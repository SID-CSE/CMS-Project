import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize auth state from localStorage
  useEffect(() => {
    const storedUser = authService.getCurrentUser();
    if (storedUser) {
      setUser(storedUser);
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const result = await authService.login({ email, password });
      if (result.ok && result.user) {
        setUser(result.user);
        return { ok: true, user: result.user };
      } else {
        setError(result.message);
        return { ok: result.ok, requiresVerification: result.requiresVerification, verificationEmail: result.verificationEmail, developmentVerificationUrl: result.developmentVerificationUrl, message: result.message };
      }
    } catch (err) {
      setError(err.message);
      return { ok: false, message: err.message };
    } finally {
      setLoading(false);
    }
  };

  const register = async (email, username, name, role, password) => {
    setLoading(true);
    setError(null);
    try {
      const result = await authService.register({ email, username, name, role, password });
      if (result.ok) {
        setUser(result.user);
        return { ok: true, user: result.user };
      } else {
        setError(result.message);
        return { ok: false, message: result.message };
      }
    } catch (err) {
      setError(err.message);
      return { ok: false, message: err.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await authService.logout();
      setUser(null);
      setError(null);
      return { ok: true };
    } catch (err) {
      setError(err.message);
      return { ok: false, message: err.message };
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    isLoggedIn: !!user,
    userId: user?.id,
    userRole: user?.role,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export default AuthContext;
