/**
 * Get a cookie value by name
 * @param {string} name - Cookie name
 * @returns {string|null} Cookie value or null if not found
 */
export const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop().split(';').shift();
  }
  return null;
};

/**
 * Get the JWT token from httpOnly cookie
 * Note: In production, the token cookie is httpOnly and cannot be read by JavaScript
 * This is a fallback for development or if the cookie is not httpOnly
 * @returns {string|null} JWT token or null
 */
export const getJWTToken = () => {
  return getCookie('token');
};
