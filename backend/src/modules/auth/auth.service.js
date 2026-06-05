import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import { prisma } from "../../config/prisma.js";

const INITIAL_PERMISSIONS = [
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

export const registerTenant = async ({
  companyName,
  legalName,
  taxId,
  adminName,
  adminEmail,
  adminPassword,
  ip,
  userAgent,
}) => {
  const existingUser = await prisma.user.findUnique({
    where: {
      email: adminEmail,
    },
  });

  if (existingUser) {
    const error = new Error("Ya existe un usuario registrado con ese email");
    error.statusCode = 409;
    throw error;
  }

  const passwordHash = await bcrypt.hash(adminPassword, 10);

  const result = await prisma.$transaction(async (tx) => {
    const tenant = await tx.tenant.create({
      data: {
        name: companyName,
        legalName,
        taxId,
      },
    });

    const adminUser = await tx.user.create({
      data: {
        name: adminName,
        email: adminEmail,
        password: passwordHash,
        status: "ACTIVE",
      },
    });

    const adminRole = await tx.role.create({
      data: {
        tenantId: tenant.id,
        name: "TENANT_ADMIN",
        description: "Administrador principal de la empresa",
      },
    });

    const permissions = [];

    for (const permissionKey of INITIAL_PERMISSIONS) {
      const permission = await tx.permission.upsert({
        where: {
          key: permissionKey,
        },
        update: {},
        create: {
          key: permissionKey,
          description: `Permiso para ${permissionKey}`,
        },
      });

      permissions.push(permission);
    }

    await tx.rolePermission.createMany({
      data: permissions.map((permission) => ({
        roleId: adminRole.id,
        permissionId: permission.id,
      })),
      skipDuplicates: true,
    });

    await tx.tenantUser.create({
      data: {
        tenantId: tenant.id,
        userId: adminUser.id,
        roleId: adminRole.id,
      },
    });

    await tx.auditLog.create({
      data: {
        tenantId: tenant.id,
        userId: adminUser.id,
        action: "CREATE",
        module: "auth",
        entity: "Tenant",
        entityId: tenant.id,
        newValue: {
          tenantName: tenant.name,
          adminEmail: adminUser.email,
        },
        metadata: {
          event: "REGISTER_TENANT",
        },
        ip,
        userAgent,
      },
    });

    return {
      tenant,
      adminUser,
      adminRole,
      permissions,
    };
  });

  return {
    tenant: {
      id: result.tenant.id,
      name: result.tenant.name,
      legalName: result.tenant.legalName,
      taxId: result.tenant.taxId,
    },
    admin: {
      id: result.adminUser.id,
      name: result.adminUser.name,
      email: result.adminUser.email,
    },
    role: {
      id: result.adminRole.id,
      name: result.adminRole.name,
    },
    permissions: result.permissions.map((permission) => permission.key),
  };
};

export const login = async ({
  email,
  password,
  tenantId,
  ip,
  userAgent,
}) => {
  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (!user) {
    const error = new Error("Credenciales inválidas");
    error.statusCode = 401;
    throw error;
  }

  if (user.status !== "ACTIVE") {
    const error = new Error("El usuario no está activo");
    error.statusCode = 403;
    throw error;
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    const error = new Error("Credenciales inválidas");
    error.statusCode = 401;
    throw error;
  }

  const membership = await prisma.tenantUser.findFirst({
    where: {
      userId: user.id,
      tenantId,
    },
    include: {
      tenant: true,
      role: {
        include: {
          permissions: {
            include: {
              permission: true,
            },
          },
        },
      },
    },
  });

  if (!membership) {
    const error = new Error("El usuario no pertenece a esta empresa");
    error.statusCode = 403;
    throw error;
  }

  if (!membership.tenant.isActive) {
    const error = new Error("La empresa se encuentra inactiva");
    error.statusCode = 403;
    throw error;
  }

  const permissions = membership.role.permissions.map(
    (rolePermission) => rolePermission.permission.key
  );

  const token = jwt.sign(
    {
      sub: user.id,
      tenantId: membership.tenant.id,
      roleId: membership.role.id,
      email: user.email,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "1h",
    }
  );

  await prisma.auditLog.create({
    data: {
      tenantId: membership.tenant.id,
      userId: user.id,
      action: "LOGIN",
      module: "auth",
      entity: "User",
      entityId: user.id,
      metadata: {
        event: "LOGIN",
        email: user.email,
      },
      ip,
      userAgent,
    },
  });

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      status: user.status,
    },
    tenant: {
      id: membership.tenant.id,
      name: membership.tenant.name,
    },
    role: {
      id: membership.role.id,
      name: membership.role.name,
    },
    permissions,
  };
};