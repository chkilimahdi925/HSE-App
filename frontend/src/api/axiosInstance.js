import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_API_URL } from './endpoints';

export const TOKEN_KEY = 'hse_access_token';
export const USER_KEY = 'hse_user';

const api = axios.create({
  baseURL: BASE_API_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem(TOKEN_KEY);

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      config.headers.Cookie = `access_token=${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  async (response) => {
    const tokenFromBody = response?.data?.token;
    if (tokenFromBody) {
      await AsyncStorage.setItem(TOKEN_KEY, tokenFromBody);
    }

    const setCookie = response?.headers?.['set-cookie'];
    if (!tokenFromBody && setCookie) {
      const cookieString = Array.isArray(setCookie) ? setCookie.join(';') : setCookie;
      const match = cookieString.match(/access_token=([^;]+)/);
      if (match?.[1]) {
        await AsyncStorage.setItem(TOKEN_KEY, match[1]);
      }
    }

    return response;
  },
  async (error) => {
    if (error?.response?.status === 401) {
      await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
    }
    return Promise.reject(error);
  }
);

export const saveToken = async (token) => AsyncStorage.setItem(TOKEN_KEY, token);
export const getToken = async () => AsyncStorage.getItem(TOKEN_KEY);
export const saveUser = async (user) => AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
export const getStoredUser = async () => {
  const raw = await AsyncStorage.getItem(USER_KEY);
  return raw ? JSON.parse(raw) : null;
};
export const clearSession = async () => AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);

export default api;
