import { Collection } from 'discord.js';
import ping from './utility/ping.js';

const commandList = {};
export const commandCollection = new Collection();

// Utility
commandList['ping'] = ping;

Object.entries(commandList).forEach(([key, command]) => {
  if ('data' in command && 'execute' in command) {
    commandCollection.set(command.data.name, command);
  } else {
    console.log(`Command "${key}" is missing reqired attributes. Skipping.`);
  }
});
