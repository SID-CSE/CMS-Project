import apiClient from './apiClient';

// Helper to normalize roles
function normalizeRole(roleValue) {
  const role = (roleValue || '').toString().trim().toLowerCase();
  if (role === 'stakeholder') return 'STAKEHOLDER';
  if (role === 'admin') return 'ADMIN';
  if (role === 'editor') return 'EDITOR';
  return 'EDITOR';
}

function getDashboardPathForRole(role) {
  const normalizedRole = normalizeRole(role);

  if (normalizedRole === 'ADMIN') {
    return '/admin/dashboard';
  }

  if (normalizedRole === 'STAKEHOLDER') {
    return '/stakeholder/home';
  }

  return '/editor/dashboard';
}

const CURRENT_USER_KEY = 'contify_current_user';

function getAuthToken() {
  return localStorage.getItem('authToken');
}

// Store user session
function setCurrentUser(user) {
  if (user) {
    localStorage.setItem('currentUser', JSON.stringify(user));
    localStorage.setItem('userId', user.id);
    localStorage.setItem('userRole', user.role);
    localStorage.setItem('userEmail', user.email);
    localStorage.setItem('username', user.username || user.name || '');
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  }
}

function clearUserSession() {
  localStorage.removeItem('currentUser');
  localStorage.removeItem('userId');
  localStorage.removeItem('userRole');
  localStorage.removeItem('userEmail');
  localStorage.removeItem('username');
  localStorage.removeItem('authToken');
  localStorage.removeItem(CURRENT_USER_KEY);
}

function getCurrentUser() {
  const token = getAuthToken();
  if (!token) return null;

  const raw = localStorage.getItem(CURRENT_USER_KEY) || localStorage.getItem('currentUser');
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

// Authentication Service
export const authService = {
  async register({ email, username, name, role, password = 'default123' }) {
    try {
      const response = await apiClient.post('/auth/register', {
        email: (email || '').trim().toLowerCase(),
        username: (username || '').trim(),
        name: (name || username || '').trim(),
        role: normalizeRole(role),
        password,
      });

      const payload = response.data || response;
      const authData = payload.data || payload;
      if (authData?.token) {
        localStorage.setItem('authToken', authData.token);
      }
      if (authData?.token) setCurrentUser(authData?.user);

      return {
        ok: true,
        user: authData?.user,
        requiresVerification: Boolean(authData?.emailVerificationRequired),
        verificationEmail: authData?.verificationEmail,
        developmentVerificationUrl: authData?.developmentVerificationUrl,
      };
    } catch (error) {
      return {
        ok: false,
        message: error.message || 'Registration failed',
      };
    }
  },

  async login({ email, password }) {
    try {
      const response = await apiClient.post('/auth/login', {
        email: (email || '').trim().toLowerCase(),
        password,
      });

      const payload = response.data || response;
      const authData = payload.data || payload;
      if (authData?.token) {
        localStorage.setItem('authToken', authData.token);
      }
      setCurrentUser(authData?.user);

      return {
        ok: true,
        user: authData?.user,
      };
    } catch (error) {
      return {
        ok: false,
        message: error.message || 'Login failed',
      };
    }
  },

  async googleSignIn(credential, role = 'STAKEHOLDER') {
    try {
      const response = await apiClient.post('/auth/google', { credential, role });
      const payload = response.data || response;
      const authData = payload.data || payload;
      if (!authData?.token || !authData?.user) throw new Error('Google sign-in did not return an authenticated session.');
      localStorage.setItem('authToken', authData.token);
      setCurrentUser(authData.user);
      return { ok: true, user: authData.user };
    } catch (error) {
      return { ok: false, message: error.message || 'Google sign-in failed.' };
    }
  },

  async verifyEmail(token) {
    try {
      const response = await apiClient.get(`/auth/verify-email?token=${encodeURIComponent(token || '')}`);
      return { ok: true, message: response.message || 'Email verified successfully.' };
    } catch (error) {
      return { ok: false, message: error.message || 'Unable to verify email.' };
    }
  },

  async resendVerification(email) {
    try {
      const response = await apiClient.post('/auth/resend-verification', { email });
      const data = response.data || {};
      return {
        ok: true,
        message: response.message || 'If the account can receive verification, instructions have been sent.',
        developmentVerificationUrl: data.developmentVerificationUrl,
      };
    } catch (error) {
      return { ok: false, message: error.message || 'Unable to resend verification email.' };
    }
  },

  async forgotPassword(email) {
    try {
      const normalizedEmail = (email || '').trim().toLowerCase();
      if (!normalizedEmail) {
        return {
          ok: false,
          message: 'Please enter your email in the login form first.',
        };
      }

      const response = await apiClient.post('/auth/forgot-password', {
        email: normalizedEmail,
      });

      return {
        ok: true,
        message: response?.message || 'If your account exists, reset instructions have been sent.',
      };
    } catch (error) {
      return {
        ok: false,
        message: error.message || 'Unable to process forgot password request',
      };
    }
  },

  async resetPassword(token, password) {
    try {
      const safeToken = (token || '').trim();
      if (!safeToken) {
        return {
          ok: false,
          message: 'Invalid reset token.',
        };
      }

      const response = await apiClient.post('/auth/reset-password', {
        token: safeToken,
        password,
      });

      return {
        ok: true,
        message: response?.message || 'Password has been reset successfully.',
      };
    } catch (error) {
      return {
        ok: false,
        message: error.message || 'Unable to reset password',
      };
    }
  },

  async logout() {
    clearUserSession();
    return { ok: true };
  },

  isLoggedIn() {
    return !!getCurrentUser();
  },

  getCurrentUser() {
    return getCurrentUser();
  },

  getUserId() {
    return localStorage.getItem('userId');
  },

  getUserRole() {
    return localStorage.getItem('userRole');
  },

  getDashboardPath() {
    return getDashboardPathForRole(this.getUserRole());
  },
};

export { getDashboardPathForRole, getCurrentUser };
