import Constants from 'expo-constants';
import { Platform } from 'react-native';

const extra =
  Constants.expoConfig?.extra ||
  Constants.manifest2?.extra ||
  Constants.manifest?.extra ||
  {};

const configuredBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL || extra.apiBaseUrl || '';

const defaultBaseUrl = Platform.select({
  android: 'http://10.0.2.2:5000',
  ios: 'http://localhost:5000',
  default: 'http://localhost:5000',
});

export const BASE_URL = (configuredBaseUrl || defaultBaseUrl).replace(/\/$/, '');
export const BASE_API_URL = `${BASE_URL}/api`;
