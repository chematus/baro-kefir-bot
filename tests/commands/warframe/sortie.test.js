import { describe, it, expect, vi, beforeEach } from 'vitest';
import sortieCommand from '../../../src/commands/warframe/sortie.js';
import * as warframeAPI from '../../../src/services/warframeAPI.js';
import { EmbedBuilder } from 'discord.js';

vi.mock('../../../src/services/warframeAPI.js', async (importOriginal) => {
  const actual = await importOriginal();

  return {
    ...actual,
    getSortieData: vi.fn(),
  };
});

vi.mock('../../../src/utils/logger.js', () => ({
  logger: { info: vi.fn() },
}));

const mockEmbed = {
  setColor: vi.fn().mockReturnThis(),
  setTitle: vi.fn().mockReturnThis(),
  setTimestamp: vi.fn().mockReturnThis(),
  addFields: vi.fn().mockReturnThis(),
  setFooter: vi.fn().mockReturnThis(),
};
vi.mock('discord.js', async (importOriginal) => {
  const actual = await importOriginal();

  return {
    ...actual,
    EmbedBuilder: vi.fn(() => mockEmbed),
  };
});

describe('/warframe sortie command', () => {
  let mockInteraction;

  beforeEach(() => {
    mockInteraction = {
      editReply: vi.fn(),
      user: { tag: 'test-user' },
    };
    vi.clearAllMocks();
    Object.values(mockEmbed).forEach((mockFn) => mockFn.mockClear());
  });

  it('should correctly display the sortie and its variants', async () => {
    // --- Arrange ---
    const mockSortieData = {
      boss: 'Captain Vor',
      faction: 'Grineer',
      expiry: '2025-09-06T12:00:00.000Z',
      variants: [
        { missionType: 'Exterminate', node: 'Ceres - Draco', modifier: 'Energy Reduction', modifierDescription: 'Energy pickups are less effective.' },
        { missionType: 'Rescue', node: 'Jupiter - Io', modifier: 'Enemy Elemental Enhancement', modifierDescription: 'Enemies have enhanced elemental damage.' },
      ],
    };
    warframeAPI.getSortieData.mockResolvedValue(mockSortieData);

    // --- Act ---
    await sortieCommand.execute(mockInteraction);

    // --- Assert ---
    expect(mockInteraction.editReply).toHaveBeenCalledOnce();
    const replyArgs = mockInteraction.editReply.mock.calls[0][0];

    // 1 main embed + 2 variants = 3 total
    expect(EmbedBuilder).toHaveBeenCalledTimes(3);
    expect(replyArgs.embeds).toHaveLength(3);

    expect(mockEmbed.setTitle).toHaveBeenCalledWith('Captain Vor  |  Grineer');
    expect(mockEmbed.setTitle).toHaveBeenCalledWith('Exterminate  |  Ceres - Draco');
    expect(mockEmbed.setTitle).toHaveBeenCalledWith('Rescue  |  Jupiter - Io');

    const rescueVariant = mockSortieData.variants[1];
    expect(mockEmbed.addFields).toHaveBeenCalledWith({
      name: rescueVariant.modifier,
      value: rescueVariant.modifierDescription,
    });
  });

  it('should handle API errors gracefully', async () => {
    // --- Arrange ---
    warframeAPI.getSortieData.mockResolvedValue(null);

    // --- Act ---
    await sortieCommand.execute(mockInteraction);

    // --- Assert ---
    expect(mockInteraction.editReply).toHaveBeenCalledOnce();
    expect(mockInteraction.editReply).toHaveBeenCalledWith('Sorry, there was an error fetching the sortie data.');
  });
});
