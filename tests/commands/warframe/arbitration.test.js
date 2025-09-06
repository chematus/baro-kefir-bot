import { describe, it, expect, vi, beforeEach } from 'vitest';
import arbitrationCommand from '../../../src/commands/warframe/arbitration.js';
import * as warframeAPI from '../../../src/services/warframeAPI.js';
import { EmbedBuilder, AttachmentBuilder } from 'discord.js';

vi.mock('../../../src/services/warframeAPI.js', async (importOriginal) => {
  const actual = await importOriginal();

  return {
    ...actual,
    getArbitrationData: vi.fn(),
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

describe('/warframe arbitration command', () => {
  let mockInteraction;

  beforeEach(() => {
    mockInteraction = {
      editReply: vi.fn(),
      user: { tag: 'test-user' },
    };

    vi.clearAllMocks();

    Object.values(mockEmbed).forEach((mockFn) => mockFn.mockClear());
  });

  it('should display the current arbitration mission correctly', async () => {
    // --- Arrange ---
    const mockArbitrationData = {
      expiry: '2025-09-06T01:21:49.000Z',
      node: 'Tyana Pass (Mars)',
      enemy: 'Grineer',
      type: 'Excavation',
    };
    warframeAPI.getArbitrationData.mockResolvedValue(mockArbitrationData);

    // --- Act ---
    await arbitrationCommand.execute(mockInteraction);

    // --- Assert ---
    expect(mockInteraction.editReply).toHaveBeenCalledOnce();

    const embedInstance = vi.mocked(EmbedBuilder).mock.results[0].value;
    expect(embedInstance.setTitle).toHaveBeenCalledWith('Tyana Pass (Mars) | Excavation | Grineer');

    const expectedTimestamp = Math.floor(new Date(mockArbitrationData.expiry).getTime() / 1000);
    expect(embedInstance.addFields).toHaveBeenCalledWith({ name: `Ends <t:${expectedTimestamp}:R>`, value: '' });

    expect(AttachmentBuilder).toHaveBeenCalledWith(
      './assets/arbitration/vitus-essence.png',
      { name: 'vitus-essence.png' },
    );
  });

  it('should handle API errors gracefully', async () => {
    // --- Arrange ---
    warframeAPI.getArbitrationData.mockResolvedValue(null);

    // --- Act ---
    await arbitrationCommand.execute(mockInteraction);

    // --- Assert ---
    expect(mockInteraction.editReply).toHaveBeenCalledOnce();
    expect(mockInteraction.editReply).toHaveBeenCalledWith('Sorry, there was an error fetching arbitration data.');
  });
});
