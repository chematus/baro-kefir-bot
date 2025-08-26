import { Collection } from 'discord.js';
import utility from './utility.js';
import warframe from './warframe.js';
import { logger } from '../utils/logger.js';

const commandList = {};
export const commandCollection = new Collection();

commandList['utility'] = utility;
commandList['warframe'] = warframe;

Object.entries(commandList).forEach(([key, command]) => {
  if ('data' in command && 'execute' in command) {
    commandCollection.set(command.data.name, command);
  } else {
    logger.info(`Command "${key}" is missing reqired attributes. Skipping.`);
  }
});
