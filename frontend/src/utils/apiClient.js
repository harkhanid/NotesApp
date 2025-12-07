import { API_DOMAIN } from "../constants/constants.js";
import store from "../store.js";
import { clearAuth } from "../store/authSlice.js";
import { addToast } from "../store/toastSlice.js";

// Track if we're already handling a 401 to prevent loops
let isHandling401 = false;

/**
 * Enhanced fetch wrapper that handles 401 responses globally
 * Automatically logs out user when JWT token expires
 */
const apiClient = async (url, options = {}) => {
  // Ensure credentials are included for cookie-based auth
  const config = {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);

    // Handle 401 Unauthorized - JWT token expired or invalid
    if (response.status === 401 && !isHandling401) {
      isHandling401 = true;

      // Dispatch clearAuth action to clear auth state (synchronous, no API call)
      store.dispatch(clearAuth());

      // Only show toast and redirect if not already on login/auth pages
      const currentPath = window.location.pathname;
      const isAuthPage = ['/login', '/signup', '/forgot-password', '/reset-password', '/verify-email', '/resend-verification'].includes(currentPath);

      if (!isAuthPage) {
        // Show toast notification
        store.dispatch(
          addToast({
            message: "Your session has expired. Please login again.",
            type: "error",
          })
        );

        // Redirect to login page
        window.location.href = "/login";
      }

      // Reset flag after a delay
      setTimeout(() => {
        isHandling401 = false;
      }, 1000);

      // Throw error to prevent further processing
      throw new Error("Unauthorized - Session expired");
    }

    return response;
  } catch (error) {
    // If it's a network error or the 401 error we threw above
    if (error.message === "Unauthorized - Session expired") {
      throw error;
    }

    // For other errors, re-throw
    throw error;
  }
};

/**
 * Convenience methods for common HTTP verbs
 */
export const api = {
  get: (url, options = {}) => {
    return apiClient(url, { ...options, method: "GET" });
  },

  post: (url, data, options = {}) => {
    return apiClient(url, {
      ...options,
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  put: (url, data, options = {}) => {
    return apiClient(url, {
      ...options,
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  patch: (url, data, options = {}) => {
    return apiClient(url, {
      ...options,
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  delete: (url, options = {}) => {
    return apiClient(url, { ...options, method: "DELETE" });
  },
};

// Export API_URL for convenience
export const API_URL = `${API_DOMAIN}/api`;

export default apiClient;
