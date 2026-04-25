import { describe, it, expect, vi, beforeEach } from 'vitest';
import nightwaveCommand from '../../../src/commands/warframe/nightwave.js';
import * as warframeAPI from '../../../src/services/warframeAPI.js';
import { EmbedBuilder } from 'discord.js';

vi.mock('../../../src/services/warframeAPI.js', async (importOriginal) => {
  const actual = await importOriginal();

  return {
    ...actual,
    getNightwaveData: vi.fn(),
    nightwaveChallengeType: actual.nightwaveChallengeType,
  };
});

vi.mock('../../../src/utils/logger.js', () => ({
  logger: { info: vi.fn() },
}));

const mockEmbed = {
  setColor: vi.fn().mockReturnThis(),
  setTitle: vi.fn().mockReturnThis(),
  setDescription: vi.fn().mockReturnThis(),
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


describe('/warframe nightwave command', () => {
  let mockInteraction;

  beforeEach(() => {
    mockInteraction = {
      editReply: vi.fn(),
      user: { tag: 'test-user' },
    };
    vi.clearAllMocks();
    Object.values(mockEmbed).forEach((mockFn) => mockFn.mockClear());
  });

  it('should correctly display grouped nightwave challenges', async () => {
    // --- Arrange ---
    const mockNightwaveData = {
      season: 5,
      tag: 'Nora\'s Mix Vol. 5',
      expiry: '2025-10-10T00:00:00.000Z',
      activeChallenges: [
        { title: 'Daily Task', desc: 'Do a thing.', isDaily: true, expiry: '2025-09-06T00:00:00Z' },
        { title: 'Weekly Task', desc: 'Do another thing.', isDaily: false, isElite: false, expiry: '2025-09-10T00:00:00Z' },
        { title: 'Elite Task', desc: 'Do a hard thing.', isDaily: false, isElite: true, expiry: '2025-09-10T00:00:00Z' },
      ],
    };
    warframeAPI.getNightwaveData.mockResolvedValue(mockNightwaveData);

    // --- Act ---
    await nightwaveCommand.execute(mockInteraction);

    // --- Assert ---
    expect(mockInteraction.editReply).toHaveBeenCalledOnce();
    const replyArgs = mockInteraction.editReply.mock.calls[0][0];

    // 1 main embed + 3 categories = 4 total
    expect(EmbedBuilder).toHaveBeenCalledTimes(4);
    expect(replyArgs.embeds).toHaveLength(4);
    expect(mockEmbed.setTitle).toHaveBeenCalledWith('Nightwave Season 5');
    expect(mockEmbed.setDescription).toHaveBeenCalledWith('Nora\'s Mix Vol. 5');
    expect(mockEmbed.setTitle).toHaveBeenCalledWith(expect.stringContaining('Daily'));
    expect(mockEmbed.setTitle).toHaveBeenCalledWith(expect.stringContaining('Weekly'));
    expect(mockEmbed.setTitle).toHaveBeenCalledWith(expect.stringContaining('Elite Weekly'));

    const dailyChallenge = mockNightwaveData.activeChallenges[0];
    expect(mockEmbed.addFields).toHaveBeenCalledWith(
      expect.objectContaining({ name: dailyChallenge.title, value: dailyChallenge.desc }),
      expect.any(Object),
    );
  });

  it('should skip empty challenge groups', async () => {
    // --- Arrange ---
    const mockNightwaveData = {
      season: 5,
      tag: 'Nora\'s Mix Vol. 5',
      expiry: '2025-10-10T00:00:00.000Z',
      activeChallenges: [
        { title: 'Daily Task', desc: 'Do a thing.', isDaily: true, expiry: '2025-09-06T00:00:00Z' },
      ],
    };
    warframeAPI.getNightwaveData.mockResolvedValue(mockNightwaveData);

    // --- Act ---
    await nightwaveCommand.execute(mockInteraction);

    // --- Assert ---
    expect(mockInteraction.editReply).toHaveBeenCalledOnce();
    const replyArgs = mockInteraction.editReply.mock.calls[0][0];

    // 1 main embed + 1 populated category
    expect(EmbedBuilder).toHaveBeenCalledTimes(2);
    expect(replyArgs.embeds).toHaveLength(2);
    expect(mockEmbed.setTitle).toHaveBeenCalledWith(expect.stringContaining('Daily'));
    expect(mockEmbed.setTitle).not.toHaveBeenCalledWith(expect.stringContaining('Elite Weekly'));
  });


  it('should handle API errors gracefully', async () => {
    // --- Arrange ---
    warframeAPI.getNightwaveData.mockResolvedValue(null);

    // --- Act ---
    await nightwaveCommand.execute(mockInteraction);

    // --- Assert ---
    expect(mockInteraction.editReply).toHaveBeenCalledOnce();
    expect(mockInteraction.editReply).toHaveBeenCalledWith('Sorry, there was an error fetching the nightwave data.');
  });
});
