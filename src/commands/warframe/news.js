import { EmbedBuilder } from 'discord.js';
import { getNewsData } from '../../services/warframeAPI.js';
import { logger } from '../../utils/logger.js';
import {
  getRandomHexColor,
  chunkArray,
  timestampToUnix,
} from '../../utils/common.js';

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

    const embeds = newsData.map((k) => {
      const embed = new EmbedBuilder()
        .setColor(getRandomHexColor())
        .setTitle(k.message)
        .setURL(k.link)
        .setImage(k.imageLink)
        .setTimestamp()
        .setFooter({ text: 'warframestat.us' });

      if (k.endDate) {
        embed.addFields({ name: `Ends <t:${timestampToUnix(k.endDate)}:R>`, value: '' });
      }

      return embed;
    });

    const embedChunks = chunkArray(embeds);

    await interaction.editReply({ embeds: embedChunks[0] });

    for (let i = 1; i < embedChunks.length; i++) {
      await interaction.followUp({ embeds: embedChunks[i] });
    }
  },
};
