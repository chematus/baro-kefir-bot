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

const NOTIFICATION_TYPE = {
  ALERT: 'alert',
  INVASION: 'invasion',
  NEWS: 'news',
  EVENT: 'event',
  BARO: 'baro',
};

const NOTIFICATION_MESSAGE = {
  [NOTIFICATION_TYPE.ALERT]: 'New Alerts:',
  [NOTIFICATION_TYPE.INVASION]: 'Invasions with priority rewards:',
  [NOTIFICATION_TYPE.NEWS]: 'Fresh News:',
  [NOTIFICATION_TYPE.EVENT]: 'New Events:',
  [NOTIFICATION_TYPE.BARO]: 'Baro has just arrived!',
};

const FETCHER = {
  [NOTIFICATION_TYPE.ALERT]: getAlertsData,
  [NOTIFICATION_TYPE.INVASION]: getInvasionsData,
  [NOTIFICATION_TYPE.NEWS]: getNewsData,
  [NOTIFICATION_TYPE.EVENT]: getEventsData,
  [NOTIFICATION_TYPE.BARO]: getVoidTraderData,
};

const EMBED_BUILDER = {
  [NOTIFICATION_TYPE.ALERT]: createAlertEmbed,
  [NOTIFICATION_TYPE.INVASION]: createInvasionEmbed,
  [NOTIFICATION_TYPE.NEWS]: createNewsEmbed,
  [NOTIFICATION_TYPE.EVENT]: createEventEmbed,
  [NOTIFICATION_TYPE.BARO]: createVoidTraderEmbed,
};

const filterAlerts = ({ expired }) => !expired;

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
  [NOTIFICATION_TYPE.NEWS]: () => true,
  [NOTIFICATION_TYPE.EVENT]: () => true,
  [NOTIFICATION_TYPE.BARO]: () => true,
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

  const itemList = (await FETCHER[type]()).filter(FILTER[type]);

  if (!itemList?.length) {
    return;
  }

  const postedIds = await getPostedIdsByType(type);
  const itemsToPost = itemList.filter(({ id }) => !postedIds.has(id));
  const embeds = itemsToPost.map(EMBED_BUILDER[type]);

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
