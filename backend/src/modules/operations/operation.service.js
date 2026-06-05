import { prisma } from "../../config/prisma.js";

export const createOperation = async ({
  tenantId,
  userId,
  data,
  ip,
  userAgent,
}) => {
  if (data.clientId) {
    const client = await prisma.client.findFirst({
      where: {
        id: data.clientId,
        tenantId,
        isActive: true,
      },
    });

    if (!client) {
      const error = new Error("Cliente no encontrado o inactivo");
      error.statusCode = 404;
      throw error;
    }
  }

  if (data.assignedToId) {
    const assignedUser = await prisma.tenantUser.findFirst({
      where: {
        tenantId,
        userId: data.assignedToId,
      },
    });

    if (!assignedUser) {
      const error = new Error("El usuario asignado no pertenece a esta empresa");
      error.statusCode = 404;
      throw error;
    }
  }

  const result = await prisma.$transaction(async (tx) => {
    const operation = await tx.operation.create({
      data: {
        tenantId,
        clientId: data.clientId,
        type: data.type,
        title: data.title,
        description: data.description,
        priority: data.priority || "MEDIUM",
        scheduledAt: data.scheduledAt,
        createdById: userId,
        assignedToId: data.assignedToId,
        assignments: data.assignedToId
          ? {
              create: {
                tenantId,
                userId: data.assignedToId,
              },
            }
          : undefined,
        statusHistory: {
          create: {
            tenantId,
            fromStatus: null,
            toStatus: "PENDING",
            changedById: userId,
            note: "Operación creada",
          },
        },
      },
      include: {
        client: true,
        assignments: true,
        statusHistory: true,
      },
    });

    await tx.auditLog.create({
      data: {
        tenantId,
        userId,
        action: "CREATE",
        module: "operations",
        entity: "Operation",
        entityId: operation.id,
        newValue: operation,
        metadata: {
          event: "CREATE_OPERATION",
        },
        ip,
        userAgent,
      },
    });

    return operation;
  });

  return result;
};

export const getOperations = async ({ tenantId, filters }) => {
  return prisma.operation.findMany({
    where: {
      tenantId,
      status: filters.status || undefined,
      type: filters.type || undefined,
      clientId: filters.clientId || undefined,
    },
    include: {
      client: true,
      assignments: true,
      statusHistory: {
        orderBy: {
          createdAt: "desc",
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

export const getOperationById = async ({ tenantId, operationId }) => {
  const operation = await prisma.operation.findFirst({
    where: {
      id: operationId,
      tenantId,
    },
    include: {
      client: true,
      assignments: true,
      statusHistory: {
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  if (!operation) {
    const error = new Error("Operación no encontrada");
    error.statusCode = 404;
    throw error;
  }

  return operation;
};

export const updateOperationStatus = async ({
  tenantId,
  userId,
  operationId,
  data,
  ip,
  userAgent,
}) => {
  const existingOperation = await prisma.operation.findFirst({
    where: {
      id: operationId,
      tenantId,
    },
  });

  if (!existingOperation) {
    const error = new Error("Operación no encontrada");
    error.statusCode = 404;
    throw error;
  }

  const statusDates = {};

  if (data.status === "IN_PROGRESS" && !existingOperation.startedAt) {
    statusDates.startedAt = new Date();
  }

  if (data.status === "COMPLETED") {
    statusDates.completedAt = new Date();
  }

  const result = await prisma.$transaction(async (tx) => {
    const updatedOperation = await tx.operation.update({
      where: {
        id: operationId,
      },
      data: {
        status: data.status,
        ...statusDates,
      },
      include: {
        client: true,
        assignments: true,
        statusHistory: true,
      },
    });

    await tx.operationStatusHistory.create({
      data: {
        tenantId,
        operationId,
        fromStatus: existingOperation.status,
        toStatus: data.status,
        changedById: userId,
        note: data.note,
      },
    });

    await tx.auditLog.create({
      data: {
        tenantId,
        userId,
        action: "STATUS_CHANGE",
        module: "operations",
        entity: "Operation",
        entityId: operationId,
        oldValue: {
          status: existingOperation.status,
        },
        newValue: {
          status: data.status,
        },
        metadata: {
          event: "UPDATE_OPERATION_STATUS",
          note: data.note,
        },
        ip,
        userAgent,
      },
    });

    return updatedOperation;
  });

  return result;
};

export const assignOperation = async ({
  tenantId,
  userId,
  operationId,
  assignedUserId,
  ip,
  userAgent,
}) => {
  const existingOperation = await prisma.operation.findFirst({
    where: {
      id: operationId,
      tenantId,
    },
  });

  if (!existingOperation) {
    const error = new Error("Operación no encontrada");
    error.statusCode = 404;
    throw error;
  }

  const assignedUser = await prisma.tenantUser.findFirst({
    where: {
      tenantId,
      userId: assignedUserId,
    },
  });

  if (!assignedUser) {
    const error = new Error("El usuario asignado no pertenece a esta empresa");
    error.statusCode = 404;
    throw error;
  }

  const result = await prisma.$transaction(async (tx) => {
    const updatedOperation = await tx.operation.update({
      where: {
        id: operationId,
      },
      data: {
        assignedToId: assignedUserId,
      },
      include: {
        client: true,
        assignments: true,
        statusHistory: true,
      },
    });

    await tx.operationAssignment.upsert({
      where: {
        operationId_userId: {
          operationId,
          userId: assignedUserId,
        },
      },
      update: {},
      create: {
        tenantId,
        operationId,
        userId: assignedUserId,
      },
    });

    await tx.auditLog.create({
      data: {
        tenantId,
        userId,
        action: "ASSIGN",
        module: "operations",
        entity: "Operation",
        entityId: operationId,
        oldValue: {
          assignedToId: existingOperation.assignedToId,
        },
        newValue: {
          assignedToId: assignedUserId,
        },
        metadata: {
          event: "ASSIGN_OPERATION",
        },
        ip,
        userAgent,
      },
    });

    return updatedOperation;
  });

  return result;
};