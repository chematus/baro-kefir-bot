import { SlashCommandBuilder, Collection, MessageFlags } from 'discord.js';
import { logger } from '../utils/logger.js';

/**
 * Build a slash command with subcommands from a list of modules.
 *
 * @param {string} name - The name of the main command.
 * @param {string} description - The description of the main command.
 * @param {Array} moduleList - The list of module objects containing command data.
 * @returns {{ data: SlashCommandBuilder, execute: (interaction: CommandInteraction) => Promise<void> }} - The built command and its execution logic.
 */
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

      await interaction.deferReply({ flags: MessageFlags.Ephemeral });
      await subcommand.execute(interaction);
    },
  };
};
