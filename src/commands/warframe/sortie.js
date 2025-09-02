import { EmbedBuilder } from 'discord.js';
import { getSortieData } from '../../services/warframeAPI.js';
import { logger } from '../../utils/logger.js';
import { DELIMITER, getRandomHexColor, timestampToUnix } from '../../utils/common.js';


export default {
  data: {
    name: 'sortie',
    description: 'Retrieve the list of current sortie missions',
  },
  async execute(interaction) {
    const sortieData = await getSortieData();

    if (!sortieData) {
      await interaction.editReply('Sorry, there was an error fetching the sortie data.');

      return;
    }

    logger.info(`User ${interaction.user.tag} requested the sortie data.`);

    const embeds = [new EmbedBuilder()
      .setColor(getRandomHexColor())
      .setTitle(`${sortieData.boss}${DELIMITER}${sortieData.faction}`)
      .setTimestamp()
      .addFields({ name: `Ends <t:${timestampToUnix(sortieData.expiry)}:R>`, value: '' })
      .setFooter({ text: 'warframestat.us' })];

    sortieData.variants.forEach((variant) => embeds.push(new EmbedBuilder()
      .setColor(getRandomHexColor())
      .setTitle(`${variant.missionType}${DELIMITER}${variant.node}`)
      .setTimestamp()
      .addFields(
        { name: variant.modifier, value: variant.modifierDescription })
      .setFooter({ text: 'warframestat.us' })));

    await interaction.editReply({ embeds });
  },
};
