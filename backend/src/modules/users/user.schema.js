import { z } from "zod";

const requiredText = (fieldName, maxLength = 120) => {
  return z
    .string()
    .trim()
    .min(2, `${fieldName} es obligatorio`)
    .max(maxLength, `${fieldName} no puede superar los ${maxLength} caracteres`);
};

const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email("El email no es válido")
  .max(120, "El email no puede superar los 120 caracteres");

export const createUserSchema = z.object({
  name: requiredText("El nombre del usuario", 120),

  email: emailSchema,

  password: z
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .max(72, "La contraseña no puede superar los 72 caracteres")
    .regex(/[A-Z]/, "La contraseña debe incluir al menos una mayúscula")
    .regex(/[a-z]/, "La contraseña debe incluir al menos una minúscula")
    .regex(/[0-9]/, "La contraseña debe incluir al menos un número"),

  roleId: z
    .string()
    .trim()
    .min(1, "El roleId es obligatorio")
    .max(100, "El roleId no puede superar los 100 caracteres"),
});

export const updateUserSchema = z.object({
  name: requiredText("El nombre del usuario", 120).optional(),

  roleId: z
    .string()
    .trim()
    .min(1, "El roleId es obligatorio")
    .max(100, "El roleId no puede superar los 100 caracteres")
    .optional(),

  status: z.enum(["ACTIVE", "INACTIVE", "BLOCKED"]).optional(),
});