import {
  getAlertsData,
  getInvasionsData,
  getNewsData,
  getEventsData,
  getVoidTraderData,
  priorityRewardList,
} from './warframeAPI.js';
import { getPostedIdsByType, markItemsAsPosted } from './database.js';
import { logger } from '../utils/logger.js';
import {
  createAlertEmbed,
  createInvasionEmbed,
  createNewsEmbed,
  createEventEmbed,
  createVoidTraderEmbed,
} from '../utils/embed.js';
import { chunkArray } from '../utils/common.js';

const TEN_MINUTES_MS = 10 * 60 * 1000;
const ONE_HOUR_MS = 60 * 60 * 1000;

let clientInstance = null;
let notificationChannel = null;

// Define notification types
const NOTIFICATION_TYPE = {
  ALERT: 'alert',
  INVASION: 'invasion',
  NEWS: 'news',
  EVENT: 'event',
  BARO: 'baro',
};

// Predefined messages for each notification type
const NOTIFICATION_MESSAGE = {
  [NOTIFICATION_TYPE.ALERT]: 'New Alerts:',
  [NOTIFICATION_TYPE.INVASION]: 'Invasions with priority rewards:',
  [NOTIFICATION_TYPE.NEWS]: 'Fresh News:',
  [NOTIFICATION_TYPE.EVENT]: 'New Events:',
  [NOTIFICATION_TYPE.BARO]: 'Baro has just arrived!',
};

// Maps notification types to their corresponding data fetching functions
const FETCHER = {
  [NOTIFICATION_TYPE.ALERT]: getAlertsData,
  [NOTIFICATION_TYPE.INVASION]: getInvasionsData,
  [NOTIFICATION_TYPE.NEWS]: getNewsData,
  [NOTIFICATION_TYPE.EVENT]: getEventsData,
  [NOTIFICATION_TYPE.BARO]: getVoidTraderData,
};

// Maps notification types to their corresponding embed creation functions
const EMBED_BUILDER = {
  [NOTIFICATION_TYPE.ALERT]: createAlertEmbed,
  [NOTIFICATION_TYPE.INVASION]: createInvasionEmbed,
  [NOTIFICATION_TYPE.NEWS]: createNewsEmbed,
  [NOTIFICATION_TYPE.EVENT]: createEventEmbed,
  [NOTIFICATION_TYPE.BARO]: createVoidTraderEmbed,
};

/**
 * Filters alerts based on their expiration status.
 *
 * @param {Object} data - The alert data.
 * @returns {boolean} - True if the alert matches the filter, false otherwise.
 */
const filterAlerts = ({ expired }) => !expired;

/**
 * Filters invasions based on their rewards.
 *
 * @param {Object} param0 - The invasion data.
 * @returns {boolean} - True if the invasion matches the filter, false otherwise.
 */
const filterInvasions = ({ attacker, defender }) => {
  const filterRewards = (({ key, type }) => priorityRewardList
    .some((item) => key.toLowerCase().includes(item) || type.toLowerCase().includes(item)));

  const attackerRewards = attacker.reward?.countedItems;

  if (attackerRewards?.length && attackerRewards.some(filterRewards)) {
    return true;
  }

  const defenderRewards = defender.reward?.countedItems;

  if (defenderRewards?.length && defenderRewards.some(filterRewards)) {
    return true;
  }

  return false;
};

const FILTER = {
  [NOTIFICATION_TYPE.ALERT]: filterAlerts,
  [NOTIFICATION_TYPE.INVASION]: filterInvasions,
};

const EMBED_MODIFIER = {
  [NOTIFICATION_TYPE.BARO]: (embed) => embed[0],
};

/**
 * Fetches the notification channel and caches it.
 *
 * @returns {import('discord.js').TextChannel|null}
 */
const getNotificationChannel = async () => {
  if (notificationChannel) {
    return notificationChannel;
  }

  if (!clientInstance) {
    return null;
  }

  try {
    const channelId = process.env.NOTIFICATION_CHANNEL_ID;

    if (!channelId) {
      logger.warn('Missing NOTIFICATION_CHANNEL_ID');

      return null;
    }

    const channel = await clientInstance.channels.fetch(channelId);
    notificationChannel = channel;

    return channel;
  } catch (error) {
    logger.error('Could not fetch the notification channel', error);

    return null;
  }
};

/**
 * Checks for new notifications of a specific type.
 *
 * @param {string} type - The type of notification to check (e.g., 'alert', 'invasion', 'news', 'event', 'baro')
 * @returns {Promise<void>}
 */
const checkByType = async (type) => {
  if (type === NOTIFICATION_TYPE.BARO) {
    const today = new Date();

    if (today.getDay() !== 5) {
      return;
    }
  }

  const channel = await getNotificationChannel();

  if (!channel) {
    return;
  }

  let itemList = await FETCHER[type]();

  if (!itemList) {
    return;
  }

  if (type === NOTIFICATION_TYPE.BARO && !itemList.inventory?.length) {
    return;
  }

  if (!Array.isArray(itemList)) {
    itemList = [itemList];
  }

  if (FILTER[type]) {
    itemList = itemList.filter(FILTER[type]);
  }

  if (!itemList?.length) {
    return;
  }

  const postedIds = await getPostedIdsByType(type);
  const itemsToPost = itemList.filter(({ id }) => !postedIds.has(id));
  let embeds = itemsToPost.map(EMBED_BUILDER[type]);

  if (EMBED_MODIFIER[type]) {
    embeds = EMBED_MODIFIER[type](embeds);
  }

  await markItemsAsPosted(itemsToPost.map(({ id }) => id), type);

  if (embeds?.length) {
    await channel.send(NOTIFICATION_MESSAGE[type]);

    const embedChunks = chunkArray(embeds);

    for (let i = 0; i < embedChunks.length; i++) {
      await channel.send({ embeds: embedChunks[i] });
    }
  }
};


/**
 * Initializes and starts all the polling mechanisms
 *
 * @param {import('discord.js').Client} client - The main Discord client instance
 */
export const startNotifiers = async (client) => {
  clientInstance = client;
  logger.info('Starting background notifiers...');

  setInterval(async () => await checkByType(NOTIFICATION_TYPE.ALERT), TEN_MINUTES_MS);
  setInterval(async () => await checkByType(NOTIFICATION_TYPE.INVASION), TEN_MINUTES_MS);
  setInterval(async () => await checkByType(NOTIFICATION_TYPE.NEWS), ONE_HOUR_MS);
  setInterval(async () => await checkByType(NOTIFICATION_TYPE.EVENT), ONE_HOUR_MS);
  setInterval(async () => await checkByType(NOTIFICATION_TYPE.BARO), ONE_HOUR_MS);

  await checkByType(NOTIFICATION_TYPE.ALERT);
  await checkByType(NOTIFICATION_TYPE.INVASION);
  await checkByType(NOTIFICATION_TYPE.NEWS);
  await checkByType(NOTIFICATION_TYPE.EVENT);
  await checkByType(NOTIFICATION_TYPE.BARO);
};
