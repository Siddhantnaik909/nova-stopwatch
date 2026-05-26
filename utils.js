/**
 * NOVA Stopwatch - Utility Functions
 * ===================================
 *
 * Shared utility functions used across the application.
 * Extracted to avoid code duplication and improve maintainability.
 */

/**
 * Simple helper to get element by ID
 * @param {string} id - Element ID without # prefix
 * @returns {HTMLElement|null} DOM element or null
 */
export const $ = (id) => {
  try {
    return document.getElementById(id);
  } catch (error) {
    console.warn(`Failed to get element with ID: ${id}`, error);
    return null;
  }
};

/**
 * Clamp a number between min and max
 * @param {number} n - Value to clamp
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} Clamped value
 */
export const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

/**
 * Pad a number to 2 digits with leading zero
 * @param {number} n - Number to pad
 * @returns {string} Padded string (e.g., "05")
 */
export const pad2 = (n) => String(n).padStart(2, "0");

/**
 * Format milliseconds as MM:SS.CS (minutes:seconds.centiseconds)
 * @param {number} ms - Milliseconds
 * @param {number} precisionMsDigits - 2 for centiseconds, 3 for milliseconds
 * @returns {string} Formatted time (e.g., "01:30.45")
 */
export const formatClock = (ms, precisionMsDigits = 2) => {
  const totalMs = Math.max(0, ms);
  const minutes = Math.floor(totalMs / 60000);
  const seconds = Math.floor((totalMs % 60000) / 1000);
  const remMs = totalMs % 1000;

  if (precisionMsDigits === 3) {
    // Show full milliseconds
    return `${pad2(minutes)}:${pad2(seconds)}.${String(remMs).padStart(3, "0")}`;
  }

  const cs = Math.floor(remMs / 10);
  return `${pad2(minutes)}:${pad2(seconds)}.${pad2(cs)}`;
};

/**
 * Format milliseconds as MM:SS
 * @param {number} ms - Milliseconds
 * @returns {string} Formatted time (e.g., "01:30")
 */
export const formatMMSS = (ms) => {
  const totalMs = Math.max(0, ms);
  const minutes = Math.floor(totalMs / 60000);
  const seconds = Math.floor((totalMs % 60000) / 1000);
  return `${pad2(minutes)}:${pad2(seconds)}`;
};

/**
 * Format milliseconds as centiseconds (.00)
 * @param {number} ms - Milliseconds
 * @returns {string} Centiseconds string (e.g., "45")
 */
export const formatCentiseconds = (ms) => {
  const remMs = Math.max(0, ms) % 1000;
  const cs = Math.floor(remMs / 10);
  return pad2(cs);
};

/**
 * Format time delta for display (e.g., "+00:01.23" or "-00:00.50")
 * @param {number} ms - Milliseconds (can be negative)
 * @returns {string} Formatted delta (e.g., "+00:01.23")
 */
export const formatDelta = (ms) => {
  if (!Number.isFinite(ms)) return "—";
  const abs = Math.abs(ms);
  if (abs < 10) return "±0.00";
  const sign = ms >= 0 ? "+" : "-";
  return `${sign}${formatMMSS(abs)}.${formatCentiseconds(abs)}`;
};

/**
 * Update SVG progress rings based on elapsed time
 * Used by Stopwatch, Timer, and Pomodoro controllers
 *
 * @param {Object} ui - UI reference object with progress elements
 * @param {number} elapsedMs - Elapsed time in milliseconds
 * @param {number} totalMs - Total duration in milliseconds
 * @param {Object} circles - Circle circumference constants
 */
export const updateRings = (ui, elapsedMs, totalMs, circles = {}) => {
  // Default circle circumferences if not provided
  const minuteCirc = circles.minute || 2 * Math.PI * 86;
  const secondCirc = circles.second || 2 * Math.PI * 93;
  const msCirc = circles.ms || 2 * Math.PI * 100;

  // Calculate progress ratios
  const total = totalMs || 1;
  const progress = clamp(elapsedMs / total, 0, 1);
  const secondProgress = (elapsedMs % 60000) / 60000;
  const msProgress = (elapsedMs % 1000) / 1000;

  // Update stroke-dashoffset for progress rings
  if (ui?.progressMinute) {
    ui.progressMinute.style.strokeDashoffset = String(minuteCirc * (1 - progress));
  }
  if (ui?.progressSecond) {
    ui.progressSecond.style.strokeDashoffset = String(secondCirc * (1 - secondProgress));
  }
  if (ui?.progressMs) {
    ui.progressMs.style.strokeDashoffset = String(msCirc * (1 - msProgress));
  }

  // Update sweep dot
  if (ui?.sweepDot) {
    ui.sweepDot.style.opacity = elapsedMs > 0 ? "1" : "0";
    ui.sweepDot.style.transform = `rotate(${msProgress * 360}deg)`;
  }
};

/**
 * Safely retrieve value from localStorage with fallback
 * @param {string} key - Storage key
 * @param {*} fallback - Default value if not found
 * @returns {*} Stored value or fallback
 */
export const getStorageValue = (key, fallback = null) => {
  try {
    const value = localStorage.getItem(key);
    return value !== null ? value : fallback;
  } catch (error) {
    console.warn(`Failed to retrieve localStorage key: ${key}`, error);
    return fallback;
  }
};

/**
 * Safely set value in localStorage
 * @param {string} key - Storage key
 * @param {*} value - Value to store
 * @returns {boolean} Success status
 */
export const setStorageValue = (key, value) => {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (error) {
    console.warn(`Failed to set localStorage key: ${key}`, error);
    return false;
  }
};

/**
 * Safely remove value from localStorage
 * @param {string} key - Storage key
 * @returns {boolean} Success status
 */
export const removeStorageValue = (key) => {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.warn(`Failed to remove localStorage key: ${key}`, error);
    return false;
  }
};

/**
 * Create a UUID (requires crypto API)
 * @returns {string} UUID v4
 */
export const generateUUID = () => {
  if (crypto?.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for browsers without randomUUID
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Format date to locale string
 * @param {Date|string} date - Date object or ISO string
 * @returns {string} Formatted date
 */
export const formatDate = (date) => {
  try {
    const d = typeof date === "string" ? new Date(date) : date;
    return d.toLocaleString();
  } catch (error) {
    console.warn("Failed to format date", error);
    return "—";
  }
};

/**
 * Calculate statistics from array of lap times
 * @param {number[]} laps - Array of lap times in milliseconds
 * @returns {Object} Statistics object
 */
export const calculateStats = (laps = []) => {
  if (!laps.length) {
    return {
      totalLaps: 0,
      fastest: null,
      slowest: null,
      average: null,
    };
  }

  const fastest = Math.min(...laps);
  const slowest = Math.max(...laps);
  const total = laps.reduce((a, b) => a + b, 0);
  const average = total / laps.length;

  return {
    totalLaps: laps.length,
    fastest,
    slowest,
    average,
    total,
  };
};

/**
 * Debounce a function to limit execution frequency
 * @param {Function} func - Function to debounce
 * @param {number} delayMs - Delay in milliseconds
 * @returns {Function} Debounced function
 */
export const debounce = (func, delayMs = 300) => {
  let timeoutId;
  return function debounced(...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delayMs);
  };
};

/**
 * Throttle a function to limit execution frequency
 * @param {Function} func - Function to throttle
 * @param {number} limitMs - Execution limit in milliseconds
 * @returns {Function} Throttled function
 */
export const throttle = (func, limitMs = 100) => {
  let inThrottle;
  return function throttled(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limitMs);
    }
  };
};

/**
 * Check if value is a valid positive number
 * @param {*} value - Value to check
 * @returns {boolean} True if valid positive number
 */
export const isValidPositiveNumber = (value) => {
  return Number.isFinite(value) && value >= 0;
};

/**
 * Check if localStorage is available
 * @returns {boolean} True if localStorage is accessible
 */
export const isLocalStorageAvailable = () => {
  try {
    const test = "__test__";
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
};

/**
 * Get browser information for debugging
 * @returns {Object} Browser info
 */
export const getBrowserInfo = () => {
  return {
    userAgent: navigator.userAgent,
    language: navigator.language,
    onLine: navigator.onLine,
    localStorage: isLocalStorageAvailable(),
    cookiesEnabled: navigator.cookieEnabled,
  };
};

/**
 * Log with prefix for debugging
 * @param {string} message - Message to log
 * @param {*} data - Optional data to log
 */
export const log = (message, data = null) => {
  const timestamp = new Date().toLocaleTimeString();
  const prefix = `[NOVA ${timestamp}]`;
  if (data !== null) {
    console.log(prefix, message, data);
  } else {
    console.log(prefix, message);
  }
};

export default {
  $,
  clamp,
  pad2,
  formatClock,
  formatMMSS,
  formatCentiseconds,
  formatDelta,
  updateRings,
  getStorageValue,
  setStorageValue,
  removeStorageValue,
  generateUUID,
  formatDate,
  calculateStats,
  debounce,
  throttle,
  isValidPositiveNumber,
  isLocalStorageAvailable,
  getBrowserInfo,
  log,
};
