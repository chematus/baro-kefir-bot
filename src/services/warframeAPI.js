import axios from 'axios';
import { logger, reportError } from '../utils/logger.js';

export const owZoneList = [
  { name: 'Cetus', value: 'cetus' },
  { name: 'Vallis', value: 'vallis' },
  { name: 'Cambion', value: 'cambion' },
  { name: 'Earth', value: 'earth' },
];

export const archonList = [
  { name: 'amar', reward: 'crimson', color: '#DC143C' },
  { name: 'nira', reward: 'amber', color: '#FFBF00' },
  { name: 'boreal', reward: 'azure', color: '#007fff' },
];

export const fissureTypeList = [
  { name: 'lith', tierNum: 1, color: '#6d490b' },
  { name: 'meso', tierNum: 2, color: '#976b20' },
  { name: 'neo', tierNum: 3, color: '#c18d33' },
  { name: 'axi', tierNum: 4, color: '#f1bf68' },
  { name: 'requiem', tierNum: 5, color: '#921212' },
  { name: 'omnia', tierNum: 6, color: '#e2caa0' },
];

export const nightwaveChallengeType = {
  DAILY: { name: 'Daily', tier: 0, value: 1000 },
  WEEKLY: { name: 'Weekly', tier: 1, value: 4500 },
  ELITE : { name: 'Elite Weekly', tier: 2, value: 7000 },
};

export const polarities = {
  madurai: { symbol: ':regional_indicator_v:', name: 'Madurai' },
  naramon: { symbol: ':heavy_minus_sign:', name: 'Naramon' },
  vazarin: { symbol: ':regional_indicator_d:', name: 'Vazarin' },
  zenurik: { symbol: ':heavy_equals_sign:', name: 'Zenurik' },
  unairu: { symbol: ':regional_indicator_r:', name: 'Unairu' },
  penjaga: { symbol: ':regional_indicator_y:', name: 'Penjaga' },
  umbra: { symbol: ':regional_indicator_u:', name: 'Umbra' },
  omnia: { symbol: ':regional_indicator_o:', name: 'Omnia' },
};

export const damageTypeList = {
  impact: { name: 'Impact', icon: ':hammer:' },
  puncture: { name: 'Puncture', icon: ':pushpin:' },
  slash: { name: 'Slash', icon: ':knife:' },
  heat: { name: 'Heat', icon: ':fire:' },
  cold: { name: 'Cold', icon: ':snowflake:' },
  electricity: { name: 'Electricity', icon: ':zap:' },
  toxin: { name: 'Toxin', icon: ':skull_crossbones:' },
  blast: { name: 'Blast', icon: ':boom:' },
  radiation: { name: 'Radiation', icon: ':radioactive:' },
  gas: { name: 'Gas', icon: ':fog:' },
  magnetic: { name: 'Magnetic', icon: ':magnet:' },
  viral: { name: 'Viral', icon: ':microbe:' },
  corrosive: { name: 'Corrosive', icon: ':broken_chain:' },
  void: { name: 'Void', icon: ':milky_way:' },
  tau: { name: 'Tau', icon: ':space_invader:' },
  true: { name: 'True', icon: ':x_ray:' },
  // duplicate types to cover alternative namings
  freeze: { name: 'Cold', icon: ':snowflake:' },
  fire: { name: 'Heat', icon: ':fire:' },
  poison: { name: 'Toxin', icon: ':skull_crossbones:' },
  explosion: { name: 'Blast', icon: ':boom:' },
  radiant: { name: 'Void', icon: ':milky_way:' },
  sentient: { name: 'Tau', icon: ':space_invader:' },
  finisher: { name: 'True', icon: ':x_ray:' },
};

export const priorityRewardList = [
  'forma',
  'adapter',
  'glyph',
];

const apiClient = axios.create({
  baseURL: 'https://api.warframestat.us/',
  timeout: 5000,
  headers: {
    'User-Agent': 'Warframe-Discord-Bot',
    'Accept': 'application/json',
  },
  params: {
    language: 'en',
  },
});

const fetchData = async (endpoint, context) => {
  try {
    logger.debug(`Fetching Warframe ${context}...`);
    const response = await apiClient.get(endpoint);

    return response.data;
  } catch (error) {
    reportError(error, { context: `warframeAPI ${context}` });

    return null;
  }
};

export const getCycleData = (zone) => fetchData(`${zone}Cycle`, `${zone} cycle data`);
export const getAlertsData = () => fetchData('alerts', 'alerts data');
export const getArbitrationData = () => fetchData('arbitration', 'arbitration data');
export const getArchonData = () => fetchData('archonHunt', 'archon hunt data');
export const getDailyDealsData = () => fetchData('dailyDeals', 'daily deals data');
export const getArchimedeaData = () => fetchData('deepArchimedea', 'archimedea data');
export const getEventsData = () => fetchData('events', 'events data');
export const getFissuresData = () => fetchData('fissures', 'fissures data');
export const getInvasionsData = () => fetchData('invasions', 'invasions data');
export const getNewsData = () => fetchData('news', 'news data');
export const getNightwaveData = () => fetchData('nightwave', 'nightwave data');
export const getSortieData = () => fetchData('sortie', 'sortie data');
export const getVoidTraderData = () => fetchData('voidTrader', 'void trader data');
export const getItemData = (itemName) => fetchData(`items/${encodeURI(itemName)}`, `${itemName} item data`);
