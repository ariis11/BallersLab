import Constants from 'expo-constants';

// API Configuration
export const API_CONFIG = {
  BASE_URL: Constants.expoConfig?.extra?.apiBaseUrl || 'http://localhost:3001',
  TIMEOUT: 10000, // 10 seconds
} as const;

// Environment Configuration
export const ENV_CONFIG = {
  IS_DEV: Constants.expoConfig?.extra?.env === 'development' || __DEV__,
  IS_PROD: Constants.expoConfig?.extra?.env === 'production',
} as const;

// App Configuration
export const APP_CONFIG = {
  NAME: Constants.expoConfig?.name || 'BallersLab',
  VERSION: Constants.expoConfig?.version || '1.0.0',
} as const;

// Helper function to get API base URL with fallback
export const getApiBaseUrl = (): string => {
  return API_CONFIG.BASE_URL;
};

// Helper function to check if we're in development
export const isDevelopment = (): boolean => {
  return ENV_CONFIG.IS_DEV;
}; 