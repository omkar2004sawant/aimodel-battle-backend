import api from './api.js';

export const authService = {
  signup: (name, email, password) =>
    api.post('/auth/signup', { name, email, password }).then((r) => r.data),
  login: (email, password) =>
    api.post('/auth/login', { email, password }).then((r) => r.data),
  me: () => api.get('/auth/me').then((r) => r.data),
};

export const battleService = {
  create: (formData) =>
    api.post('/battles', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data),
  stats: () => api.get('/battles/stats').then((r) => r.data),
};

export const historyService = {
  list: (q) => api.get('/history', { params: { q } }).then((r) => r.data),
  get: (id) => api.get(`/history/${id}`).then((r) => r.data),
  remove: (id) => api.delete(`/history/${id}`).then((r) => r.data),
  clear: () => api.delete('/history').then((r) => r.data),
};

export const userService = {
  updateProfile: (name) => api.put('/users/profile', { name }).then((r) => r.data),
  updatePassword: (currentPassword, newPassword) =>
    api.put('/users/password', { currentPassword, newPassword }).then((r) => r.data),
};
