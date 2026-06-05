import { z } from "zod";

const requiredText = (fieldName, maxLength = 120) => {
  return z
    .string()
    .trim()
    .min(2, `${fieldName} es obligatorio`)
    .max(maxLength, `${fieldName} no puede superar los ${maxLength} caracteres`);
};

const optionalText = (maxLength = 255) => {
  return z
    .string()
    .trim()
    .max(maxLength, `No puede superar los ${maxLength} caracteres`)
    .optional()
    .or(z.literal(""));
};

const optionalEmail = z
  .string()
  .trim()
  .email("El email no es válido")
  .max(120, "El email no puede superar los 120 caracteres")
  .optional()
  .or(z.literal(""));

const optionalCoordinate = z
  .union([z.number(), z.coerce.number(), z.literal(""), z.null()])
  .optional()
  .transform((value) => {
    if (value === "" || value === null || value === undefined) {
      return undefined;
    }

    return value;
  });

const locationSchema = z.object({
  name: requiredText("El nombre de la sucursal", 120),
  address: optionalText(255),
  city: optionalText(120),
  state: optionalText(120),
  country: optionalText(120),
  lat: optionalCoordinate,
  lng: optionalCoordinate,
});

const contactSchema = z.object({
  name: requiredText("El nombre del contacto", 120),
  email: optionalEmail,
  phone: optionalText(50),
  role: optionalText(120),
});

export const createClientSchema = z.object({
  name: requiredText("El nombre del cliente", 120),
  legalName: optionalText(180),
  taxId: optionalText(50),
  email: optionalEmail,
  phone: optionalText(50),
  locations: z.array(locationSchema).max(20).optional(),
  contacts: z.array(contactSchema).max(20).optional(),
});

export const updateClientSchema = z.object({
  name: requiredText("El nombre del cliente", 120).optional(),
  legalName: optionalText(180),
  taxId: optionalText(50),
  email: optionalEmail,
  phone: optionalText(50),
});