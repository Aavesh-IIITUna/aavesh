const BASE_URL = import.meta.env.VITE_API_URL ?? '/api';

class ApiRequestError extends Error {
  constructor(message, status, details) {
    super(message);
    this.name = 'ApiRequestError';
    this.status = status;
    this.details = details;
  }
}

async function request(path, { method = 'GET', body, signal } = {}) {
  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    signal,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });

  const isJson = response.headers.get('content-type')?.includes('application/json');
  const payload = isJson ? await response.json() : null;

  if (!response.ok) {
    throw new ApiRequestError(
      payload?.error ?? `Request failed with status ${response.status}`,
      response.status,
      payload?.details,
    );
  }

  return payload;
}

export const api = {
  getSociety: (options) => request('/society', options),
  getTracks: (options) => request('/society/tracks', options),
  listProjects: (options) => request('/projects', options),
  listMembers: (options) => request('/members', options),
  sendMessage: (body, options) => request('/contact', { ...options, method: 'POST', body }),
};

export { ApiRequestError };