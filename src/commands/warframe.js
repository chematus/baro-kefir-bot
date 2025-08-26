import cycle from './warframe/cycle.js';
import { buildSlashCommand } from '../utils/commandBuilder.js';

const subcommandModules = [
  cycle,
];

export default buildSlashCommand('warframe', 'Warframe commands', subcommandModules);
