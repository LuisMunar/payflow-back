type Environment = Record<string, string | undefined>;

type AppConfig = {
  NODE_ENV: string;
  PORT: number;
  DATABASE_URL: string;
  PAYMENT_API_BASE_URL: string;
  PAYMENT_PUBLIC_KEY: string;
  PAYMENT_PRIVATE_KEY: string;
  PAYMENT_INTEGRITY_KEY: string;
};

const requiredKeys: Array<keyof Omit<AppConfig, 'PORT'>> = [
  'NODE_ENV',
  'DATABASE_URL',
  'PAYMENT_API_BASE_URL',
  'PAYMENT_PUBLIC_KEY',
  'PAYMENT_PRIVATE_KEY',
  'PAYMENT_INTEGRITY_KEY',
];

function getRequiredString(config: Environment, key: keyof Omit<AppConfig, 'PORT'>): string {
  return config[key] as string;
}

export function validateEnv(config: Environment): AppConfig {
  const missingKeys = requiredKeys.filter((key) => !config[key]);

  if (missingKeys.length > 0) {
    throw new Error(`Missing required environment variables: ${missingKeys.join(', ')}`);
  }

  const port = Number(config.PORT ?? 3000);

  if (!Number.isInteger(port) || port <= 0) {
    throw new Error('PORT must be a positive integer');
  }

  return {
    NODE_ENV: getRequiredString(config, 'NODE_ENV'),
    PORT: port,
    DATABASE_URL: getRequiredString(config, 'DATABASE_URL'),
    PAYMENT_API_BASE_URL: getRequiredString(config, 'PAYMENT_API_BASE_URL'),
    PAYMENT_PUBLIC_KEY: getRequiredString(config, 'PAYMENT_PUBLIC_KEY'),
    PAYMENT_PRIVATE_KEY: getRequiredString(config, 'PAYMENT_PRIVATE_KEY'),
    PAYMENT_INTEGRITY_KEY: getRequiredString(config, 'PAYMENT_INTEGRITY_KEY'),
  };
}
