import { EmbedBuilder, AttachmentBuilder } from 'discord.js';
import { getArchonData, archonList } from '../../services/warframeAPI.js';
import { logger } from '../../utils/logger.js';
import { capitalizeString, timestampToUnix } from '../../utils/common.js';

export default {
  data: {
    name: 'archon',
    description: 'Retrieve the list of active Archon Hunt missions',
  },
  async execute(interaction) {
    const archonData = await getArchonData();

    if (!archonData) {
      await interaction.editReply('Sorry, there was an error fetching archon data.');

      return;
    }

    logger.info(`User ${interaction.user.tag} requested the archon data.`);

    const {
      expiry,
      boss,
      missions,
    } = archonData;

    const bossKey = boss?.split(' ')[1].toLowerCase();

    const icon = new AttachmentBuilder(
      `./assets/archon/${bossKey}.png`,
      { name: `${bossKey}.png` },
    );

    const { reward, color } = archonList.find(({ name }) => name === bossKey);

    const missionList = missions.map((m) => ({ name: m.node, value: m.type }));

    const embed = new EmbedBuilder()
      .setColor(color)
      .setTitle(boss)
      .setThumbnail(`attachment://${bossKey}.png`)
      .addFields(
        { name: 'Reward', value: `${capitalizeString(reward)} Archon Shard` },
        { name: `Ends <t:${timestampToUnix(expiry)}:R>`, value: '' },
        ...missionList,
      )
      .setTimestamp()
      .setFooter({ text: 'warframestat.us' });

    return interaction.editReply({ embeds: [embed], files: [icon] });
  },
};
