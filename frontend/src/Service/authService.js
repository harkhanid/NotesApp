import { API_DOMAIN } from "../constants/constants";
import apiClient, { api } from "../utils/apiClient.js";

const API_URL = API_DOMAIN + "/api/auth";

// Public endpoints - don't use apiClient (no 401 handling needed)
const register = (name, email, password) => {
  return fetch(API_URL + "/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name,
      email,
      password,
    }),
  });
};

const login = (email, password) => {
  return fetch(API_URL + "/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      password,
    }),
    credentials: "include",
  });
};

// Authenticated endpoints - use apiClient for 401 handling
const logout = () => {
  // Assuming the backend has a /logout endpoint that clears the cookie
  return api.post(API_URL + "/logout");
};

const checkAuthStatus = () => {
  return api.get(API_URL + "/profile");
};

/**
 * Get JWT token for WebSocket authentication
 * Since the main token is httpOnly, we fetch it from the backend
 */
const getWebSocketToken = async () => {
  try {
    const response = await api.get(API_URL + "/websocket-token");

    if (!response.ok) {
      throw new Error("Failed to fetch WebSocket token");
    }

    const data = await response.json();
    return data.token;
  } catch (error) {
    console.error("Error fetching WebSocket token:", error);
    return null;
  }
};

/**
 * Check if a user exists by email
 * Used for validating email addresses before sharing notes
 */
const checkEmailExists = async (email) => {
  try {
    const response = await api.get(API_URL + `/check-email?email=${encodeURIComponent(email)}`);

    if (!response.ok) {
      throw new Error("Failed to check email");
    }

    const data = await response.json();
    return data.exists;
  } catch (error) {
    console.error("Error checking email:", error);
    return false;
  }
};

// Email verification functions removed - using manual admin approval instead

/**
 * Request password reset
 */
const forgotPassword = (email) => {
  return fetch(API_URL + "/forgot-password", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email }),
  });
};

/**
 * Validate password reset token
 */
const validateResetToken = (token) => {
  return fetch(API_URL + `/validate-reset-token?token=${encodeURIComponent(token)}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
};

/**
 * Reset password with token
 */
const resetPassword = (token, password) => {
  return fetch(API_URL + "/reset-password", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ token, password }),
  });
};

const authService = {
  register,
  login,
  logout,
  checkAuthStatus,
  getWebSocketToken,
  checkEmailExists,
  forgotPassword,
  validateResetToken,
  resetPassword,
};

export default authService;
