import { describe, it, expect, vi, beforeEach } from 'vitest';
import archonCommand from '../../../src/commands/warframe/archon.js';
import * as warframeAPI from '../../../src/services/warframeAPI.js';
import { AttachmentBuilder } from 'discord.js';

vi.mock('../../../src/services/warframeAPI.js', async (importOriginal) => {
  const actual = await importOriginal();

  return {
    ...actual,
    getArchonData: vi.fn(),
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

describe('/warframe archon command', () => {
  let mockInteraction;

  beforeEach(() => {
    mockInteraction = {
      editReply: vi.fn(),
      user: { tag: 'test-user' },
    };
    vi.clearAllMocks();
    Object.values(mockEmbed).forEach((mockFn) => mockFn.mockClear());
  });

  it('should display archon hunt details correctly', async () => {
    // --- Arrange ---
    const mockArchonData = {
      expiry: '2025-09-06T01:21:49.000Z',
      boss: 'Archon Nira',
      missions: [
        { node: 'Bode (Ceres)', type: 'Excavation' },
        { node: 'Everest (Earth)', type: 'Excavation' },
        { node: 'E Prime (Earth)', type: 'Exterminate' },
      ],
    };
    warframeAPI.getArchonData.mockResolvedValue(mockArchonData);

    // --- Act ---
    await archonCommand.execute(mockInteraction);

    // --- Assert ---
    expect(mockInteraction.editReply).toHaveBeenCalledOnce();

    expect(mockEmbed.setTitle).toHaveBeenCalledWith('Archon Nira');
    expect(mockEmbed.setColor).toHaveBeenCalledWith('#FFBF00');
    const expectedTimestamp = Math.floor(new Date(mockArchonData.expiry).getTime() / 1000);
    expect(mockEmbed.addFields).toHaveBeenCalledWith(
      { name: 'Reward', value: 'Amber Archon Shard' },
      { name: `Ends <t:${expectedTimestamp}:R>`, value: '' },
      { name: 'Bode (Ceres)', value: 'Excavation' },
      { name: 'Everest (Earth)', value: 'Excavation' },
      { name: 'E Prime (Earth)', value: 'Exterminate' },
    );
    expect(AttachmentBuilder).toHaveBeenCalledWith(
      './assets/archon/nira.png',
      { name: 'nira.png' },
    );
  });

  it('should handle API errors gracefully', async () => {
    // --- Arrange ---
    warframeAPI.getArchonData.mockResolvedValue(null);

    // --- Act ---
    await archonCommand.execute(mockInteraction);

    // --- Assert ---
    expect(mockInteraction.editReply).toHaveBeenCalledOnce();
    expect(mockInteraction.editReply).toHaveBeenCalledWith('Sorry, there was an error fetching archon data.');
  });
});
