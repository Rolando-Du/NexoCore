import { z } from "zod";

export const notificationQuerySchema = z.object({
  status: z.enum(["UNREAD", "READ", "ARCHIVED"]).optional(),

  type: z
    .string()
    .trim()
    .min(1, "El tipo de notificación no puede estar vacío")
    .max(100, "El tipo de notificación no puede superar los 100 caracteres")
    .optional(),

  take: z.coerce
    .number()
    .int("take debe ser un número entero")
    .min(1, "take debe ser mayor o igual a 1")
    .max(100, "take no puede superar 100")
    .optional()
    .default(50),

  skip: z.coerce
    .number()
    .int("skip debe ser un número entero")
    .min(0, "skip debe ser mayor o igual a 0")
    .optional()
    .default(0),
});