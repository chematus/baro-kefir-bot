import { getTwitchStreamData, TWITCH_CHANNEL } from '../../services/twitchAPI.js';
import { logger } from '../../utils/logger.js';
import { createTwitchStreamEmbed } from '../../utils/embed.js';
import { MessageFlags } from 'discord.js';

/**
 * Command to retrieve the status of warframe twitch stream.
 */
export default {
  data: {
    name: 'twitch',
    description: 'Retrieve the status of warframe twitch stream',
  },
  async execute(interaction) {
    const streamData = await getTwitchStreamData(TWITCH_CHANNEL.WARFRAME);

    if (!streamData) {
      return interaction.editReply('The stream hasn\'t started yet.');
    }

    logger.info(`User ${interaction.user.tag} requested the warframe stream data.`);

    const embeds = createTwitchStreamEmbed(streamData);

    return interaction.editReply({ embeds, flags: MessageFlags.Ephemeral });
  },
};
