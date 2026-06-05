import { prisma } from "../../config/prisma.js";

export const getAuditLogs = async ({ tenantId, filters }) => {
  const where = {
    tenantId,
    module: filters.module || undefined,
    action: filters.action || undefined,
    userId: filters.userId || undefined,
    entity: filters.entity || undefined,
    entityId: filters.entityId || undefined,
    createdAt:
      filters.dateFrom || filters.dateTo
        ? {
            gte: filters.dateFrom || undefined,
            lte: filters.dateTo || undefined,
          }
        : undefined,
  };

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      take: filters.take,
      skip: filters.skip,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            status: true,
          },
        },
        tenant: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    }),

    prisma.auditLog.count({
      where,
    }),
  ]);

  return {
    total,
    take: filters.take,
    skip: filters.skip,
    logs,
  };
};

export const getAuditLogById = async ({ tenantId, auditId }) => {
  const log = await prisma.auditLog.findFirst({
    where: {
      id: auditId,
      tenantId,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          status: true,
        },
      },
      tenant: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  if (!log) {
    const error = new Error("Registro de auditoría no encontrado");
    error.statusCode = 404;
    throw error;
  }

  return log;
};