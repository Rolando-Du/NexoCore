import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

export const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("nexocore_token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const statusCode = error.response?.status;
    const currentPath = window.location.pathname;

    if (statusCode === 401 && currentPath !== "/login") {
      localStorage.removeItem("nexocore_token");
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);