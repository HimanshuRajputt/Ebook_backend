const multer = require("multer");
const path = require("path");
const fs = require("fs-extra");

// Ensure upload directories exist
const uploadDir = path.join(__dirname, "../uploads/temp");
fs.ensureDirSync(uploadDir);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Create unique filename with timestamp and user ID
    const uniqueName = `${req.body.userId}_${Date.now()}_${file.originalname}`;
    cb(null, uniqueName);
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "application/zip" ||
    file.mimetype === "application/x-zip-compressed" ||
    path.extname(file.originalname).toLowerCase() === ".zip"
  ) {
    cb(null, true);
  } else {
    cb(new Error("Only ZIP files are allowed"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
  },
});

module.exports = upload;
