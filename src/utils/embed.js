import { EmbedBuilder } from 'discord.js';
import {
  chunkArray,
  DELIMITER,
  etaToUnix,
  getRandomHexColor,
  timestampToUnix,
} from './common.js';
import { priorityRewardList } from '../services/warframeAPI.js';

export const createAlertEmbed = ({ expiry, mission: m }) => new EmbedBuilder()
  .setColor(getRandomHexColor())
  .setTitle(m.reward.itemString)
  .setThumbnail(m.reward.setThumbnail)
  .addFields(
    { name: `${m.node}${DELIMITER}${m.type}`, value: `${m.faction} (${m.minEnemyLevel}-${m.maxEnemyLevel})` },
    { name: `Ends <t:${timestampToUnix(expiry)}:R>`, value: '' },
  )
  .setTimestamp()
  .setFooter({ text: 'warframestat.us' });

export const createEventEmbed = (e) => new EmbedBuilder()
  .setColor(getRandomHexColor())
  .setTitle(e.description)
  .addFields(
    { name: e.tooltip || '', value: e.node || '' },
    ...e.interimSteps.map(({ goal, reward: { items } }) => ({ name: `@${goal}`, value: items.join(DELIMITER) })),
    { name: `@${e.maximumScore}`, value: e.rewards.map(({ items }) => items.join(DELIMITER)).filter((s) => s.length).join('\n') },
    { name: `Ends <t:${timestampToUnix(e.expiry)}:R>`, value: '' },
  )
  .setTimestamp()
  .setFooter({ text: 'warframestat.us' });

export const createInvasionEmbed = (inv) => {
  let attackerReward = '';

  if (inv.attacker.reward) {
    if (inv.attacker.reward.asString) {
      attackerReward = inv.attacker.reward.asString;
    } else {
      const items = inv.attacker.reward.countedItems;
      attackerReward = items.map(({ count, type }) => `${count} ${type}`).join(DELIMITER);
    }
  }

  if (attackerReward.length
        && priorityRewardList.some((str) => attackerReward.toLowerCase().includes(str))) {
    attackerReward = `__**${attackerReward}**__`;
  }

  let defenderReward = '';

  if (inv.defender.reward) {
    if (inv.defender.reward.asString) {
      defenderReward = inv.defender.reward.asString;
    } else {
      const items = inv.defender.reward.countedItems;
      defenderReward = items.map(({ count, type }) => `${count} ${type}`).join(DELIMITER);
    }
  }

  if (defenderReward.length
        && priorityRewardList.some((str) => defenderReward.toLowerCase().includes(str))) {
    defenderReward = `__**${defenderReward}**__`;
  }

  const fields = [
    {
      name: 'Attacker',
      value: `${inv.attacker.faction}${attackerReward ? `${DELIMITER}${attackerReward}` : ''}`,
    },
    {
      name: 'Defender',
      value: `${inv.defender.faction}${defenderReward ? `${DELIMITER}${defenderReward}` : ''}`,
    },
  ];

  if (inv.eta) {
    fields.push({
      name: `Completion ${inv.completion.toFixed(2)}%`,
      value: `ETA: <t:${etaToUnix(inv.eta)}:R>`,
    });
  }

  return new EmbedBuilder()
    .setColor(getRandomHexColor())
    .setTitle(`${inv.desc}${DELIMITER}${inv.node}`)
    .setThumbnail(inv.attacker?.reward?.thumbnail || inv.defender?.reward?.thumbnail || '')
    .addFields(...fields)
    .setTimestamp()
    .setFooter({ text: 'warframestat.us' });
};

export const createNewsEmbed = (item) => {
  const embed = new EmbedBuilder()
    .setColor(getRandomHexColor())
    .setTitle(item.message)
    .setURL(item.link)
    .setImage(item.imageLink)
    .setTimestamp()
    .setFooter({ text: 'warframestat.us' });

  if (item.endDate) {
    embed.addFields({ name: `Ends <t:${timestampToUnix(item.endDate)}:R>`, value: '' });
  }

  return embed;
};

export const createVoidTraderEmbed = (voidTraderData) => {
  const embeds = [new EmbedBuilder()
    .setColor(getRandomHexColor())
    .setTitle(voidTraderData.character)
    .setDescription(`has arrived at ${voidTraderData.location}`)
    .addFields(
      { name: `Departs <t:${timestampToUnix(voidTraderData.expiry)}:R>`, value: '' },
    )
    .setTimestamp()
    .setFooter({ text: 'warframestat.us' })];

  const inventory = chunkArray(voidTraderData.inventory);

  embeds.push(new EmbedBuilder()
    .setColor(getRandomHexColor())
    .setTitle('Inventory')
    .addFields(
      ...inventory[0].map(({ item, ducats, credits }) => ({
        name: item,
        value: `${ducats} :coin: + ${credits} :euro:`,
      })),
    ));

  for (let i = 1; i < inventory.length; i++) {
    embeds.push(new EmbedBuilder()
      .setColor(getRandomHexColor())
      .addFields(
        ...inventory[i].map(({ item, ducats, credits }) => ({
          name: item,
          value: `${ducats} :coin: + ${credits} :euro:`,
        })),
      ));
  }

  return embeds;
};
