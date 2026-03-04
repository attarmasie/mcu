function getEnv<T extends string>(value: T | undefined, key: string): T {
  if (!value) {
    throw new Error(`Missing environment variable: ${key}`);
  }
  return value;
}

function getOptionalEnv(value: string | undefined, fallback: string): string {
  return value || fallback;
}

export const ENV = {
  BASE_URL: getEnv(import.meta.env.VITE_BASE_URL, "VITE_BASE_URL"),
  ENVIRONMENT: getEnv(import.meta.env.VITE_ENVIRONMENT, "VITE_ENVIRONMENT"),
  APP_VERSION: getOptionalEnv(import.meta.env.VITE_APP_VERSION, "dev"),
  OTEL_ENABLED:
    getOptionalEnv(import.meta.env.VITE_OTEL_ENABLED, "true") === "true",
  OTEL_SERVICE_NAME: getOptionalEnv(
    import.meta.env.VITE_OTEL_SERVICE_NAME,
    "mcu-frontend",
  ),
  OTEL_EXPORTER_OTLP_ENDPOINT: getOptionalEnv(
    import.meta.env.VITE_OTEL_EXPORTER_OTLP_ENDPOINT,
    "http://localhost:4318/v1/traces",
  ),
} as const;
