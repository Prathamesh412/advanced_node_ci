import React from 'react';
import { useNavigate } from 'react-router-dom';

function BlogFormReview({ formValues, onSubmit, onBack }) {
  const navigate = useNavigate();

  if (!formValues) {
    return <div>Loading...</div>;
  }

  const { title, content } = formValues;

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