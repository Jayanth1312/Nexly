import axios from "axios";
import Cookies from "js-cookie";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Include cookies in requests
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = Cookies.get("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid, remove it
      Cookies.remove("token");
      // Optionally redirect to login
      window.location.href = "/sign-in";
    }
    return Promise.reject(error);
  }
);

export const authService = {
  // Register new user
  register: async (userData: {
    email: string;
    name: string;
    profession?: string;
    password: string;
  }) => {
    try {
      const response = await api.post("/auth/register", userData);

      // Store token in cookie
      if (response.data.token) {
        Cookies.set("token", response.data.token, {
          expires: 7, // 7 days
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
        });
      }

      return response.data;
    } catch (error: any) {
      throw error.response?.data || { message: "Registration failed" };
    }
  },

  // Login user
  login: async (credentials: { email: string; password: string }) => {
    try {
      const response = await api.post("/auth/login", credentials);

      // Store token in cookie
      if (response.data.token) {
        Cookies.set("token", response.data.token, {
          expires: 7, // 7 days
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
        });
      }

      return response.data;
    } catch (error: any) {
      throw error.response?.data || { message: "Login failed" };
    }
  },

  // Logout user
  logout: async () => {
    try {
      await api.post("/auth/logout");
      Cookies.remove("token");
      window.location.href = "/sign-in";
    } catch (error) {
      // Even if request fails, remove token locally
      Cookies.remove("token");
      window.location.href = "/sign-in";
    }
  },

  // Get user profile
  getProfile: async () => {
    try {
      const response = await api.get("/auth/profile");
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { message: "Failed to get profile" };
    }
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return !!Cookies.get("token");
  },

  // Get token
  getToken: () => {
    return Cookies.get("token");
  },

  // Request password reset
  requestPasswordReset: async (email: string) => {
    try {
      const response = await api.post("/auth/forgot-password", { email });
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { message: "Failed to send reset email" };
    }
  },

  // Reset password with token
  resetPassword: async (token: string, password: string) => {
    try {
      const response = await api.post("/auth/reset-password", {
        token,
        password,
      });
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { message: "Failed to reset password" };
    }
  },

  // Verify reset token
  verifyResetToken: async (token: string) => {
    try {
      const response = await api.get(`/auth/verify-reset-token/${token}`);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { message: "Invalid or expired token" };
    }
  },

  // OAuth URLs
  getGoogleAuthUrl: () => `${API_BASE_URL}/auth/google`,
  getGitHubAuthUrl: () => `${API_BASE_URL}/auth/github`,
};

export default authService;
