import { prisma } from "../../config/prisma.js";
import { createNotification } from "../notifications/notification.service.js";

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
      const error = new Error(
        "El usuario asignado no pertenece a esta empresa"
      );
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
        statusHistory: {
          orderBy: {
            createdAt: "desc",
          },
        },
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

    if (data.assignedToId) {
      await createNotification({
        tx,
        tenantId,
        userId: data.assignedToId,
        type: "OPERATION_ASSIGNED",
        title: "Nueva operación asignada",
        message: `Se te asignó la operación: ${operation.title}`,
        payload: {
          operationId: operation.id,
          status: operation.status,
          priority: operation.priority,
        },
      });
    }

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

  if (existingOperation.status === data.status) {
    const error = new Error(
      `La operación ya se encuentra en estado ${data.status}`
    );
    error.statusCode = 409;
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
    await tx.operation.update({
      where: {
        id: operationId,
      },
      data: {
        status: data.status,
        ...statusDates,
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

    const notificationUserId =
      existingOperation.assignedToId || existingOperation.createdById;

    await createNotification({
      tx,
      tenantId,
      userId: notificationUserId,
      type: "OPERATION_STATUS_CHANGED",
      title: "Estado de operación actualizado",
      message: `La operación "${existingOperation.title}" cambió de ${existingOperation.status} a ${data.status}`,
      payload: {
        operationId,
        fromStatus: existingOperation.status,
        toStatus: data.status,
        note: data.note,
      },
    });

    const updatedOperation = await tx.operation.findFirst({
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
    await tx.operation.update({
      where: {
        id: operationId,
      },
      data: {
        assignedToId: assignedUserId,
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

    await createNotification({
      tx,
      tenantId,
      userId: assignedUserId,
      type: "OPERATION_ASSIGNED",
      title: "Operación asignada",
      message: `Se te asignó la operación: ${existingOperation.title}`,
      payload: {
        operationId,
        assignedBy: userId,
      },
    });

    const updatedOperation = await tx.operation.findFirst({
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

    return updatedOperation;
  });

  return result;
};