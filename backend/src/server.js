import app from "./app.js";
import { env } from "./config/env.js";

const server = app.listen(env.port, () => {
  console.log(`NexoCore API running on http://localhost:${env.port}`);
  console.log(`Swagger documentation available at http://localhost:${env.port}/api/docs`);
});

const shutdown = (signal) => {
  console.log(`Received ${signal}. Closing server...`);

  server.close(() => {
    console.log("Server closed successfully.");
    process.exit(0);
  });
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));