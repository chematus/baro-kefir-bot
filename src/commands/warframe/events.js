import { EmbedBuilder } from 'discord.js';
import { getEventsData } from '../../services/warframeAPI.js';
import { logger } from '../../utils/logger.js';
import { getRandomHexColor, timestampToUnix } from '../../utils/common.js';

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

    const embeds = eventsData.map((e) => new EmbedBuilder()
      .setColor(getRandomHexColor())
      .setTitle(e.description)
      .addFields(
        { name: e.tooltip || '', value: e.node || '' },
        ...e.interimSteps.map(({ goal, reward: { asString } }) => ({ name: `@${goal}`, value: asString })),
        { name: `@${e.maximumScore}`, value: e.rewards.map(({ asString }) => asString).filter((s) => s.length).join('\n') },
        { name: `Ends <t:${timestampToUnix(e.expiry)}:R>`, value: '' },
      )
      .setTimestamp()
      .setFooter({ text: 'warframestat.us' }));

    if (embeds && embeds.length) {
      return interaction.editReply({ embeds });
    }

    return interaction.editReply('No active events found :confused:');
  },
};
