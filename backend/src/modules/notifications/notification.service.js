import { prisma } from "../../config/prisma.js";

const normalizeRequiredText = (value, fieldName) => {
  const cleanValue = String(value || "").trim();

  if (!cleanValue) {
    const error = new Error(`${fieldName} es obligatorio`);
    error.statusCode = 400;
    throw error;
  }

  return cleanValue;
};

const normalizePayload = (payload) => {
  if (!payload) return null;

  return payload;
};

const normalizePagination = (filters = {}) => {
  const take = Number(filters.take || 50);
  const skip = Number(filters.skip || 0);

  return {
    take: Number.isNaN(take) ? 50 : Math.min(Math.max(take, 1), 100),
    skip: Number.isNaN(skip) ? 0 : Math.max(skip, 0),
  };
};

export const createNotification = async ({
  tx = prisma,
  tenantId,
  userId,
  type,
  title,
  message,
  payload,
}) => {
  return tx.notification.create({
    data: {
      tenantId,
      userId,
      type: normalizeRequiredText(type, "El tipo de notificación"),
      title: normalizeRequiredText(title, "El título de la notificación"),
      message: normalizeRequiredText(message, "El mensaje de la notificación"),
      payload: normalizePayload(payload),
      channel: "IN_APP",
      status: "UNREAD",
    },
  });
};

export const getMyNotifications = async ({ tenantId, userId, filters = {} }) => {
  const { take, skip } = normalizePagination(filters);

  const where = {
    tenantId,
    userId,
    status: filters.status || undefined,
    type: filters.type || undefined,
  };

  const [notifications, total, unreadTotal] = await Promise.all([
    prisma.notification.findMany({
      where,
      take,
      skip,
      orderBy: {
        createdAt: "desc",
      },
    }),

    prisma.notification.count({
      where,
    }),

    prisma.notification.count({
      where: {
        tenantId,
        userId,
        status: "UNREAD",
      },
    }),
  ]);

  return {
    total,
    unreadTotal,
    take,
    skip,
    notifications,
  };
};

export const markAsRead = async ({ tenantId, userId, notificationId }) => {
  const notification = await prisma.notification.findFirst({
    where: {
      id: notificationId,
      tenantId,
      userId,
    },
  });

  if (!notification) {
    const error = new Error("Notificación no encontrada");
    error.statusCode = 404;
    throw error;
  }

  if (notification.status === "READ") {
    return notification;
  }

  return prisma.notification.update({
    where: {
      id: notificationId,
    },
    data: {
      status: "READ",
      readAt: new Date(),
    },
  });
};

export const markAllAsRead = async ({ tenantId, userId }) => {
  const result = await prisma.notification.updateMany({
    where: {
      tenantId,
      userId,
      status: "UNREAD",
    },
    data: {
      status: "READ",
      readAt: new Date(),
    },
  });

  return {
    updated: result.count,
  };
};