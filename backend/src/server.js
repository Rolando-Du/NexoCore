import app from "./app.js";
import { env } from "./config/env.js";
import { prisma } from "./config/prisma.js";

const server = app.listen(env.port, () => {
  console.log(`NexoCore API running on http://localhost:${env.port}`);
  console.log(
    `Swagger documentation available at http://localhost:${env.port}/api/docs`
  );
});

const shutdown = async (signal) => {
  console.log(`Received ${signal}. Closing server...`);

  server.close(async () => {
    try {
      await prisma.$disconnect();
      console.log("Database connection closed successfully.");
      console.log("Server closed successfully.");
      process.exit(0);
    } catch (error) {
      console.error("Error while shutting down server:", error);
      process.exit(1);
    }
  });
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));