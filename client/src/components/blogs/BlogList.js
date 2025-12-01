import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchBlogs } from '../../actions';

function BlogList() {
  const dispatch = useDispatch();
  const blogs = useSelector(state => state.blogs);

  useEffect(() => {
    dispatch(fetchBlogs());
  }, [dispatch]);

  const renderBlogs = () => {
    return Object.values(blogs).map(blog => (
      <div className="card darken-1 horizontal" key={blog._id}>
        <div className="card-stacked">
          <div className="card-content">
            <span className="card-title">{blog.title}</span>
            <p>{blog.content}</p>
          </div>
          <div className="card-action">
            <Link to={`/blogs/${blog._id}`}>Read</Link>
          </div>
        </div>
      </div>
    ));
  };

  return <div>{renderBlogs()}</div>;
}

export default BlogList;