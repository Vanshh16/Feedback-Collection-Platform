import axios from 'axios';

// Create an instance of axios
const api = axios.create({
  baseURL: 'http://localhost:5001/api', // Your backend server URL
  headers: {
    'Content-Type': 'application/json',
  },
});

/*
  This is the corrected interceptor.
  It now correctly sets the 'Authorization' header with the 'Bearer' prefix,
  which matches what our backend middleware expects.
*/
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      // Set the correct header format
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;