import { getInvasionsData } from '../../services/warframeAPI.js';
import { logger } from '../../utils/logger.js';
import { chunkArray } from '../../utils/common.js';
import { createInvasionEmbed } from '../../utils/embed.js';
import { MessageFlags } from 'discord.js';

export default {
  data: {
    name: 'invasions',
    description: 'Retrieve the list of invasions',
  },
  async execute(interaction) {
    const invasionsData = await getInvasionsData();

    if (!invasionsData) {
      await interaction.editReply('Sorry, there was an error fetching the invasions data.');

      return;
    }

    logger.info(`User ${interaction.user.tag} requested the invasions data.`);

    const embeds = invasionsData.filter(({ completed }) => !completed).map(createInvasionEmbed);

    const embedChunks = chunkArray(embeds);

    await interaction.editReply({ embeds: embedChunks[0], flags: MessageFlags.Ephemeral });

    for (let i = 1; i < embedChunks.length; i++) {
      await interaction.followUp({ embeds: embedChunks[i], flags: MessageFlags.Ephemeral });
    }
  },
};
