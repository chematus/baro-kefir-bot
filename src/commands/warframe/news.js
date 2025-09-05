import { getNewsData } from '../../services/warframeAPI.js';
import { logger } from '../../utils/logger.js';
import { chunkArray } from '../../utils/common.js';
import { createNewsEmbed } from '../../utils/embed.js';
import { MessageFlags } from 'discord.js';

/**
 * News command to retrieve the list of news.
 */
export default {
  data: {
    name: 'news',
    description: 'Retrieve the list of news',
  },
  async execute(interaction) {
    const newsData = await getNewsData();

    if (!newsData) {
      await interaction.editReply('Sorry, there was an error fetching the news data.');

      return;
    }

    logger.info(`User ${interaction.user.tag} requested the news data.`);

    const embeds = newsData.map(createNewsEmbed);

    const embedChunks = chunkArray(embeds);

    await interaction.editReply({ embeds: embedChunks[0], flags: MessageFlags.Ephemeral });

    for (let i = 1; i < embedChunks.length; i++) {
      await interaction.followUp({ embeds: embedChunks[i], flags: MessageFlags.Ephemeral });
    }
  },
};
