import axios, { AxiosError } from "axios";

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000/v1",
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export function extractApiError(err: unknown): string {
  if (err instanceof AxiosError) {
    if (typeof err.response?.data?.detail === "string") {
      return err.response.data.detail;
    }
    if (Array.isArray(err.response?.data?.detail)) {
      return err.response.data.detail[0]?.msg || "An error occurred";
    }
    return err.response?.data?.message || err.message;
  }
  if (err instanceof Error) return err.message;
  return "An unexpected error occurred";
}
