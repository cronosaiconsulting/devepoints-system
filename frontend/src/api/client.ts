import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

console.log('=== API Configuration ===');
console.log('VITE_API_URL:', import.meta.env.VITE_API_URL);
console.log('API_URL:', API_URL);
console.log('========================');

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  register: (email: string, password: string, fullName: string, referralCode?: string) =>
    api.post('/auth/register', { email, password, fullName, referralCode }),

  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password })
};

export const userAPI = {
  getBalance: () => api.get('/user/balance'),
  getHistory: () => api.get('/user/history'),
  getExpiring: (days: number = 30) => api.get(`/user/expiring?days=${days}`),
  getReferrals: () => api.get('/user/referrals')
};

export const storeAPI = {
  getProducts: () => api.get('/store/products'),
  purchase: (productId: number) => api.post('/store/purchase', { productId }),
  getOrders: () => api.get('/store/orders')
};

export const adminAPI = {
  createUser: (email: string, password: string, fullName: string, role?: string) =>
    api.post('/admin/users', { email, password, fullName, role }),

  awardCoins: (userId: number, amount: number, description: string, expiryDays?: number, observations?: string) =>
    api.post('/admin/award', { userId, amount, description, expiryDays, observations }),

  getUsers: (limit: number = 50, offset: number = 0) =>
    api.get(`/admin/users?limit=${limit}&offset=${offset}`),

  searchUsers: (query: string) =>
    api.get(`/admin/users/search?q=${query}`),

  getUserDetails: (userId: number) =>
    api.get(`/admin/users/${userId}`),

  createProduct: (name: string, description: string, price: number, type: string) =>
    api.post('/admin/products', { name, description, price, type }),

  updateProduct: (id: number, updates: any) =>
    api.patch(`/admin/products/${id}`, updates),

  getAllProducts: () => api.get('/admin/products'),

  deleteProduct: (id: number) =>
    api.delete(`/admin/products/${id}`),

  getStats: () => api.get('/admin/stats'),

  getTransactions: (limit: number = 100, offset: number = 0) =>
    api.get(`/admin/transactions?limit=${limit}&offset=${offset}`),

  getOrders: (limit: number = 100, offset: number = 0) =>
    api.get(`/admin/orders?limit=${limit}&offset=${offset}`),

  getAnalytics: () => api.get('/admin/analytics'),

  // Rewards
  createReward: (amount: number, eventTitle: string, defaultExpiryDays?: number) =>
    api.post('/admin/rewards', { amount, eventTitle, defaultExpiryDays }),

  getAllRewards: () => api.get('/admin/rewards'),

  updateReward: (id: number, updates: any) =>
    api.patch(`/admin/rewards/${id}`, updates),

  deleteReward: (id: number) =>
    api.delete(`/admin/rewards/${id}`)
};
