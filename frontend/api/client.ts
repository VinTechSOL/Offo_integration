import axios from "axios";
import { useToastStore } from "@/store/toastStore";


const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);


// GLOBAL AUTH FAILURE HANDLER
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired / invalid
      localStorage.removeItem("access_token");
      // Force hard reset to login
      window.location.href = "/"; // or "/login"
    }

    if (
      error.response?.status >= 500 ||
      error.code === "ERR_NETWORK"
    ) {
      useToastStore.getState().showError(
        "No Internet Connection.Please Check your network"
      );
    }

    return Promise.reject(error);
  }
);



export default api;
