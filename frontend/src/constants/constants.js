export const MENU = {
  ALL_NOTES: "All Notes",
  ARCHIEVD_NOTES: "Archieved Notes",
};

// Use environment variable for API URL
// Vite exposes env variables prefixed with VITE_ as import.meta.env.VITE_*
export const API_DOMAIN = import.meta.env.VITE_API_URL || "http://localhost:8080";
