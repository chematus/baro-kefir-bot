import 'dotenv/config';
import {
  REST,
  Routes,
  MessageFlags,
} from 'discord.js';
import { logger, reportError } from './logger.js';

/**
 * Register commands with Discord API.
 *
 * @param {Collection} commandCollection - The collection of commands to register.
 */
export const registerCommands = async (commandCollection) => {
  if (!process.env.DISCORD_TOKEN || !process.env.APP_ID) {
    logger.error('Missing required env variables');

    return;
  }

  const rest = new REST().setToken(process.env.DISCORD_TOKEN);
  const commands = [];

  commandCollection.each((command) => commands.push(command.data.toJSON()));

  try {
    logger.info(`Started refreshing ${commands.length} application commands.`);

    const data = await rest.put(
      Routes.applicationGuildCommands(process.env.APP_ID, process.env.GUILD_ID),
      { body: commands },
    );

    logger.info(`Successfully reloaded ${data.length} application commands.`);
  } catch (error) {
    reportError(error, { context: 'Command Registration' });
  }
};

/**
 * Bind the command handler to the interaction event.
 *
 * @param {import('discord.js').CommandInteraction} interaction - The interaction object from Discord.js.
 */
export const bindCommandHandler = async (interaction) => {
  if (!interaction.isChatInputCommand()) {
    return;
  }

  const command = interaction.client.commands.get(interaction.commandName);

  if (!command) {
    logger.warn(`No command matching "${interaction.commandName}" was found.`);
    await interaction.reply({ content: `The command "${interaction.commandName}" does not exist.`, ephemeral: true });

    return;
  }

  try {
    await command.execute(interaction);
  } catch (error) {
    reportError(error, {
      commandName: interaction.commandName,
      user: interaction.user.tag,
      guild: interaction.guild?.id,
      channel: interaction.channel?.id,
    });

    const errorMessage = 'There was an error while executing this command!';
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({ content: errorMessage, flags: MessageFlags.Ephemeral });
    } else {
      await interaction.reply({ content: errorMessage, flags: MessageFlags.Ephemeral });
    }
  }
};
