import { validateEnv } from './env.validation';

describe('validateEnv', () => {
  const validEnv = {
    NODE_ENV: 'test',
    PORT: '3000',
    DATABASE_URL: 'postgresql://payflow:payflow@localhost:5432/payflow',
    PAYMENT_API_BASE_URL: 'https://sandbox.example.test/v1',
    PAYMENT_PUBLIC_KEY: 'public_key',
    PAYMENT_PRIVATE_KEY: 'private_key',
    PAYMENT_INTEGRITY_KEY: 'integrity_key',
  };

  it('returns a parsed app config', () => {
    expect(validateEnv(validEnv)).toEqual({
      ...validEnv,
      PORT: 3000,
    });
  });

  it('uses default port when PORT is not provided', () => {
    const envWithoutPort = Object.fromEntries(
      Object.entries(validEnv).filter(([key]) => key !== 'PORT'),
    );

    expect(validateEnv(envWithoutPort).PORT).toBe(3000);
  });

  it('fails when a required variable is missing', () => {
    const envWithoutDatabaseUrl = Object.fromEntries(
      Object.entries(validEnv).filter(([key]) => key !== 'DATABASE_URL'),
    );

    expect(() => validateEnv(envWithoutDatabaseUrl)).toThrow(
      'Missing required environment variables: DATABASE_URL',
    );
  });

  it('fails when PORT is invalid', () => {
    expect(() => validateEnv({ ...validEnv, PORT: 'invalid' })).toThrow(
      'PORT must be a positive integer',
    );
  });
});
