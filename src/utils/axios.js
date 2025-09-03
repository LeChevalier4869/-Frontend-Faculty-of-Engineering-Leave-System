import axios from "axios";

// base URL ของ backend
const API = axios.create({
  baseURL: "https://backend-faculty-of-engineering-leave.onrender.com",
  withCredentials: true, // ถ้าใช้ cookie
});

// --- Token Storage ---
let accessToken = null;
let refreshToken = null;

export function setTokens(tokens) {
  accessToken = tokens.accessToken;
  refreshToken = tokens.refreshToken;
}

// --- Interceptor Request ---
API.interceptors.request.use(
  async (config) => {
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// --- Interceptor Response ---
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // ถ้า access token หมดอายุ
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // ขอ token ใหม่จาก refresh
        const res = await axios.post("https://backend-faculty-of-engineering-leave.onrender.com/auth/refresh", {
          refreshToken,
        });

        accessToken = res.data.accessToken;
        refreshToken = res.data.refreshToken;

        // retry request เดิม
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return API(originalRequest);
      } catch (err) {
        console.error("Refresh token failed", err);
        window.location.href = "/login"; // บังคับ logout
      }
    }

    return Promise.reject(error);
  }
);

export default API;
