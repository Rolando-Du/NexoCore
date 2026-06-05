import multer from "multer";
import path from "path";
import fs from "fs";
import crypto from "crypto";

const uploadDir = path.join(process.cwd(), "uploads", "evidences");

const maxFileSize = 10 * 1024 * 1024;

const allowedFiles = {
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
  "image/webp": [".webp"],
  "application/pdf": [".pdf"],
  "application/msword": [".doc"],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [
    ".docx",
  ],
  "application/vnd.ms-excel": [".xls"],
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
    ".xlsx",
  ],
};

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const createSafeFileName = (originalName) => {
  const extension = path.extname(originalName).toLowerCase();
  const baseName = path.basename(originalName, extension);

  const safeBaseName =
    baseName
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 40) || "evidencia";

  const uniqueSuffix = `${Date.now()}-${crypto.randomUUID()}`;

  return `${safeBaseName}-${uniqueSuffix}${extension}`;
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },

  filename: (req, file, cb) => {
    cb(null, createSafeFileName(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  const allowedExtensions = allowedFiles[file.mimetype];
  const fileExtension = path.extname(file.originalname).toLowerCase();

  if (!allowedExtensions || !allowedExtensions.includes(fileExtension)) {
    const error = new Error(
      "Tipo de archivo no permitido. Solo se permiten imágenes, PDF, Word y Excel."
    );

    error.statusCode = 400;
    return cb(error);
  }

  return cb(null, true);
};

export const uploadEvidence = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: maxFileSize,
    files: 1,
  },
});