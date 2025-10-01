import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { api, logout as apiLogout } from '../api/client.js';

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Function to fetch user data
  const fetchMe = useCallback(async () => {
    try {
      const data = await api('/api/auth/me');
      setUser(data.user);
      setError(null);
      return data.user;
    } catch (err) {
      console.error('Error fetching user:', err);
      setUser(null);
      setError(err.message || 'Failed to fetch user data');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        await fetchMe();
      } catch (err) {
        console.error('Auth initialization error:', err);
        setError('Failed to initialize authentication');
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Listen for logout events from other tabs
    const handleStorageEvent = (event) => {
      if (event.key === 'logout') {
        setUser(null);
      }
    };

    // Listen for unauthorized events (e.g., token refresh failed)
    const handleUnauthorized = () => {
      setUser(null);
      // You can add a redirect to login page here if needed
    };

    window.addEventListener('storage', handleStorageEvent);
    window.addEventListener('unauthorized', handleUnauthorized);

    return () => {
      window.removeEventListener('storage', handleStorageEvent);
      window.removeEventListener('unauthorized', handleUnauthorized);
    };
  }, [fetchMe]);

  // Login function
  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    
    try {
      // The API client will handle token storage
      const response = await api('/api/auth/login', { 
        method: 'POST', 
        data: { email, password } 
      });
      
      // Fetch user data after successful login
      const userData = await fetchMe();
      return { success: true, user: userData };
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Login failed. Please check your credentials.');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      // Call the API client's logout function
      await apiLogout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      // Clear user state regardless of API call success
      setUser(null);
      setError(null);
    }
  };

  // Value object for context
  const value = { 
    user, 
    loading, 
    error,
    login, 
    logout, 
    isAdmin: user?.role === 'admin',
    refreshUser: fetchMe
  };

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

// Custom hook to use the auth context
export function useAuth() {
  const context = useContext(AuthCtx);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
