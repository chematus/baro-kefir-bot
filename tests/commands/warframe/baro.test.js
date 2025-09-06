import { describe, it, expect, vi, beforeEach } from 'vitest';
import baroCommand from '../../../src/commands/warframe/baro.js';
import * as warframeAPI from '../../../src/services/warframeAPI.js';
import * as embedUtils from '../../../src/utils/embed.js';
import { EmbedBuilder } from 'discord.js';

vi.mock('../../../src/services/warframeAPI.js', async (importOriginal) => {
  const actual = await importOriginal();

  return {
    ...actual,
    getVoidTraderData: vi.fn(),
  };
});

vi.mock('../../../src/utils/embed.js', () => ({
  createVoidTraderEmbed: vi.fn(),
}));

vi.mock('../../../src/utils/logger.js', () => ({
  logger: {
    info: vi.fn(),
  },
}));

const mockEmbed = {
  setColor: vi.fn().mockReturnThis(),
  setTitle: vi.fn().mockReturnThis(),
  setDescription: vi.fn().mockReturnThis(),
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

describe('/warframe baro command', () => {
  let mockInteraction;

  beforeEach(() => {
    mockInteraction = {
      editReply: vi.fn(),
      user: { tag: 'test-user' },
    };
    vi.clearAllMocks();
    Object.values(mockEmbed).forEach((mockFn) => mockFn.mockClear());
  });

  it('should display active inventory when Baro has items', async () => {
    // --- Arrange ---
    const mockBaroData = {
      character: 'Baro Ki\'Teer',
      location: 'Larunda Relay (Mercury)',
      inventory: [{ item: 'Primed Flow', ducats: 350, credits: 110000 }],
    };
    warframeAPI.getVoidTraderData.mockResolvedValue(mockBaroData);
    const mockCreatedEmbeds = [new EmbedBuilder().setTitle('Mocked Inventory')];
    embedUtils.createVoidTraderEmbed.mockReturnValue(mockCreatedEmbeds);

    // --- Act ---
    await baroCommand.execute(mockInteraction);

    // --- Assert ---
    expect(embedUtils.createVoidTraderEmbed).toHaveBeenCalledOnce();
    expect(embedUtils.createVoidTraderEmbed).toHaveBeenCalledWith(mockBaroData);
    expect(mockInteraction.editReply).toHaveBeenCalledOnce();
    expect(mockInteraction.editReply).toHaveBeenCalledWith({
      embeds: mockCreatedEmbeds,
      flags: expect.any(Number),
    });
  });

  it('should display arrival time when Baro has no inventory', async () => {
    // --- Arrange ---
    const mockBaroData = {
      character: 'Baro Ki\'Teer',
      location: 'Larunda Relay (Mercury)',
      activation: '2025-09-06T01:21:49.000Z',
      inventory: [],
    };
    warframeAPI.getVoidTraderData.mockResolvedValue(mockBaroData);

    // --- Act ---
    await baroCommand.execute(mockInteraction);

    // --- Assert ---
    expect(EmbedBuilder).toHaveBeenCalledOnce();
    expect(mockEmbed.setTitle).toHaveBeenCalledWith('Baro Ki\'Teer');
    const expectedTimestamp = Math.floor(new Date(mockBaroData.activation).getTime() / 1000);
    expect(mockEmbed.setDescription).toHaveBeenCalledWith(
      `is scheduled to arrive at Larunda Relay (Mercury) <t:${expectedTimestamp}:R>`,
    );
    expect(mockInteraction.editReply).toHaveBeenCalledOnce();
  });

  it('should handle API errors gracefully', async () => {
    // --- Arrange ---
    warframeAPI.getVoidTraderData.mockResolvedValue(null);

    // --- Act ---
    await baroCommand.execute(mockInteraction);

    // --- Assert ---
    expect(mockInteraction.editReply).toHaveBeenCalledOnce();
    expect(mockInteraction.editReply).toHaveBeenCalledWith('Sorry, there was an error fetching the void trader data.');
  });
});
