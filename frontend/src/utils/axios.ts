// lib/axios.ts
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
    console.log('📤 Request:', {
      method: config.method,
      url: config.url,
      withCredentials: config.withCredentials,
      // Note: httpOnly cookies won't show here — that's correct & secure
    });
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);


let isRefreshing = false;
// Queue failed requests while refreshing
let failedQueue: {
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}[] = [];

const processQueue = (error: unknown) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });
  failedQueue = [];
};

// ✅ Response interceptor — handles token refresh
axiosInstance.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    // If 401 and not already retried
    if (error.response?.status === 401 && !originalRequest._retry) {
      
      if (isRefreshing) {
        // Queue request while refresh is in progress
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => axiosInstance(originalRequest))
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // ✅ Call refresh — sends refreshToken cookie automatically
        await axiosInstance.post('/auth/refresh-token');

        processQueue(null); // retry all queued requests
        return axiosInstance(originalRequest); // retry original

      } catch (refreshError) {
        processQueue(refreshError);

        // Refresh failed — redirect to login
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);

      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);



export { axiosInstance };