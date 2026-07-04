let unauthorizedHandler = null;

export function setUnauthorizedHandler(handler) {
  unauthorizedHandler = handler;
}

export function triggerUnauthorized() {
  if (unauthorizedHandler) {
    unauthorizedHandler();
  }
}
