import { describe, it, expect, vi, beforeEach } from 'vitest';
import fissuresCommand from '../../../src/commands/warframe/fissures.js';
import * as warframeAPI from '../../../src/services/warframeAPI.js';
import { EmbedBuilder, AttachmentBuilder } from 'discord.js';

vi.mock('../../../src/services/warframeAPI.js', async (importOriginal) => {
  const actual = await importOriginal();

  return {
    ...actual,
    getFissuresData: vi.fn(),
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

describe('/warframe fissures command', () => {
  let mockInteraction;

  beforeEach(() => {
    mockInteraction = {
      editReply: vi.fn(),
      user: { tag: 'test-user' },
    };
    vi.clearAllMocks();
    Object.values(mockEmbed).forEach((mockFn) => mockFn.mockClear());
  });

  it('should correctly group and display active fissures', async () => {
    // --- Arrange ---
    const mockFissuresData = [
      { tierNum: 1, node: 'Teshub (Void)', missionType: 'Exterminate', enemy: 'Corrupted', expiry: '2025-01-01T00:00:00Z' },
      { tierNum: 1, node: 'Hepit (Void)', missionType: 'Capture', enemy: 'Corrupted', expiry: '2025-01-01T01:00:00Z' },
      { tierNum: 3, node: 'Ukko (Void)', missionType: 'Capture', enemy: 'Corrupted', expiry: '2025-01-01T02:00:00Z' },
    ];
    warframeAPI.getFissuresData.mockResolvedValue(mockFissuresData);

    // --- Act ---
    await fissuresCommand.execute(mockInteraction);

    // --- Assert ---
    expect(mockInteraction.editReply).toHaveBeenCalledOnce();
    const replyArgs = mockInteraction.editReply.mock.calls[0][0];

    const embedNumber = (new Set(mockFissuresData.map(({ tierNum }) => tierNum))).size;
    expect(EmbedBuilder).toHaveBeenCalledTimes(embedNumber);
    expect(AttachmentBuilder).toHaveBeenCalledTimes(embedNumber);
    expect(replyArgs.embeds).toHaveLength(embedNumber);
    expect(replyArgs.files).toHaveLength(embedNumber);

    // Spot-check the Lith embed (tier 1)
    expect(mockEmbed.setTitle).toHaveBeenCalledWith('Lith');
    expect(mockEmbed.addFields).toHaveBeenCalledWith(
      expect.objectContaining({ name: expect.stringContaining('Teshub (Void)') }),
      expect.objectContaining({ name: expect.stringContaining('Hepit (Void)') }),
    );

    // Spot-check the Neo embed (tier 3)
    expect(mockEmbed.setTitle).toHaveBeenCalledWith('Neo');
    expect(mockEmbed.addFields).toHaveBeenCalledWith(
      expect.objectContaining({ name: expect.stringContaining('Ukko (Void)') }),
    );

  });

  it('should handle API errors gracefully', async () => {
    // --- Arrange ---
    warframeAPI.getFissuresData.mockResolvedValue(null);

    // --- Act ---
    await fissuresCommand.execute(mockInteraction);

    // --- Assert ---
    expect(mockInteraction.editReply).toHaveBeenCalledOnce();
    expect(mockInteraction.editReply).toHaveBeenCalledWith('Sorry, there was an error fetching the fissures data.');
  });
});
