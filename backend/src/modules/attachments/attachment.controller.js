import fs from "fs/promises";
import { ZodError } from "zod";

import { uploadAttachmentSchema } from "./attachment.schema.js";
import * as attachmentService from "./attachment.service.js";

const removeUploadedFile = async (file) => {
  if (!file?.path) return;

  try {
    await fs.unlink(file.path);
  } catch {
    // Si el archivo no existe o ya fue eliminado, no rompemos la respuesta.
  }
};

const handleValidationError = async ({ error, req, res }) => {
  await removeUploadedFile(req.file);

  return res.status(400).json({
    success: false,
    message: "Datos inválidos",
    errors: error.issues,
  });
};

export const uploadOperationAttachment = async (req, res, next) => {
  try {
    const validatedData = uploadAttachmentSchema.parse(req.body);

    const attachment = await attachmentService.uploadOperationAttachment({
      tenantId: req.context.tenant.id,
      userId: req.context.user.id,
      operationId: req.params.operationId,
      file: req.file,
      description: validatedData.description,
      ip: req.ip,
      userAgent: req.headers["user-agent"],
    });

    return res.status(201).json({
      success: true,
      message: "Evidencia subida correctamente",
      data: attachment,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return handleValidationError({ error, req, res });
    }

    return next(error);
  }
};

export const getOperationAttachments = async (req, res, next) => {
  try {
    const attachments = await attachmentService.getOperationAttachments({
      tenantId: req.context.tenant.id,
      operationId: req.params.operationId,
    });

    return res.json({
      success: true,
      message: "Evidencias obtenidas correctamente",
      data: attachments,
    });
  } catch (error) {
    return next(error);
  }
};

export const getAttachmentById = async (req, res, next) => {
  try {
    const attachment = await attachmentService.getAttachmentById({
      tenantId: req.context.tenant.id,
      attachmentId: req.params.id,
    });

    return res.json({
      success: true,
      message: "Archivo obtenido correctamente",
      data: attachment,
    });
  } catch (error) {
    return next(error);
  }
};