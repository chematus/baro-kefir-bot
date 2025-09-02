import { EmbedBuilder } from 'discord.js';
import { getInvasionsData, priorityRewardList } from '../../services/warframeAPI.js';
import { logger } from '../../utils/logger.js';
import {
  getRandomHexColor,
  etaToUnix,
  chunkArray,
  DELIMITER,
} from '../../utils/common.js';

export default {
  data: {
    name: 'invasions',
    description: 'Retrieve the list of invasions',
  },
  async execute(interaction) {
    const invasionsData = await getInvasionsData();

    if (!invasionsData) {
      await interaction.editReply('Sorry, there was an error fetching the invasions data.');

      return;
    }

    logger.info(`User ${interaction.user.tag} requested the invasions data.`);

    const embeds = invasionsData.filter(({ completed }) => !completed).map((inv) => {
      let attackerReward = inv.attacker.reward ? inv.attacker.reward.asString : '';

      if (attackerReward.length
        && priorityRewardList.some((str) => attackerReward.toLowerCase().includes(str))) {
        attackerReward = `__**${attackerReward}**__`;
      }

      let defenderReward = inv.defender.reward ? inv.defender.reward.asString : '';

      if (defenderReward.length
        && priorityRewardList.some((str) => defenderReward.toLowerCase().includes(str))) {
        defenderReward = `__**${defenderReward}**__`;
      }

      return new EmbedBuilder()
        .setColor(getRandomHexColor())
        .setTitle(`${inv.desc}${DELIMITER}${inv.node}`)
        .setThumbnail(inv.attacker?.reward?.thumbnail || inv.defender?.reward?.thumbnail || '')
        .addFields(
          {
            name: 'Attacker',
            value: `${inv.attacker.faction}${attackerReward ? `${DELIMITER}${attackerReward}` : ''}`,
          },
          {
            name: 'Defender',
            value: `${inv.defender.faction}${defenderReward ? `${DELIMITER}${defenderReward}` : ''}`,
          },
          {
            name: `Completion ${inv.completion.toFixed(2)}%`,
            value: `ETA: <t:${etaToUnix(inv.eta)}:R>`,
          },
        )
        .setTimestamp()
        .setFooter({ text: 'warframestat.us' });
    });

    const embedChunks = chunkArray(embeds);

    await interaction.editReply({ embeds: embedChunks[0] });

    for (let i = 1; i < embedChunks.length; i++) {
      await interaction.followUp({ embeds: embedChunks[i] });
    }
  },
};
