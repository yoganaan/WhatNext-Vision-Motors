const API_BASE = '/api';

async function request(url, options = {}) {
  const res = await fetch(`${API_BASE}${url}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export const api = {
  // Dashboard
  getDashboard: () => request('/dashboard'),

  // Dealers
  getDealers: () => request('/dealers'),
  getDealer: (id) => request(`/dealers/${id}`),
  createDealer: (data) => request('/dealers', { method: 'POST', body: JSON.stringify(data) }),
  updateDealer: (id, data) => request(`/dealers/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteDealer: (id) => request(`/dealers/${id}`, { method: 'DELETE' }),
  findNearestDealers: (lat, lon, limit = 5) => request(`/dealers/nearest/find?lat=${lat}&lon=${lon}&limit=${limit}`),

  // Vehicles
  getVehicles: () => request('/vehicles'),
  getVehicle: (id) => request(`/vehicles/${id}`),
  createVehicle: (data) => request('/vehicles', { method: 'POST', body: JSON.stringify(data) }),
  updateVehicle: (id, data) => request(`/vehicles/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteVehicle: (id) => request(`/vehicles/${id}`, { method: 'DELETE' }),

  // Orders
  getOrders: () => request('/orders'),
  getOrder: (id) => request(`/orders/${id}`),
  createOrder: (data) => request('/orders', { method: 'POST', body: JSON.stringify(data) }),
  updateOrder: (id, data) => request(`/orders/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteOrder: (id) => request(`/orders/${id}`, { method: 'DELETE' }),
  batchUpdateOrders: () => request('/orders/batch-update', { method: 'POST' }),
};
