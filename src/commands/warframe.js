import { buildSlashCommand } from '../utils/commandBuilder.js';
// import cycle from './warframe/cycle.js';
// import alerts from './warframe/alerts.js';
// import arbitration from './warframe/arbitration.js';
// import archon from './warframe/archon.js';
// import darvo from './warframe/darvo.js';
// import archimedea from './warframe/archimedea.js';
// import events from './warframe/events.js';
// import fissures from './warframe/fissures.js';
// import invasions from './warframe/invasions.js';
// import news from './warframe/news.js';
// import nightwave from './warframe/nightwave.js';
// import sortie from './warframe/sortie.js';
// import baro from './warframe/baro.js';
// import item from './warframe/item.js';
import stream from './warframe/stream.js';

// Warframe command with subcommands

/**
 * Since api.warframestat.us no longer works, all commands are disabled until the situation is resolved
 */
const subcommandModules = [
  // alerts,
  // arbitration,
  // archimedea,
  // archon,
  // baro,
  // cycle,
  // darvo,
  // events,
  // fissures,
  // invasions,
  // item,
  // news,
  // nightwave,
  // sortie,
  stream,
];

export default buildSlashCommand('warframe', 'Warframe commands', subcommandModules);
