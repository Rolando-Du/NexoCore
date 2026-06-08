import "dotenv/config";

import { prisma } from "../src/config/prisma.js";

const ALL_PERMISSIONS = [
  "users:create",
  "users:read",
  "users:update",
  "users:disable",

  "roles:manage",

  "clients:create",
  "clients:read",
  "clients:update",
  "clients:disable",

  "operations:create",
  "operations:read",
  "operations:update",
  "operations:assign",
  "operations:complete",
  "operations:cancel",

  "audit:read",
];

const ROLE_DEFINITIONS = [
  {
    name: "TENANT_ADMIN",
    description: "Administrador principal del tenant con acceso completo.",
    permissions: ALL_PERMISSIONS,
  },
  {
    name: "SUPERVISOR",
    description: "Supervisor operativo con gestión de clientes y operaciones.",
    permissions: [
      "users:read",

      "clients:create",
      "clients:read",
      "clients:update",

      "operations:create",
      "operations:read",
      "operations:update",
      "operations:assign",
      "operations:complete",
      "operations:cancel",

      "audit:read",
    ],
  },
  {
    name: "OPERADOR",
    description: "Usuario operativo para gestión diaria de operaciones.",
    permissions: [
      "clients:read",

      "operations:create",
      "operations:read",
      "operations:update",
      "operations:complete",
    ],
  },
  {
    name: "TECNICO",
    description: "Técnico de campo con acceso a operaciones asignadas y evidencias.",
    permissions: [
      "clients:read",

      "operations:read",
      "operations:update",
      "operations:complete",
    ],
  },
];

const getTargetTenant = async () => {
  const tenantId = process.env.SEED_TENANT_ID;

  if (tenantId) {
    const tenant = await prisma.tenant.findUnique({
      where: {
        id: tenantId,
      },
    });

    if (!tenant) {
      throw new Error(`No existe un tenant con el ID ${tenantId}`);
    }

    return tenant;
  }

  const tenant = await prisma.tenant.findFirst({
    orderBy: {
      createdAt: "asc",
    },
  });

  if (!tenant) {
    throw new Error("No hay tenants creados. Registrá una empresa primero.");
  }

  return tenant;
};

const upsertPermission = async (permissionKey) => {
  return prisma.permission.upsert({
    where: {
      key: permissionKey,
    },
    update: {},
    create: {
      key: permissionKey,
      description: `Permiso para ${permissionKey}`,
    },
  });
};

const syncRolePermissions = async ({ roleId, permissions }) => {
  const permissionRecords = [];

  for (const permissionKey of permissions) {
    const permission = await upsertPermission(permissionKey);
    permissionRecords.push(permission);
  }

  await prisma.rolePermission.deleteMany({
    where: {
      roleId,
    },
  });

  await prisma.rolePermission.createMany({
    data: permissionRecords.map((permission) => ({
      roleId,
      permissionId: permission.id,
    })),
    skipDuplicates: true,
  });
};

const main = async () => {
  const tenant = await getTargetTenant();

  console.log(`Seed de roles para tenant: ${tenant.name} (${tenant.id})`);

  for (const roleDefinition of ROLE_DEFINITIONS) {
    const role = await prisma.role.upsert({
      where: {
        tenantId_name: {
          tenantId: tenant.id,
          name: roleDefinition.name,
        },
      },
      update: {
        description: roleDefinition.description,
      },
      create: {
        tenantId: tenant.id,
        name: roleDefinition.name,
        description: roleDefinition.description,
      },
    });

    await syncRolePermissions({
      roleId: role.id,
      permissions: roleDefinition.permissions,
    });

    console.log(`Rol sincronizado: ${role.name}`);
  }

  console.log("Seed de roles finalizado correctamente.");
};

main()
  .catch((error) => {
    console.error("Error ejecutando seed de roles:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });