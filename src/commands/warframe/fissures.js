import { EmbedBuilder, AttachmentBuilder, MessageFlags } from 'discord.js';
import { getFissuresData, fissureTypeList } from '../../services/warframeAPI.js';
import { logger } from '../../utils/logger.js';
import { capitalizeString, DELIMITER, timestampToUnix } from '../../utils/common.js';

export default {
  data: {
    name: 'fissures',
    description: 'Retrieve the list of fissures',
  },
  async execute(interaction) {
    const fissuresData = await getFissuresData();

    if (!fissuresData) {
      await interaction.editReply('Sorry, there was an error fetching the fissures data.');

      return;
    }

    logger.info(`User ${interaction.user.tag} requested the fissures data.`);

    const icons = [];
    const fissureList = {};

    fissuresData.forEach((fissure) => {
      if (!fissureList[fissure.tierNum]) {
        fissureList[fissure.tierNum] = [];
      }

      fissureList[fissure.tierNum].push(fissure);
    });

    const embeds = fissureTypeList.map(({ name, tierNum, color }) => {
      icons.push(new AttachmentBuilder(
        `./assets/fissures/${name}.png`,
        { name: `fissure-${name}.png` },
      ));

      return new EmbedBuilder()
        .setColor(color)
        .setTitle(capitalizeString(name))
        .setThumbnail(`attachment://fissure-${name}.png`)
        .addFields(
          ...fissureList[tierNum].map((f) => ({
            name: `${f.node}${DELIMITER}${f.missionType}${DELIMITER}${f.enemy}  ${f.isHard ? '(SP)' : ''} ${f.isStorm ? '(RJ)' : ''}`,
            value: `Ends <t:${timestampToUnix(f.expiry)}:R>`,
          })),
        )
        .setTimestamp()
        .setFooter({ text: 'warframestat.us' });
    });

    return interaction.editReply({ embeds, files: icons, flags: MessageFlags.Ephemeral });
  },
};
