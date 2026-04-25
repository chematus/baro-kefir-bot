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

    const challengeList = Object.fromEntries(
      Object.values(nightwaveChallengeType).map(({ tier }) => [tier, []]),
    );

    nightwaveData.activeChallenges?.forEach((challenge) => {
      if (challenge.isDaily) {
        const tier = nightwaveChallengeType.DAILY.tier;

        challengeList[tier].push(challenge);
      } else if (challenge.isElite) {
        const tier = nightwaveChallengeType.ELITE.tier;

        challengeList[tier].push(challenge);
      } else {
        const tier = nightwaveChallengeType.WEEKLY.tier;

        challengeList[tier].push(challenge);
      }
    });

    Object.values(nightwaveChallengeType).forEach((challenge) => {
      const challenges = challengeList[challenge.tier];

      if (!challenges.length) {
        return;
      }

      embeds.push(new EmbedBuilder()
        .setColor(getRandomHexColor())
        .setTitle(`${challenge.name}${DELIMITER}${challenge.value}`)
        .setTimestamp()
        .addFields(
          ...challenges.map((c) => ({ name: c.title, value: c.desc })),
          { name: `Ends <t:${timestampToUnix(challenges[0].expiry)}:R>`, value: '' })
        .setFooter({ text: 'warframestat.us' }));
    });

    await interaction.editReply({ embeds, flags: MessageFlags.Ephemeral });
  },
};
