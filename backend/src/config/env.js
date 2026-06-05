import "dotenv/config";

const requiredEnv = (key) => {
  const value = process.env[key];

  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value;
};

const parsePort = (value) => {
  const port = Number(value || 4000);

  if (Number.isNaN(port)) {
    throw new Error("PORT must be a valid number");
  }

  return port;
};

export const env = {
  port: parsePort(process.env.PORT),
  databaseUrl: requiredEnv("DATABASE_URL"),
  jwtSecret: requiredEnv("JWT_SECRET"),
  nodeEnv: process.env.NODE_ENV || "development",
  corsOrigin: process.env.CORS_ORIGIN || "http://localhost:5173",
};