import 'dotenv/config';
import { REST, Routes } from 'discord.js';

export const registerCommands = async (commandCollection) => {
  const rest = new REST().setToken(process.env.DISCORD_TOKEN);
  const commands = [];

  commandCollection.each((command) => commands.push(command.data.toJSON()));

  try {
    console.log(`Started refreshing ${commands.length} application commands.`);

    const data = await rest.put(
      Routes.applicationCommands(process.env.APP_ID),
      { body: commands },
    );

    console.log(`Successfully reloaded ${data.length} application commands.`);
  } catch (error) {
    console.error(error);
  }
};

export const bindCommandHandler = async (interaction) => {
  if (!interaction.isChatInputCommand()) {
    return;
  }

  const command = interaction.client.commands.get(interaction.commandName);

  if (!command) {
    console.error(`No command matching ${interaction.commandName} was found.`);

    return;
  }

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);

    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({ content: 'There was an error while executing this command!', flags: MessageFlags.Ephemeral });
    } else {
      await interaction.reply({ content: 'There was an error while executing this command!', flags: MessageFlags.Ephemeral });
    }
  }
};
