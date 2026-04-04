import axios from 'axios';

const BACKEND_URL = 'https://job-portal-backend-8pah.onrender.com/api';

const API = axios.create({
  baseURL: BACKEND_URL,
});

API.interceptors.request.use((req) => {
  const user = localStorage.getItem('user');
  if (user) {
    req.headers.Authorization = `Bearer ${JSON.parse(user).token}`;
  }
  return req;
});

export default API;
