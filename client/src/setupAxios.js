import axios from 'axios';

// Send cookies with every request
axios.defaults.withCredentials = true;

// Add token from localStorage if available
axios.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

export default axios;