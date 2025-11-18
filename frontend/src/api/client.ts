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
  purchase: (productId: number, tokensSpent?: number, moneyPaid?: number) => api.post('/store/purchase', { productId, tokensSpent, moneyPaid }),
  getOrders: () => api.get('/store/orders'),
  downloadCoupon: (orderId: number) => api.get(`/store/orders/${orderId}/coupon`, { responseType: 'blob' })
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

  createProduct: (name: string, description: string, price: number, type: string, real_price?: number, max_tokens?: number, token_offers?: any[], image_url?: string) =>
    api.post('/admin/products', { name, description, price, type, real_price, max_tokens, token_offers, image_url }),

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
  createReward: (amount: number, eventTitle: string, defaultExpiryDays?: number, description?: string) =>
    api.post('/admin/rewards', { amount, eventTitle, defaultExpiryDays, description }),

  getAllRewards: () => api.get('/admin/rewards'),

  updateReward: (id: number, updates: any) =>
    api.patch(`/admin/rewards/${id}`, updates),

  deleteReward: (id: number) =>
    api.delete(`/admin/rewards/${id}`),

  // Transactions
  refundTransaction: (transactionId: number, reason?: string) =>
    api.post(`/admin/transactions/${transactionId}/refund`, { reason }),

  // Impulso Approvals
  createApproval: (impulsoId: number, nombreCompleto: string, fechaLogro: string, mensaje: string) =>
    api.post('/admin/approvals', { impulsoId, nombreCompleto, fechaLogro, mensaje }),

  getApprovals: (limit: number = 50, offset: number = 0, filters?: {
    userName?: string;
    status?: string;
    dateFrom?: string;
    dateTo?: string;
  }) => {
    const params = new URLSearchParams();
    params.append('limit', limit.toString());
    params.append('offset', offset.toString());
    if (filters?.userName) params.append('user_name', filters.userName);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.dateFrom) params.append('date_from', filters.dateFrom);
    if (filters?.dateTo) params.append('date_to', filters.dateTo);
    return api.get(`/admin/approvals?${params.toString()}`);
  },

  getApprovalDetails: (approvalId: number) =>
    api.get(`/admin/approvals/${approvalId}`),

  approveImpulso: (approvalId: number) =>
    api.post(`/admin/approvals/${approvalId}/approve`),

  rejectImpulso: (approvalId: number, motivoRechazo: string) =>
    api.post(`/admin/approvals/${approvalId}/reject`, { motivoRechazo })
};

export const settingsAPI = {
  getAll: () => api.get('/settings'),
  update: (key: string, value: string) => api.put(`/settings/${key}`, { value }),
  getPublic: (key: string) => api.get(`/settings/public/${key}`)
};
