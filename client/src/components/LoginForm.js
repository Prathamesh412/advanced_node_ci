import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import * as actions from '../actions';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    console.log('Login attempt with:', email);

    try {
      const response = await fetch('/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ email, password })
      });

      console.log('Response status:', response.status);

      const data = await response.json();
      console.log('Response data:', data);

      if (!response.ok) {
        setError(data.error || 'Login failed');
        setLoading(false);
        return;
      }

      if (data.token) {
        console.log('Token received:', data.token.substring(0, 20) + '...');
        localStorage.setItem('token', data.token);
        console.log('Token stored in localStorage');
        console.log('Verification - localStorage.getItem("token"):', localStorage.getItem('token')?.substring(0, 20) + '...');
      } else {
        console.warn('No token in response data');
      }

      // Fetch user data to update Redux
      console.log('Fetching user...');
      await dispatch(actions.fetchUser());

      // Redirect to blogs
      console.log('Redirecting to /blogs');
      navigate('/blogs');
    } catch (err) {
      console.error('Login error:', err);
      setError('Login failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ marginTop: '50px' }}>
      <div className="row">
        <div className="col s12 m6 offset-m3">
          <div className="card">
            <div className="card-content">
              <span className="card-title">Login to Blogster</span>
              
              {error && (
                <div className="red lighten-2 red-text text-darken-2" style={{ padding: '10px', borderRadius: '4px', marginBottom: '15px' }}>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="input-field">
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <label htmlFor="email">Email</label>
                </div>

                <div className="input-field">
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <label htmlFor="password">Password</label>
                </div>

                <button 
                  type="submit" 
                  className="btn waves-effect waves-light"
                  disabled={loading}
                >
                  {loading ? 'Logging in...' : 'Login'}
                </button>
              </form>

              <p style={{ marginTop: '20px' }}>
                Don't have an account? <Link to="/auth/register">Register here</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginForm;