import { EmbedBuilder, MessageFlags } from 'discord.js';
import { getNightwaveData, nightwaveChallengeType } from '../../services/warframeAPI.js';
import { logger } from '../../utils/logger.js';
import { DELIMITER, getRandomHexColor, timestampToUnix } from '../../utils/common.js';

/**
 * Nightwave command to retrieve the list of current nightwave challenges.
 */
export default {
  data: {
    name: 'nightwave',
    description: 'Retrieve the list of current nightwave challenges',
  },
  async execute(interaction) {
    const nightwaveData = await getNightwaveData();

    if (!nightwaveData) {
      await interaction.editReply('Sorry, there was an error fetching the nightwave data.');

      return;
    }

    logger.info(`User ${interaction.user.tag} requested the nightwave data.`);

    const embeds = [new EmbedBuilder()
      .setColor(getRandomHexColor())
      .setTitle(`Nightwave Season ${nightwaveData.season}`)
      .setDescription(nightwaveData.tag)
      .setTimestamp()
      .addFields({ name: `Ends <t:${timestampToUnix(nightwaveData.expiry)}:R>`, value: '' })
      .setFooter({ text: 'warframestat.us' })];

    const challengeList = {};

    nightwaveData.activeChallenges.forEach((challenge) => {
      if (challenge.isDaily) {
        const tier = nightwaveChallengeType.DAILY.tier;

        if (!challengeList[tier]) {
          challengeList[tier] = [];
        }

        challengeList[tier].push(challenge);
      } else if (challenge.isElite) {
        const tier = nightwaveChallengeType.ELITE.tier;

        if (!challengeList[tier]) {
          challengeList[tier] = [];
        }

        challengeList[tier].push(challenge);
      } else {
        const tier = nightwaveChallengeType.WEEKLY.tier;

        if (!challengeList[tier]) {
          challengeList[tier] = [];
        }

        challengeList[tier].push(challenge);
      }
    });

    Object.values(nightwaveChallengeType).forEach((challenge) => embeds.push(new EmbedBuilder()
      .setColor(getRandomHexColor())
      .setTitle(`${challenge.name}${DELIMITER}${challenge.value}`)
      .setTimestamp()
      .addFields(
        ...challengeList[challenge.tier].map((c) => ({ name: c.title, value: c.desc })),
        { name: `Ends <t:${timestampToUnix(challengeList[challenge.tier][0].expiry)}:R>`, value: '' })
      .setFooter({ text: 'warframestat.us' })));

    await interaction.editReply({ embeds, flags: MessageFlags.Ephemeral });
  },
};
