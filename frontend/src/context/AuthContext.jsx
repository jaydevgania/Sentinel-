import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  getStoredToken, getStoredUser, setStoredToken, setStoredUser,
  loginUser, registerUser, logoutUser, fetchMe, upgradeSubscription
} from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(getStoredToken());
  const [user, setUser] = useState(getStoredUser());
  const [loading, setLoading] = useState(true);

  // Initialize and verify session on mount
  useEffect(() => {
    const initAuth = async () => {
      const savedToken = getStoredToken();
      if (savedToken) {
        try {
          const freshUser = await fetchMe();
          if (freshUser) {
            setUser(freshUser);
            setStoredUser(freshUser);
          } else {
            // Token invalid or expired
            setUser(null);
            setToken(null);
            setStoredToken(null);
            setStoredUser(null);
          }
        } catch (err) {
          console.warn('Session verification failed:', err);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    const res = await loginUser(email, password);
    setToken(res.token);
    setUser(res.user);
    return res.user;
  };

  const register = async (userData) => {
    const res = await registerUser(userData);
    setToken(res.token);
    setUser(res.user);
    return res.user;
  };

  const logout = () => {
    logoutUser();
    setToken(null);
    setUser(null);
  };

  const upgradePlan = async (tier, billingPeriod) => {
    const res = await upgradeSubscription(tier, billingPeriod);
    const freshUser = await fetchMe();
    if (freshUser) {
      setUser(freshUser);
      setStoredUser(freshUser);
    }
    return res;
  };

  const refreshProfile = async () => {
    const freshUser = await fetchMe();
    if (freshUser) {
      setUser(freshUser);
      setStoredUser(freshUser);
    }
    return freshUser;
  };

  const value = {
    user,
    token,
    isAuthenticated: !!user,
    isAdmin: !!user?.is_admin,
    loading,
    login,
    register,
    logout,
    upgradePlan,
    refreshProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
