import { apiAuth } from './api';
import { jwtDecode } from 'jwt-decode';

export const authService = {
  async loginWithGoogle(idToken) {
    const res = await apiAuth.post('/auth/google', { idToken });
    const { accessToken, usuario } = res.data;
    if (accessToken) {
      localStorage.setItem('token', accessToken);
      localStorage.setItem('user', JSON.stringify(usuario));
    }
    return res.data;
  },

  async login(correo, password) {
    const res = await apiAuth.post('/auth/login', { correo, password });
    const { accessToken, usuario } = res.data;
    if (accessToken) {
      localStorage.setItem('token', accessToken);
      localStorage.setItem('user', JSON.stringify(usuario));
    }
    return res.data;
  },

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  getToken() {
    return localStorage.getItem('token');
  },

  getRoles() {
    const token = this.getToken();
    if (!token) return [];
    try {
      const decoded = jwtDecode(token);
      return Array.isArray(decoded.roles) ? decoded.roles : [decoded.rol];
    } catch (e) {
      return [];
    }
  },

  isAuthenticated() {
    return !!this.getToken();
  }
};
