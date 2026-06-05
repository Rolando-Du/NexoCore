import {
  createClientSchema,
  updateClientSchema,
} from "./client.schema.js";

import * as clientService from "./client.service.js";

export const createClient = async (req, res, next) => {
  try {
    const validatedData = createClientSchema.parse(req.body);

    const client = await clientService.createClient({
      tenantId: req.context.tenant.id,
      userId: req.context.user.id,
      data: validatedData,
      ip: req.ip,
      userAgent: req.headers["user-agent"],
    });

    res.status(201).json({
      success: true,
      message: "Cliente creado correctamente",
      data: client,
    });
  } catch (error) {
    if (error.name === "ZodError") {
      return res.status(400).json({
        success: false,
        message: "Datos inválidos",
        errors: error.issues,
      });
    }

    next(error);
  }
};

export const getClients = async (req, res, next) => {
  try {
    const clients = await clientService.getClients({
      tenantId: req.context.tenant.id,
    });

    res.json({
      success: true,
      message: "Clientes obtenidos correctamente",
      data: clients,
    });
  } catch (error) {
    next(error);
  }
};

export const getClientById = async (req, res, next) => {
  try {
    const client = await clientService.getClientById({
      tenantId: req.context.tenant.id,
      clientId: req.params.id,
    });

    res.json({
      success: true,
      message: "Cliente obtenido correctamente",
      data: client,
    });
  } catch (error) {
    next(error);
  }
};

export const updateClient = async (req, res, next) => {
  try {
    const validatedData = updateClientSchema.parse(req.body);

    const client = await clientService.updateClient({
      tenantId: req.context.tenant.id,
      userId: req.context.user.id,
      clientId: req.params.id,
      data: validatedData,
      ip: req.ip,
      userAgent: req.headers["user-agent"],
    });

    res.json({
      success: true,
      message: "Cliente actualizado correctamente",
      data: client,
    });
  } catch (error) {
    if (error.name === "ZodError") {
      return res.status(400).json({
        success: false,
        message: "Datos inválidos",
        errors: error.issues,
      });
    }

    next(error);
  }
};

export const disableClient = async (req, res, next) => {
  try {
    const client = await clientService.disableClient({
      tenantId: req.context.tenant.id,
      userId: req.context.user.id,
      clientId: req.params.id,
      ip: req.ip,
      userAgent: req.headers["user-agent"],
    });

    res.json({
      success: true,
      message: "Cliente deshabilitado correctamente",
      data: client,
    });
  } catch (error) {
    next(error);
  }
};