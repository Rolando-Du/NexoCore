import dotenv from "dotenv";
import { defineConfig, env } from "prisma/config";

dotenv.config({ override: true });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});