import { z } from "zod";

export const registerTenantSchema = z.object({
  companyName: z
    .string()
    .min(2, "El nombre de la empresa es obligatorio"),

  legalName: z.string().optional(),

  taxId: z.string().optional(),

  adminName: z
    .string()
    .min(2, "El nombre del administrador es obligatorio"),

  adminEmail: z
    .string()
    .email("El email no es válido"),

  adminPassword: z
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres"),
});

export const loginSchema = z.object({
  email: z
    .string()
    .email("El email no es válido"),

  password: z
    .string()
    .min(1, "La contraseña es obligatoria"),

  tenantId: z
    .string()
    .min(1, "El tenantId es obligatorio"),
});