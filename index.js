import 'dotenv/config';
import {
  Client,
  Events,
  GatewayIntentBits,
} from 'discord.js';
import { commandCollection } from './src/commands/index.js';
import { registerCommands, bindCommandHandler } from './src/utils/commandController.js';

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
client.commands = commandCollection;

registerCommands(commandCollection);

client.on(Events.InteractionCreate, async (interaction) => {
  bindCommandHandler(interaction);
});

client.once(Events.ClientReady, (readyClient) => {
  console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

client.login(process.env.DISCORD_TOKEN);
