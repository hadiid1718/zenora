import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor — attach access token
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const { data } = await axios.post(
          `${API_BASE_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );

        const newToken = data.data.accessToken;
        useAuthStore.getState().setAccessToken(newToken);

        // Fetch updated user info after token refresh
        try {
          const { data: meData } = await axios.get(`${API_BASE_URL}/auth/me`, {
            headers: { Authorization: `Bearer ${newToken}` },
            withCredentials: true,
          });
          const refreshedUser = meData.data.user;
          const storedUser = useAuthStore.getState().user;

          useAuthStore.setState({ user: refreshedUser });

          // If the role changed (session was overwritten by another login),
          // redirect to the correct login page
          if (storedUser && refreshedUser.role !== storedUser.role) {
            const loginPaths = { admin: '/admin/login', instructor: '/instructor/login' };
            window.location.href = loginPaths[storedUser.role] || '/login';
            return Promise.reject(new Error('Session changed, redirecting to login'));
          }
        } catch {
          // If fetching user fails, continue with the refreshed token
        }

        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        useAuthStore.setState({
          user: null,
          accessToken: null,
          isAuthenticated: false,
        });
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
