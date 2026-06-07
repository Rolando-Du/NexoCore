import bcrypt from "bcryptjs";

import { prisma } from "../../config/prisma.js";

const userMembershipInclude = {
  user: {
    select: {
      id: true,
      name: true,
      email: true,
      status: true,
      createdAt: true,
      updatedAt: true,
    },
  },
  role: {
    select: {
      id: true,
      name: true,
      description: true,
    },
  },
};

const normalizeRequiredText = (value, fieldName) => {
  const cleanValue = String(value || "").trim();

  if (!cleanValue) {
    const error = new Error(`${fieldName} es obligatorio`);
    error.statusCode = 400;
    throw error;
  }

  return cleanValue;
};

const normalizeEmail = (email) => {
  return normalizeRequiredText(email, "El email").toLowerCase();
};

const validateTenantRole = async ({ tenantId, roleId }) => {
  const role = await prisma.role.findFirst({
    where: {
      id: roleId,
      tenantId,
    },
    select: {
      id: true,
      name: true,
    },
  });

  if (!role) {
    const error = new Error("Rol no encontrado para esta empresa");
    error.statusCode = 404;
    throw error;
  }

  return role;
};

const getTenantMembership = async ({ tenantId, userId }) => {
  return prisma.tenantUser.findFirst({
    where: {
      tenantId,
      userId,
    },
    include: userMembershipInclude,
  });
};

export const getTenantRoles = async ({ tenantId }) => {
  return prisma.role.findMany({
    where: {
      tenantId,
    },
    select: {
      id: true,
      name: true,
      description: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: {
      name: "asc",
    },
  });
};

export const getUsers = async ({ tenantId }) => {
  return prisma.tenantUser.findMany({
    where: {
      tenantId,
    },
    include: userMembershipInclude,
    orderBy: {
      createdAt: "desc",
    },
  });
};

export const getUserById = async ({ tenantId, userId }) => {
  const membership = await getTenantMembership({
    tenantId,
    userId,
  });

  if (!membership) {
    const error = new Error("Usuario no encontrado en esta empresa");
    error.statusCode = 404;
    throw error;
  }

  return membership;
};

export const createUser = async ({
  tenantId,
  currentUserId,
  data,
  ip,
  userAgent,
}) => {
  const cleanName = normalizeRequiredText(data.name, "El nombre del usuario");
  const cleanEmail = normalizeEmail(data.email);

  await validateTenantRole({
    tenantId,
    roleId: data.roleId,
  });

  const existingUser = await prisma.user.findUnique({
    where: {
      email: cleanEmail,
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

  const passwordHash = await bcrypt.hash(data.password, 10);

  const result = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        name: cleanName,
        email: cleanEmail,
        password: passwordHash,
        status: "ACTIVE",
      },
      select: {
        id: true,
        name: true,
        email: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    const membership = await tx.tenantUser.create({
      data: {
        tenantId,
        userId: user.id,
        roleId: data.roleId,
      },
      include: userMembershipInclude,
    });

    await tx.auditLog.create({
      data: {
        tenantId,
        userId: currentUserId,
        action: "CREATE",
        module: "users",
        entity: "User",
        entityId: user.id,
        newValue: {
          id: user.id,
          name: user.name,
          email: user.email,
          status: user.status,
          roleId: data.roleId,
        },
        metadata: {
          event: "CREATE_USER",
        },
        ip,
        userAgent,
      },
    });

    return membership;
  });

  return result;
};

export const updateUser = async ({
  tenantId,
  currentUserId,
  userId,
  data,
  ip,
  userAgent,
}) => {
  const existingMembership = await getTenantMembership({
    tenantId,
    userId,
  });

  if (!existingMembership) {
    const error = new Error("Usuario no encontrado en esta empresa");
    error.statusCode = 404;
    throw error;
  }

  if (data.roleId) {
    await validateTenantRole({
      tenantId,
      roleId: data.roleId,
    });
  }

  if (currentUserId === userId && data.status && data.status !== "ACTIVE") {
    const error = new Error("No podés desactivar o bloquear tu propio usuario");
    error.statusCode = 409;
    throw error;
  }

  const cleanName = data.name
    ? normalizeRequiredText(data.name, "El nombre del usuario")
    : undefined;

  const result = await prisma.$transaction(async (tx) => {
    if (cleanName || data.status) {
      await tx.user.update({
        where: {
          id: userId,
        },
        data: {
          name: cleanName,
          status: data.status,
        },
      });
    }

    if (data.roleId) {
      await tx.tenantUser.update({
        where: {
          tenantId_userId: {
            tenantId,
            userId,
          },
        },
        data: {
          roleId: data.roleId,
        },
      });
    }

    const updatedMembership = await tx.tenantUser.findUnique({
      where: {
        tenantId_userId: {
          tenantId,
          userId,
        },
      },
      include: userMembershipInclude,
    });

    await tx.auditLog.create({
      data: {
        tenantId,
        userId: currentUserId,
        action: "UPDATE",
        module: "users",
        entity: "User",
        entityId: userId,
        oldValue: {
          id: existingMembership.user.id,
          name: existingMembership.user.name,
          email: existingMembership.user.email,
          status: existingMembership.user.status,
          roleId: existingMembership.role.id,
        },
        newValue: {
          id: updatedMembership.user.id,
          name: updatedMembership.user.name,
          email: updatedMembership.user.email,
          status: updatedMembership.user.status,
          roleId: updatedMembership.role.id,
        },
        metadata: {
          event: "UPDATE_USER",
        },
        ip,
        userAgent,
      },
    });

    return updatedMembership;
  });

  return result;
};

export const disableUser = async ({
  tenantId,
  currentUserId,
  userId,
  ip,
  userAgent,
}) => {
  if (currentUserId === userId) {
    const error = new Error("No podés deshabilitar tu propio usuario");
    error.statusCode = 409;
    throw error;
  }

  const existingMembership = await getTenantMembership({
    tenantId,
    userId,
  });

  if (!existingMembership) {
    const error = new Error("Usuario no encontrado en esta empresa");
    error.statusCode = 404;
    throw error;
  }

  if (existingMembership.user.status === "INACTIVE") {
    const error = new Error("El usuario ya se encuentra inactivo");
    error.statusCode = 409;
    throw error;
  }

  const result = await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: {
        id: userId,
      },
      data: {
        status: "INACTIVE",
      },
    });

    const updatedMembership = await tx.tenantUser.findUnique({
      where: {
        tenantId_userId: {
          tenantId,
          userId,
        },
      },
      include: userMembershipInclude,
    });

    await tx.auditLog.create({
      data: {
        tenantId,
        userId: currentUserId,
        action: "UPDATE",
        module: "users",
        entity: "User",
        entityId: userId,
        oldValue: {
          id: existingMembership.user.id,
          name: existingMembership.user.name,
          email: existingMembership.user.email,
          status: existingMembership.user.status,
        },
        newValue: {
          id: updatedMembership.user.id,
          name: updatedMembership.user.name,
          email: updatedMembership.user.email,
          status: updatedMembership.user.status,
        },
        metadata: {
          event: "DISABLE_USER",
        },
        ip,
        userAgent,
      },
    });

    return updatedMembership;
  });

  return result;
};