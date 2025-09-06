import { describe, it, expect, vi, beforeEach } from 'vitest';
import invasionsCommand from '../../../src/commands/warframe/invasions.js';
import * as warframeAPI from '../../../src/services/warframeAPI.js';
import * as embedUtils from '../../../src/utils/embed.js';
import * as commonUtils from '../../../src/utils/common.js';
import { EmbedBuilder } from 'discord.js';

vi.mock('../../../src/services/warframeAPI.js', async (importOriginal) => {
  const actual = await importOriginal();

  return {
    ...actual,
    getInvasionsData: vi.fn(),
  };
});

vi.mock('../../../src/utils/embed.js', () => ({
  createInvasionEmbed: vi.fn(),
}));
vi.mock('../../../src/utils/common.js', () => ({
  chunkArray: vi.fn(),
}));
vi.mock('../../../src/utils/logger.js', () => ({
  logger: { info: vi.fn() },
}));

describe('/warframe invasions command', () => {
  let mockInteraction;

  beforeEach(() => {
    mockInteraction = {
      editReply: vi.fn(),
      followUp: vi.fn(),
      user: { tag: 'test-user' },
    };
    vi.clearAllMocks();
  });

  it('should handle multiple chunks of invasions correctly', async () => {
    // --- Arrange ---
    const mockInvasions = [
      { id: '1', completed: false },
      { id: '2', completed: false },
      { id: '3', completed: false },
    ];
    warframeAPI.getInvasionsData.mockResolvedValue(mockInvasions);

    const mockEmbeds = [
      new EmbedBuilder().setTitle('Invasion 1'),
      new EmbedBuilder().setTitle('Invasion 2'),
      new EmbedBuilder().setTitle('Invasion 3'),
    ];
    embedUtils.createInvasionEmbed.mockImplementation((invasion) =>
      mockEmbeds.find(e => e.data.title.includes(invasion.id)),
    );

    commonUtils.chunkArray.mockReturnValue([
      [mockEmbeds[0], mockEmbeds[1]],
      [mockEmbeds[2]],
    ]);

    // --- Act ---
    await invasionsCommand.execute(mockInteraction);

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

  it('should filter out completed invasions', async () => {
    // --- Arrange ---
    const mockInvasions = [
      { id: '1', completed: false },
      { id: '2', completed: true },
      { id: '3', completed: false },
    ];
    warframeAPI.getInvasionsData.mockResolvedValue(mockInvasions);
    commonUtils.chunkArray.mockImplementation((arr) => [arr]);

    // --- Act ---
    await invasionsCommand.execute(mockInteraction);

    // --- Assert ---
    expect(embedUtils.createInvasionEmbed).toHaveBeenCalledTimes(2);
    expect(embedUtils.createInvasionEmbed).toHaveBeenCalledWith(mockInvasions[0], 0, expect.any(Array));
    expect(embedUtils.createInvasionEmbed).toHaveBeenCalledWith(mockInvasions[2], 1, expect.any(Array));
  });

  it('should handle API errors gracefully', async () => {
    // --- Arrange ---
    warframeAPI.getInvasionsData.mockResolvedValue(null);

    // --- Act ---
    await invasionsCommand.execute(mockInteraction);

    // --- Assert ---
    expect(mockInteraction.editReply).toHaveBeenCalledOnce();
    expect(mockInteraction.editReply).toHaveBeenCalledWith('Sorry, there was an error fetching the invasions data.');
    expect(mockInteraction.followUp).not.toHaveBeenCalled();
  });
});
