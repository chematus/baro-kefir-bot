import { describe, it, expect, vi, beforeEach } from 'vitest';
import eventsCommand from '../../../src/commands/warframe/events.js';
import * as warframeAPI from '../../../src/services/warframeAPI.js';
import * as embedUtils from '../../../src/utils/embed.js';
import { EmbedBuilder } from 'discord.js';

vi.mock('../../../src/services/warframeAPI.js', async (importOriginal) => {
  const actual = await importOriginal();

  return {
    ...actual,
    getEventsData: vi.fn(),
  };
});

vi.mock('../../../src/utils/embed.js', () => ({
  createEventEmbed: vi.fn(),
}));

vi.mock('../../../src/utils/logger.js', () => ({
  logger: {
    info: vi.fn(),
  },
}));

describe('/warframe events command', () => {
  let mockInteraction;

  beforeEach(() => {
    mockInteraction = {
      editReply: vi.fn(),
      user: { tag: 'test-user' },
    };
    vi.clearAllMocks();
  });

  it('should display events when the API returns data', async () => {
    // --- Arrange ---
    const mockEventsData = [
      { id: 'event1', description: 'Ghouls are active.' },
      { id: 'event2', description: 'Fomorian is attacking.' },
    ];
    warframeAPI.getEventsData.mockResolvedValue(mockEventsData);

    const mockCreatedEmbeds = [
      new EmbedBuilder().setTitle('Mock Event 1'),
      new EmbedBuilder().setTitle('Mock Event 2'),
    ];
    embedUtils.createEventEmbed.mockReturnValue(mockCreatedEmbeds[0]).mockReturnValueOnce(mockCreatedEmbeds[1]);


    // --- Act ---
    await eventsCommand.execute(mockInteraction);

    // --- Assert ---
    expect(embedUtils.createEventEmbed).toHaveBeenCalledTimes(2);
    expect(embedUtils.createEventEmbed).toHaveBeenCalledWith(mockEventsData[0], 0, mockEventsData);
    expect(embedUtils.createEventEmbed).toHaveBeenCalledWith(mockEventsData[1], 1, mockEventsData);
    expect(mockInteraction.editReply).toHaveBeenCalledOnce();
    expect(mockInteraction.editReply).toHaveBeenCalledWith({
      embeds: expect.any(Array),
      flags: expect.any(Number),
    });
  });

  it('should display a "no events" message when API returns an empty array', async () => {
    // --- Arrange ---
    warframeAPI.getEventsData.mockResolvedValue([]);

    // --- Act ---
    await eventsCommand.execute(mockInteraction);

    // --- Assert ---
    expect(mockInteraction.editReply).toHaveBeenCalledOnce();
    expect(mockInteraction.editReply).toHaveBeenCalledWith({
      content: expect.stringContaining('No active events found'),
      flags: expect.any(Number),
    });
  });


  it('should handle API errors gracefully', async () => {
    // --- Arrange ---
    warframeAPI.getEventsData.mockResolvedValue(null);

    // --- Act ---
    await eventsCommand.execute(mockInteraction);

    // --- Assert ---
    expect(mockInteraction.editReply).toHaveBeenCalledOnce();
    expect(mockInteraction.editReply).toHaveBeenCalledWith('Sorry, there was an error fetching the events data.');
  });
});
