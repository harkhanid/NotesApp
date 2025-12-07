import { useState, useEffect } from 'react';
import { API_DOMAIN } from '../constants/constants';

/**
 * Custom hook to detect if backend is starting up (Render free tier)
 * Returns { isStarting: boolean, checkStartup: function }
 */
export const useBackendStartup = () => {
  const [isStarting, setIsStarting] = useState(false);

  const checkStartup = async () => {
    try {
      // Ping a lightweight endpoint to check backend status
      const response = await fetch(`${API_DOMAIN}/actuator/health`, {
        method: 'GET',
        // Don't include credentials for health check
      });

      // If we get 503 or network error, backend is likely starting
      if (response.status === 503) {
        setIsStarting(true);
        return true;
      }

      setIsStarting(false);
      return false;
    } catch (error) {
      // Network error - backend might be starting
      setIsStarting(true);
      return true;
    }
  };

  return { isStarting, checkStartup, setIsStarting };
};

/**
 * Retry a function with exponential backoff while backend is starting
 */
export const retryWhileStarting = async (fn, maxRetries = 20, initialDelay = 2000) => {
  let retries = 0;
  let delay = initialDelay;

  while (retries < maxRetries) {
    try {
      const result = await fn();
      return result;
    } catch (error) {
      // Check if error is due to backend starting (503 or network error)
      const isStartupError =
        error.message?.includes('503') ||
        error.message?.includes('Failed to fetch') ||
        error.message?.includes('NetworkError');

      if (!isStartupError) {
        // Not a startup error, rethrow
        throw error;
      }

      retries++;
      if (retries >= maxRetries) {
        throw new Error('Backend startup timeout. Please try again later.');
      }

      // Wait before retrying (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, delay));
      delay = Math.min(delay * 1.5, 10000); // Max 10 second delay
    }
  }
};
