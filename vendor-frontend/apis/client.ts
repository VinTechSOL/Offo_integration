import axios, {
  AxiosError,
  InternalAxiosRequestConfig,
} from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
});

// =========================================================
// REQUEST INTERCEPTOR
// =========================================================

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem("access_token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// =========================================================
// RESPONSE INTERCEPTOR
// =========================================================

let isRefreshing = false;

let refreshSubscribers: Array<
  (token: string) => void
> = [];

const subscribeTokenRefresh = (
  callback: (token: string) => void
) => {
  refreshSubscribers.push(callback);
};

const onRefreshed = (token: string) => {
  refreshSubscribers.forEach((callback) => {
    callback(token);
  });

  refreshSubscribers = [];
};

const clearRefreshSubscribers = () => {
  refreshSubscribers = [];
};

api.interceptors.response.use(
  (response) => response,

  async (error: AxiosError) => {
    const originalRequest =
      error.config as InternalAxiosRequestConfig & {
        _retry?: boolean;
      };

    // =======================================================
    // ONLY HANDLE 401
    // =======================================================

    if (
      error.response?.status !== 401 ||
      !originalRequest
    ) {
      return Promise.reject(error);
    }

    // =======================================================
    // NEVER REFRESH THE REFRESH ENDPOINT ITSELF
    // =======================================================

    if (
      originalRequest.url?.includes(
        "/staff/auth/refresh"
      )
    ) {
      localStorage.removeItem("access_token");
      window.location.href = "/";
      return Promise.reject(error);
    }

    // =======================================================
    // PREVENT INFINITE RETRY
    // =======================================================

    if (originalRequest._retry) {
      localStorage.removeItem("access_token");
      window.location.href = "/";
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    // =======================================================
    // ANOTHER REQUEST IS ALREADY REFRESHING
    // =======================================================

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        subscribeTokenRefresh((newToken) => {
          if (!newToken) {
            reject(error);
            return;
          }

          originalRequest.headers.Authorization =
            `Bearer ${newToken}`;

          resolve(api(originalRequest));
        });
      });
    }

    // =======================================================
    // START REFRESH
    // =======================================================

    isRefreshing = true;

    try {
      const refreshResponse =
        await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/staff/auth/refresh`,
          {},
          {
            withCredentials: true,
          }
        );

      const newAccessToken =
        refreshResponse.data.access_token;

      localStorage.setItem(
        "access_token",
        newAccessToken
      );

      // Release requests waiting for refresh
      onRefreshed(newAccessToken);

      // Retry original request
      originalRequest.headers.Authorization =
        `Bearer ${newAccessToken}`;

      return api(originalRequest);

    } catch (refreshError) {
      clearRefreshSubscribers();

      localStorage.removeItem(
        "access_token"
      );

      window.location.href = "/";

      return Promise.reject(refreshError);

    } finally {
      isRefreshing = false;
    }
  }
);

export default api;