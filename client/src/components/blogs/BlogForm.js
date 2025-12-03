import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function BlogForm({ onSubmit, initialValues }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState(initialValues || { title: '', content: '' });
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files && e.target.files[0];

    if (!file) {
      setImage(null);
      setImagePreview(null);
      setErrors(prev => ({ ...prev, image: undefined }));
      return;
    }

    const allowedTypes = ['image/png', 'image/jpeg'];

    if (!allowedTypes.includes(file.type)) {
      setImage(null);
      setImagePreview(null);
      setErrors(prev => ({
        ...prev,
        image: 'Only PNG and JPEG images are allowed'
      }));
      return;
    }

    setImage(file);
    setErrors(prev => ({
      ...prev,
      image: undefined
    }));

    // Create preview URL
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    if (!formData.content.trim()) {
      newErrors.content = 'Content is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      // Pass title, content, and the selected image file up to the parent
      onSubmit({
        ...formData,
        image
      });
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="input-field">
        <label htmlFor="title">Blog Title</label>
        <input
          id="title"
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          className={errors.title ? 'invalid' : ''}
        />
        {errors.title && <span className="helper-text">{errors.title}</span>}
      </div>

      <div className="input-field">
        <label htmlFor="content">Blog Content</label>
        <textarea
          id="content"
          name="content"
          value={formData.content}
          onChange={handleChange}
          className={`materialize-textarea ${errors.content ? 'invalid' : ''}`}
        />
        {errors.content && <span className="helper-text">{errors.content}</span>}
      </div>

      <div className="file-field input-field">
        <div className="btn">
          <span>Image</span>
          <input
            type="file"
            accept="image/png,image/jpeg"
            onChange={handleImageChange}
          />
        </div>
        <div className="file-path-wrapper">
          <input
            className="file-path validate"
            type="text"
            placeholder="Upload a PNG or JPEG image"
            readOnly
            value={image ? image.name : ''}
          />
        </div>
        {errors.image && <span className="helper-text">{errors.image}</span>}
      </div>

      {imagePreview && (
        <div style={{ marginTop: '20px', marginBottom: '20px' }}>
          <label>Image Preview:</label>
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

      <button type="submit" className="btn">Submit</button>
      <button 
        type="button" 
        onClick={() => navigate('/blogs')}
        className="btn grey"
        style={{ marginLeft: '10px' }}
      >
        Cancel
      </button>
    </form>
  );
}

export default BlogForm;