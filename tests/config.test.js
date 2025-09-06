import { describe, it, expect } from 'vitest';

describe('Application Configuration', () => {
  it('should have all required environment variables defined', () => {
    expect(process.env.DISCORD_TOKEN).toBeDefined();
    expect(process.env.DISCORD_TOKEN).not.toBe('');

    expect(process.env.APP_ID).toBeDefined();
    expect(process.env.APP_ID).not.toBe('');

    expect(process.env.GUILD_ID).toBeDefined();
    expect(process.env.GUILD_ID).not.toBe('');

    expect(process.env.NOTIFICATION_CHANNEL_ID).toBeDefined();
    expect(process.env.NOTIFICATION_CHANNEL_ID).not.toBe('');
  });
});
