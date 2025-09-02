import { EmbedBuilder } from 'discord.js';
import { getVoidTraderData } from '../../services/warframeAPI.js';
import { logger } from '../../utils/logger.js';
import { getRandomHexColor, timestampToUnix } from '../../utils/common.js';


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

    const embeds = [
      new EmbedBuilder()
        .setColor(getRandomHexColor())
        .setTitle(voidTraderData.character)
        .setDescription(`has arrived at ${voidTraderData.location}`)
        .addFields(
          { name: `Departs <t:${timestampToUnix(voidTraderData.activation)}:R>`, value: '' },
        )
        .setTimestamp()
        .setFooter({ text: 'warframestat.us' }),
      new EmbedBuilder()
        .setColor(getRandomHexColor())
        .setTitle('Inventory')
        .addFields(
          ...voidTraderData.inventory.map(({ item, ducats, credits }) => ({
            name: item,
            value: `${ducats} :coin: + ${credits} :euro:`,
          })),
        )
        .setTimestamp()
        .setFooter({ text: 'warframestat.us' }),
    ];

    return interaction.editReply({ embeds });
  },
};
