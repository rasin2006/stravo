import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'stravo_auth_token';
let cachedToken = null;

export async function loadToken() {
  try {
    cachedToken = await SecureStore.getItemAsync(TOKEN_KEY);
  } catch {
    cachedToken = null;
  }
  return cachedToken;
}

export async function setToken(token) {
  cachedToken = token;
  try {
    if (token) {
      await SecureStore.setItemAsync(TOKEN_KEY, token);
    } else {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
    }
  } catch (err) {
    console.warn('Failed to persist auth token', err);
  }
}

export function getToken() {
  return cachedToken;
}

export async function clearToken() {
  await setToken(null);
}
