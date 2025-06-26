import axios from 'axios';

import { env } from '@/config/env';
import { getActiveLogin } from '@/lib/utils';

export const avatarApi = axios.create({
  baseURL: `${env.SOCIAL_BASE_URL}/api/v1`,
});

// add auth token to the request
avatarApi.interceptors.request.use((config) => {
  const token = getActiveLogin()?.accessToken;
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
