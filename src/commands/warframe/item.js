import { EmbedBuilder, MessageFlags } from 'discord.js';
import { getItemData, polarities, damageTypeList } from '../../services/warframeAPI.js';
import { logger } from '../../utils/logger.js';
import { getRandomHexColor, formatDuration, DELIMITER } from '../../utils/common.js';

const CIRCLE_ICON = {
  FILLED: ':white_circle:',
  EMPTY: ':black_circle:',
};

const BINARY_ICON = {
  TRUE: ':white_check_mark:',
  FALSE: ':x:',
};

//  ---- Helpers ----
const getDamageTypeString = (key) => damageTypeList[key] ? `${damageTypeList[key].icon} ${damageTypeList[key].name}` : '';

const replacePlaceholders = (str) => str
  .replace(/<DT_([^_>]+).*?>/g, (match, word) => `${damageTypeList[word.toLowerCase()]?.icon || ''} `)
  .replace(/\|[^|]+\|/g, '...');

const getPolarityString = (key) => polarities[key] ? `${polarities[key].name} ${polarities[key].symbol}` : '';

const getTotalDamage = (data) => Object.values(data).reduce((acc, i) => acc += Math.round(i * 100), 0) / 100;

const generateDispositionBar = (value) => {
  const dispositionBar = new Array(5).fill(CIRCLE_ICON.EMPTY);

  for (let i = 0; i < value; i++) {
    dispositionBar[i] = CIRCLE_ICON.FILLED;
  }

  return dispositionBar.join(' ');
};

// Parse item info for firearams
const parseFirearmInfo = ({ attacks, multishot, reloadTime, magazineSize }) => {
  const weaponFields = [];

  if (multishot && multishot !== 1) {
    weaponFields.push({ name: 'Multishot', value: String(multishot), inline: true });
  }

  if (reloadTime) {
    weaponFields.push({ name: 'Reload Time', value: `${reloadTime.toFixed(2)}s`, inline: true });
  }

  if (magazineSize) {
    weaponFields.push({ name: 'Magazine Size', value: String(magazineSize), inline: true });
  }

  const embeds = [new EmbedBuilder()
    .setColor(getRandomHexColor())
    .setTitle('Weapon Stats')
    .addFields(...weaponFields)];

  attacks.forEach((attack) => {
    const fields = [];

    if (attack.speed) {
      fields.push({ name: 'Fire Rate', value: String(attack.speed.toFixed(2)), inline: true });
    }

    if (attack.crit_chance) {
      fields.push({ name: 'Critical Chance', value: `${attack.crit_chance}%`, inline: true });
    }

    if (attack.crit_mult) {
      fields.push({ name: 'Critical Multiplier', value: `x${attack.crit_mult}`, inline: true });
    }

    if (attack.status_chance) {
      fields.push({ name: 'Status Chance', value: `${attack.status_chance}%`, inline: true });
    }

    if (attack.shot_type) {
      fields.push({ name: 'Trigger', value: attack.shot_type, inline: true });
    }

    fields.push({ name: 'Total Damage', value: String(getTotalDamage(attack.damage)), inline: true });

    Object.entries(damageTypeList).map(([key, { name }]) => {
      if (attack.damage[key]) {
        fields.push({ name, value: String(attack.damage[key].toFixed(2)), inline: true });
      }
    });

    if (attack.falloff) {
      fields.push({
        name: 'Damage Falloff',
        value: `Between ${attack.falloff.start}m and ${attack.falloff.end}m (100% - ${(1 - attack.falloff.reduction) * 100}%)`,
        inline: true,
      });
    }

    embeds.push(new EmbedBuilder()
      .setColor(getRandomHexColor())
      .setTitle(attack.name)
      .addFields(...fields));
  });

  return embeds;
};

// Parse item info for melee weapons
const parseMeleeInfo = (data) => {
  const weaponFields = [
    { name: 'Range', value: `${data.range}m`, inline: true },
    { name: 'Blocking Angle', value: `${data.blockingAngle}°`, inline: true },
    { name: 'Combo Duration', value: `${data.comboDuration}s`, inline: true },
    { name: 'Follow Through', value: `${data.followThrough * 100}%`, inline: true },
    { name: 'Slide', value: String(data.slideAttack), inline: true },
    { name: 'Windup', value: `${data.windUp}s`, inline: true },
    {
      name: 'Stance Polarity',
      value: getPolarityString(data.stancePolarity),
      inline: true,
    },
  ];

  const embeds = [new EmbedBuilder()
    .setColor(getRandomHexColor())
    .setTitle('Weapon Stats')
    .addFields(...weaponFields)];

  data.attacks.forEach((attack) => {
    const fields = [];

    if (attack.speed) {
      fields.push({ name: 'Attack Speed', value: String(attack.speed.toFixed(2)), inline: true });
    }

    if (attack.crit_chance) {
      fields.push({ name: 'Critical Chance', value: `${attack.crit_chance}%`, inline: true });
    }

    if (attack.crit_mult) {
      fields.push({ name: 'Critical Multiplier', value: `x${attack.crit_mult}`, inline: true });
    }

    if (attack.status_chance) {
      fields.push({ name: 'Status Chance', value: `${attack.status_chance}%`, inline: true });
    }

    fields.push({ name: 'Total Damage', value: String(getTotalDamage(attack.damage)), inline: true });

    Object.entries(damageTypeList).map(([key, { name }]) => {
      if (attack.damage[key]) {
        fields.push({ name, value: String(attack.damage[key].toFixed(2)), inline: true });
      }
    });

    if (attack.falloff) {
      fields.push({
        name: 'Damage Falloff',
        value: `Between ${attack.falloff.start}m and ${attack.falloff.end}m (100% - ${(1 - attack.falloff.reduction) * 100}%)`,
        inline: true,
      });
    }

    embeds.push(new EmbedBuilder()
      .setColor(getRandomHexColor())
      .setTitle(attack.name)
      .addFields(...fields));
  });

  return embeds;
};

// Parse item info for warframes
const parseWarframeInfo = (data) => {
  const warframeFields = [
    { name: 'Shields', value: String(data.shield || 0), inline: true },
    { name: 'Health', value: String(data.health || 0), inline: true },
    { name: 'Armor', value: String(data.armor || 0), inline: true },
    { name: 'Energy', value: String(data.power || 0), inline: true },
    { name: 'Sprint Speed', value: String(data.sprintSpeed.toFixed(2)), inline: true },
  ];

  if (data.aura) {
    warframeFields.push({ name: 'Aura', value: getPolarityString(data.aura) });
  }

  const embeds = [new EmbedBuilder()
    .setColor(getRandomHexColor())
    .setTitle('Warframe Stats')
    .addFields(...warframeFields)];

  const abilityFields = [
    { name: 'Passive', value: replacePlaceholders(data.passiveDescription) },
    ...data.abilities.map(({ name, description }) => ({ name, value: replacePlaceholders(description) })),
  ];

  embeds.push(new EmbedBuilder()
    .setColor(getRandomHexColor())
    .setTitle('Abilities')
    .addFields(...abilityFields));

  return embeds;
};

// Parse item info for pets
const parsePetInfo = (data) => {
  const petFields = [
    { name: 'Shields', value: String(data.shield || 0), inline: true },
    { name: 'Health', value: String(data.health || 0), inline: true },
    { name: 'Armor', value: String(data.armor || 0), inline: true },
  ];

  return [new EmbedBuilder()
    .setColor(getRandomHexColor())
    .setTitle('Pet Stats')
    .addFields(...petFields)];
};

// Parse item info for archwings
const parseArchwingInfo = (data) => {
  const warframeFields = [
    { name: 'Shields', value: String(data.shield || 0), inline: true },
    { name: 'Health', value: String(data.health || 0), inline: true },
    { name: 'Armor', value: String(data.armor || 0), inline: true },
    { name: 'Energy', value: String(data.power || 0), inline: true },
  ];

  const embeds = [new EmbedBuilder()
    .setColor(getRandomHexColor())
    .setTitle('Archwing Stats')
    .addFields(...warframeFields)];

  const abilityFields = [
    ...data.abilities.map(({ name, description }) => ({ name, value: replacePlaceholders(description) })),
  ];

  embeds.push(new EmbedBuilder()
    .setColor(getRandomHexColor())
    .setTitle('Abilities')
    .addFields(...abilityFields));

  return embeds;
};

// Parse item info for misc items
const parseMiscInfo = ({ drops }) => {
  const miscFields = drops
    // filter out conclave missions
    ?.filter(({ location }) => !location.toLowerCase().includes('conclave'))
    .map(({ chance, location, rarity, type }) => ({
      name: location, value: `${(chance * 100).toFixed(2)}% (${rarity})${DELIMITER}${type}`,
    }));

  const embed = new EmbedBuilder()
    .setColor(getRandomHexColor())
    .setTitle('Drops');

  if (miscFields?.length) {
    embed.addFields(...miscFields);

    return [embed];
  }

  return [];
};

// Parse item info for mods
const parseModInfo = (data) => {
  const modFields = [
    { name: 'Polarity', value: getPolarityString(data.polarity) },
    { name: 'Max Fusion Level', value: String(data.fusionLimit), inline: true },
    { name: 'Rarity', value: data.rarity, inline: true },
    { name: 'Tradable', value: `${data.tradable ? BINARY_ICON.TRUE : BINARY_ICON.FALSE}`, inline: true },
    { name: 'Transmutable', value: `${data.transmutable ? BINARY_ICON.TRUE : BINARY_ICON.FALSE}`, inline: true },
    { name: 'Type', value: data.type, inline: true },
  ];

  if (data.compatName) {
    modFields.push({ name: 'Compatible With', value: data.compatName, inline: true });
  }
  const embeds = [new EmbedBuilder()
    .setColor(getRandomHexColor())
    .setTitle('Mod Info')
    .addFields(...modFields)];

  return embeds;
};

// Parse item info for enemies
const parseEnemyInfo = (data) => {
  const enemyFields = [
    { name: 'Type', value: data.type, inline: true },
    { name: 'Shields', value: String(data.shield || 0), inline: true },
    { name: 'Health', value: String(data.health || 0), inline: true },
    { name: 'Armor', value: String(data.armor || 0), inline: true },
  ];

  const embeds = [new EmbedBuilder()
    .setColor(getRandomHexColor())
    .setTitle('Enemy Stats')
    .addFields(...enemyFields)];

  const resFields = data.resistances.filter(({ amount }) => amount).map(({ type, affectors }) => ({
    name: type,
    value: affectors
      .map(({ element, modifier }) => `${getDamageTypeString(element.toLowerCase())}${DELIMITER}${(1 + modifier) * 100}%`)
      .join('\n'),
    inline: true,
  }));

  embeds.push(new EmbedBuilder()
    .setColor(getRandomHexColor())
    .setTitle('Resistances')
    .addFields(...resFields));

  const dropFields = data.drops.filter(({ chance }) => chance).map(({ location, rarity, chance }) => ({
    name: location,
    value: `${rarity}${DELIMITER}${(chance * 100).toFixed(2)}%`,
  }));

  embeds.push(new EmbedBuilder()
    .setColor(getRandomHexColor())
    .setTitle('Drops')
    .addFields(...dropFields));

  return embeds;
};

// Mapping item category to its parser function
const itemTypeMapping = {
  primary: parseFirearmInfo,
  secondary: parseFirearmInfo,
  melee: parseMeleeInfo,
  pets: parsePetInfo,
  archwing: parseArchwingInfo,
  warframes: parseWarframeInfo,
  misc: parseMiscInfo,
  mods: parseModInfo,
  enemy: parseEnemyInfo,
};

/**
 * Item command to search for an item.
 */
export default {
  data: {
    name: 'item',
    description: 'Search for an item',
  },
  options: (option) =>
    option.setName('name')
      .setDescription('Enter its name')
      .setRequired(true),
  async execute(interaction) {
    const itemName = interaction.options.getString('name');
    const itemData = await getItemData(itemName);

    if (!itemData) {
      await interaction.editReply(`No record for "${itemName}" found.`);

      return;
    }

    logger.info(`User ${interaction.user.tag} requested the "${itemName}" info.`);

    // General
    const fields = [];

    if (itemData.category) {
      fields.push({ name: 'Category', value: itemData.category });
    }

    if (itemData.type) {
      fields.push({ name: 'Type', value: itemData.type });
    }

    if (itemData.disposition) {
      fields.push({
        name: 'Disposition',
        value: `${generateDispositionBar(itemData.disposition)} (x${itemData.omegaAttenuation})`,
      });
    }

    if (itemData.polarities?.length) {
      fields.push({
        name: 'Polarities',
        value: itemData.polarities.map(getPolarityString).join(DELIMITER),
      });
    }

    if (itemData.masteryReq) {
      fields.push({ name: 'Mastery requirement', value: String(itemData.masteryReq) });
    }

    if (itemData.marketCost) {
      fields.push({ name: 'Market Cost', value: `${itemData.marketCost}pl` });
    }

    let embeds = [new EmbedBuilder()
      .setColor(getRandomHexColor())
      .setTitle(itemData.name)
      .setImage(itemData.wikiaThumbnail)
      .addFields(...fields)
      .setTimestamp()
      .setFooter({ text: 'warframestat.us' })];

    if (itemData.description) {
      embeds[0].setDescription(itemData.description);
    } else if (itemData.levelStats?.length) {
      const desc = itemData.levelStats.at(-1).stats.join('\n');
      embeds[0].setDescription(replacePlaceholders(desc));
    }

    // Specific item data
    embeds = embeds.concat(itemTypeMapping[itemData.category.toLowerCase()](itemData));

    // Crafting
    const craftFields = [];

    if (itemData.bpCost) {
      craftFields.push({ name: 'Blueprint cost', value: `${itemData.bpCost} :euro:`, inline: true });
    }

    if (itemData.buildPrice) {
      craftFields.push({ name: 'Build price', value: `${itemData.buildPrice} :euro: for ${itemData.buildQuantity} item`, inline: true });
    }

    if (itemData.buildTime) {
      craftFields.push({ name: 'Build time', value: `${formatDuration(itemData.buildTime)}`, inline: true });
    }

    if (itemData.components?.length > 1) {
      craftFields.push({
        name: 'Components',
        value: `${itemData.components.map(({ name, itemCount }) => `${name}: ${itemCount}`).join('\n')}`,
        inline: true,
      });
    }

    if (craftFields.length) {
      embeds.push(new EmbedBuilder()
        .setColor(getRandomHexColor())
        .setTitle('Crafting')
        .addFields(...craftFields));
    }

    // Misc
    const miscFields = [];

    if (itemData.releaseDate) {
      miscFields.push({
        name: 'Release Date',
        value: new Date(itemData.releaseDate).toLocaleDateString(),
        inline: true,
      });
    }

    if (itemData.vaultDate) {
      miscFields.push({
        name: 'Vault Date',
        value: new Date(itemData.vaultDate).toLocaleDateString(),
        inline: true,
      });
    }

    if (itemData.tags && itemData.tags.length) {
      miscFields.push({
        name: 'Tags',
        value: `${itemData.tags.map((tag) => `\`${tag}\``).join(' ')}`,
        inline: true,
      });
    }

    if (miscFields.length) {
      embeds.push(new EmbedBuilder()
        .setColor(getRandomHexColor())
        .setTitle('Misc')
        .addFields(...miscFields));
    }

    return interaction.editReply({ embeds, flags: MessageFlags.Ephemeral });
  },
};
