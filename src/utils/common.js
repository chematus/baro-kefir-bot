const EMBED_LIMIT = 10;

export const DELIMITER = '  |  ';

export const capitalizeString = (str) => str.charAt(0).toUpperCase() + str.slice(1);

export const timestampToUnix = (timestamp) => Math.floor(new Date(timestamp) / 1000);

export const getRandomHexColor = () => '#' + (Math.random() * 0xFFFFFF << 0).toString(16).padStart(6, '0');

export const chunkArray = (array, limit = EMBED_LIMIT) => {
  const chunks = [];

  for (let i = 0; i < array.length; i += limit) {
    chunks.push(array.slice(i, i + limit));
  }

  return chunks;
};

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
