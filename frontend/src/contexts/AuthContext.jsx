import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  completeProfile as completeProfileRequest,
  getCurrentUser,
  sendOtp as sendOtpRequest,
  verifyOtp as verifyOtpRequest,
} from '../services/authService';
import {
  AUTH_TOKEN_STORAGE_KEY,
  clearStoredToken,
  storeAuthToken,
} from '../services/api';

const AuthContext = createContext(null);

function getErrorMessage(error, fallbackMessage) {
  return error.response?.data?.message || fallbackMessage;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);

  async function hydrateCurrentUser() {
    try {
      const response = await getCurrentUser();
      setUser(response.user);
      return response.user;
    } catch (error) {
      clearStoredToken();
      setUser(null);
      throw error;
    }
  }

  useEffect(() => {
    function handleAuthExpired() {
      setUser(null);
    }

    window.addEventListener('clinic:auth-expired', handleAuthExpired);

    const token = window.localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);

    if (!token) {
      setIsInitializing(false);
      return () => window.removeEventListener('clinic:auth-expired', handleAuthExpired);
    }

    hydrateCurrentUser().finally(() => setIsInitializing(false));

    return () => window.removeEventListener('clinic:auth-expired', handleAuthExpired);
  }, []);

  async function sendOtp(phone) {
    return sendOtpRequest(phone);
  }

  async function verifyOtp(phone, otp) {
    try {
      const response = await verifyOtpRequest(phone, otp);
      storeAuthToken(response.token);
      setUser(response.user);
      return response;
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Unable to verify OTP.'));
    }
  }

  async function completeProfile(profile) {
    try {
      const response = await completeProfileRequest(profile);
      setUser(response.user);
      return response.user;
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Unable to save your profile.'));
    }
  }

  async function refreshUser() {
    try {
      return await hydrateCurrentUser();
    } catch {
      return null;
    }
  }

  function logout() {
    clearStoredToken();
    setUser(null);
  }

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isInitializing,
      sendOtp,
      verifyOtp,
      completeProfile,
      refreshUser,
      logout,
    }),
    [user, isInitializing]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider.');
  }

  return context;
}
