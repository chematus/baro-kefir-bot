const author = 'chematus';

export default {
  data: {
    name: 'ping',
    description: 'Check if Baro is awake',
  },
  async execute(interaction) {
    const tag = interaction.user.tag.split('#')[0].toLowerCase();
    const message = author === tag ? 'Hey, Dad! :pleading_face:' : 'Pong';
    await interaction.editReply(message);
  },
};
