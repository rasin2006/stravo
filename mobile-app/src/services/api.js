import axios from 'axios';
import { API_BASE_URL } from '../config';
import { getToken, clearToken } from './tokenStore';
import { triggerUnauthorized } from './authEvents';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await clearToken();
      triggerUnauthorized();
    }
    return Promise.reject(error);
  }
);

export default api;
