export const capitalizeString = (str) => str.charAt(0).toUpperCase() + str.slice(1);

export const timestampToUnix = (timestamp) => Math.floor(new Date(timestamp) / 1000);

export const getRandomHexColor = () => '#' + (Math.random() * 0xFFFFFF << 0).toString(16).padStart(6, '0');
