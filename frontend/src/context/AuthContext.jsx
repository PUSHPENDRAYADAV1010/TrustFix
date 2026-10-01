import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { providerService } from '../services/providerService';
import { clearAuthStorage } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // Initialize from localStorage
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('trustfix_user');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return null;
  });

  const [providerProfile, setProviderProfile] = useState(() => {
    const saved = localStorage.getItem('trustfix_provider_profile');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return null;
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem('trustfix_token') || null;
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      localStorage.setItem('trustfix_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('trustfix_user');
    }
  }, [user]);

  useEffect(() => {
    if (providerProfile) {
      localStorage.setItem('trustfix_provider_profile', JSON.stringify(providerProfile));
    } else {
      localStorage.removeItem('trustfix_provider_profile');
    }
  }, [providerProfile]);

  useEffect(() => {
    if (token) {
      localStorage.setItem('trustfix_token', token);
    } else {
      localStorage.removeItem('trustfix_token');
    }
  }, [token]);

  useEffect(() => {
    // On app initialization or refresh: if authenticated provider, fetch fresh profile from MySQL
    if (token && user?.id && user.role === 'PROVIDER') {
      providerService.getProviderByUserId(user.id)
        .then((freshProfile) => {
          if (freshProfile) {
            setProviderProfile(freshProfile);
          }
        })
        .catch((err) => {
          console.warn('[AuthContext] Provider profile not yet created on backend:', err);
          setProviderProfile(null);
        });
    }
  }, [user?.id, user?.role, token]);

  const refreshProviderProfile = async () => {
    if (!user?.id || user.role !== 'PROVIDER') return null;
    try {
      const fresh = await providerService.getProviderByUserId(user.id);
      setProviderProfile(fresh);
      return fresh;
    } catch (e) {
      console.warn('[AuthContext] Failed to refresh provider profile:', e);
      return null;
    }
  };

  const login = async ({ email, password }) => {
    setLoading(true);
    try {
      const res = await authService.login({ email, password });
      if (!res?.token) {
        throw new Error('Login failed: missing token.');
      }

      setUser(res.user);
      setToken(res.token);

      if (res.user?.role === 'PROVIDER') {
        try {
          const realProfile = await providerService.getProviderByUserId(res.user.id);
          setProviderProfile(realProfile);
        } catch (pErr) {
          console.warn('[AuthContext] Provider profile not found for user ID:', res.user.id);
          setProviderProfile(null);
        }
      } else {
        setProviderProfile(null);
      }

      return res;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    try {
      const res = await authService.register(userData);
      setUser(res.user);

      if (res.user?.role === 'PROVIDER') {
        try {
          const realProfile = await providerService.getProviderByUserId(res.user.id);
          setProviderProfile(realProfile);
        } catch (pErr) {
          setProviderProfile(null);
        }
      } else {
        setProviderProfile(null);
      }

      return res;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await authService.logout();
      clearAuthStorage();
      setUser(null);
      setProviderProfile(null);
      setToken(null);
    } finally {
      setLoading(false);
    }
  };

  const updateUser = (updatedFields) => {
    setUser(prev => (prev ? { ...prev, ...updatedFields } : updatedFields));
  };

  const updateProvider = (updatedFields) => {
    setProviderProfile(prev => (prev ? { ...prev, ...updatedFields } : updatedFields));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        providerProfile,
        role: user?.role || null,
        isAuthenticated: !!user && !!token,
        token,
        loading,
        login,
        register,
        logout,
        updateUser,
        updateProvider,
        refreshProviderProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
