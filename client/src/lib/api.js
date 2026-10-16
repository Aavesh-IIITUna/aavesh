const BASE_URL = import.meta.env.VITE_API_URL ?? '/api';

class ApiRequestError extends Error {
  constructor(message, status, details) {
    super(message);
    this.name = 'ApiRequestError';
    this.status = status;
    this.details = details;
  }
}

async function request(path, { method = 'GET', body, signal, credentials = 'include' } = {}) {
  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    signal,
    credentials,
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
  listEvents: (options) => request('/events', options),
  getMe: (options) => request('/me', options),
  updateMyProfile: (body, options) => request('/me/profile', { ...options, method: 'PATCH', body }),
  register: (body, options) => request('/auth/register', { ...options, method: 'POST', body }),
  login: (body, options) => request('/auth/login', { ...options, method: 'POST', body }),
  logout: (options) => request('/auth/logout', { ...options, method: 'POST' }),
  listManagedMembers: (options) => request('/manage/members', options),
  createMember: (body, options) => request('/members', { ...options, method: 'POST', body }),
  updateMember: (id, body, options) => request(`/members/${encodeURIComponent(id)}`, { ...options, method: 'PATCH', body }),
  deleteMember: (id, options) => request(`/members/${encodeURIComponent(id)}`, { ...options, method: 'DELETE' }),
  createEvent: (body, options) => request('/events', { ...options, method: 'POST', body }),
  updateEvent: (id, body, options) => request(`/events/${encodeURIComponent(id)}`, { ...options, method: 'PATCH', body }),
  deleteEvent: (id, options) => request(`/events/${encodeURIComponent(id)}`, { ...options, method: 'DELETE' }),
  listRoles: (options) => request('/roles', options),
  listUsers: (options) => request('/users', options),
  createRole: (body, options) => request('/roles', { ...options, method: 'POST', body }),
  updateRole: (key, body, options) => request(`/roles/${encodeURIComponent(key)}`, { ...options, method: 'PATCH', body }),
  changeUserRoles: (userId, body, options) => request(`/users/${encodeURIComponent(userId)}/roles`, { ...options, method: 'PATCH', body }),
  changeUserPermissions: (userId, body, options) => request(`/users/${encodeURIComponent(userId)}/permissions`, { ...options, method: 'PATCH', body }),
  sendMessage: (body, options) => request('/contact', { ...options, method: 'POST', body }),
};

export { ApiRequestError };
