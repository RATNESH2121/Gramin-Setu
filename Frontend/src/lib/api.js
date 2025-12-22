const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const request = async (path, options = {}) => {
  const { headers: customHeaders = {}, ...otherOptions } = options;

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...otherOptions,
    headers: {
      'Content-Type': 'application/json',
      ...customHeaders
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || data.message || 'Request failed');
  }

  return data;
};

export const authApi = {
  register: (payload) =>
    request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  login: (payload) =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  profile: (token) =>
    request('/auth/profile', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }),
  sendOtp: (payload) => request('/auth/send-otp', {
    method: 'POST',
    body: JSON.stringify(typeof payload === 'string' ? { phone: payload } : payload)
  }),
  verifyOtp: (payload) => request('/auth/verify-otp', {
    method: 'POST',
    body: JSON.stringify(payload)
  }),
  updateProfile: (payload) => request('/auth/update', {
    method: 'PUT',
    body: JSON.stringify(payload)
  })
};

export const cropsApi = {
  getAll: () => request('/crops'),
  getRecommendation: (name, soilType) => request(`/crops/${name}/${soilType}`),
  create: (payload) => request('/crops', { method: 'POST', body: JSON.stringify(payload) })
};

export const housingApi = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    // Support both old and new endpoints if needed, but prioritizing new app flow
    return request(`/housing-apps/all?${query}`);
  },
  apply: (payload) => request('/housing-apps/apply', { method: 'POST', body: JSON.stringify(payload) }),
  getMyApps: (userId) => request(`/housing-apps/my-applications/${userId}`),
  updateStatus: (id, payload) => request(`/housing-apps/status/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  // Legacy or generic create if still needed
  create: (payload) => request('/housings', { method: 'POST', body: JSON.stringify(payload) })
};

export const gisApi = {
  getLayers: (params) => {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    return request(`/gis/layers${query}`);
  },
  seed: () => request('/gis/seed', { method: 'POST' })
};


export const fertilizerApi = {
  addLand: (payload) => request('/fertilizer/land', {
    method: 'POST',
    headers: { 'user-id': JSON.parse(localStorage.getItem('user') || '{}').id },
    body: JSON.stringify(payload)
  }),
  getMyLands: () => request('/fertilizer/land', {
    headers: { 'user-id': JSON.parse(localStorage.getItem('user') || '{}').id }
  }),
  addSoilData: (payload) => request('/fertilizer/soil', {
    method: 'POST',
    headers: { 'user-id': JSON.parse(localStorage.getItem('user') || '{}').id },
    body: JSON.stringify(payload)
  }),
  getSoilTests: () => request('/fertilizer/soil', {
    headers: { 'user-id': JSON.parse(localStorage.getItem('user') || '{}').id }
  }),
  getPlans: (landId) => request(`/fertilizer/plans/${landId}`, {
    headers: { 'user-id': JSON.parse(localStorage.getItem('user') || '{}').id }
  })
};

export const adminApiExtended = {
  getAllLands: () => request('/fertilizer/admin/lands', {
    headers: { 'user-id': JSON.parse(localStorage.getItem('user') || '{}').id }
  }),
  createUser: (payload) => request('/auth/admin/create-user', {
    method: 'POST',
    body: JSON.stringify(payload),
    headers: { 'user-id': JSON.parse(localStorage.getItem('user') || '{}').id }
  }),

  getPendingSoil: () => request('/fertilizer/admin/soil/pending', {
    headers: { 'user-id': JSON.parse(localStorage.getItem('user') || '{}').id }
  }),
  updateSoilStatus: (id, approved) => request(`/fertilizer/admin/soil/${id}/status`, {
    method: 'PUT',
    headers: { 'user-id': JSON.parse(localStorage.getItem('user') || '{}').id },
    body: JSON.stringify({ approved })
  }),
  createPlan: (payload) => request('/fertilizer/admin/plan', {
    method: 'POST',
    headers: { 'user-id': JSON.parse(localStorage.getItem('user') || '{}').id },
    body: JSON.stringify(payload)
  }),
  getStats: () => request('/fertilizer/admin/stats', {
    headers: { 'user-id': JSON.parse(localStorage.getItem('user') || '{}').id }
  }),
  getCharts: () => request('/fertilizer/admin/charts', {
    headers: { 'user-id': JSON.parse(localStorage.getItem('user') || '{}').id }
  }),
  deleteUser: (id) => request(`/admin/farmers/${id}`, {
    method: 'DELETE',
    headers: { 'user-id': JSON.parse(localStorage.getItem('user') || '{}').id }
  }),
  updateUser: (id, payload) => request(`/admin/farmers/${id}`, {
    method: 'PUT',
    headers: { 'user-id': JSON.parse(localStorage.getItem('user') || '{}').id },
    body: JSON.stringify(payload)
  })
};

export const districtsApi = {
  getAll: () => request('/districts'),
  create: (name) => request('/districts', {
    method: 'POST',
    body: JSON.stringify({ name })
  })
};

export const tasksApi = {
  getAll: (userId) => request(`/tasks?userId=${userId}`),
  create: (payload) => request('/tasks', { method: 'POST', body: JSON.stringify(payload) }),
  update: (id, payload) => request(`/tasks/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),
  delete: (id) => request(`/tasks/${id}`, { method: 'DELETE' })
};

export const contactApi = {
  submitQuery: (payload) => request('/contact/query', { method: 'POST', body: JSON.stringify(payload) }),
  subscribe: (email) => request('/contact/subscribe', { method: 'POST', body: JSON.stringify({ email }) })
};

export { API_BASE_URL };
