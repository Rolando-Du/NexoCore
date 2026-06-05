import { z } from "zod";

export const auditQuerySchema = z.object({
  module: z.string().optional(),
  action: z
    .enum([
      "CREATE",
      "UPDATE",
      "DELETE",
      "LOGIN",
      "LOGOUT",
      "READ",
      "ASSIGN",
      "STATUS_CHANGE",
    ])
    .optional(),
  userId: z.string().optional(),
  entity: z.string().optional(),
  entityId: z.string().optional(),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
  take: z.coerce.number().min(1).max(100).optional().default(50),
  skip: z.coerce.number().min(0).optional().default(0),
});