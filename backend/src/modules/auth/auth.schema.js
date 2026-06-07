import { z } from "zod";

const requiredText = (fieldName, maxLength = 120) => {
  return z
    .string()
    .trim()
    .min(2, `${fieldName} es obligatorio`)
    .max(maxLength, `${fieldName} no puede superar los ${maxLength} caracteres`);
};

const optionalText = (maxLength = 180) => {
  return z
    .string()
    .trim()
    .max(maxLength, `No puede superar los ${maxLength} caracteres`)
    .optional()
    .or(z.literal(""));
};

const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email("El email no es válido")
  .max(120, "El email no puede superar los 120 caracteres");

export const registerTenantSchema = z.object({
  companyName: requiredText("El nombre de la empresa", 120),

  legalName: optionalText(180),

  taxId: optionalText(50),

  adminName: requiredText("El nombre del administrador", 120),

  adminEmail: emailSchema,

  adminPassword: z
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .max(72, "La contraseña no puede superar los 72 caracteres")
    .regex(/[A-Z]/, "La contraseña debe incluir al menos una mayúscula")
    .regex(/[a-z]/, "La contraseña debe incluir al menos una minúscula")
    .regex(/[0-9]/, "La contraseña debe incluir al menos un número"),
});

export const loginSchema = z.object({
  email: emailSchema,

  password: z.string().min(1, "La contraseña es obligatoria"),

  tenantId: z
    .string()
    .trim()
    .min(1, "El tenantId es obligatorio")
    .max(100, "El tenantId no puede superar los 100 caracteres"),
});