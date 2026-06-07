import { z } from "zod";

const auditActions = [
  "CREATE",
  "UPDATE",
  "DELETE",
  "LOGIN",
  "LOGOUT",
  "READ",
  "ASSIGN",
  "STATUS_CHANGE",
];

const optionalText = (maxLength = 120) => {
  return z
    .string()
    .trim()
    .max(maxLength, `No puede superar los ${maxLength} caracteres`)
    .optional()
    .or(z.literal(""));
};

const optionalDate = z
  .union([z.coerce.date(), z.literal(""), z.null()])
  .optional()
  .transform((value) => {
    if (!value) return undefined;
    return value;
  });

export const auditQuerySchema = z.object({
  module: optionalText(80),

  action: z
    .enum(auditActions, {
      message: "Acción de auditoría inválida",
    })
    .optional(),

  userId: optionalText(100),

  entity: optionalText(80),

  entityId: optionalText(100),

  dateFrom: optionalDate,

  dateTo: optionalDate,

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