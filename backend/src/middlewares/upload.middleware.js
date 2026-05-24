const multer = require("multer");
const path = require("path");
const fs = require("fs");

const carpetaCV = path.join(__dirname, "../../uploads/cv");

if (!fs.existsSync(carpetaCV)) {
  fs.mkdirSync(carpetaCV, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, carpetaCV);
  },
  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname);
    const nombreSeguro = file.originalname
      .replace(extension, "")
      .replace(/[^a-zA-Z0-9_-]/g, "_");

    const nombreFinal = `${Date.now()}_${nombreSeguro}${extension}`;

    cb(null, nombreFinal);
  },
});

const fileFilter = (req, file, cb) => {
  const extensionesPermitidas = [".pdf", ".doc", ".docx"];
  const extension = path.extname(file.originalname).toLowerCase();

  if (!extensionesPermitidas.includes(extension)) {
    return cb(new Error("El CV debe estar en formato PDF, DOC o DOCX."));
  }

  cb(null, true);
};

const uploadCV = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

module.exports = uploadCV;