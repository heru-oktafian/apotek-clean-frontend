const BASE_URL = '/api/v1';

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || `HTTP ${res.status}`);
  }

  return data;
}

// Auth
export const auth = {
  login: (body) => request('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  logout: () => request('/auth/logout', { method: 'POST' }),
  me: () => request('/auth/me'),
};

// Products
export const products = {
  list: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/products${qs ? `?${qs}` : ''}`);
  },
  get: (id) => request(`/products/${id}`),
  create: (body) => request('/products', { method: 'POST', body: JSON.stringify(body) }),
  update: (id, body) => request(`/products/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  delete: (id) => request(`/products/${id}`, { method: 'DELETE' }),
};

// Categories
export const categories = {
  list: () => request('/categories'),
  create: (body) => request('/categories', { method: 'POST', body: JSON.stringify(body) }),
  update: (id, body) => request(`/categories/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  delete: (id) => request(`/categories/${id}`, { method: 'DELETE' }),
};

// Suppliers
export const suppliers = {
  list: () => request('/suppliers'),
  create: (body) => request('/suppliers', { method: 'POST', body: JSON.stringify(body) }),
  update: (id, body) => request(`/suppliers/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  delete: (id) => request(`/suppliers/${id}`, { method: 'DELETE' }),
};

// Stock
export const stock = {
  list: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/stock${qs ? `?${qs}` : ''}`);
  },
  opname: (body) => request('/stock/opname', { method: 'POST', body: JSON.stringify(body) }),
  adjust: (id, body) => request(`/stock/${id}/adjust`, { method: 'POST', body: JSON.stringify(body) }),
};

// Transactions
export const transactions = {
  list: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/transactions${qs ? `?${qs}` : ''}`);
  },
  get: (id) => request(`/transactions/${id}`),
  create: (body) => request('/transactions', { method: 'POST', body: JSON.stringify(body) }),
};

// Reports
export const reports = {
  sales: (params) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/reports/sales${qs ? `?${qs}` : ''}`);
  },
  stock: () => request('/reports/stock'),
  profit: (params) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/reports/profit${qs ? `?${qs}` : ''}`);
  },
};
