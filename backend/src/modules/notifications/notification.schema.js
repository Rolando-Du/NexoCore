import { z } from "zod";

export const notificationQuerySchema = z.object({
  status: z.enum(["UNREAD", "READ", "ARCHIVED"]).optional(),
  take: z.coerce.number().min(1).max(100).optional().default(50),
  skip: z.coerce.number().min(0).optional().default(0),
});