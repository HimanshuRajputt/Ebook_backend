// const express = require("express");
// const upload = require("../middleware/upload");
// const uploadController = require("../controllers/uploadController");

// const router = express.Router();

// // Upload ZIP file
// router.post("/upload", upload.single("zip"), uploadController.uploadZip);

// // Get upload status
// router.get("/upload/:uploadId/status", uploadController.getUploadStatus);

// // Get user uploads
// router.get("/user/:userId/uploads", uploadController.getUserUploads);

// // Get specific folder images
// router.get(
//   "/user/:userId/folder/:folderName/images",
//   uploadController.getFolderImages
// );

// module.exports = router;


const express = require("express");
const upload = require("../middleware/upload");
const uploadController = require("../controllers/uploadController");
const { authenticateToken } = require("../middleware/auth");

const router = express.Router();

// All upload routes are protected
router.post(
  "/upload",
  authenticateToken,
  upload.single("zip"),
  uploadController.uploadZip
);
router.get(
  "/upload/:uploadId/status",
  authenticateToken,
  uploadController.getUploadStatus
);
router.get("/uploads", authenticateToken, uploadController.getUserUploads);
router.get(
  "/folder/:folderName/images",
  authenticateToken,
  uploadController.getFolderImages
);

module.exports = router;