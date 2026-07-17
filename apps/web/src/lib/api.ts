import axios from 'axios';
import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api/v1';

export const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach access token on every request
api.interceptors.request.use((config) => {
  const token = Cookies.get('access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  const tenantId = Cookies.get('tenant_id');
  if (tenantId) config.headers['X-Tenant-ID'] = tenantId;
  return config;
});

// Auto refresh on 401
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const refreshToken = Cookies.get('refresh_token');
        if (!refreshToken) throw new Error('No refresh token');
        const { data } = await axios.post(`${API_URL}/auth/refresh`, { refreshToken });
        const { accessToken } = data.data;
        Cookies.set('access_token', accessToken, { expires: 1 / 96 }); // 15 min
        original.headers.Authorization = `Bearer ${accessToken}`;
        return api(original);
      } catch {
        Cookies.remove('access_token');
        Cookies.remove('refresh_token');
        Cookies.remove('tenant_id');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Unwrap standard API response
api.interceptors.response.use((res) => {
  if (res.data && 'data' in res.data) return { ...res, data: res.data.data, meta: res.data.meta };
  return res;
});

export default api;
