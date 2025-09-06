import { describe, it, expect, vi, beforeEach } from 'vitest';
import pingCommand from '../../../src/commands/utility/ping.js';

describe('/utility ping command', () => {
  let mockInteraction;

  beforeEach(() => {
    vi.clearAllMocks();

    mockInteraction = {
      editReply: vi.fn(),
      user: {
        tag: 'testuser#1234',
      },
    };
  });

  it('should reply with "Pong" for a regular user', async () => {
    // --- Act ---
    await pingCommand.execute(mockInteraction);

    // --- Assert ---
    expect(mockInteraction.editReply).toHaveBeenCalledOnce();
    expect(mockInteraction.editReply).toHaveBeenCalledWith(
      expect.objectContaining({
        content: 'Pong',
      }),
    );
  });

  it('should reply with the special message for the author', async () => {
    // --- Arrange ---
    mockInteraction.user.tag = 'chematus#5678';

    // --- Act ---
    await pingCommand.execute(mockInteraction);

    // --- Assert ---
    expect(mockInteraction.editReply).toHaveBeenCalledOnce();
    expect(mockInteraction.editReply).toHaveBeenCalledWith(
      expect.objectContaining({
        content: 'Hey, Dad! :pleading_face:',
      }),
    );
  });
});
