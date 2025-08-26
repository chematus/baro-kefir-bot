import { SlashCommandBuilder, Collection } from 'discord.js';
import { logger } from '../utils/logger.js';

export const buildSlashCommand = (name, description, moduleList) => {
  const subcommands = new Collection();

  const commandBuilder = new SlashCommandBuilder()
    .setName(name)
    .setDescription(description);

  moduleList.forEach((command) => {
    const { data, execute, options } = command;

    if (data && execute) {
      if (options) {
        commandBuilder.addStringOption(options);
      } else {
        commandBuilder.addSubcommand((sc) => sc.setName(data.name)
          .setDescription(data.description));
      }

      subcommands.set(data.name, command);
      logger.debug(`Loaded subcommand: /${name} ${data.name}`);
    } else {
      logger.warn('A subcommand module is missing a required "data" or "execute" property.');
    }
  });

  return {
    data: commandBuilder,
    async execute(interaction) {
      const subcommandName = interaction.options.getSubcommand(false)
          || interaction.options._hoistedOptions[0].name;

      const subcommand = subcommands.get(subcommandName);

      if (!subcommand) {
        await interaction.reply({ content: `Unknown subcommand: ${subcommandName}`, ephemeral: true });

        return;
      }

      await interaction.deferReply();
      await subcommand.execute(interaction);
    },
  };
};
