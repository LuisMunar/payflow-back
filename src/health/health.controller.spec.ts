import { HealthController } from './health.controller';
import { HealthService } from './health.service';

describe('HealthController', () => {
  it('returns health status from the service', () => {
    const response = {
      status: 'ok' as const,
      service: 'payflow-back',
      timestamp: '2026-07-13T00:00:00.000Z',
    };
    const getHealth = jest.fn().mockReturnValue(response);
    const healthService = {
      getHealth,
    } as unknown as HealthService;
    const controller = new HealthController(healthService);

    expect(controller.getHealth()).toBe(response);
    expect(getHealth).toHaveBeenCalledTimes(1);
  });
});
