import { describe, it, expect, vi, beforeEach } from 'vitest';
import archimedeaCommand from '../../../src/commands/warframe/archimedea.js';
import * as warframeAPI from '../../../src/services/warframeAPI.js';
import { EmbedBuilder, AttachmentBuilder } from 'discord.js';

vi.mock('../../../src/services/warframeAPI.js', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    getArchimedeaData: vi.fn(),
  };
});

vi.mock('../../../src/utils/logger.js', () => ({
  logger: {
    info: vi.fn(),
  },
}));

const mockEmbed = {
  setColor: vi.fn().mockReturnThis(),
  setTitle: vi.fn().mockReturnThis(),
  setThumbnail: vi.fn().mockReturnThis(),
  addFields: vi.fn().mockReturnThis(),
  setTimestamp: vi.fn().mockReturnThis(),
  setFooter: vi.fn().mockReturnThis(),
};
vi.mock('discord.js', async (importOriginal) => {
  const actual = await importOriginal();

  return {
    ...actual,
    EmbedBuilder: vi.fn(() => mockEmbed),
    AttachmentBuilder: vi.fn(),
  };
});

describe('/warframe archimedea command', () => {
  let mockInteraction;

  beforeEach(() => {
    mockInteraction = {
      editReply: vi.fn(),
      user: { tag: 'test-user' },
    };

    vi.clearAllMocks();

    Object.values(mockEmbed).forEach((mockFn) => mockFn.mockClear());
  });

  it('should display archimedea details with multiple embeds', async () => {
    // --- Arrange ---
    const mockArchimedeaData = {
      expiry: '2025-09-06T01:21:49.000Z',
      missions: [
        {
          mission: 'Alator (Mars)',
          deviation: { name: 'Elite Roar', description: 'Elite enemies are Eximus.' },
          riskVariables: [{ name: 'Lethal Descent', description: 'Warframe bleedout is instant.' }],
        },
        {
          mission: 'Martialis (Mars)',
          deviation: { name: 'Personal Roar', description: 'Personal modifiers are active.' },
          riskVariables: [{ name: 'Tactical Reload', description: 'Magazines are not automatically reloaded.' }],
        },
      ],
      personalModifiers: [
        { name: 'Focus Siphon', description: 'Focus point gain is halved.' },
        { name: 'Energy Siphon', description: 'Energy regeneration is disabled.' },
      ],
    };
    warframeAPI.getArchimedeaData.mockResolvedValue(mockArchimedeaData);

    // --- Act ---
    await archimedeaCommand.execute(mockInteraction);

    // --- Assert ---
    expect(EmbedBuilder).toHaveBeenCalledTimes(3);

    expect(mockInteraction.editReply).toHaveBeenCalledOnce();
    const replyArgs = mockInteraction.editReply.mock.calls[0][0];
    expect(replyArgs.embeds).toHaveLength(3);
    expect(mockEmbed.setTitle).toHaveBeenCalledWith('Deep Archimedea');
    expect(mockEmbed.setTitle).toHaveBeenCalledWith('Martialis (Mars)');
    expect(AttachmentBuilder).toHaveBeenCalledWith(
      './assets/archimedea/necraloid.png',
      { name: 'necraloid.png' },
    );
  });

  it('should handle API errors gracefully', async () => {
    // --- Arrange ---
    warframeAPI.getArchimedeaData.mockResolvedValue(null);

    // --- Act ---
    await archimedeaCommand.execute(mockInteraction);

    // --- Assert ---
    expect(mockInteraction.editReply).toHaveBeenCalledOnce();
    expect(mockInteraction.editReply).toHaveBeenCalledWith('Sorry, there was an error fetching the archimedea data.');
  });
});

