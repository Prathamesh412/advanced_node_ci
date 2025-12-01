import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function BlogForm({ onSubmit, initialValues }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState(initialValues || { title: '', content: '' });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
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
      onSubmit(formData);
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