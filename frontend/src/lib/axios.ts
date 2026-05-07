import axios from "axios";
import ENV from "../conf/conf";

const axiosInstance = axios.create({
  baseURL: `${ENV.API_BASE_URL}/api`,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // ✅ browser auto-sends httpOnly cookie
});

// ✅ No need to read cookie manually
// ✅ No need to set Authorization header
// The browser handles it automatically

axiosInstance.interceptors.request.use(
  (config) => {
    console.log("📤 Request:", {
      method: config.method,
      url: config.url,
      withCredentials: config.withCredentials,
      // Note: httpOnly cookies won't show here — that's correct & secure
    });
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Refresh-token state ───────────────────────────────────────────────────────
let isRefreshing = false;

// Pages that don't require authentication — never redirect away from these.
const PUBLIC_PATHS = ["/login", "/register"];

// Queue of { resolve, reject } for requests that arrived while a refresh
// was already in progress.
type QueueEntry = {
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
};
let failedQueue: QueueEntry[] = [];

/** Drain the queue after a refresh attempt. */
const processQueue = (error: unknown) => {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve()));
  failedQueue = [];
};

// ─── Response interceptor — handles silent token refresh ──────────────────────
axiosInstance.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    // Only intercept 401s that haven't been retried yet.
    // Also skip the refresh-token endpoint itself to avoid infinite loops.
    if (
      error.response?.status !== 401 ||
      originalRequest._retry ||
      originalRequest.url?.includes("/auth/refresh-token")
    ) {
      return Promise.reject(error);
    }

    // Another refresh is already running — queue this request.
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then(() => axiosInstance(originalRequest))
        .catch((err) => Promise.reject(err));
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      // Refresh sends the httpOnly refreshToken cookie automatically.
      await axiosInstance.post("/auth/refresh-token");
      console.log("🔄 Token refreshed — retrying original request");

      processQueue(null); // unblock queued requests
      return axiosInstance(originalRequest); // retry the original call

    } catch (refreshError) {
      processQueue(refreshError); // reject all queued requests

      // Refresh failed — session is dead, send user to login.
      // Skip redirect if already on a public page to prevent infinite reload loops.
      if (
        typeof window !== "undefined" &&
        !PUBLIC_PATHS.includes(window.location.pathname)
      ) {
        window.location.href = "/login";
      }
      return Promise.reject(refreshError);

    } finally {
      isRefreshing = false;
    }
  }
);

export { axiosInstance };