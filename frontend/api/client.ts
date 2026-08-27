import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

import { useToastStore } from '@/store/toastStore';

// ============================================================
// API CLIENT
// ============================================================

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,

  // Required so the browser sends the HttpOnly
  // refresh-token cookie to api.offo.co.in
  withCredentials: true,
});

const refreshApi = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,

  // Required so the browser sends the HttpOnly
  // refresh-token cookie to api.offo.co.in
  withCredentials: true,
});

// ============================================================
// REFRESH STATE
// ============================================================

// Prevent multiple simultaneous refresh requests.
//
// Example:
//
// Request A → 401
// Request B → 401
// Request C → 401
//
// Only ONE refresh request will be sent.
// B and C wait for the same promise.

let refreshPromise: Promise<string> | null = null;

// ============================================================
// REQUEST INTERCEPTOR
// ============================================================

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('access_token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },

  (error) => {
    return Promise.reject(error);
  },
);

// ============================================================
// REFRESH ACCESS TOKEN
// ============================================================

const refreshAccessToken = async (): Promise<string> => {
  // ----------------------------------------------------------
  // If another request is already refreshing the token,
  // wait for it.
  // ----------------------------------------------------------

  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    try {
      const response = await refreshApi.post('/auth/refresh');

      const newAccessToken = response.data?.access_token;

      if (!newAccessToken) {
        throw new Error('Refresh response did not contain access token');
      }

      localStorage.setItem('access_token', newAccessToken);

      return newAccessToken;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
};

// ============================================================
// RESPONSE INTERCEPTOR
// ============================================================

api.interceptors.response.use(
  (response) => {
    return response;
  },

  async (error: AxiosError) => {
    const originalRequest = error.config as
      | (InternalAxiosRequestConfig & {
          _retry?: boolean;
        })
      | undefined;

    // ========================================================
    // NO ORIGINAL REQUEST
    // ========================================================

    if (!originalRequest) {
      return Promise.reject(error);
    }

    // ========================================================
    // NETWORK ERROR
    // ========================================================

    if (error.code === 'ERR_NETWORK') {
      useToastStore
        .getState()
        .showError('No Internet Connection. Please check your network.');

      return Promise.reject(error);
    }

    // ========================================================
    // SERVER ERROR
    // ========================================================

    if (error.response?.status && error.response.status >= 500) {
      useToastStore.getState().showError('Server error. Please try again.');

      return Promise.reject(error);
    }

    // ========================================================
    // ONLY HANDLE 401
    // ========================================================

    if (error.response?.status !== 401) {
      return Promise.reject(error);
    }

    // ========================================================
    // NEVER REFRESH LOGOUT REQUEST
    // ========================================================

    if (originalRequest.url?.includes('/auth/logout')) {
      return Promise.reject(error);
    }

    // ========================================================
    // NEVER REFRESH THE REFRESH REQUEST
    // ========================================================

    if (originalRequest.url?.includes('/auth/refresh')) {
      localStorage.removeItem('access_token');

      window.location.href = '/login';

      return Promise.reject(error);
    }

    // ========================================================
    // DON'T RETRY SAME REQUEST TWICE
    // ========================================================

    if (originalRequest._retry) {
      localStorage.removeItem('access_token');

      window.location.href = '/login';

      return Promise.reject(error);
    }

    originalRequest._retry = true;

    // ========================================================
    // REFRESH ACCESS TOKEN
    // ========================================================

    try {
      const newAccessToken = await refreshAccessToken();

      // ------------------------------------------------------
      // Update token in original request
      // ------------------------------------------------------

      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

      // ------------------------------------------------------
      // Retry original request
      // ------------------------------------------------------

      return api(originalRequest);
    } catch (refreshError) {
      localStorage.removeItem('access_token');

      window.location.href = '/login';

      return Promise.reject(refreshError);
    }
  },
);

export {
  refreshApi
};
export default api;
