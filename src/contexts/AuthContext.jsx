import { createContext, useContext, useState, useEffect } from 'react';
import api from '../config/axios';
import { toast } from 'react-toastify';
const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tokenExpiryTime, setTokenExpiryTime] = useState(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    const storedRefreshToken = localStorage.getItem('refreshToken');
    const storedExpiryTime = localStorage.getItem('tokenExpiryTime');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
      setRefreshToken(storedRefreshToken);
      setTokenExpiryTime(storedExpiryTime ? parseInt(storedExpiryTime) : null);

      // Check if token is expired
      if (storedExpiryTime && Date.now() > parseInt(storedExpiryTime)) {
        // Token is expired, try to refresh
        if (storedRefreshToken) {
          refreshTokenFunc();
        } else {
          logout();
        }
      } else if (storedExpiryTime) {
        // Token is still valid, set up auto refresh
        setupTokenRefresh(parseInt(storedExpiryTime));
      }
    }
    setLoading(false);
  }, []);

  // Add effect to handle token refresh function dependency
  useEffect(() => {
    // This effect ensures refreshTokenFunc is available when needed
  }, [refreshToken]);

  const login = async (email, password) => {
    try {

      const response = await api.post(`auth/login`, { identifier: email, password });
      if (response.data.success) {
        console.log('Login response:', response.data);
        const { token, user, refreshToken } = response.data.data;

        // Calculate expiry time (100 minutes from now)
        const expiryTime = Date.now() + (100 * 60 * 1000); // 100 minutes in milliseconds

        setToken(token);
        setUser(user);
        setRefreshToken(refreshToken);
        setTokenExpiryTime(expiryTime);

        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('tokenExpiryTime', expiryTime.toString());

        // Set up auto refresh before expiry (refresh 5 minutes before expiry)
        setupTokenRefresh(expiryTime);

        toast.success('Login successful!');
        return response;
      } else {
        toast.error('Invalid email/password or inactive account.');
      }
    } catch (error) {
      toast.error('Invalid email/password or inactive account.');
    }
  };

  const register = async (email, password, confirmPassword) => {
    try {
      if (password !== confirmPassword) {
        throw new Error('Passwords do not match');
      }

      const response = await api.post(`auth/register`, { email, password, confirmPassword });
      if (response.data.success) {
        const { token, user } = response.data;
        setToken(token);
        setUser(user);
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        return response;
      } else {
        toast.error('Registration failed. Please try again.');
      }
    } catch (error) {
      toast.error('Registration failed. Please try again.');
    }
  };

  const refreshTokenFunc = async () => {
    try {
      const storedRefreshToken = localStorage.getItem('refreshToken');
      if (!storedRefreshToken) {
        logout();
        return;
      }

      const response = await api.post('auth/refresh-token', {
        refreshToken: storedRefreshToken
      });

      if (response.data.success) {
        const { token, refreshToken: newRefreshToken } = response.data.data;

        // Calculate new expiry time (100 minutes from now)
        const expiryTime = Date.now() + (100 * 60 * 1000);

        setToken(token);
        setRefreshToken(newRefreshToken);
        setTokenExpiryTime(expiryTime);

        localStorage.setItem('token', token);
        localStorage.setItem('refreshToken', newRefreshToken);
        localStorage.setItem('tokenExpiryTime', expiryTime.toString());

        // Set up next auto refresh
        setupTokenRefresh(expiryTime);

        console.log('Token refreshed successfully');
        return token;
      } else {
        logout();
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      logout();
    }
  };

  const setupTokenRefresh = (expiryTime) => {
    // Clear any existing timeout
    if (window.tokenRefreshTimeout) {
      clearTimeout(window.tokenRefreshTimeout);
    }

    // Calculate time until refresh (5 minutes before expiry)
    const refreshTime = expiryTime - Date.now() - (5 * 60 * 1000); // 5 minutes before expiry

    if (refreshTime > 0) {
      window.tokenRefreshTimeout = setTimeout(() => {
        refreshTokenFunc();
      }, refreshTime);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setRefreshToken(null);
    setTokenExpiryTime(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('tokenExpiryTime');

    // Clear refresh timeout
    if (window.tokenRefreshTimeout) {
      clearTimeout(window.tokenRefreshTimeout);
    }
  };

  const isAdmin = () => user?.role === 'admin';
  const isManager = () => user?.role === 'manager';
  const canManage = () => isAdmin() || isManager();

  const value = {
    user,
    token,
    refreshToken,
    loading,
    login,
    register,
    logout,
    refreshTokenFunc,
    isAdmin,
    isManager,
    canManage
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};