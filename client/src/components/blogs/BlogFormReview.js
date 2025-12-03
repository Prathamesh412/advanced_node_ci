import React from 'react';
import { useNavigate } from 'react-router-dom';

function BlogFormReview({ formValues, onSubmit, onBack }) {
  const navigate = useNavigate();

  if (!formValues) {
    return <div>Loading...</div>;
  }

  const { title, content, image } = formValues;
  
  // Create preview URL if image file exists
  const [imagePreview, setImagePreview] = React.useState(null);
  
  React.useEffect(() => {
    if (image && image instanceof File) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(image);
    }
  }, [image]);

  const handleSubmit = async () => {
    try {
      await onSubmit(formValues);
      navigate('/blogs');
    } catch (error) {
      console.error('Error submitting blog:', error);
    }
  };

  return (
    <div>
      <h5>Please review your blog</h5>
      <div>
        <h6>Title</h6>
        <p>{title}</p>
      </div>
      <div>
        <h6>Content</h6>
        <p>{content}</p>
      </div>
      {imagePreview && (
        <div style={{ marginTop: '20px', marginBottom: '20px' }}>
          <h6>Image</h6>
          <img 
            src={imagePreview} 
            alt="Preview" 
            style={{ 
              maxWidth: '100%', 
              maxHeight: '300px', 
              marginTop: '10px',
              borderRadius: '4px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }} 
          />
        </div>
      )}

      <button 
        onClick={onBack}
        className="btn grey"
      >
        Back
      </button>
      <button 
        onClick={handleSubmit}
        className="btn red right"
      >
        Submit Blog
      </button>
    </div>
  );
}

export default BlogFormReview;