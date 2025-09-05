const EMBED_LIMIT = 10;

// Delimiter used in messages
export const DELIMITER = '  |  ';

/**
 * Capitalizes the first letter of a string.
 *
 * @param {string} str - The input string.
 * @returns {string} - The capitalized string.
 */
export const capitalizeString = (str) => str.charAt(0).toUpperCase() + str.slice(1);

/**
 * Converts a timestamp to a Unix timestamp.
 *
 * @param {*} timestamp - The timestamp to convert.
 * @returns {number} - The Unix timestamp.
 */
export const timestampToUnix = (timestamp) => Math.floor(new Date(timestamp) / 1000);

/**
 * Generates a random hex color code.
 *
 * @returns {string} - The random hex color code.
 */
export const getRandomHexColor = () => '#' + (Math.random() * 0xFFFFFF << 0).toString(16).padStart(6, '0');

/**
 * Chunks an array into smaller arrays of a specified size.
 *
 * @param {Array} array - The array to chunk.
 * @param {number} limit - The maximum size of each chunk.
 * @returns {Array<Array>} - The array of chunks.
 */
export const chunkArray = (array, limit = EMBED_LIMIT) => {
  const chunks = [];

  for (let i = 0; i < array.length; i += limit) {
    chunks.push(array.slice(i, i + limit));
  }

  return chunks;
};

/**
 * Converts an ETA string (e.g., "1d 2h 30m 15s") to a Unix timestamp.
 *
 * @param {string} etaString - The ETA string to convert.
 * @returns {number} - The Unix timestamp representing the ETA.
 */
export const etaToUnix = (etaString) => {
  const regex = /(\d+)\s*(d|h|m|s)/g;
  let totalSeconds = 0;
  let match;

  while ((match = regex.exec(etaString)) !== null) {
    const value = parseInt(match[1], 10);
    const unit = match[2];

    switch (unit) {
    case 'd':
      totalSeconds += value * 86400;
      break;
    case 'h':
      totalSeconds += value * 3600;
      break;
    case 'm':
      totalSeconds += value * 60;
      break;
    case 's':
      totalSeconds += value;
      break;
    }
  }

  const futureTimestamp = Math.floor(Date.now() / 1000) + totalSeconds;

  return futureTimestamp;
};

/**
 * Formats a duration in seconds into a human-readable string.
 *
 * @param {number} totalSeconds - The total duration in seconds.
 * @returns {string} - The formatted duration string.
 */
export const formatDuration = (totalSeconds) => {
  if (totalSeconds <= 0) {
    return '0s';
  }

  const days = Math.floor(totalSeconds / 86400);
  totalSeconds %= 86400;
  const hours = Math.floor(totalSeconds / 3600);
  totalSeconds %= 3600;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60);

  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (seconds > 0) parts.push(`${seconds}s`);

  return parts.join(' ') || '0s';
};
