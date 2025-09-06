import { describe, it, expect, vi, beforeEach } from 'vitest';
import cycleCommand from '../../../src/commands/warframe/cycle.js';
import * as warframeAPI from '../../../src/services/warframeAPI.js';

vi.mock('../../../src/services/warframeAPI.js', async (importOriginal) => {
  const actual = await importOriginal();

  return {
    ...actual,
    getCycleData: vi.fn(),
  };
});

vi.mock('../../../src/utils/logger.js', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
}));

describe('/warframe cycle command', () => {
  let mockInteraction;

  beforeEach(() => {
    mockInteraction = {
      options: {
        getString: vi.fn(),
      },
      editReply: vi.fn(),
      user: {
        tag: 'test-user',
      },
    };

    vi.resetAllMocks();
  });

  it('should correctly format and reply with the Cetus cycle data', async () => {
    // Arrange
    mockInteraction.options.getString.mockReturnValue('cetus');

    const mockCetusData = {
      id: 'cetusCycle',
      expiry: '2025-09-06T01:21:49.000Z',
      isDay: true,
      state: 'day',
    };

    warframeAPI.getCycleData.mockResolvedValue(mockCetusData);

    // Act

    await cycleCommand.execute(mockInteraction);

    // Assert
    expect(mockInteraction.editReply).toHaveBeenCalledOnce();

    const replyArgs = mockInteraction.editReply.mock.calls[0][0];

    expect(replyArgs.embeds).toHaveLength(1);

    const embed = replyArgs.embeds[0].toJSON();

    expect(embed.title).toBe('Cetus Cycle: Day');
    expect(embed.color).toBe(0xFFD700);

    const expectedTimestamp = Math.floor(new Date(mockCetusData.expiry).getTime() / 1000);
    expect(embed.fields[0].name).toBe(`Ends <t:${expectedTimestamp}:R>`);
  });

  it('should handle API errors gracefully', async () => {
    // Arrange
    mockInteraction.options.getString.mockReturnValue('cetus');
    warframeAPI.getCycleData.mockResolvedValue(null);

    // Act
    await cycleCommand.execute(mockInteraction);

    // Assert
    expect(mockInteraction.editReply).toHaveBeenCalledOnce();
    expect(mockInteraction.editReply).toHaveBeenCalledWith('Sorry, there was an error fetching the Cetus cycle data.');
  });
});
