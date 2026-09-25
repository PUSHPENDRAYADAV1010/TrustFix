import apiClient from './api';

export const authService = {
  // Real API login using Spring Boot /api/auth/login
  login: async ({ email, password }) => {
    try {
      const response = await apiClient.post('/auth/login', { email, password });
      const data = response.data;
      const token = data.token || data.message;
      const user = {
        id: data.userId,
        name: data.name,
        email: data.email,
        role: data.role
      };
      if (token) {
        localStorage.setItem('trustfix_token', token);
      }
      if (user) {
        localStorage.setItem('trustfix_user', JSON.stringify(user));
      }
      return {
        success: true,
        user,
        token,
        message: 'Login successful'
      };
    } catch (error) {
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
        id: response.data.id,
        name: response.data.name,
        email: response.data.email,
        phone: response.data.phone,
        role: response.data.role
      };

      try {
        const loginResponse = await apiClient.post('/auth/login', { email, password });
        const token = loginResponse.data.token || loginResponse.data.message;
        if (token) localStorage.setItem('trustfix_token', token);
      } catch {}

      localStorage.setItem('trustfix_user', JSON.stringify(user));
      return { success: true, user, message: 'Registration successful' };
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.response?.data?.error || 'Registration failed. Please try again.';
      throw new Error(errorMsg);
    }
  },

  logout: async () => {
    localStorage.removeItem('trustfix_token');
    localStorage.removeItem('trustfix_user');
    localStorage.removeItem('trustfix_provider_profile');
    return { success: true };
  }
};
