import axios, { AxiosError } from "axios";

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000/v1",
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
    const data = err.response?.data;
    if (data?.error?.message) {
      return data.error.message;
    }
    if (typeof data?.detail === "string") {
      return data.detail;
    }
    if (Array.isArray(data?.detail)) {
      return data.detail[0]?.msg || "Validation error";
    }
    if (data?.message) {
      return data.message;
    }
    return err.message || "Network Request Error";
  }
  if (err instanceof Error) return err.message;
  return "An unexpected error occurred";
}

