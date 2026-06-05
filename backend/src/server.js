import app from "./app.js";
import { env } from "./config/env.js";

app.listen(env.port, () => {
  console.log(`🚀 NexoCore API corriendo en http://localhost:${env.port}`);
  console.log(`📘 Swagger disponible en http://localhost:${env.port}/api/docs`);
});