import { EmbedBuilder, AttachmentBuilder } from 'discord.js';
import { getCycleData, owZoneList } from '../../services/warframeAPI.js';
import { logger } from '../../utils/logger.js';
import { capitalizeString, timestampToUnix } from '../../utils/common.js';

const BORDER_COLOR = {
  DAY: '#FFD700',
  NIGHT: '#4B0082',
};

const parseEarthData = ({ expiry, isDay }) => {
  if (!expiry || typeof isDay !== 'boolean') {
    return null;
  }

  return {
    changeTimestamp: timestampToUnix(expiry),
    isDay,
    cycleState: isDay ? 'day' : 'night',
  };
};

const parseCetusData = ({ expiry, isDay, state }) => {
  if (!expiry || typeof isDay !== 'boolean') {
    return null;
  }

  return {
    changeTimestamp: timestampToUnix(expiry),
    isDay,
    cycleState: state || isDay ? 'day' : 'night',
  };
};

const parseCambionData = ({ expiry, state }) => {
  if (!expiry || !state) {
    return null;
  }

  return {
    changeTimestamp: timestampToUnix(expiry),
    isDay: state === 'fass',
    cycleState: state,
  };
};

const parseVallisData = ({ expiry, isWarm }) => {
  if (!expiry || typeof isWarm !== 'boolean') {
    return null;
  }

  return {
    changeTimestamp: timestampToUnix(expiry),
    isDay: isWarm,
    cycleState: isWarm ? 'warm' : 'cold',
  };
};

export default {
  data: {
    name: 'cycle',
    description: 'Retrieve current cycle for selected zone',
  },
  options: (option) =>
    option.setName('zone')
      .setDescription('Choose location')
      .setRequired(true)
      .addChoices(owZoneList),
  async execute(interaction) {
    const zone = interaction.options.getString('zone');
    const zoneName = owZoneList.find(({ value }) => value === zone).name;
    const cycleData = await getCycleData(zone);

    if (!cycleData) {
      await interaction.editReply(`Sorry, there was an error fetching the ${zoneName} cycle data.`);

      return;
    }

    let parsedData = {};

    switch (zone) {
    case 'vallis':
      parsedData = parseVallisData(cycleData);
      break;
    case 'cambion':
      parsedData = parseCambionData(cycleData);
      break;
    case 'earth':
      parsedData = parseEarthData(cycleData);
      break;
    default:
      parsedData = parseCetusData(cycleData);
      break;
    }

    const { isDay, cycleState, changeTimestamp } = parsedData;

    const fileName = isDay ? 'day' : 'night';

    const icon = new AttachmentBuilder(
      `./assets/cycle/${fileName}.png`,
      { name: `cycle-${fileName}.png` },
    );

    logger.info(`User ${interaction.user.tag} requested the ${zoneName} cycle.`);

    const embed = new EmbedBuilder()
      .setColor(isDay ? BORDER_COLOR.DAY : BORDER_COLOR.NIGHT)
      .setTitle(`${zoneName} Cycle: ${capitalizeString(cycleState)}`)
      .setThumbnail(`attachment://cycle-${fileName}.png`)
      .addFields(
        { name: `Ends <t:${changeTimestamp}:R>`, value: '' },
      )
      .setTimestamp()
      .setFooter({ text: 'warframestat.us' });

    return interaction.editReply({ embeds: [embed], files: [icon] });
  },
};
