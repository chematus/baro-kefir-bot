import { EmbedBuilder, AttachmentBuilder } from 'discord.js';
import { getArbitrationData } from '../../services/warframeAPI.js';
import { logger } from '../../utils/logger.js';
import { getRandomHexColor, timestampToUnix } from '../../utils/common.js';

const THUMBNAIL = 'vitus-essence.png';

export default {
  data: {
    name: 'arbitration',
    description: 'Retrieve the current arbitration mission',
  },
  async execute(interaction) {
    const arbitrationData = await getArbitrationData();

    if (!arbitrationData) {
      await interaction.editReply('Sorry, there was an error fetching arbitration data.');

      return;
    }

    logger.info(`User ${interaction.user.tag} requested the arbitration data.`);


    const icon = new AttachmentBuilder(
      `./assets/arbitration/${THUMBNAIL}`,
      { name: THUMBNAIL },
    );

    const {
      expiry,
      node,
      enemy,
      type,
    } = arbitrationData;

    const embed = new EmbedBuilder()
      .setColor(getRandomHexColor())
      .setTitle(`${node} | ${type} | ${enemy}`)
      .setThumbnail(`attachment://${THUMBNAIL}`)
      .addFields(
        { name: `Ends <t:${timestampToUnix(expiry)}:R>`, value: '' },
      )
      .setTimestamp()
      .setFooter({ text: 'warframestat.us' });

    return interaction.editReply({ embeds: [embed], files: [icon] });
  },
};
