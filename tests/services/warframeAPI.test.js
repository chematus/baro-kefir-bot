import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import { logger, reportError } from '../../src/utils/logger.js';

const mockGet = vi.fn();

vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => ({
      get: mockGet,
    })),
  },
}));

vi.mock('../../src/utils/logger.js', () => ({
  logger: {
    debug: vi.fn(),
    error: vi.fn(),
  },
  reportError: vi.fn(),
}));

describe('warframeAPI', () => {
  let warframeAPI;

  beforeEach(async () => {
    vi.clearAllMocks();
    vi.resetModules();

    warframeAPI = await import('../../src/services/warframeAPI.js');
  });

  it('suppresses the first two consecutive 404s for the same fetch', async () => {
    const error = { response: { status: 404 } };
    mockGet.mockRejectedValue(error);

    await warframeAPI.getItemData('Excalibur');
    await warframeAPI.getItemData('Excalibur');

    expect(reportError).not.toHaveBeenCalled();
    expect(logger.debug).toHaveBeenCalledWith(
      'Suppressed Warframe 404 for Excalibur item data (1 consecutive, reporting after 3)',
    );
    expect(logger.debug).toHaveBeenCalledWith(
      'Suppressed Warframe 404 for Excalibur item data (2 consecutive, reporting after 3)',
    );
  });

  it('reports only the third consecutive 404 for the same fetch streak', async () => {
    const error = { response: { status: 404 } };
    mockGet.mockRejectedValue(error);

    await warframeAPI.getItemData('Excalibur');
    await warframeAPI.getItemData('Excalibur');
    await warframeAPI.getItemData('Excalibur');
    await warframeAPI.getItemData('Excalibur');

    expect(reportError).toHaveBeenCalledOnce();
    expect(reportError).toHaveBeenCalledWith(error, { context: 'warframeAPI Excalibur item data' });
  });

  it('resets the 404 counter after a successful fetch', async () => {
    const error = { response: { status: 404 } };
    mockGet
      .mockRejectedValueOnce(error)
      .mockResolvedValueOnce({ data: { name: 'Excalibur' } })
      .mockRejectedValueOnce(error);

    await warframeAPI.getItemData('Excalibur');
    await warframeAPI.getItemData('Excalibur');
    await warframeAPI.getItemData('Excalibur');

    expect(reportError).not.toHaveBeenCalled();
  });

  it('reports non-404 failures immediately', async () => {
    const error = { response: { status: 500 } };
    mockGet.mockRejectedValue(error);

    await warframeAPI.getAlertsData();

    expect(reportError).toHaveBeenCalledOnce();
    expect(reportError).toHaveBeenCalledWith(error, { context: 'warframeAPI alerts data' });
  });

  it('configures the Warframe API client once', () => {
    expect(axios.create).toHaveBeenCalledWith(expect.objectContaining({
      baseURL: 'https://api.warframestat.us/',
      timeout: 5000,
    }));
  });
});
