import { getAlertsData } from '../../services/warframeAPI.js';
import { logger } from '../../utils/logger.js';
import { createAlertEmbed } from '../../utils/embed.js';
import { MessageFlags } from 'discord.js';

/**
 * Alerts command to retrieve the list of active alerts.
 */
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

    if (!alertsData?.length) {
      return interaction.editReply('No active alerts found :confused:');
    }

    const embeds = alertsData.map(createAlertEmbed);

    if (embeds?.length) {
      return interaction.editReply({ embeds, flags: MessageFlags.Ephemeral });
    }

    return interaction.editReply({ content: 'No active alerts found :confused:', flags: MessageFlags.Ephemeral });
  },
};
