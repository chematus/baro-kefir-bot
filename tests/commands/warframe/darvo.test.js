import { describe, it, expect, vi, beforeEach } from 'vitest';
import darvoCommand from '../../../src/commands/warframe/darvo.js';
import * as warframeAPI from '../../../src/services/warframeAPI.js';
import { EmbedBuilder } from 'discord.js';

vi.mock('../../../src/services/warframeAPI.js', async (importOriginal) => {
  const actual = await importOriginal();

  return {
    ...actual,
    getDailyDealsData: vi.fn(),
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
  addFields: vi.fn().mockReturnThis(),
  setTimestamp: vi.fn().mockReturnThis(),
  setFooter: vi.fn().mockReturnThis(),
};
vi.mock('discord.js', async (importOriginal) => {
  const actual = await importOriginal();

  return {
    ...actual,
    EmbedBuilder: vi.fn(() => mockEmbed),
  };
});

describe('/warframe darvo command', () => {
  let mockInteraction;

  beforeEach(() => {
    mockInteraction = {
      editReply: vi.fn(),
      user: { tag: 'test-user' },
    };
    vi.clearAllMocks();
    Object.values(mockEmbed).forEach((mockFn) => mockFn.mockClear());
  });

  it('should display daily deals in multiple embeds', async () => {
    // --- Arrange ---
    const mockDarvoData = [
      {
        item: 'Vaykor Hek',
        expiry: '2025-09-06T01:21:49.000Z',
        originalPrice: 100,
        salePrice: 50,
        total: 1000,
        sold: 200,
        discount: 50,
      },
      {
        item: 'Forma Bundle',
        expiry: '2025-09-06T02:30:00.000Z',
        originalPrice: 35,
        salePrice: 20,
        total: 5000,
        sold: 1500,
        discount: 43,
      },
    ];
    warframeAPI.getDailyDealsData.mockResolvedValue(mockDarvoData);

    // --- Act ---
    await darvoCommand.execute(mockInteraction);

    // --- Assert ---
    expect(EmbedBuilder).toHaveBeenCalledTimes(2);
    expect(mockInteraction.editReply).toHaveBeenCalledOnce();
    const replyArgs = mockInteraction.editReply.mock.calls[0][0];
    expect(replyArgs.embeds).toHaveLength(2);
    expect(mockEmbed.setTitle).toHaveBeenCalledWith('Vaykor Hek');
    const expectedTimestamp = Math.floor(new Date(mockDarvoData[0].expiry).getTime() / 1000);
    expect(mockEmbed.addFields).toHaveBeenCalledWith(
      { name: 'Price', value: expect.stringContaining('~~100pl~~') },
      { name: 'Stock', value: '800/1000 items left' },
      { name: expect.stringContaining(`<t:${expectedTimestamp}:R>`), value: '' },
    );
    expect(mockEmbed.setTitle).toHaveBeenCalledWith('Forma Bundle');
  });

  it('should handle API errors gracefully', async () => {
    // --- Arrange ---
    warframeAPI.getDailyDealsData.mockResolvedValue(null);

    // --- Act ---
    await darvoCommand.execute(mockInteraction);

    // --- Assert ---
    expect(mockInteraction.editReply).toHaveBeenCalledOnce();
    expect(mockInteraction.editReply).toHaveBeenCalledWith('Sorry, there was an error fetching the daily deals data.');
  });
});
