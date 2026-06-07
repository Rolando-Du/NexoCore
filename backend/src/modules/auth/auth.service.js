import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import { env } from "../../config/env.js";
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

const normalizeRequiredText = (value, fieldName) => {
  const cleanValue = String(value || "").trim();

  if (!cleanValue) {
    const error = new Error(`${fieldName} es obligatorio`);
    error.statusCode = 400;
    throw error;
  }

  return cleanValue;
};

const normalizeOptionalText = (value) => {
  if (!value) return null;

  const cleanValue = String(value).trim();

  return cleanValue || null;
};

const normalizeEmail = (email) => {
  return normalizeRequiredText(email, "El email").toLowerCase();
};

const getMembershipPermissions = (membership) => {
  return membership.role.permissions.map(
    (rolePermission) => rolePermission.permission.key
  );
};

const buildAuthResponse = ({ token, user, tenant, role, permissions }) => {
  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      status: user.status,
    },
    tenant: {
      id: tenant.id,
      name: tenant.name,
    },
    role: {
      id: role.id,
      name: role.name,
    },
    permissions,
  };
};

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
  const cleanCompanyName = normalizeRequiredText(
    companyName,
    "El nombre de la empresa"
  );
  const cleanLegalName = normalizeOptionalText(legalName);
  const cleanTaxId = normalizeOptionalText(taxId);
  const cleanAdminName = normalizeRequiredText(
    adminName,
    "El nombre del administrador"
  );
  const cleanAdminEmail = normalizeEmail(adminEmail);

  const existingUser = await prisma.user.findUnique({
    where: {
      email: cleanAdminEmail,
    },
    select: {
      id: true,
    },
  });

  if (existingUser) {
    const error = new Error("Ya existe un usuario registrado con ese email");
    error.statusCode = 409;
    throw error;
  }

  if (cleanTaxId) {
    const existingTenant = await prisma.tenant.findFirst({
      where: {
        taxId: cleanTaxId,
      },
      select: {
        id: true,
      },
    });

    if (existingTenant) {
      const error = new Error("Ya existe una empresa registrada con ese CUIT / Tax ID");
      error.statusCode = 409;
      throw error;
    }
  }

  const passwordHash = await bcrypt.hash(adminPassword, 10);

  const result = await prisma.$transaction(async (tx) => {
    const tenant = await tx.tenant.create({
      data: {
        name: cleanCompanyName,
        legalName: cleanLegalName,
        taxId: cleanTaxId,
      },
    });

    const adminUser = await tx.user.create({
      data: {
        name: cleanAdminName,
        email: cleanAdminEmail,
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
          tenantId: tenant.id,
          tenantName: tenant.name,
          adminUserId: adminUser.id,
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

export const login = async ({ email, password, tenantId, ip, userAgent }) => {
  const cleanEmail = normalizeEmail(email);
  const cleanTenantId = normalizeRequiredText(tenantId, "El tenantId");

  const user = await prisma.user.findUnique({
    where: {
      email: cleanEmail,
    },
    select: {
      id: true,
      name: true,
      email: true,
      password: true,
      status: true,
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
      tenantId: cleanTenantId,
    },
    include: {
      tenant: {
        select: {
          id: true,
          name: true,
          isActive: true,
        },
      },
      role: {
        select: {
          id: true,
          name: true,
          permissions: {
            select: {
              permission: {
                select: {
                  key: true,
                },
              },
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

  const permissions = getMembershipPermissions(membership);

  const token = jwt.sign(
    {
      sub: user.id,
      tenantId: membership.tenant.id,
      roleId: membership.role.id,
      email: user.email,
    },
    env.jwtSecret,
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

  return buildAuthResponse({
    token,
    user,
    tenant: membership.tenant,
    role: membership.role,
    permissions,
  });
};