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

const authService = {
  register,
  login,
  logout,
  checkAuthStatus,
};

export default authService;
