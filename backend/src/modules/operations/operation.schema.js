import { z } from "zod";

const operationTypes = [
  "TASK",
  "WORK_ORDER",
  "INCIDENT",
  "INSPECTION",
  "SERVICE_REQUEST",
];

const operationStatuses = [
  "DRAFT",
  "PENDING",
  "IN_PROGRESS",
  "PAUSED",
  "COMPLETED",
  "CANCELLED",
];

const priorities = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];

const optionalString = (maxLength = 500) => {
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

export const createOperationSchema = z.object({
  clientId: optionalString(100),

  type: z.enum(operationTypes, {
    message: "Tipo de operación inválido",
  }),

  title: z
    .string()
    .trim()
    .min(2, "El título es obligatorio")
    .max(120, "El título no puede superar los 120 caracteres"),

  description: optionalString(1000),

  priority: z
    .enum(priorities, {
      message: "Prioridad inválida",
    })
    .optional(),

  scheduledAt: optionalDate,

  assignedToId: optionalString(100),
});

export const updateStatusSchema = z.object({
  status: z.enum(operationStatuses, {
    message: "Estado de operación inválido",
  }),

  note: optionalString(500),
});

export const assignOperationSchema = z.object({
  userId: z
    .string()
    .trim()
    .min(1, "El userId es obligatorio")
    .max(100, "El userId no puede superar los 100 caracteres"),
});