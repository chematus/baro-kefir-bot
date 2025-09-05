import { buildSlashCommand } from '../utils/commandBuilder.js';
import ping from './utility/ping.js';

// Utility command with subcommands

const subcommandModules = [
  ping,
];

export default buildSlashCommand('utility', 'List of utility commands', subcommandModules);
