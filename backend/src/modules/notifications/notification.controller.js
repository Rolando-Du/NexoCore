import { notificationQuerySchema } from "./notification.schema.js";
import * as notificationService from "./notification.service.js";

export const getMyNotifications = async (req, res, next) => {
  try {
    const filters = notificationQuerySchema.parse(req.query);

    const result = await notificationService.getMyNotifications({
      tenantId: req.context.tenant.id,
      userId: req.context.user.id,
      filters,
    });

    res.json({
      success: true,
      message: "Notificaciones obtenidas correctamente",
      data: result,
    });
  } catch (error) {
    if (error.name === "ZodError") {
      return res.status(400).json({
        success: false,
        message: "Filtros inválidos",
        errors: error.issues,
      });
    }

    next(error);
  }
};

export const markAsRead = async (req, res, next) => {
  try {
    const notification = await notificationService.markAsRead({
      tenantId: req.context.tenant.id,
      userId: req.context.user.id,
      notificationId: req.params.id,
    });

    res.json({
      success: true,
      message: "Notificación marcada como leída",
      data: notification,
    });
  } catch (error) {
    next(error);
  }
};

export const markAllAsRead = async (req, res, next) => {
  try {
    const result = await notificationService.markAllAsRead({
      tenantId: req.context.tenant.id,
      userId: req.context.user.id,
    });

    res.json({
      success: true,
      message: "Notificaciones marcadas como leídas",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};