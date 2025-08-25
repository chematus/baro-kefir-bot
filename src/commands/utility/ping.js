import { SlashCommandBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Check if Baro is awake'),
  async execute(interaction) {
    await interaction.reply('Pong!');
  },
};
