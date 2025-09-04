import { getEventsData } from '../../services/warframeAPI.js';
import { logger } from '../../utils/logger.js';
import { createEventEmbed } from '../../utils/embed.js';
import { MessageFlags } from 'discord.js';

export default {
  data: {
    name: 'events',
    description: 'Retrieve the list of events',
  },
  async execute(interaction) {
    const eventsData = await getEventsData();

    if (!eventsData) {
      await interaction.editReply('Sorry, there was an error fetching the events data.');

      return;
    }

    logger.info(`User ${interaction.user.tag} requested the events data.`);

    const embeds = eventsData.map(createEventEmbed);

    if (embeds?.length) {
      return interaction.editReply({ embeds, flags: MessageFlags.Ephemeral });
    }

    return interaction.editReply({ content: 'No active events found :confused:', flags: MessageFlags.Ephemeral });
  },
};
