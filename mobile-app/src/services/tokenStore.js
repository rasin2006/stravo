let authToken = null;

export function setToken(token) {
  authToken = token;
}

export function getToken() {
  return authToken;
}

export function clearToken() {
  authToken = null;
}
