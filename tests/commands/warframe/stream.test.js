import { describe, it, expect, vi, beforeEach } from 'vitest';
import streamCommand from '../../../src/commands/warframe/stream.js';
import * as twitchAPI from '../../../src/services/twitchAPI.js';
import { EmbedBuilder } from 'discord.js';
import { TWITCH_NOTIFICATION_COLOR } from '../../../src/services/twitchAPI.js';
import { timestampToUnix } from '../../../src/utils/common.js';

vi.mock('../../../src/services/twitchAPI.js', async (importOriginal) => {
  const actual = await importOriginal();

  return {
    ...actual,
    getTwitchStreamData: vi.fn(),
    AppTokenAuthProvider: vi.fn(),
    ApiClient: vi.fn(),
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
  setDescription: vi.fn().mockReturnThis(),
  setURL: vi.fn().mockReturnThis(),
  setImage: vi.fn().mockReturnThis(),
};
vi.mock('discord.js', async (importOriginal) => {
  const actual = await importOriginal();

  return {
    ...actual,
    EmbedBuilder: vi.fn(() => mockEmbed),
  };
});

describe('/warframe stream command', () => {
  let mockInteraction;

  beforeEach(() => {
    mockInteraction = {
      editReply: vi.fn(),
      user: { tag: 'test-user' },
    };
    vi.clearAllMocks();
    Object.values(mockEmbed).forEach((mockFn) => mockFn.mockClear());
  });

  it('should correctly display the stream status and info', async () => {
    // --- Arrange ---
    const mockStreamData = {
      title: 'stream_title',
      gameName: 'game_name',
      startDate: '2025-09-15T12:00:00.000Z',
      userName: 'user_name',
      userDisplayName: 'display_name',
      getThumbnailUrl: () => 'thumbnail_url',
    };
    twitchAPI.getTwitchStreamData.mockResolvedValue(mockStreamData);

    // --- Act ---
    await streamCommand.execute(mockInteraction);

    // --- Assert ---
    expect(mockInteraction.editReply).toHaveBeenCalledOnce();
    const replyArgs = mockInteraction.editReply.mock.calls[0][0];

    expect(EmbedBuilder).toHaveBeenCalledTimes(1);
    expect(replyArgs.embeds).toHaveLength(1);

    expect(mockEmbed.setTitle).toHaveBeenCalledWith(mockStreamData.title);
    expect(mockEmbed.setColor).toHaveBeenCalledWith(TWITCH_NOTIFICATION_COLOR);
    expect(mockEmbed.addFields).toHaveBeenCalledWith({
      name: `Playing: **${mockStreamData.gameName}**`,
      value: `<t:${timestampToUnix(mockStreamData.startDate)}:R>`,
    });
    expect(mockEmbed.setDescription).toHaveBeenCalledWith(`${mockStreamData.userDisplayName} is now LIVE on Twitch!`);
    expect(mockEmbed.setURL).toHaveBeenCalledWith(`https://twitch.tv/${mockStreamData.userName}`);
    expect(mockEmbed.setImage).toHaveBeenCalledWith(mockStreamData.getThumbnailUrl());
    expect(mockEmbed.setFooter).toHaveBeenCalledWith({ text: 'twitch.tv' });
  });

  it('should handle empty response with proper response', async () => {
    // --- Arrange ---
    twitchAPI.getTwitchStreamData.mockResolvedValue(null);

    // --- Act ---
    await streamCommand.execute(mockInteraction);

    // --- Assert ---
    expect(mockInteraction.editReply).toHaveBeenCalledOnce();
    expect(mockInteraction.editReply).toHaveBeenCalledWith('The stream hasn\'t started yet.');
  });
});
