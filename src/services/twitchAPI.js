import { ApiClient } from '@twurple/api';
import { AppTokenAuthProvider } from '@twurple/auth';
import { reportError } from '../utils/logger.js';

const { TWITCH_CLIENT_ID, TWITCH_CLIENT_SECRET } = process.env;
export const TWITCH_NOTIFICATION_COLOR = '#6441A5';
export const TWITCH_CHANNEL = {
  WARFRAME: 'warframe',
};

const authProvider = new AppTokenAuthProvider(TWITCH_CLIENT_ID, TWITCH_CLIENT_SECRET);
const apiClient = new ApiClient({ authProvider });

/**
 * Gets Twitch stream data by name.
 *
 * @param {string} userName The Twitch login name.
 * @returns {Promise<HelixUser|null>} The stream object or null if not found.
 */
export const getTwitchStreamData = async (userName) => {
  try {
    const stream = await apiClient.streams.getStreamByUserNameBatched(userName);

    return stream;
  } catch (error) {
    reportError(error, { context: 'twitchAPI.getTwitchStreamData' });

    return null;
  }
};
