import { buildSlashCommand } from '../utils/commandBuilder.js';
import cycle from './warframe/cycle.js';
import alerts from './warframe/alerts.js';
import arbitration from './warframe/arbitration.js';
import archon from './warframe/archon.js';

const subcommandModules = [
  alerts,
  arbitration,
  archon,
  cycle,
];

export default buildSlashCommand('warframe', 'Warframe commands', subcommandModules);
