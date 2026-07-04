import api from './api';
import { setToken } from './token';

export { getToken, setToken, isLoggedIn } from './token';

export async function login(identifier, password) {
  const { data } = await api.post('/auth/login', { identifier, password });
  setToken(data.token);
  return data;
}

export async function register(name, identifier, password) {
  const { data } = await api.post('/auth/register', { name, identifier, password });
  setToken(data.token);
  return data;
}

export function logout() {
  setToken(null);
}
