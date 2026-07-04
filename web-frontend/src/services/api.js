import axios from 'axios';
import { getToken, setToken } from './token';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
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
  (error) => {
    if (error.response?.status === 401 && getToken()) {
      setToken(null);
      window.dispatchEvent(new CustomEvent('stravo:unauthorized'));
    }
    return Promise.reject(error);
  }
);

export default api;

export async function submitSegmentFeedback(segmentId, isInteresting) {
  const { data } = await api.post(`/segments/${segmentId}/feedback`, { isInteresting });
  return data;
}
