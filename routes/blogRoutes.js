const mongoose = require('mongoose');
const requireLogin = require('../middlewares/requireLogin');
const { clearHash } = require('../services/cache');

const Blog = mongoose.model('Blog');

module.exports = app => {
  // Create a blog
  app.post('/api/blogs', requireLogin, async (req, res) => {
    try {
      const { title, content } = req.body;

      if (!title || !title.trim()) {
        return res.status(400).json({ error: 'Title is required' });
      }

      if (!content || !content.trim()) {
        return res.status(400).json({ error: 'Content is required' });
      }

      const blog = new Blog({
        title,
        content,
        _user: req.user.id
      });

      await blog.save();
      
      // Clear cache for blogs collection to ensure fresh data on next fetch
      await clearHash('blogs');
      
      res.status(201).json(blog);
    } catch (err) {
      console.error('Error creating blog:', err);
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