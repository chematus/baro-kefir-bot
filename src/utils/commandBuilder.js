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
      commandBuilder.addSubcommand((sc) => {
        const builder = sc.setName(data.name)
          .setDescription(data.description);

        if (options) {
          builder.addStringOption(options);
        }

        return builder;
      });

      subcommands.set(data.name, command);
      logger.debug(`Loaded subcommand: /${name} ${data.name}`);
    } else {
      logger.warn('A subcommand module is missing a required "data" or "execute" property.');
    }
  });

  return {
    data: commandBuilder,
    async execute(interaction) {
      const subcommandName = interaction.options.getSubcommand();

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
