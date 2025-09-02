import { EmbedBuilder } from 'discord.js';
import { getAlertsData } from '../../services/warframeAPI.js';
import { logger } from '../../utils/logger.js';
import { DELIMITER, getRandomHexColor, timestampToUnix } from '../../utils/common.js';

export default {
  data: {
    name: 'alerts',
    description: 'Retrieve the list of active alerts',
  },
  async execute(interaction) {
    const alertsData = await getAlertsData();

    if (!alertsData) {
      await interaction.editReply('Sorry, there was an error fetching the alerts data.');

      return;
    }

    logger.info(`User ${interaction.user.tag} requested the alerts data.`);

    const embeds = alertsData.map(({ expiry, mission: m }) => new EmbedBuilder()
      .setColor(getRandomHexColor())
      .setTitle(m.reward.itemString)
      .setThumbnail(m.reward.setThumbnail)
      .addFields(
        { name: `${m.node}${DELIMITER}${m.type}`, value: `${m.faction} (${m.minEnemyLevel}-${m.maxEnemyLevel})` },
        { name: `Ends <t:${timestampToUnix(expiry)}:R>`, value: '' },
      )
      .setTimestamp()
      .setFooter({ text: 'warframestat.us' }));

    if (embeds && embeds.length) {
      return interaction.editReply({ embeds });
    }

    return interaction.editReply('No active alerts found :confused:');
  },
};
