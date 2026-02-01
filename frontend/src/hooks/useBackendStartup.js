import { useState, useCallback } from "react";
import { API_DOMAIN } from "../constants/constants";

/**
 * Custom hook to detect if backend is starting up (Render free tier)
 * Returns { isStarting: boolean, checkStartup: function }
 */
export const useBackendStartup = () => {
  const [isStarting, setIsStarting] = useState(false);

  const checkStartup = useCallback(async () => {
    try {
      // Try to ping the backend with a timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout

      const response = await fetch(`${API_DOMAIN}/actuator/health`, {
        method: "GET",
        signal: controller.signal,
        cache: "no-store", // Don't cache the health check
      });

      clearTimeout(timeoutId);

      // 503 = Service starting up
      // 401 = Service is up but requires auth (that's fine!)
      // 200 = Service is up
      // Any response means backend is running
      setIsStarting(false);
      return false;
    } catch (error) {
      // AbortError = timeout
      // TypeError = network error (backend sleeping)
      // Either way, backend is starting
      setIsStarting(true);
      return true;
    }
  }, []); // Empty dependencies - stable reference

  return { isStarting, checkStartup, setIsStarting };
};

/**
 * Retry a function with exponential backoff while backend is starting
 */
export const retryWhileStarting = async (
  fn,
  maxRetries = 20,
  initialDelay = 2000,
) => {
  let retries = 0;
  let delay = initialDelay;

  while (retries < maxRetries) {
    try {
      const result = await fn();
      return result;
    } catch (error) {
      // Check if error is due to backend starting (503 or network error)
      const isStartupError =
        error.message?.includes("503") ||
        error.message?.includes("Failed to fetch") ||
        error.message?.includes("NetworkError");

      if (!isStartupError) {
        // Not a startup error, rethrow
        throw error;
      }

      retries++;
      if (retries >= maxRetries) {
        throw new Error("Backend startup timeout. Please try again later.");
      }

      // Wait before retrying (exponential backoff)
      await new Promise((resolve) => setTimeout(resolve, delay));
      delay = Math.min(delay * 1.5, 10000); // Max 10 second delay
    }
  }
};
