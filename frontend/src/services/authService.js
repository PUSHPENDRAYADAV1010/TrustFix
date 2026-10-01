import apiClient, { clearAuthStorage } from './api';

const getTokenFromResponse = (payload) => {
  const rawToken = payload?.token ?? payload?.accessToken ?? payload?.jwt ?? null;
  return typeof rawToken === 'string' && rawToken.trim() ? rawToken.trim() : null;
};

const normalizeUser = (payload) => {
  if (!payload || typeof payload !== 'object') {
    return null;
  }

  return {
    id: payload.userId ?? payload.id ?? null,
    name: payload.name ?? '',
    email: payload.email ?? '',
    role: payload.role ?? 'CUSTOMER',
  };
};

export const authService = {
  // Real API login using Spring Boot /api/auth/login
  login: async ({ email, password }) => {
    try {
      const response = await apiClient.post('/auth/login', { email, password });
      const data = response.data ?? {};
      const token = getTokenFromResponse(data);

      if (!token) {
        throw new Error('Authentication failed: no token returned by server.');
      }

      const user = normalizeUser(data);
      if (!user?.email) {
        throw new Error('Authentication failed: invalid user payload returned by server.');
      }

      localStorage.setItem('trustfix_token', token);
      localStorage.setItem('trustfix_user', JSON.stringify(user));

      return {
        success: true,
        user,
        token,
        message: 'Login successful',
      };
    } catch (error) {
      clearAuthStorage();
      const errorMsg = error.response?.data?.message || error.response?.data?.error || 'Invalid email or password. Please try again.';
      throw new Error(errorMsg);
    }
  },

  // Real API register
  register: async ({ name, email, phone, password, role, service, serviceArea }) => {
    const userRole = role === 'PROVIDER' ? 'PROVIDER' : 'CUSTOMER';
    try {
      const response = await apiClient.post('/auth/register', {
        name,
        email,
        phone,
        password,
        role: userRole,
      });

      const user = {
        id: response.data?.id ?? null,
        name: response.data?.name ?? name,
        email: response.data?.email ?? email,
        phone: response.data?.phone ?? phone,
        role: response.data?.role ?? userRole,
      };

      try {
        const loginResponse = await apiClient.post('/auth/login', { email, password });
        const token = getTokenFromResponse(loginResponse.data ?? {});
        if (token) {
          localStorage.setItem('trustfix_token', token);
        }
      } catch (loginError) {
        console.warn('[AuthService] Auto-login after registration failed:', loginError);
      }

      localStorage.setItem('trustfix_user', JSON.stringify(user));
      return { success: true, user, message: 'Registration successful' };
    } catch (error) {
      clearAuthStorage();
      const errorMsg = error.response?.data?.message || error.response?.data?.error || 'Registration failed. Please try again.';
      throw new Error(errorMsg);
    }
  },

  logout: async () => {
    clearAuthStorage();
    return { success: true };
  },
};
