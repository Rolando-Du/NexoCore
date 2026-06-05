import { prisma } from "./config/prisma.js";

const main = async () => {
  const tenants = await prisma.tenant.findMany();

  console.log("Conexión correcta con Prisma");
  console.log("Tenants encontrados:", tenants);
};

main()
  .catch((error) => {
    console.error("Error probando Prisma:", error);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });