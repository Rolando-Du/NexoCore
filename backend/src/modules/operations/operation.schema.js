import { z } from "zod";

export const createOperationSchema = z.object({
  clientId: z.string().optional(),

  type: z.enum([
    "TASK",
    "WORK_ORDER",
    "INCIDENT",
    "INSPECTION",
    "SERVICE_REQUEST",
  ]),

  title: z.string().min(2, "El título es obligatorio"),

  description: z.string().optional(),

  priority: z
    .enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"])
    .optional(),

  scheduledAt: z.coerce.date().optional(),

  assignedToId: z.string().optional(),
});

export const updateStatusSchema = z.object({
  status: z.enum([
    "DRAFT",
    "PENDING",
    "IN_PROGRESS",
    "PAUSED",
    "COMPLETED",
    "CANCELLED",
  ]),

  note: z.string().optional(),
});

export const assignOperationSchema = z.object({
  userId: z.string().min(1, "El userId es obligatorio"),
});