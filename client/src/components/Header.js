import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';

function Header() {
  const auth = useSelector(state => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await fetch('/auth/logout', {
        method: 'GET',
        credentials: 'include'
      });
      localStorage.removeItem('token');
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const renderContent = () => {
    switch (auth) {
      case null:
        return null;
      case false:
        return (
          <li>
            <Link to="/auth/login">Login</Link>
          </li>
        );
      default:
        return [
          <li key="1" style={{ margin: '0 10px' }}>
            <Link to="/blogs">My Blogs</Link>
          </li>,
          <li key="2">
            <button 
              onClick={handleLogout}
              style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}
            >
              Logout
            </button>
          </li>
        ];
    }
  };

  return (
    <nav className="indigo">
      <div className="nav-wrapper">
        <Link
          to={auth ? '/blogs' : '/'}
          className="left brand-logo"
          style={{ marginLeft: '10px' }}
        >
          Blogster
        </Link>
        <ul className="right">{renderContent()}</ul>
      </div>
    </nav>
  );
}

export default Header;