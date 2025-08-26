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
      .setTitle(`${node} - ${type}`)
      .setThumbnail(`attachment://${THUMBNAIL}`)
      .addFields(
        { name: 'Ends', value: `<t:${timestampToUnix(expiry)}:R>` },
        { name: enemy, value: '60-80' },
      )
      .setTimestamp()
      .setFooter({ text: 'Data from warframestat.us' });

    return interaction.editReply({ embeds: [embed], files: [icon] });
  },
};
