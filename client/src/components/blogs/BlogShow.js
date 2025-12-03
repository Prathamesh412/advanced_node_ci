import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { fetchBlog } from '../../actions';

function BlogShow() {
  const dispatch = useDispatch();
  const { _id } = useParams();
  const blog = useSelector(state => state.blogs[_id]);

  useEffect(() => {
    dispatch(fetchBlog(_id));
  }, [dispatch, _id]);

  if (!blog) {
    return <div>Loading...</div>;
  }

  const { title, content, imageUrl } = blog;

  return (
    <div>
      <h3>{title}</h3>
      {imageUrl && (
        <div style={{ marginBottom: '20px' }}>
          <img 
            src={imageUrl} 
            alt={title} 
            style={{ 
              maxWidth: '100%', 
              height: 'auto', 
              borderRadius: '4px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }} 
          />
        </div>
      )}
      <p>{content}</p>
    </div>
  );
}

export default BlogShow;