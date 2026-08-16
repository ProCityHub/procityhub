// Session helper — generates and persists a session ID for the current session.
// Stored in sessionStorage so it survives page navigations but not tab closes.

export function getSessionId() {
  let id = sessionStorage.getItem('jarvis_session_id');
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem('jarvis_session_id', id);
  }
  return id;
}

// Generate a request ID for brain calls
export function generateRequestId() {
  return crypto.randomUUID();
}
