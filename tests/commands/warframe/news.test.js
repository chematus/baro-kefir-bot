import { describe, it, expect, vi, beforeEach } from 'vitest';
import newsCommand from '../../../src/commands/warframe/news.js';
import * as warframeAPI from '../../../src/services/warframeAPI.js';
import * as embedUtils from '../../../src/utils/embed.js';
import * as commonUtils from '../../../src/utils/common.js';
import { EmbedBuilder } from 'discord.js';

vi.mock('../../../src/services/warframeAPI.js', async (importOriginal) => {
  const actual = await importOriginal();

  return { ...actual, getNewsData: vi.fn() };
});
vi.mock('../../../src/utils/embed.js', () => ({ createNewsEmbed: vi.fn() }));
vi.mock('../../../src/utils/common.js', () => ({ chunkArray: vi.fn() }));
vi.mock('../../../src/utils/logger.js', () => ({ logger: { info: vi.fn() } }));

describe('/warframe news command', () => {
  let mockInteraction;

  beforeEach(() => {
    mockInteraction = {
      editReply: vi.fn(),
      followUp: vi.fn(),
      user: { tag: 'test-user' },
    };
    vi.clearAllMocks();
  });

  it('should handle multiple chunks of news items correctly', async () => {
    // --- Arrange ---
    const mockNewsData = [{ id: '1' }, { id: '2' }, { id: '3' }];
    warframeAPI.getNewsData.mockResolvedValue(mockNewsData);

    const mockEmbeds = [
      new EmbedBuilder().setTitle('News 1'),
      new EmbedBuilder().setTitle('News 2'),
      new EmbedBuilder().setTitle('News 3'),
    ];
    embedUtils.createNewsEmbed.mockImplementation((newsItem) =>
      mockEmbeds.find(e => e.data.title.includes(newsItem.id)),
    );

    commonUtils.chunkArray.mockReturnValue([
      [mockEmbeds[0], mockEmbeds[1]],
      [mockEmbeds[2]],
    ]);

    // --- Act ---
    await newsCommand.execute(mockInteraction);

    // --- Assert ---
    expect(mockInteraction.editReply).toHaveBeenCalledOnce();
    expect(mockInteraction.editReply).toHaveBeenCalledWith({
      embeds: [mockEmbeds[0], mockEmbeds[1]],
      flags: expect.any(Number),
    });

    expect(mockInteraction.followUp).toHaveBeenCalledOnce();
    expect(mockInteraction.followUp).toHaveBeenCalledWith({
      embeds: [mockEmbeds[2]],
      flags: expect.any(Number),
    });
  });

  it('should handle API errors gracefully', async () => {
    // --- Arrange ---
    warframeAPI.getNewsData.mockResolvedValue(null);

    // --- Act ---
    await newsCommand.execute(mockInteraction);

    // --- Assert ---
    expect(mockInteraction.editReply).toHaveBeenCalledOnce();
    expect(mockInteraction.editReply).toHaveBeenCalledWith('Sorry, there was an error fetching the news data.');
    expect(mockInteraction.followUp).not.toHaveBeenCalled();
  });
});
