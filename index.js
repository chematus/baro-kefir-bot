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

// Initialize Sentry for error monitoring
setupSentry();

// Create a new Discord client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds] });
client.commands = commandCollection;

client.once(Events.ClientReady, (readyClient) => {
  logger.info(`Logged in as ${readyClient.user.tag}`);

  // Register commands and start notifiers
  registerCommands(commandCollection);
  startNotifiers(readyClient);
});

client.on(Events.InteractionCreate, async (interaction) => {
  // Handle command interactions
  return bindCommandHandler(interaction);
});

client.login(process.env.DISCORD_TOKEN);
