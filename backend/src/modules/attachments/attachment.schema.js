import { z } from "zod";

export const uploadAttachmentSchema = z.object({
  description: z.string().optional(),
});