const mongoose = require('mongoose');
const requireLogin = require('../middlewares/requireLogin');
const { clearHash } = require('../services/cache');
const multer = require('multer');
const { S3Client, PutObjectCommand, GetBucketLocationCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const keys = require('../config/keys');
const { randomUUID } = require('crypto');

const Blog = mongoose.model('Blog');

// Configure multer for memory storage (we'll upload directly to S3)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Only allow PNG and JPEG images
    if (file.mimetype === 'image/png' || file.mimetype === 'image/jpeg') {
      cb(null, true);
    } else {
      cb(new Error('Only PNG and JPEG images are allowed'), false);
    }
  }
});

const BUCKET_NAME = 'my-blog-bucket-3773';

// Helper function to get or create S3 client with correct region
let s3Client = null;
let bucketRegion = keys.awsRegion || 'us-east-1';

const getS3Client = () => {
  if (!s3Client) {
    s3Client = new S3Client({
      credentials: {
        accessKeyId: keys.awsAccessId,
        secretAccessKey: keys.awsSecretAccessKey,
      },
      region: bucketRegion,
    });
  }
  return s3Client;
};

// Helper function to detect bucket region
const detectBucketRegion = async () => {
  try {
    // Try to get bucket location using us-east-1 (default region for location queries)
    const tempClient = new S3Client({
      credentials: {
        accessKeyId: keys.awsAccessId,
        secretAccessKey: keys.awsSecretAccessKey,
      },
      region: 'us-east-1',
    });
    
    const command = new GetBucketLocationCommand({ Bucket: BUCKET_NAME });
    const response = await tempClient.send(command);
    
    // Bucket location can be null for us-east-1, or a region string
    const region = response.LocationConstraint || 'us-east-1';
    bucketRegion = region;
    
    // Recreate client with correct region
    s3Client = new S3Client({
      credentials: {
        accessKeyId: keys.awsAccessId,
        secretAccessKey: keys.awsSecretAccessKey,
      },
      region: bucketRegion,
    });
    
    return region;
  } catch (error) {
    console.error('Error detecting bucket region:', error);
    // Fall back to default region
    return bucketRegion;
  }
};

module.exports = app => {
  // Get presigned URL for direct client-side upload (optional endpoint)
  app.get('/api/upload', requireLogin, async (req, res) => {
    try {
      const id = randomUUID();
      const key = `${req.user.id}/${id}.jpeg`;

      const command = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
        ContentType: 'image/jpeg',
      });

      const s3 = getS3Client();
      
      try {
        const url = await getSignedUrl(s3, command, { expiresIn: 60 * 60 * 24 * 6 });
        res.json({ url, key });
      } catch (error) {
        // If we get a redirect error, detect region and retry
        if (error.name === 'PermanentRedirect' || error.$metadata?.httpStatusCode === 301) {
          console.log('Detecting bucket region due to redirect...');
          await detectBucketRegion();
          const updatedS3 = getS3Client();
          const url = await getSignedUrl(updatedS3, command, { expiresIn: 60 * 60 * 24 * 6 });
          res.json({ url, key });
        } else {
          throw error;
        }
      }
    } catch (error) {
      console.error('Error getting signed url:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Create a blog with optional image upload
  app.post('/api/blogs', requireLogin, upload.single('image'), async (req, res) => {
    try {
      const { title, content } = req.body;

      if (!title || !title.trim()) {
        return res.status(400).json({ error: 'Title is required' });
      }

      if (!content || !content.trim()) {
        return res.status(400).json({ error: 'Content is required' });
      }

      let imageUrl = null;

      // If an image was uploaded, save it to S3
      if (req.file) {
        try {
          const id = randomUUID();
          const fileExtension = req.file.mimetype === 'image/png' ? 'png' : 'jpeg';
          const key = `${req.user.id}/${id}.${fileExtension}`;

          const command = new PutObjectCommand({
            Bucket: BUCKET_NAME,
            Key: key,
            Body: req.file.buffer,
            ContentType: req.file.mimetype
          });

          const s3 = getS3Client();
          
          try {
            await s3.send(command);
          } catch (s3Error) {
            // If we get a PermanentRedirect error, detect the correct region and retry
            if (s3Error.name === 'PermanentRedirect' || s3Error.$metadata?.httpStatusCode === 301) {
              console.log('Detecting bucket region due to redirect...');
              await detectBucketRegion();
              const updatedS3 = getS3Client();
              await updatedS3.send(command);
            } else {
              throw s3Error;
            }
          }

          // Construct the public URL for the image
          imageUrl = `https://${BUCKET_NAME}.s3.${bucketRegion}.amazonaws.com/${key}`;
        } catch (s3Error) {
          console.error('Error uploading image to S3:', s3Error);
          return res.status(500).json({ error: 'Failed to upload image: ' + s3Error.message });
        }
      }

      const blog = new Blog({
        title,
        content,
        imageUrl,
        _user: req.user.id
      });

      await blog.save();
      
      // Clear cache for blogs collection to ensure fresh data on next fetch
      await clearHash('blogs');
      
      res.status(201).json(blog);
    } catch (err) {
      console.error('Error creating blog:', err);
      
      // Handle multer errors
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ error: 'File size too large. Maximum size is 5MB' });
        }
        return res.status(400).json({ error: err.message });
      }
      
      res.status(500).json({ error: err.message });
    }
  });

  // Get all blogs for current user
  app.get('/api/blogs', requireLogin, async (req, res) => {
    try {
      const blogs = await Blog.find({ _user: req.user.id }).cache();
      res.json(blogs);
    } catch (err) {
      console.error('Error fetching blogs:', err);
      res.status(500).json({ error: err.message });
    }
  });

  // Get a single blog
  app.get('/api/blogs/:id', async (req, res) => {
    try {
      const blog = await Blog.findById(req.params.id);
      
      if (!blog) {
        return res.status(404).json({ error: 'Blog not found' });
      }

      res.json(blog);
    } catch (err) {
      console.error('Error fetching blog:', err);
      res.status(500).json({ error: err.message });
    }
  });

  // Update a blog
  app.put('/api/blogs/:id', requireLogin, async (req, res) => {
    try {
      const blog = await Blog.findById(req.params.id);

      if (!blog) {
        return res.status(404).json({ error: 'Blog not found' });
      }

      if (blog._user.toString() !== req.user.id) {
        return res.status(403).json({ error: 'Not authorized to update this blog' });
      }

      blog.title = req.body.title || blog.title;
      blog.content = req.body.content || blog.content;

      await blog.save();
      res.json(blog);
    } catch (err) {
      console.error('Error updating blog:', err);
      res.status(500).json({ error: err.message });
    }
  });

  // Delete a blog
  app.delete('/api/blogs/:id', requireLogin, async (req, res) => {
    try {
      const blog = await Blog.findById(req.params.id);

      if (!blog) {
        return res.status(404).json({ error: 'Blog not found' });
      }

      if (blog._user.toString() !== req.user.id) {
        return res.status(403).json({ error: 'Not authorized to delete this blog' });
      }

      await Blog.deleteOne({ _id: req.params.id });
      res.json({ success: true, message: 'Blog deleted' });
    } catch (err) {
      console.error('Error deleting blog:', err);
      res.status(500).json({ error: err.message });
    }
  });
};