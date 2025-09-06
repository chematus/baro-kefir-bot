import { describe, it, expect, vi, beforeEach } from 'vitest';
import itemCommand from '../../../src/commands/warframe/item.js';
import * as warframeAPI from '../../../src/services/warframeAPI.js';

vi.mock('../../../src/services/warframeAPI.js', async (importOriginal) => {
  const actual = await importOriginal();

  return {
    ...actual,
    getItemData: vi.fn(),
    // Keep real static data for the parsers to use
    polarities: actual.polarities,
    damageTypeList: actual.damageTypeList,
  };
});

vi.mock('../../../src/utils/logger.js', () => ({
  logger: { info: vi.fn() },
}));

vi.mock('discord.js', async (importOriginal) => {
  const actual = await importOriginal();

  return {
    ...actual,
    EmbedBuilder: vi.fn().mockImplementation(() => ({
      setColor: vi.fn().mockReturnThis(),
      setTitle: vi.fn().mockReturnThis(),
      setDescription: vi.fn().mockReturnThis(),
      setImage: vi.fn().mockReturnThis(),
      addFields: vi.fn().mockReturnThis(),
      setTimestamp: vi.fn().mockReturnThis(),
      setFooter: vi.fn().mockReturnThis(),
    })),
  };
});


describe('/warframe item command', () => {
  let mockInteraction;

  beforeEach(() => {
    mockInteraction = {
      options: { getString: vi.fn() },
      editReply: vi.fn(),
      user: { tag: 'test-user' },
    };
    vi.clearAllMocks();
  });

  it('should display info for a Warframe item correctly', async () => {
    // --- Arrange ---
    mockInteraction.options.getString.mockReturnValue('Excalibur');
    const mockWarframeData = {
      name: 'Excalibur',
      description: 'A master of gun and blade.',
      category: 'Warframes',
      wikiaThumbnail: 'url_to_image',
      health: 100,
      shield: 100,
      armor: 225,
      power: 150,
      sprintSpeed: 1.0,
      passiveDescription: 'Swordsmanship',
      abilities: [{ name: 'Slash Dash', description: 'Dash and slash.' }],
      components: [{ name: 'Neuroptics', itemCount: 1 }],
    };
    warframeAPI.getItemData.mockResolvedValue(mockWarframeData);

    // --- Act ---
    await itemCommand.execute(mockInteraction);

    // --- Assert ---
    expect(mockInteraction.editReply).toHaveBeenCalledOnce();
    const replyArgs = mockInteraction.editReply.mock.calls[0][0];
    const embeds = replyArgs.embeds;

    // Check that the main embed, stats embed, abilities embed, and crafting embed were created
    expect(embeds).toHaveLength(4);

    expect(embeds[0].setTitle).toHaveBeenCalledWith('Excalibur');
    expect(embeds[1].setTitle).toHaveBeenCalledWith('Warframe Stats');
    expect(embeds[2].setTitle).toHaveBeenCalledWith('Abilities');
    expect(embeds[3].setTitle).toHaveBeenCalledWith('Crafting');
  });

  it('should display info for a Primary weapon item correctly', async () => {
    // --- Arrange ---
    mockInteraction.options.getString.mockReturnValue('Braton');
    const mockWeaponData = {
      name: 'Braton',
      category: 'Primary',
      wikiaThumbnail: 'url_to_image',
      attacks: [{
        name: 'Default',
        crit_chance: 12,
        crit_mult: 2,
        status_chance: 20,
        damage: { impact: 10, slash: 10, puncture: 10 },
      }],
    };
    warframeAPI.getItemData.mockResolvedValue(mockWeaponData);

    // --- Act ---
    await itemCommand.execute(mockInteraction);

    // --- Assert ---
    expect(mockInteraction.editReply).toHaveBeenCalledOnce();
    const replyArgs = mockInteraction.editReply.mock.calls[0][0];
    const embeds = replyArgs.embeds;

    // Main embed, stats embed, default attack embed
    expect(embeds).toHaveLength(3);

    // The third embed is the one with attack stats
    const attackEmbed = embeds[2];

    expect(attackEmbed.setTitle).toHaveBeenCalledWith('Default');
    expect(attackEmbed.addFields).toHaveBeenCalledWith(
      {
        inline: true,
        name: 'Critical Chance',
        value: '12%',
      },
      {
        inline: true,
        name: 'Critical Multiplier',
        value: 'x2',
      },

      {
        inline: true,
        name: 'Status Chance',
        value: '20%',
      },
      {
        inline: true,
        name: 'Total Damage',
        value: '30',
      },
      {
        inline: true,
        name: 'Impact',
        value: '10.00',
      },
      {
        inline: true,
        name: 'Puncture',
        value: '10.00',
      },
      {
        inline: true,
        name: 'Slash',
        value: '10.00',
      },
    );
  });

  it('should handle items with unknown categories', async () => {
    // --- Arrange ---
    mockInteraction.options.getString.mockReturnValue('Some Item');
    const mockUnknownData = {
      name: 'Some Item',
      category: 'Fish',
      description: 'A fishy item.',
    };
    warframeAPI.getItemData.mockResolvedValue(mockUnknownData);

    // --- Act & Assert ---
    // The parser for 'fish' doesn't exist, so it should throw an error
    await expect(itemCommand.execute(mockInteraction))
      .rejects.toThrow(TypeError);
  });

  it('should handle "item not found" gracefully', async () => {
    // --- Arrange ---
    mockInteraction.options.getString.mockReturnValue('NonExistentItem');
    warframeAPI.getItemData.mockResolvedValue(null);

    // --- Act ---
    await itemCommand.execute(mockInteraction);

    // --- Assert ---
    expect(mockInteraction.editReply).toHaveBeenCalledOnce();
    expect(mockInteraction.editReply).toHaveBeenCalledWith('No record for "NonExistentItem" found.');
  });
});

