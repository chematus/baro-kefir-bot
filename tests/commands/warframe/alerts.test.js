import { describe, it, expect, vi, beforeEach } from 'vitest';
import alertsCommand from '../../../src/commands/warframe/alerts.js';
import * as warframeAPI from '../../../src/services/warframeAPI.js';
import * as embedUtils from '../../../src/utils/embed.js';

vi.mock('../../../src/services/warframeAPI.js', async (importOriginal) => {
  const actual = await importOriginal();

  return {
    ...actual,
    getAlertsData: vi.fn(),
  };
});

vi.mock('../../../src/utils/embed.js', () => ({
  createAlertEmbed: vi.fn(),
}));

vi.mock('../../../src/utils/logger.js', () => ({
  logger: {
    info: vi.fn(),
  },
}));

describe('/warframe alerts command', () => {
  let mockInteraction;

  beforeEach(() => {
    mockInteraction = {
      editReply: vi.fn(),
      user: { tag: 'test-user' },
    };
    vi.resetAllMocks();
  });

  it('should display embeds for all active alerts when data is returned', async () => {
    // --- Arrange ---
    const mockAlertsData = [
      { id: 'alert1', mission: { reward: {} } },
      { id: 'alert2', mission: { reward: {} } },
    ];
    warframeAPI.getAlertsData.mockResolvedValue(mockAlertsData);

    embedUtils.createAlertEmbed.mockImplementation((alert) => ({
      title: `Mocked Embed for ${alert.id}`,
    }));

    // --- Act ---
    await alertsCommand.execute(mockInteraction);

    // --- Assert ---
    expect(embedUtils.createAlertEmbed).toHaveBeenCalledTimes(2);
    expect(embedUtils.createAlertEmbed).toHaveBeenCalledWith(mockAlertsData[0], 0, mockAlertsData);
    expect(embedUtils.createAlertEmbed).toHaveBeenCalledWith(mockAlertsData[1], 1, mockAlertsData);

    expect(mockInteraction.editReply).toHaveBeenCalledOnce();
    const replyArgs = mockInteraction.editReply.mock.calls[0][0];
    expect(replyArgs.embeds).toHaveLength(2);
    expect(replyArgs.embeds[0].title).toBe('Mocked Embed for alert1');
  });

  it('should show a "no alerts found" message when the API returns an empty array', async () => {
    // --- Arrange ---
    warframeAPI.getAlertsData.mockResolvedValue([]);

    // --- Act ---
    await alertsCommand.execute(mockInteraction);

    // --- Assert ---
    expect(mockInteraction.editReply).toHaveBeenCalledOnce();
    expect(mockInteraction.editReply).toHaveBeenCalledWith('No active alerts found :confused:');
  });

  it('should handle API errors gracefully', async () => {
    // --- Arrange ---
    warframeAPI.getAlertsData.mockResolvedValue(null);

    // --- Act ---
    await alertsCommand.execute(mockInteraction);

    // --- Assert ---
    expect(mockInteraction.editReply).toHaveBeenCalledOnce();
    expect(mockInteraction.editReply).toHaveBeenCalledWith('Sorry, there was an error fetching the alerts data.');
  });
});
