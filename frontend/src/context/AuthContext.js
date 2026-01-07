import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import jwtDecode from 'jwt-decode';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('token');
    if (token) {
      try {
        // Verify token expiration
        const decodedToken = jwtDecode(token);
        const currentTime = Date.now() / 1000;
        
        if (decodedToken.exp > currentTime) {
          // Set up axios default header
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          // Attempt to hydrate user from cache first
          const cachedUserRaw = localStorage.getItem('user');
          if (cachedUserRaw) {
            try {
              const cachedUser = JSON.parse(cachedUserRaw);
              setUser(cachedUser);
            } catch (_) {
              // ignore parse errors
            }
          } else {
            // Fallback minimal user from token if available
            const minimalUser = {
              id: decodedToken.id || decodedToken.sub,
              email: decodedToken.email,
              role: decodedToken.role,
              name: decodedToken.name
            };
            setUser(minimalUser);
          }
          setIsAuthenticated(true);
          setIsLoading(false);

          // Refresh user profile in background (do not force logout on failure)
          fetchUserProfile(true);
        } else {
          // Token expired
          logout();
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error decoding token:', error);
        logout();
        setIsLoading(false);
      }
    } else {
      setIsLoading(false);
    }
  }, []);

  const fetchUserProfile = async (background = false) => {
    try {
      const response = await axios.get('/api/users/profile');
      setUser(response.data);
      setIsAuthenticated(true);
      setIsLoading(false);
      try { localStorage.setItem('user', JSON.stringify(response.data)); } catch (_) {}
    } catch (error) {
      console.error('Error fetching user profile:', error);
      // In background mode, don't force logout on transient errors
      if (!background) {
        // Only logout if explicitly not background fetching
        logout();
      }
      setIsLoading(false);
      setError(error.response?.data?.message || 'Failed to load profile');
    }
  };

  const login = async (email, password) => {
    try {
      setError(null);
      const response = await axios.post('/api/users/login', { email, password });
      const { token, user } = response.data;
      
      // Save token to local storage
      localStorage.setItem('token', token);
      
      // Set up axios default header
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      setUser(user);
      setIsAuthenticated(true);
      try { localStorage.setItem('user', JSON.stringify(user)); } catch (_) {}
      
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      setError(error.response?.data?.message || 'Login failed. Please try again.');
      return { success: false, error: error.response?.data?.message || 'Login failed' };
    }
  };

  const register = async (userData) => {
    try {
      setError(null);
      const response = await axios.post('/api/users/register', userData);
      const { token, user } = response.data;
      
      // Save token to local storage
      localStorage.setItem('token', token);
      
      // Set up axios default header
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      setUser(user);
      setIsAuthenticated(true);
      
      return { success: true };
    } catch (error) {
      console.error('Registration error:', error);
      setError(error.response?.data?.message || 'Registration failed. Please try again.');
      return { success: false, error: error.response?.data?.message || 'Registration failed' };
    }
  };

  const logout = () => {
    // Remove token from local storage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Remove axios default header
    delete axios.defaults.headers.common['Authorization'];
    
    setUser(null);
    setIsAuthenticated(false);
  };

  // Axios interceptor to auto-logout on 401 unauthorized
  useEffect(() => {
    const id = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error?.response?.status === 401) {
          logout();
        }
        return Promise.reject(error);
      }
    );
    return () => axios.interceptors.response.eject(id);
  }, []);

  const updateProfile = async (userData) => {
    try {
      setError(null);
      const response = await axios.put('/api/users/profile', userData);
      setUser(response.data.user);
      try { localStorage.setItem('user', JSON.stringify(response.data.user)); } catch (_) {}
      return { success: true };
    } catch (error) {
      console.error('Update profile error:', error);
      setError(error.response?.data?.message || 'Update failed. Please try again.');
      return { success: false, error: error.response?.data?.message || 'Update failed' };
    }
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    updateProfile
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
