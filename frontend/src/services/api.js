import axios from 'axios';
import { readSession } from './session';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'https://job-portal-backend-8pah.onrender.com/api',
});

API.interceptors.request.use(request => {
  const user = readSession();
  if (user) request.headers.Authorization = 'Bearer ' + user.token;
  return request;
});

export function errorMessage(error, fallback) {
  if (error.response?.status === 401 && readSession()) return 'Your session has expired. Sign out and sign in again.';
  const message = error.response?.data?.message;
  return typeof message === 'string' && message ? message : fallback;
}

export default API;
