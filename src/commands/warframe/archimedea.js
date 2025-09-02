import { EmbedBuilder, AttachmentBuilder } from 'discord.js';
import { getArchimedeaData } from '../../services/warframeAPI.js';
import { logger } from '../../utils/logger.js';
import { getRandomHexColor, timestampToUnix } from '../../utils/common.js';

const THUMBNAIL = 'necraloid.png';

export default {
  data: {
    name: 'archimedea',
    description: 'Retrieve the details of archimedea challenges',
  },
  async execute(interaction) {
    const archimedeaData = await getArchimedeaData();

    if (!archimedeaData) {
      await interaction.editReply('Sorry, there was an error fetching the archimedea data.');

      return;
    }

    logger.info(`User ${interaction.user.tag} requested the archimedea data.`);

    const { expiry, missions, personalModifiers } = archimedeaData;

    const icon = new AttachmentBuilder(
      `./assets/archimedea/${THUMBNAIL}`,
      { name: THUMBNAIL },
    );

    const embeds = [new EmbedBuilder()
      .setColor(getRandomHexColor())
      .setTitle('Deep Archimedea')
      .setThumbnail(`attachment://${THUMBNAIL}`)
      .addFields(
        ...personalModifiers.map(({ name, description: value }) => ({ name, value })),
        { name: `Ends <t:${timestampToUnix(expiry)}:R>`, value: '' },
      )
      .setTimestamp()
      .setFooter({ text: 'warframestat.us' })];

    missions.forEach(({ mission, deviation, riskVariables }) => embeds.push(new EmbedBuilder()
      .setColor(getRandomHexColor())
      .setTitle(mission)
      .addFields(
        { name: deviation.name, value: deviation.description },
        ...riskVariables.map(({ name, description: value }) => ({ name, value })),
      )));

    return interaction.editReply({ embeds, files: [icon] });
  },
};
