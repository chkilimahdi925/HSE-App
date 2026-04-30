import React, { createContext, useContext, useEffect, useState } from 'react';
import api, { clearSession, getStoredUser, getToken, saveToken, saveUser } from '../api/axiosInstance';
import { API_URLS } from '../api/endpoints';
import { getErrorMessage } from '../utils/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = await getToken();
      const cachedUser = await getStoredUser();

      if (!token) {
        setUser(null);
        return;
      }

      if (cachedUser) {
        setUser(cachedUser);
      }

      const response = await api.get(API_URLS.auth.me);
      const nextUser = response.data.user;
      setUser(nextUser);
      await saveUser(nextUser);
    } catch (err) {
      setUser(null);
      await clearSession();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      setError(null);
      const response = await api.post(API_URLS.auth.login, { email, password });
      const loggedUser = response.data.user;
      const token = response.data.token;

      if (token) {
        await saveToken(token);
      }

      if (loggedUser) {
        await saveUser(loggedUser);
        setUser(loggedUser);
      }

      return { success: true, user: loggedUser };
    } catch (err) {
      const message = getErrorMessage(err, 'Erreur de connexion');
      setError(message);
      return { success: false, error: message };
    }
  };

  const logout = async () => {
    try {
      await api.post(API_URLS.auth.logout);
    } catch (_) {
      // ignore server logout failure on mobile
    } finally {
      await clearSession();
      setUser(null);
    }
  };

  const updateCurrentUser = async (nextUser) => {
    setUser(nextUser);
    if (nextUser) {
      await saveUser(nextUser);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        logout,
        setUser: updateCurrentUser,
        refreshSession: checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth doit être utilisé dans AuthProvider');
  return ctx;
};
