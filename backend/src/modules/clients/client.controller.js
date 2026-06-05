import { ZodError } from "zod";

import { createClientSchema, updateClientSchema } from "./client.schema.js";

import * as clientService from "./client.service.js";

const handleZodError = (error, res) => {
  return res.status(400).json({
    success: false,
    message: "Datos inválidos",
    errors: error.issues,
  });
};

const getRequestMetadata = (req) => {
  return {
    ip: req.ip,
    userAgent: req.headers["user-agent"],
  };
};

export const createClient = async (req, res, next) => {
  try {
    const validatedData = createClientSchema.parse(req.body);
    const metadata = getRequestMetadata(req);

    const client = await clientService.createClient({
      tenantId: req.context.tenant.id,
      userId: req.context.user.id,
      data: validatedData,
      ip: metadata.ip,
      userAgent: metadata.userAgent,
    });

    return res.status(201).json({
      success: true,
      message: "Cliente creado correctamente",
      data: client,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return handleZodError(error, res);
    }

    return next(error);
  }
};

export const getClients = async (req, res, next) => {
  try {
    const includeInactive = req.query.includeInactive !== "false";

    const clients = await clientService.getClients({
      tenantId: req.context.tenant.id,
      includeInactive,
    });

    return res.json({
      success: true,
      message: "Clientes obtenidos correctamente",
      data: clients,
    });
  } catch (error) {
    return next(error);
  }
};

export const getClientById = async (req, res, next) => {
  try {
    const client = await clientService.getClientById({
      tenantId: req.context.tenant.id,
      clientId: req.params.id,
    });

    return res.json({
      success: true,
      message: "Cliente obtenido correctamente",
      data: client,
    });
  } catch (error) {
    return next(error);
  }
};

export const updateClient = async (req, res, next) => {
  try {
    const validatedData = updateClientSchema.parse(req.body);
    const metadata = getRequestMetadata(req);

    const client = await clientService.updateClient({
      tenantId: req.context.tenant.id,
      userId: req.context.user.id,
      clientId: req.params.id,
      data: validatedData,
      ip: metadata.ip,
      userAgent: metadata.userAgent,
    });

    return res.json({
      success: true,
      message: "Cliente actualizado correctamente",
      data: client,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return handleZodError(error, res);
    }

    return next(error);
  }
};

export const disableClient = async (req, res, next) => {
  try {
    const metadata = getRequestMetadata(req);

    const client = await clientService.disableClient({
      tenantId: req.context.tenant.id,
      userId: req.context.user.id,
      clientId: req.params.id,
      ip: metadata.ip,
      userAgent: metadata.userAgent,
    });

    return res.json({
      success: true,
      message: "Cliente deshabilitado correctamente",
      data: client,
    });
  } catch (error) {
    return next(error);
  }
};