import { EmbedBuilder, MessageFlags } from 'discord.js';
import { getDailyDealsData } from '../../services/warframeAPI.js';
import { logger } from '../../utils/logger.js';
import { DELIMITER, getRandomHexColor, timestampToUnix } from '../../utils/common.js';

/**
 * Darvo command to retrieve the list of daily deals.
 */
export default {
  data: {
    name: 'darvo',
    description: 'Retrieve the list of daily deals',
  },
  async execute(interaction) {
    const dailyDealsData = await getDailyDealsData();

    if (!dailyDealsData) {
      await interaction.editReply('Sorry, there was an error fetching the daily deals data.');

      return;
    }

    logger.info(`User ${interaction.user.tag} requested the daily deals data.`);

    const embeds = dailyDealsData.map((dd) => new EmbedBuilder()
      .setColor(getRandomHexColor())
      .setTitle(dd.item)
      .addFields(
        { name: 'Price', value: `~~${dd.originalPrice}pl~~${DELIMITER}**${dd.salePrice}pl**${DELIMITER}(-${dd.discount}%)` },
        { name: 'Stock', value: `${dd.total - dd.sold}/${dd.total} items left` },
        { name: `Ends <t:${timestampToUnix(dd.expiry)}:R>`, value: '' },
      )
      .setTimestamp()
      .setFooter({ text: 'warframestat.us' }));

    return interaction.editReply({ embeds, flags: MessageFlags.Ephemeral });
  },
};
