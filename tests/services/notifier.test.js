import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('notifier service', () => {
  let client;
  let channel;
  let database;
  let embedUtils;
  let notifier;
  let warframeAPI;

  beforeEach(async () => {
    vi.resetModules();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-04-25T12:00:00Z'));

    process.env.NOTIFICATION_CHANNEL_ID = 'notification-channel';

    channel = {
      send: vi.fn().mockResolvedValue(undefined),
    };
    client = {
      channels: {
        fetch: vi.fn().mockResolvedValue(channel),
      },
    };

    vi.doMock('../../src/services/warframeAPI.js', () => ({
      getAlertsData: vi.fn().mockResolvedValue([]),
      getInvasionsData: vi.fn().mockResolvedValue([]),
      getNewsData: vi.fn().mockResolvedValue([]),
      getEventsData: vi.fn().mockResolvedValue([]),
      getVoidTraderData: vi.fn().mockResolvedValue({ id: 'baro', inventory: [] }),
      priorityRewardList: [],
    }));

    vi.doMock('../../src/services/database.js', () => ({
      getPostedIdsByType: vi.fn().mockResolvedValue(new Set()),
      markItemsAsPosted: vi.fn().mockResolvedValue(undefined),
    }));

    vi.doMock('../../src/services/twitchAPI.js', () => ({
      getTwitchStreamData: vi.fn().mockResolvedValue([]),
      TWITCH_CHANNEL: {
        WARFRAME: 'warframe',
      },
    }));

    vi.doMock('../../src/utils/embed.js', () => ({
      createAlertEmbed: vi.fn((item) => ({ title: `alert ${item.id}` })),
      createInvasionEmbed: vi.fn((item) => ({ title: `invasion ${item.id}` })),
      createNewsEmbed: vi.fn((item) => ({ title: `news ${item.id}` })),
      createEventEmbed: vi.fn((item) => ({ title: `event ${item.id}` })),
      createVoidTraderEmbed: vi.fn((item) => ({ title: `baro ${item.id}` })),
      createTwitchStreamEmbed: vi.fn((item) => ({ title: `twitch ${item.id}` })),
    }));

    vi.doMock('../../src/utils/logger.js', () => ({
      logger: {
        error: vi.fn(),
        info: vi.fn(),
        warn: vi.fn(),
      },
    }));

    warframeAPI = await import('../../src/services/warframeAPI.js');
    database = await import('../../src/services/database.js');
    embedUtils = await import('../../src/utils/embed.js');
    notifier = await import('../../src/services/notifier.js');
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    delete process.env.NOTIFICATION_CHANNEL_ID;
  });

  it('sends each notification heading with its relevant first embed chunk', async () => {
    const newsItem = { id: 'news-1' };
    const eventItem = { id: 'event-1' };
    const newsEmbed = { title: 'news embed' };
    const eventEmbed = { title: 'event embed' };

    warframeAPI.getNewsData.mockResolvedValue([newsItem]);
    warframeAPI.getEventsData.mockResolvedValue([eventItem]);
    embedUtils.createNewsEmbed.mockReturnValue(newsEmbed);
    embedUtils.createEventEmbed.mockReturnValue(eventEmbed);

    await notifier.startNotifiers(client);

    expect(channel.send).toHaveBeenCalledTimes(2);
    expect(channel.send).toHaveBeenNthCalledWith(1, {
      content: 'Fresh News:',
      embeds: [newsEmbed],
    });
    expect(channel.send).toHaveBeenNthCalledWith(2, {
      content: 'New Events:',
      embeds: [eventEmbed],
    });
    expect(database.markItemsAsPosted).toHaveBeenCalledWith(['news-1'], 'news');
    expect(database.markItemsAsPosted).toHaveBeenCalledWith(['event-1'], 'event');
  });
});
