import { detectMood } from "./moodDetection";

/**
 * Calculate message expiration time based on detected emotion
 * Negative emotions = shorter lifetime
 * Positive emotions = longer lifetime
 */

// Base expiration times in seconds
const EXPIRATION_TIMES = {
  // Negative emotions - disappear faster (30-60 seconds)
  angry: 30,
  sad: 45,
  worried: 40,
  
  // Neutral/mild emotions - medium duration (2-3 minutes)
  confused: 120,
  thinking: 150,
  tired: 90,
  sick: 100,
  
  // Positive emotions - stay longer (3-5 minutes)
  happy: 180,
  excited: 200,
  love: 240,
  grateful: 220,
  laughing: 180,
  cool: 160,
  celebration: 300,
  surprised: 120,
  
  // Default for messages with no mood
  default: 120,
};

/**
 * Get expiration time for a message based on its text
 * @param {string} text - Message text
 * @returns {number} - Seconds until expiration
 */
export const getExpirationTime = (text) => {
  const moodData = detectMood(text);
  
  if (!moodData) {
    return EXPIRATION_TIMES.default;
  }
  
  return EXPIRATION_TIMES[moodData.mood] || EXPIRATION_TIMES.default;
};

/**
 * Calculate expiration date for a message
 * @param {string} text - Message text
 * @returns {Date} - Expiration date
 */
export const calculateExpirationDate = (text) => {
  const seconds = getExpirationTime(text);
  const expirationDate = new Date();
  expirationDate.setSeconds(expirationDate.getSeconds() + seconds);
  return expirationDate;
};

/**
 * Check if message has expired
 * @param {Date} expiresAt - Expiration date
 * @returns {boolean}
 */
export const isMessageExpired = (expiresAt) => {
  if (!expiresAt) return false;
  return new Date() >= new Date(expiresAt);
};

/**
 * Get remaining time until expiration
 * @param {Date} expiresAt - Expiration date
 * @returns {number} - Seconds remaining (0 if expired)
 */
export const getRemainingTime = (expiresAt) => {
  if (!expiresAt) return null;
  
  const now = new Date();
  const expiration = new Date(expiresAt);
  const diff = expiration - now;
  
  return diff > 0 ? Math.floor(diff / 1000) : 0;
};

/**
 * Format remaining time for display
 * @param {number} seconds - Seconds remaining
 * @returns {string} - Formatted time (e.g., "2:30")
 */
export const formatRemainingTime = (seconds) => {
  if (seconds === null || seconds === undefined) return "";
  
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  
  if (mins > 0) {
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }
  return `${secs}s`;
};

/**
 * Get emoji representation of expiration urgency
 * @param {number} seconds - Seconds remaining
 * @returns {string} - Emoji
 */
export const getExpirationEmoji = (seconds) => {
  if (seconds === null || seconds === undefined) return "";
  
  if (seconds <= 10) return "🔥"; // Very urgent
  if (seconds <= 30) return "⏰"; // Urgent
  if (seconds <= 60) return "⏳"; // Medium
  return "⌛"; // Low urgency
};

/**
 * Get color class based on remaining time
 * @param {number} seconds - Seconds remaining
 * @returns {string} - CSS color class
 */
export const getExpirationColor = (seconds) => {
  if (seconds === null || seconds === undefined) return "text-gray-500";
  
  if (seconds <= 10) return "text-error animate-pulse";
  if (seconds <= 30) return "text-warning";
  if (seconds <= 60) return "text-info";
  return "text-success";
};
