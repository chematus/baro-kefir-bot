import 'dotenv/config';
import {
  Client,
  Events,
  GatewayIntentBits,
} from 'discord.js';
import { commandCollection } from './src/commands/index.js';
import { registerCommands, bindCommandHandler } from './src/utils/commandController.js';
import { setupSentry } from './src/utils/logger.js';
import { logger } from './src/utils/logger.js';
import { startNotifiers } from './src/services/notifier.js';

setupSentry();

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
client.commands = commandCollection;

client.once(Events.ClientReady, (readyClient) => {
  logger.info(`Logged in as ${readyClient.user.tag}`);

  registerCommands(commandCollection);
  startNotifiers(readyClient);
});

client.on(Events.InteractionCreate, async (interaction) => {
  bindCommandHandler(interaction);
});

client.login(process.env.DISCORD_TOKEN);
