import axios from 'axios';
import { logger, reportError } from '../utils/logger.js';

export const owZoneList = Object.freeze([
  { name: 'Cetus', value: 'cetus' },
  { name: 'Vallis', value: 'vallis' },
  { name: 'Cambion', value: 'cambion' },
  { name: 'Earth', value: 'earth' },
]);

export const archonList = Object.freeze([
  { name: 'amar', reward: 'crimson', color: '#DC143C' },
  { name: 'nira', reward: 'amber', color: '#FFBF00' },
  { name: 'boreal', reward: 'azure', color: '#007fff' },
]);

const apiClient = axios.create({
  baseURL: 'https://api.warframestat.us/pc/',
  timeout: 5000,
  headers: {
    'User-Agent': 'Warframe-Discord-Bot',
    'Accept': 'application/json',
  },
  params: {
    language: 'en',
  },
});

export const getCycleData = async (zone) => {
  if (!owZoneList.find((ow) => ow.value === zone)) {
    return null;
  }

  try {
    logger.debug('Fetching Warframe cycles state...');
    const response = await apiClient.get(`${zone}Cycle`);

    return response.data;
  } catch (error) {
    reportError(error, { context: 'warframeAPI.getCycleData' });

    return null;
  }
};


export const getAlertsData = async () => {
  try {
    logger.debug('Fetching Warframe alerts list...');
    const response = await apiClient.get('alerts');

    return response.data;
  } catch (error) {
    reportError(error, { context: 'warframeAPI.getAlertsData' });

    return null;
  }
};

export const getArbitrationData = async () => {
  try {
    logger.debug('Fetching Warframe arbitration data...');
    const response = await apiClient.get('arbitration');

    return response.data;
  } catch (error) {
    reportError(error, { context: 'warframeAPI.getArbitrationData' });

    return null;
  }
};

export const getArchonData = async () => {
  try {
    logger.debug('Fetching Warframe archon data...');
    const response = await apiClient.get('archonHunt');

    return response.data;
  } catch (error) {
    reportError(error, { context: 'warframeAPI.getArchonData' });

    return null;
  }
};
