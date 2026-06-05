import fs from "fs/promises";
import path from "path";

import { prisma } from "../../config/prisma.js";

const getAttachmentType = (mimeType) => {
  if (mimeType.startsWith("image/")) {
    return "IMAGE";
  }

  if (
    mimeType === "application/pdf" ||
    mimeType.includes("word") ||
    mimeType.includes("excel") ||
    mimeType.includes("spreadsheet")
  ) {
    return "DOCUMENT";
  }

  return "OTHER";
};

const getUploadedFilePath = (file) => {
  if (file?.path) {
    return file.path;
  }

  return path.join(process.cwd(), "uploads", "evidences", file.filename);
};

const removeUploadedFile = async (file) => {
  if (!file) return;

  try {
    await fs.unlink(getUploadedFilePath(file));
  } catch {
    // Si el archivo no existe o ya fue eliminado, no rompemos el flujo.
  }
};

const normalizeDescription = (description) => {
  if (!description) return null;

  const cleanDescription = String(description).trim();

  return cleanDescription || null;
};

export const uploadOperationAttachment = async ({
  tenantId,
  userId,
  operationId,
  file,
  description,
  ip,
  userAgent,
}) => {
  try {
    if (!file) {
      const error = new Error("Archivo requerido");
      error.statusCode = 400;
      throw error;
    }

    const operation = await prisma.operation.findFirst({
      where: {
        id: operationId,
        tenantId,
      },
      select: {
        id: true,
        title: true,
        status: true,
      },
    });

    if (!operation) {
      const error = new Error("Operación no encontrada");
      error.statusCode = 404;
      throw error;
    }

    const relativePath = `uploads/evidences/${file.filename}`;
    const publicUrl = `/uploads/evidences/${file.filename}`;
    const cleanDescription = normalizeDescription(description);

    const result = await prisma.$transaction(async (tx) => {
      const attachment = await tx.attachment.create({
        data: {
          tenantId,
          operationId,
          uploadedById: userId,
          type: getAttachmentType(file.mimetype),
          originalName: file.originalname,
          fileName: file.filename,
          mimeType: file.mimetype,
          size: file.size,
          path: relativePath,
          url: publicUrl,
          description: cleanDescription,
          metadata: {
            fieldname: file.fieldname,
            encoding: file.encoding,
          },
        },
        include: {
          uploadedBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          operation: {
            select: {
              id: true,
              title: true,
              status: true,
            },
          },
        },
      });

      await tx.auditLog.create({
        data: {
          tenantId,
          userId,
          action: "CREATE",
          module: "attachments",
          entity: "Attachment",
          entityId: attachment.id,
          newValue: {
            id: attachment.id,
            operationId,
            originalName: attachment.originalName,
            fileName: attachment.fileName,
            mimeType: attachment.mimeType,
            size: attachment.size,
            type: attachment.type,
            url: attachment.url,
          },
          metadata: {
            event: "UPLOAD_OPERATION_ATTACHMENT",
            operationTitle: operation.title,
            operationStatus: operation.status,
          },
          ip,
          userAgent,
        },
      });

      return attachment;
    });

    return result;
  } catch (error) {
    await removeUploadedFile(file);
    throw error;
  }
};

export const getOperationAttachments = async ({ tenantId, operationId }) => {
  const operation = await prisma.operation.findFirst({
    where: {
      id: operationId,
      tenantId,
    },
    select: {
      id: true,
    },
  });

  if (!operation) {
    const error = new Error("Operación no encontrada");
    error.statusCode = 404;
    throw error;
  }

  return prisma.attachment.findMany({
    where: {
      tenantId,
      operationId,
    },
    include: {
      uploadedBy: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

export const getAttachmentById = async ({ tenantId, attachmentId }) => {
  const attachment = await prisma.attachment.findFirst({
    where: {
      id: attachmentId,
      tenantId,
    },
    include: {
      uploadedBy: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      operation: {
        select: {
          id: true,
          title: true,
          status: true,
        },
      },
    },
  });

  if (!attachment) {
    const error = new Error("Archivo no encontrado");
    error.statusCode = 404;
    throw error;
  }

  return attachment;
};