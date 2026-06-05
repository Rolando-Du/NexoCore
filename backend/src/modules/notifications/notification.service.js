import { prisma } from "../../config/prisma.js";

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
      type,
      title,
      message,
      payload,
      channel: "IN_APP",
      status: "UNREAD",
    },
  });
};

export const getMyNotifications = async ({ tenantId, userId, filters }) => {
  const where = {
    tenantId,
    userId,
    status: filters.status || undefined,
  };

  const [notifications, total] = await Promise.all([
    prisma.notification.findMany({
      where,
      take: filters.take,
      skip: filters.skip,
      orderBy: {
        createdAt: "desc",
      },
    }),

    prisma.notification.count({
      where,
    }),
  ]);

  return {
    total,
    take: filters.take,
    skip: filters.skip,
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