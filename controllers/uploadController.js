// // const Upload = require("../models/Upload");
// // const { addToQueue } = require("../utils/imageProcessor");

// // const uploadController = {
// //   // Handle ZIP upload
// //   async uploadZip(req, res) {
// //     try {
// //       const { userId, folderName } = req.body;
// //       const zipFile = req.file;

// //       if (!userId || !folderName || !zipFile) {
// //         return res.status(400).json({
// //           error: "Missing required fields: userId, folderName, or zip file",
// //         });
// //       }

// //       // Create upload record in database
// //       const upload = new Upload({
// //         userId,
// //         folderName,
// //         originalZipName: zipFile.originalname,
// //         status: "processing",
// //       });

// //       await upload.save();

// //       // Add to processing queue
// //       await addToQueue({
// //         uploadId: upload._id.toString(),
// //         zipPath: zipFile.path,
// //         userId,
// //         folderName,
// //       });

// //       res.status(200).json({
// //         message: "ZIP file uploaded successfully. Processing started.",
// //         uploadId: upload._id,
// //         status: "processing",
// //       });
// //     } catch (error) {
// //       console.error("Upload error:", error);
// //       res.status(500).json({
// //         error: "Upload failed",
// //         message: error.message,
// //       });
// //     }
// //   },

// //   // Get upload status
// //   async getUploadStatus(req, res) {
// //     try {
// //       const { uploadId } = req.params;

// //       const upload = await Upload.findById(uploadId);

// //       if (!upload) {
// //         return res.status(404).json({
// //           error: "Upload not found",
// //         });
// //       }

// //       res.json({
// //         uploadId: upload._id,
// //         status: upload.status,
// //         folderName: upload.folderName,
// //         totalImages: upload.totalImages,
// //         processedImages: upload.processedImages,
// //         images: upload.images,
// //         uploadedAt: upload.uploadedAt,
// //         completedAt: upload.completedAt,
// //         errorMessage: upload.errorMessage,
// //       });
// //     } catch (error) {
// //       console.error("Status check error:", error);
// //       res.status(500).json({
// //         error: "Failed to get upload status",
// //         message: error.message,
// //       });
// //     }
// //   },

// //   // Get user uploads
// //   async getUserUploads(req, res) {
// //     try {
// //       const { userId } = req.params;

// //       const uploads = await Upload.find({ userId })
// //         .sort({ uploadedAt: -1 })
// //         .select("-images"); // Exclude images array for performance

// //       res.json({
// //         uploads: uploads.map((upload) => ({
// //           uploadId: upload._id,
// //           folderName: upload.folderName,
// //           status: upload.status,
// //           totalImages: upload.totalImages,
// //           processedImages: upload.processedImages,
// //           uploadedAt: upload.uploadedAt,
// //           completedAt: upload.completedAt,
// //         })),
// //       });
// //     } catch (error) {
// //       console.error("Get user uploads error:", error);
// //       res.status(500).json({
// //         error: "Failed to get user uploads",
// //         message: error.message,
// //       });
// //     }
// //   },

// //   // Get specific folder images
// //   async getFolderImages(req, res) {
// //     try {
// //       const { userId, folderName } = req.params;

// //       const upload = await Upload.findOne({
// //         userId,
// //         folderName,
// //         status: "completed",
// //       });

// //       if (!upload) {
// //         return res.status(404).json({
// //           error: "Folder not found or still processing",
// //         });
// //       }

// //       res.json({
// //         folderName: upload.folderName,
// //         images: upload.images,
// //         totalImages: upload.totalImages,
// //         completedAt: upload.completedAt,
// //       });
// //     } catch (error) {
// //       console.error("Get folder images error:", error);
// //       res.status(500).json({
// //         error: "Failed to get folder images",
// //         message: error.message,
// //       });
// //     }
// //   },
// // };

// // module.exports = uploadController;

// // +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

//     // new update
// //---------------------------------------------------------------------------------
// // const Upload = require("../models/Upload");
// // const yauzl = require("yauzl");
// // const sharp = require("sharp");
// // const fs = require("fs-extra");
// // const path = require("path");

// // // Ensure processed directory exists
// // const processedDir = path.join(__dirname, "../processed/images");
// // fs.ensureDirSync(processedDir);

// // const uploadController = {
// //   // Handle ZIP upload - Process immediately
// //   async uploadZip(req, res) {
// //     try {
// //       const { userId, folderName } = req.body;
// //       const zipFile = req.file;

// //       if (!userId || !folderName || !zipFile) {
// //         return res.status(400).json({
// //           error: "Missing required fields: userId, folderName, or zip file",
// //         });
// //       }

// //       // Create upload record in database
// //       const upload = new Upload({
// //         userId,
// //         folderName,
// //         originalZipName: zipFile.originalname,
// //         status: "processing",
// //       });

// //       await upload.save();

// //       // Process immediately (no queue)
// //       try {
// //         const images = await extractAndProcessImages(
// //           zipFile.path,
// //           userId,
// //           folderName,
// //           upload._id
// //         );

// //         // Update upload record with processed images
// //         await Upload.findByIdAndUpdate(upload._id, {
// //           images,
// //           totalImages: images.length,
// //           processedImages: images.length,
// //           status: "completed",
// //           completedAt: new Date(),
// //         });

// //         // Clean up temp zip file
// //         await fs.remove(zipFile.path);

// //         res.status(200).json({
// //           message: `ZIP file processed successfully! ${images.length} images processed.`,
// //           uploadId: upload._id,
// //           status: "completed",
// //           totalImages: images.length,
// //           images: images,
// //         });
// //       } catch (processError) {
// //         console.error("Processing error:", processError);

// //         // Update upload record with error
// //         await Upload.findByIdAndUpdate(upload._id, {
// //           status: "failed",
// //           errorMessage: processError.message,
// //           completedAt: new Date(),
// //         });

// //         // Clean up temp zip file
// //         try {
// //           await fs.remove(zipFile.path);
// //         } catch (cleanupError) {
// //           console.error("Error cleaning up zip file:", cleanupError);
// //         }

// //         res.status(500).json({
// //           error: "Processing failed",
// //           message: processError.message,
// //         });
// //       }
// //     } catch (error) {
// //       console.error("Upload error:", error);
// //       res.status(500).json({
// //         error: "Upload failed",
// //         message: error.message,
// //       });
// //     }
// //   },

// //   // Get upload status
// //   async getUploadStatus(req, res) {
// //     try {
// //       const { uploadId } = req.params;

// //       const upload = await Upload.findById(uploadId);

// //       if (!upload) {
// //         return res.status(404).json({
// //           error: "Upload not found",
// //         });
// //       }

// //       res.json({
// //         uploadId: upload._id,
// //         status: upload.status,
// //         folderName: upload.folderName,
// //         totalImages: upload.totalImages,
// //         processedImages: upload.processedImages,
// //         images: upload.images,
// //         uploadedAt: upload.uploadedAt,
// //         completedAt: upload.completedAt,
// //         errorMessage: upload.errorMessage,
// //       });
// //     } catch (error) {
// //       console.error("Status check error:", error);
// //       res.status(500).json({
// //         error: "Failed to get upload status",
// //         message: error.message,
// //       });
// //     }
// //   },

// //   // Get user uploads
// //   async getUserUploads(req, res) {
// //     try {
// //       const { userId } = req.params;

// //       const uploads = await Upload.find({ userId })
// //         .sort({ uploadedAt: -1 })
// //         .select("-images"); // Exclude images array for performance

// //       res.json({
// //         uploads: uploads.map((upload) => ({
// //           uploadId: upload._id,
// //           folderName: upload.folderName,
// //           status: upload.status,
// //           totalImages: upload.totalImages,
// //           processedImages: upload.processedImages,
// //           uploadedAt: upload.uploadedAt,
// //           completedAt: upload.completedAt,
// //         })),
// //       });
// //     } catch (error) {
// //       console.error("Get user uploads error:", error);
// //       res.status(500).json({
// //         error: "Failed to get user uploads",
// //         message: error.message,
// //       });
// //     }
// //   },

// //   // Get specific folder images
// //   async getFolderImages(req, res) {
// //     try {
// //       const { userId, folderName } = req.params;

// //       const upload = await Upload.findOne({
// //         userId,
// //         folderName,
// //         status: "completed",
// //       });

// //       if (!upload) {
// //         return res.status(404).json({
// //           error: "Folder not found or still processing",
// //         });
// //       }

// //       res.json({
// //         folderName: upload.folderName,
// //         images: upload.images,
// //         totalImages: upload.totalImages,
// //         completedAt: upload.completedAt,
// //       });
// //     } catch (error) {
// //       console.error("Get folder images error:", error);
// //       res.status(500).json({
// //         error: "Failed to get folder images",
// //         message: error.message,
// //       });
// //     }
// //   },
// // };

// // async function extractAndProcessImages(zipPath, userId, folderName, uploadId) {
// //   return new Promise((resolve, reject) => {
// //     const images = [];
// //     const userFolder = path.join(processedDir, userId, folderName);

// //     // Ensure user folder exists
// //     fs.ensureDirSync(userFolder);

// //     yauzl.open(zipPath, { lazyEntries: true }, (err, zipfile) => {
// //       if (err) return reject(err);

// //       zipfile.readEntry();

// //       zipfile.on("entry", (entry) => {
// //         // Skip directories and non-image files
// //         if (/\/$/.test(entry.fileName) || !isImageFile(entry.fileName)) {
// //           zipfile.readEntry();
// //           return;
// //         }

// //         zipfile.openReadStream(entry, async (err, readStream) => {
// //           if (err) {
// //             console.error("Error reading entry:", err);
// //             zipfile.readEntry();
// //             return;
// //           }

// //           try {
// //             const originalName = path.basename(entry.fileName);
// //             const processedName = `${Date.now()}_${originalName}`;
// //             const outputPath = path.join(userFolder, processedName);

// //             // Process image with Sharp (resize and optimize)
// //             const transformer = sharp()
// //               .resize(1920, 1080, {
// //                 fit: "inside",
// //                 withoutEnlargement: true,
// //               })
// //               .jpeg({ quality: 85 });

// //             const writeStream = fs.createWriteStream(outputPath);

// //             readStream
// //               .pipe(transformer)
// //               .pipe(writeStream)
// //               .on("finish", async () => {
// //                 try {
// //                   const stats = await fs.stat(outputPath);
// //                   const imageUrl = `/processed/images/${userId}/${folderName}/${processedName}`;

// //                   images.push({
// //                     originalName,
// //                     processedName,
// //                     url: imageUrl,
// //                     size: stats.size,
// //                     processedAt: new Date(),
// //                   });

// //                   // Update progress in database
// //                   await Upload.findByIdAndUpdate(uploadId, {
// //                     processedImages: images.length,
// //                   });

// //                   zipfile.readEntry();
// //                 } catch (statError) {
// //                   console.error("Error getting file stats:", statError);
// //                   zipfile.readEntry();
// //                 }
// //               })
// //               .on("error", (writeError) => {
// //                 console.error("Error writing processed image:", writeError);
// //                 zipfile.readEntry();
// //               });
// //           } catch (processError) {
// //             console.error("Error processing image:", processError);
// //             zipfile.readEntry();
// //           }
// //         });
// //       });

// //       zipfile.on("end", () => {
// //         setTimeout(() => resolve(images), 1000); // Small delay to ensure all async operations complete
// //       });

// //       zipfile.on("error", reject);
// //     });
// //   });
// // }

// // function isImageFile(filename) {
// //   const imageExtensions = [
// //     ".jpg",
// //     ".jpeg",
// //     ".png",
// //     ".gif",
// //     ".bmp",
// //     ".webp",
// //     ".tiff",
// //   ];
// //   const ext = path.extname(filename).toLowerCase();
// //   return imageExtensions.includes(ext);
// // }

// // module.exports = uploadController;



// // ==================================================
// //  zip fiel save in db code
// //===========================================

// const Upload = require("../models/Upload");
// const yauzl = require("yauzl");
// const sharp = require("sharp");
// const fs = require("fs-extra");
// const path = require("path");

// // Ensure processed directory exists
// const processedDir = path.join(__dirname, "../processed/images");
// fs.ensureDirSync(processedDir);

// const uploadController = {
//   // Handle ZIP upload - Process immediately
//   async uploadZip(req, res) {
//     try {
//       const { userId, folderName } = req.body;
//       const zipFile = req.file;

//       if (!userId || !folderName || !zipFile) {
//         return res.status(400).json({
//           error: "Missing required fields: userId, folderName, or zip file",
//         });
//       }

//       // Create permanent directory for ZIP files
//       const permanentZipDir = path.join(__dirname, "../processed/zips", userId);
//       fs.ensureDirSync(permanentZipDir);

//       // Move ZIP to permanent location
//       const permanentZipName = `${Date.now()}_${zipFile.originalname}`;
//       const permanentZipPath = path.join(permanentZipDir, permanentZipName);
//       await fs.move(zipFile.path, permanentZipPath);

//       // Create upload record in database
//       const upload = new Upload({
//         userId,
//         folderName,
//         originalZipName: zipFile.originalname,
//         zipFilePath: permanentZipPath,
//         zipFileUrl: `/processed/zips/${userId}/${permanentZipName}`,
//         status: "processing",
//       });

//       await upload.save();

//       // Process immediately (no queue) - use permanent zip path
//       try {
//         const images = await extractAndProcessImages(
//           permanentZipPath,
//           userId,
//           folderName,
//           upload._id
//         );

//         // Update upload record with processed images (keep ZIP file)
//         await Upload.findByIdAndUpdate(upload._id, {
//           images,
//           totalImages: images.length,
//           processedImages: images.length,
//           status: "completed",
//           completedAt: new Date(),
//         });

//         // DON'T delete ZIP file - it's now permanent

//         res.status(200).json({
//           message: `ZIP file processed successfully! ${images.length} images processed.`,
//           uploadId: upload._id,
//           status: "completed",
//           totalImages: images.length,
//           images: images,
//           zipFileUrl: upload.zipFileUrl,
//         });
//       } catch (processError) {
//         console.error("Processing error:", processError);

//         // Update upload record with error
//         await Upload.findByIdAndUpdate(upload._id, {
//           status: "failed",
//           errorMessage: processError.message,
//           completedAt: new Date(),
//         });

//         // Clean up temp zip file only if it still exists in temp location
//         if (zipFile.path !== permanentZipPath) {
//           try {
//             await fs.remove(zipFile.path);
//           } catch (cleanupError) {
//             console.error("Error cleaning up temp zip file:", cleanupError);
//           }
//         }

//         res.status(500).json({
//           error: "Processing failed",
//           message: processError.message,
//         });
//       }
//     } catch (error) {
//       console.error("Upload error:", error);
//       res.status(500).json({
//         error: "Upload failed",
//         message: error.message,
//       });
//     }
//   },

//   // Get upload status
//   async getUploadStatus(req, res) {
//     try {
//       const { uploadId } = req.params;

//       const upload = await Upload.findById(uploadId);

//       if (!upload) {
//         return res.status(404).json({
//           error: "Upload not found",
//         });
//       }

//       res.json({
//         uploadId: upload._id,
//         status: upload.status,
//         folderName: upload.folderName,
//         totalImages: upload.totalImages,
//         processedImages: upload.processedImages,
//         images: upload.images,
//         uploadedAt: upload.uploadedAt,
//         completedAt: upload.completedAt,
//         errorMessage: upload.errorMessage,
//       });
//     } catch (error) {
//       console.error("Status check error:", error);
//       res.status(500).json({
//         error: "Failed to get upload status",
//         message: error.message,
//       });
//     }
//   },

//   // Get user uploads
//   async getUserUploads(req, res) {
//     try {
//       const { userId } = req.params;

//       const uploads = await Upload.find({ userId })
//         .sort({ uploadedAt: -1 })
//         .select("-images"); // Exclude images array for performance

//       res.json({
//         uploads: uploads.map((upload) => ({
//           uploadId: upload._id,
//           folderName: upload.folderName,
//           status: upload.status,
//           totalImages: upload.totalImages,
//           processedImages: upload.processedImages,
//           uploadedAt: upload.uploadedAt,
//           completedAt: upload.completedAt,
//         })),
//       });
//     } catch (error) {
//       console.error("Get user uploads error:", error);
//       res.status(500).json({
//         error: "Failed to get user uploads",
//         message: error.message,
//       });
//     }
//   },

//   // Get specific folder images
//   async getFolderImages(req, res) {
//     try {
//       const { userId, folderName } = req.params;

//       const upload = await Upload.findOne({
//         userId,
//         folderName,
//         status: "completed",
//       });

//       if (!upload) {
//         return res.status(404).json({
//           error: "Folder not found or still processing",
//         });
//       }

//       res.json({
//         folderName: upload.folderName,
//         images: upload.images,
//         totalImages: upload.totalImages,
//         completedAt: upload.completedAt,
//         zipFileUrl: upload.zipFileUrl,
//         originalZipName: upload.originalZipName,
//       });
//     } catch (error) {
//       console.error("Get folder images error:", error);
//       res.status(500).json({
//         error: "Failed to get folder images",
//         message: error.message,
//       });
//     }
//   },
// };

// async function extractAndProcessImages(zipPath, userId, folderName, uploadId) {
//   return new Promise((resolve, reject) => {
//     const images = [];
//     const userFolder = path.join(processedDir, userId, folderName);

//     // Ensure user folder exists
//     fs.ensureDirSync(userFolder);

//     yauzl.open(zipPath, { lazyEntries: true }, (err, zipfile) => {
//       if (err) return reject(err);

//       zipfile.readEntry();

//       zipfile.on("entry", (entry) => {
//         // Skip directories and non-image files
//         if (/\/$/.test(entry.fileName) || !isImageFile(entry.fileName)) {
//           zipfile.readEntry();
//           return;
//         }

//         zipfile.openReadStream(entry, async (err, readStream) => {
//           if (err) {
//             console.error("Error reading entry:", err);
//             zipfile.readEntry();
//             return;
//           }

//           try {
//             const originalName = path.basename(entry.fileName);
//             const processedName = `${Date.now()}_${originalName}`;
//             const outputPath = path.join(userFolder, processedName);

//             // Process image with Sharp (resize and optimize)
//             const transformer = sharp()
//               .resize(1920, 1080, {
//                 fit: "inside",
//                 withoutEnlargement: true,
//               })
//               .jpeg({ quality: 85 });

//             const writeStream = fs.createWriteStream(outputPath);

//             readStream
//               .pipe(transformer)
//               .pipe(writeStream)
//               .on("finish", async () => {
//                 try {
//                   const stats = await fs.stat(outputPath);
//                   const imageUrl = `/processed/images/${userId}/${folderName}/${processedName}`;

//                   images.push({
//                     originalName,
//                     processedName,
//                     url: imageUrl,
//                     size: stats.size,
//                     processedAt: new Date(),
//                   });

//                   // Update progress in database
//                   await Upload.findByIdAndUpdate(uploadId, {
//                     processedImages: images.length,
//                   });

//                   zipfile.readEntry();
//                 } catch (statError) {
//                   console.error("Error getting file stats:", statError);
//                   zipfile.readEntry();
//                 }
//               })
//               .on("error", (writeError) => {
//                 console.error("Error writing processed image:", writeError);
//                 zipfile.readEntry();
//               });
//           } catch (processError) {
//             console.error("Error processing image:", processError);
//             zipfile.readEntry();
//           }
//         });
//       });

//       zipfile.on("end", () => {
//         setTimeout(() => resolve(images), 1000); // Small delay to ensure all async operations complete
//       });

//       zipfile.on("error", reject);
//     });
//   });
// }

// function isImageFile(filename) {
//   const imageExtensions = [
//     ".jpg",
//     ".jpeg",
//     ".png",
//     ".gif",
//     ".bmp",
//     ".webp",
//     ".tiff",
//   ];
//   const ext = path.extname(filename).toLowerCase();
//   return imageExtensions.includes(ext);
// }

// module.exports = uploadController;

const Upload = require("../models/Upload");
const yauzl = require("yauzl");
const sharp = require("sharp");
const fs = require("fs-extra");
const path = require("path");

// Ensure processed directory exists
const processedDir = path.join(__dirname, "../processed/images");
fs.ensureDirSync(processedDir);

const uploadController = {
  // Handle ZIP upload - Process immediately
  async uploadZip(req, res) {
    try {
      const { folderName } = req.body;
      const zipFile = req.file;
      const userId = req.user._id.toString(); // Get userId from authenticated user

      if (!folderName || !zipFile) {
        return res.status(400).json({
          error: "Missing required fields: folderName or zip file",
        });
      }

      // Create permanent directory for ZIP files
      const permanentZipDir = path.join(__dirname, "../processed/zips", userId);
      fs.ensureDirSync(permanentZipDir);

      // Move ZIP to permanent location
      const permanentZipName = `${Date.now()}_${zipFile.originalname}`;
      const permanentZipPath = path.join(permanentZipDir, permanentZipName);
      await fs.move(zipFile.path, permanentZipPath);

      // Create upload record in database
      const upload = new Upload({
        userId,
        folderName,
        originalZipName: zipFile.originalname,
        zipFilePath: permanentZipPath,
        zipFileUrl: `/processed/zips/${userId}/${permanentZipName}`,
        status: "processing",
      });

      await upload.save();

      // Process immediately (no queue) - use permanent zip path
      try {
        const images = await extractAndProcessImages(
          permanentZipPath,
          userId,
          folderName,
          upload._id
        );

        // Update upload record with processed images (keep ZIP file)
        await Upload.findByIdAndUpdate(upload._id, {
          images,
          totalImages: images.length,
          processedImages: images.length,
          status: "completed",
          completedAt: new Date(),
        });

        // DON'T delete ZIP file - it's now permanent

        res.status(200).json({
          message: `ZIP file processed successfully! ${images.length} images processed.`,
          uploadId: upload._id,
          status: "completed",
          totalImages: images.length,
          images: images,
          zipFileUrl: upload.zipFileUrl,
        });
      } catch (processError) {
        console.error("Processing error:", processError);

        // Update upload record with error
        await Upload.findByIdAndUpdate(upload._id, {
          status: "failed",
          errorMessage: processError.message,
          completedAt: new Date(),
        });

        // Clean up temp zip file only if it still exists in temp location
        if (zipFile.path !== permanentZipPath) {
          try {
            await fs.remove(zipFile.path);
          } catch (cleanupError) {
            console.error("Error cleaning up temp zip file:", cleanupError);
          }
        }

        res.status(500).json({
          error: "Processing failed",
          message: processError.message,
        });
      }
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({
        error: "Upload failed",
        message: error.message,
      });
    }
  },

  // Get upload status
  async getUploadStatus(req, res) {
    try {
      const { uploadId } = req.params;

      const upload = await Upload.findById(uploadId);

      if (!upload) {
        return res.status(404).json({
          error: "Upload not found",
        });
      }

      res.json({
        uploadId: upload._id,
        status: upload.status,
        folderName: upload.folderName,
        totalImages: upload.totalImages,
        processedImages: upload.processedImages,
        images: upload.images,
        uploadedAt: upload.uploadedAt,
        completedAt: upload.completedAt,
        errorMessage: upload.errorMessage,
      });
    } catch (error) {
      console.error("Status check error:", error);
      res.status(500).json({
        error: "Failed to get upload status",
        message: error.message,
      });
    }
  },

  // Get user uploads
  async getUserUploads(req, res) {
    try {
      const userId = req.user._id.toString(); // Get userId from authenticated user

      const uploads = await Upload.find({ userId })
        .sort({ uploadedAt: -1 })
        .select("-images"); // Exclude images array for performance

      res.json({
        uploads: uploads.map((upload) => ({
          uploadId: upload._id,
          folderName: upload.folderName,
          status: upload.status,
          totalImages: upload.totalImages,
          processedImages: upload.processedImages,
          uploadedAt: upload.uploadedAt,
          completedAt: upload.completedAt,
        })),
      });
    } catch (error) {
      console.error("Get user uploads error:", error);
      res.status(500).json({
        error: "Failed to get user uploads",
        message: error.message,
      });
    }
  },

  // Get specific folder images
  async getFolderImages(req, res) {
    try {
      const { folderName } = req.params;
      const userId = req.user._id.toString(); // Get userId from authenticated user

      const upload = await Upload.findOne({
        userId,
        folderName,
        status: "completed",
      });

      if (!upload) {
        return res.status(404).json({
          error: "Folder not found or still processing",
        });
      }

      res.json({
        folderName: upload.folderName,
        images: upload.images,
        totalImages: upload.totalImages,
        completedAt: upload.completedAt,
        zipFileUrl: upload.zipFileUrl,
        originalZipName: upload.originalZipName,
      });
    } catch (error) {
      console.error("Get folder images error:", error);
      res.status(500).json({
        error: "Failed to get folder images",
        message: error.message,
      });
    }
  },
};

async function extractAndProcessImages(zipPath, userId, folderName, uploadId) {
  return new Promise((resolve, reject) => {
    const images = [];
    const userFolder = path.join(processedDir, userId, folderName);

    // Ensure user folder exists
    fs.ensureDirSync(userFolder);

    yauzl.open(zipPath, { lazyEntries: true }, (err, zipfile) => {
      if (err) return reject(err);

      zipfile.readEntry();

      zipfile.on("entry", (entry) => {
        // Skip directories and non-image files
        if (/\/$/.test(entry.fileName) || !isImageFile(entry.fileName)) {
          zipfile.readEntry();
          return;
        }

        zipfile.openReadStream(entry, async (err, readStream) => {
          if (err) {
            console.error("Error reading entry:", err);
            zipfile.readEntry();
            return;
          }

          try {
            const originalName = path.basename(entry.fileName);
            const processedName = `${Date.now()}_${originalName}`;
            const outputPath = path.join(userFolder, processedName);

            // Process image with Sharp (resize and optimize)
            const transformer = sharp()
              .resize(1920, 1080, {
                fit: "inside",
                withoutEnlargement: true,
              })
              .jpeg({ quality: 85 });

            const writeStream = fs.createWriteStream(outputPath);

            readStream
              .pipe(transformer)
              .pipe(writeStream)
              .on("finish", async () => {
                try {
                  const stats = await fs.stat(outputPath);
                  const imageUrl = `/processed/images/${userId}/${folderName}/${processedName}`;

                  images.push({
                    originalName,
                    processedName,
                    url: imageUrl,
                    size: stats.size,
                    processedAt: new Date(),
                  });

                  // Update progress in database
                  await Upload.findByIdAndUpdate(uploadId, {
                    processedImages: images.length,
                  });

                  zipfile.readEntry();
                } catch (statError) {
                  console.error("Error getting file stats:", statError);
                  zipfile.readEntry();
                }
              })
              .on("error", (writeError) => {
                console.error("Error writing processed image:", writeError);
                zipfile.readEntry();
              });
          } catch (processError) {
            console.error("Error processing image:", processError);
            zipfile.readEntry();
          }
        });
      });

      zipfile.on("end", () => {
        setTimeout(() => resolve(images), 1000); // Small delay to ensure all async operations complete
      });

      zipfile.on("error", reject);
    });
  });
}

function isImageFile(filename) {
  const imageExtensions = [
    ".jpg",
    ".jpeg",
    ".png",
    ".gif",
    ".bmp",
    ".webp",
    ".tiff",
  ];
  const ext = path.extname(filename).toLowerCase();
  return imageExtensions.includes(ext);
}

module.exports = uploadController;