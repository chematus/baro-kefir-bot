import axios from 'axios';
import { logger, reportError } from '../utils/logger.js';

export const owZoneList = Object.freeze([
  { name: 'Cetus', value: 'cetus' },
  { name: 'Vallis', value: 'vallis' },
  { name: 'Cambion', value: 'cambion' },
  { name: 'Earth', value: 'earth' },
]);

const apiClient = axios.create({
  baseURL: 'https://api.warframestat.us/pc/',
  timeout: 5000,
  headers: {
    'User-Agent': 'Warframe-Discord-Bot',
    'Accept': 'application/json',
  },
});

export const getCycleData = async (zone) => {
  if (!owZoneList.find((ow) => ow.value === zone)) {
    return null;
  }

  try {
    logger.debug('Fetching Warframe world state...');
    const response = await apiClient.get(`${zone}Cycle`);

    return response.data;
  } catch (error) {
    reportError(error, { context: 'warframeAPI.getCycleData' });

    return null;
  }
};
