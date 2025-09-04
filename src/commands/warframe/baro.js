import { EmbedBuilder, MessageFlags } from 'discord.js';
import { getVoidTraderData } from '../../services/warframeAPI.js';
import { logger } from '../../utils/logger.js';
import { getRandomHexColor, timestampToUnix } from '../../utils/common.js';
import { createVoidTraderEmbed } from '../../utils/embed.js';


export default {
  data: {
    name: 'baro',
    description: 'Retrieve the Void Trader info',
  },
  async execute(interaction) {
    const voidTraderData = await getVoidTraderData();

    if (!voidTraderData) {
      await interaction.editReply('Sorry, there was an error fetching the void trader data.');

      return;
    }

    logger.info(`User ${interaction.user.tag} requested the void trader data.`);

    if (!voidTraderData.inventory?.length) {
      const embed = new EmbedBuilder()
        .setColor(getRandomHexColor())
        .setTitle(voidTraderData.character)
        .setDescription(`is scheduled to arrive at ${voidTraderData.location} <t:${timestampToUnix(voidTraderData.activation)}:R>`)
        .setTimestamp()
        .setFooter({ text: 'warframestat.us' });

      return interaction.editReply({ embeds: [embed] });
    }

    const embeds = createVoidTraderEmbed(voidTraderData);

    return interaction.editReply({ embeds, flags: MessageFlags.Ephemeral });
  },
};
