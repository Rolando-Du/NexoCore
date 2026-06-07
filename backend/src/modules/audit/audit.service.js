import { prisma } from "../../config/prisma.js";

const auditInclude = {
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
};

const normalizeOptionalText = (value) => {
  if (!value) return undefined;

  const cleanValue = String(value).trim();

  return cleanValue || undefined;
};

const normalizePagination = (filters = {}) => {
  const take = Number(filters.take || 50);
  const skip = Number(filters.skip || 0);

  return {
    take: Number.isNaN(take) ? 50 : Math.min(Math.max(take, 1), 100),
    skip: Number.isNaN(skip) ? 0 : Math.max(skip, 0),
  };
};

const normalizeDate = (value) => {
  if (!value) return undefined;

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    const error = new Error("Fecha inválida");
    error.statusCode = 400;
    throw error;
  }

  return date;
};

const buildAuditWhere = ({ tenantId, filters = {} }) => {
  const dateFrom = normalizeDate(filters.dateFrom);
  const dateTo = normalizeDate(filters.dateTo);

  return {
    tenantId,
    module: normalizeOptionalText(filters.module),
    action: normalizeOptionalText(filters.action),
    userId: normalizeOptionalText(filters.userId),
    entity: normalizeOptionalText(filters.entity),
    entityId: normalizeOptionalText(filters.entityId),

    createdAt:
      dateFrom || dateTo
        ? {
            gte: dateFrom,
            lte: dateTo,
          }
        : undefined,
  };
};

export const getAuditLogs = async ({ tenantId, filters = {} }) => {
  const { take, skip } = normalizePagination(filters);

  const where = buildAuditWhere({
    tenantId,
    filters,
  });

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      take,
      skip,
      orderBy: {
        createdAt: "desc",
      },
      include: auditInclude,
    }),

    prisma.auditLog.count({
      where,
    }),
  ]);

  return {
    total,
    take,
    skip,
    logs,
  };
};

export const getAuditLogById = async ({ tenantId, auditId }) => {
  const log = await prisma.auditLog.findFirst({
    where: {
      id: auditId,
      tenantId,
    },
    include: auditInclude,
  });

  if (!log) {
    const error = new Error("Registro de auditoría no encontrado");
    error.statusCode = 404;
    throw error;
  }

  return log;
};