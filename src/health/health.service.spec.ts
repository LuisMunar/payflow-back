import { HealthService } from './health.service';

describe('HealthService', () => {
  it('returns service health status', () => {
    const service = new HealthService();

    const result = service.getHealth();

    expect(result.status).toBe('ok');
    expect(result.service).toBe('payflow-back');
    expect(result.timestamp).toEqual(expect.any(String));
  });
});
