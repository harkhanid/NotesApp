import { API_DOMAIN } from "../constants/constants";
const API_URL = API_DOMAIN + "/api/auth";

const register = (username, email, password) => {
  return fetch(API_URL + "/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username,
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

const logout = () => {
  // Assuming the backend has a /logout endpoint that clears the cookie
  return fetch(API_URL + "/logout", {
    method: "POST",
    credentials: "include",
  });
};

const checkAuthStatus = () => {
  return fetch(API_URL + "/profile", {
    credentials: "include", // This is crucial for sending the HttpOnly cookie
  });
};

/**
 * Get JWT token for WebSocket authentication
 * Since the main token is httpOnly, we fetch it from the backend
 */
const getWebSocketToken = async () => {
  try {
    const response = await fetch(API_URL + "/websocket-token", {
      credentials: "include",
    });

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

const authService = {
  register,
  login,
  logout,
  checkAuthStatus,
  getWebSocketToken,
};

export default authService;
