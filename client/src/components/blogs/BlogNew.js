import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BlogForm from './BlogForm';

function BlogNew() {
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const onSubmit = async (formValues) => {
    try {
      const token = localStorage.getItem('token');
      
      console.log('Token from localStorage:', token ? token.substring(0, 20) + '...' : 'NOT FOUND');

      if (!token) {
        setError('You must be logged in to create a blog');
        navigate('/auth/login');
        return;
      }

      const response = await fetch('/api/blogs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include',
        body: JSON.stringify(formValues)
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create blog');
      }

      const data = await response.json();
      console.log('Blog created:', data);
      navigate('/blogs');
    } catch (error) {
      console.error('Error creating blog:', error);
      setError(error.message);
    }
  };

  return (
    <div style={{ marginTop: '20px' }}>
      <h3>Create a New Blog</h3>
      {error && (
        <div className="red lighten-2 red-text text-darken-2" style={{ padding: '10px', borderRadius: '4px', marginBottom: '15px' }}>
          {error}
        </div>
      )}
      <BlogForm onSubmit={onSubmit} />
    </div>
  );
}

export default BlogNew;