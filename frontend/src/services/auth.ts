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
  // Try multiple methods to get the token
  let token = Cookies.get("token");
  if (!token) {
    // Fallback to document.cookie
    token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("token="))
      ?.split("=")[1];
  }
  if (!token && typeof window !== "undefined") {
    // Fallback to localStorage
    token = localStorage.getItem("token") || undefined;
  }

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

      // Store token in multiple places to ensure it persists
      if (response.data.token) {
        console.log(
          "Auth service: Setting token in cookie:",
          response.data.token.substring(0, 20) + "..."
        );

        // Method 1: Using js-cookie
        Cookies.set("token", response.data.token, {
          expires: 7, // 7 days
          secure: process.env.NODE_ENV === "production",
          sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
          path: "/", // Ensure cookie is available across all paths
        });

        // Method 2: Using native document.cookie as fallback
        const cookieString = `token=${response.data.token}; path=/; max-age=${
          7 * 24 * 60 * 60
        }`;
        document.cookie = cookieString;

        // Method 3: Also store in localStorage as backup
        if (typeof window !== "undefined") {
          localStorage.setItem("token", response.data.token);
        }

        console.log("Auth service: Token stored in multiple locations");

        // Verify the token was set with all methods
        const jsCookieToken = Cookies.get("token");
        const documentCookieToken = document.cookie
          .split("; ")
          .find((row) => row.startsWith("token="))
          ?.split("=")[1];
        const localStorageToken =
          typeof window !== "undefined" ? localStorage.getItem("token") : null;

        console.log(
          "Verification - js-cookie:",
          jsCookieToken ? "found" : "not found"
        );
        console.log(
          "Verification - document.cookie:",
          documentCookieToken ? "found" : "not found"
        );
        console.log(
          "Verification - localStorage:",
          localStorageToken ? "found" : "not found"
        );
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
      // Remove token from all storage methods
      Cookies.remove("token");
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
      }
      window.location.href = "/sign-in";
    } catch (error) {
      // Even if request fails, remove token locally
      Cookies.remove("token");
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
      }
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
