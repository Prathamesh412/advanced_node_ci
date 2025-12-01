import React from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

function Landing() {
  const auth = useSelector(state => state.auth);

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>Blogster</h1>
      <p>A simple blogging platform</p>
      
      {auth ? (
        <div>
          <h4>Welcome back!</h4>
          <Link to="/blogs" className="btn">
            View Your Blogs
          </Link>
        </div>
      ) : (
        <div>
          <p>Sign up or log in to get started</p>
          <a href="/auth/login" className="btn">
            Login
          </a>
          <a href="/auth/register" className="btn" style={{ marginLeft: '10px' }}>
            Register
          </a>
        </div>
      )}
    </div>
  );
}

export default Landing;