/**
 * Date formatting utilities for displaying note creation dates
 */

/**
 * Format a date to display as "Today", "Yesterday", or a formatted date
 * @param {string|Date} dateInput - The date to format (ISO string or Date object)
 * @returns {string} Formatted date string
 */
export const formatCreatedDate = (dateInput) => {
  if (!dateInput) {
    return "";
  }

  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;

  // Check if date is valid
  if (isNaN(date.getTime())) {
    return "";
  }

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const noteDate = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  );

  // Check if it's today
  if (noteDate.getTime() === today.getTime()) {
    return "Today";
  }

  // Check if it's yesterday
  if (noteDate.getTime() === yesterday.getTime()) {
    return "Yesterday";
  }

  // Format as date
  // Options: "Jan 15, 2025" or "Jan 15" for this year
  const options = {
    month: "short",
    day: "numeric",
  };

  // Add year if it's not the current year
  if (date.getFullYear() !== now.getFullYear()) {
    options.year = "numeric";
  }

  return date.toLocaleDateString("en-US", options);
};

/**
 * Format a date to include time (for tooltips or detailed views)
 * @param {string|Date} dateInput - The date to format
 * @returns {string} Formatted date and time string
 */
export const formatCreatedDateTime = (dateInput) => {
  if (!dateInput) {
    return "";
  }

  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;

  if (isNaN(date.getTime())) {
    return "";
  }

  const dateOptions = {
    month: "short",
    day: "numeric",
    year: "numeric",
  };

  const timeOptions = {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  };

  const datePart = date.toLocaleDateString("en-US", dateOptions);
  const timePart = date.toLocaleTimeString("en-US", timeOptions);

  return `${datePart} at ${timePart}`;
};

/**
 * Get relative time (e.g., "2 hours ago", "3 days ago")
 * @param {string|Date} dateInput - The date to format
 * @returns {string} Relative time string
 */
export const getRelativeTime = (dateInput) => {
  if (!dateInput) {
    return "";
  }

  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;

  if (isNaN(date.getTime())) {
    return "";
  }

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) {
    return "Just now";
  } else if (diffMin < 60) {
    return `${diffMin} minute${diffMin !== 1 ? "s" : ""} ago`;
  } else if (diffHour < 24) {
    return `${diffHour} hour${diffHour !== 1 ? "s" : ""} ago`;
  } else if (diffDay < 7) {
    return `${diffDay} day${diffDay !== 1 ? "s" : ""} ago`;
  } else {
    return formatCreatedDate(date);
  }
};
