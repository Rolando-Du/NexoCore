import { z } from "zod";

export const uploadAttachmentSchema = z.object({
  description: z
    .string()
    .trim()
    .max(500, "La descripción no puede superar los 500 caracteres")
    .optional()
    .or(z.literal("")),
});