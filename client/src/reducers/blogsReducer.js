import { FETCH_BLOGS, FETCH_BLOG } from '../actions';

export default function blogsReducer(state = {}, action) {
  switch (action.type) {
    case FETCH_BLOG:
      return {
        ...state,
        [action.payload._id]: action.payload
      };
    case FETCH_BLOGS:
      const blogsMap = {};
      action.payload.forEach(blog => {
        blogsMap[blog._id] = blog;
      });
      return blogsMap;
    default:
      return state;
  }
}