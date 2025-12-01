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

  const { title, content } = blog;

  return (
    <div>
      <h3>{title}</h3>
      <p>{content}</p>
    </div>
  );
}

export default BlogShow;