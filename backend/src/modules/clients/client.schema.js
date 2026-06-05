import { z } from "zod";

const locationSchema = z.object({
  name: z.string().min(2, "El nombre de la sucursal es obligatorio"),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
});

const contactSchema = z.object({
  name: z.string().min(2, "El nombre del contacto es obligatorio"),
  email: z.string().email("El email no es válido").optional(),
  phone: z.string().optional(),
  role: z.string().optional(),
});

export const createClientSchema = z.object({
  name: z.string().min(2, "El nombre del cliente es obligatorio"),
  legalName: z.string().optional(),
  taxId: z.string().optional(),
  email: z.string().email("El email no es válido").optional(),
  phone: z.string().optional(),
  locations: z.array(locationSchema).optional(),
  contacts: z.array(contactSchema).optional(),
});

export const updateClientSchema = z.object({
  name: z.string().min(2, "El nombre del cliente es obligatorio").optional(),
  legalName: z.string().optional(),
  taxId: z.string().optional(),
  email: z.string().email("El email no es válido").optional(),
  phone: z.string().optional(),
});