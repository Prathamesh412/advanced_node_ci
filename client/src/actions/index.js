export const FETCH_USER = 'FETCH_USER';
export const FETCH_BLOGS = 'FETCH_BLOGS';
export const FETCH_BLOG = 'FETCH_BLOG';

export const fetchUser = () => async dispatch => {
  try {
    const response = await fetch('/api/current_user', {
      method: 'GET',
      credentials: 'include', // Include cookies
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (!response.ok) {
      dispatch({ type: FETCH_USER, payload: false });
      return;
    }

    const data = await response.json();
    dispatch({ type: FETCH_USER, payload: data });
  } catch (error) {
    console.error('Error fetching user:', error);
    dispatch({ type: FETCH_USER, payload: false });
  }
};

export const fetchBlogs = () => async dispatch => {
  try {
    const response = await fetch('/api/blogs', {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (!response.ok) {
      console.error('Error fetching blogs');
      return;
    }

    const data = await response.json();
    dispatch({ type: FETCH_BLOGS, payload: data });
  } catch (error) {
    console.error('Error fetching blogs:', error);
  }
};

export const fetchBlog = (id) => async dispatch => {
  try {
    const response = await fetch(`/api/blogs/${id}`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (!response.ok) {
      console.error('Error fetching blog');
      return;
    }

    const data = await response.json();
    dispatch({ type: FETCH_BLOG, payload: data });
  } catch (error) {
    console.error('Error fetching blog:', error);
  }
};