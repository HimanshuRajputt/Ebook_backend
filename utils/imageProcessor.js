const Bull = require("bull");
const yauzl = require("yauzl");
const sharp = require("sharp");
const fs = require("fs-extra");
const path = require("path");
const Upload = require("../models/Upload");

// Create Redis queue
const imageProcessingQueue = new Bull("image processing", {
  redis: {
    host: process.env.REDIS_HOST || "localhost",
    port: process.env.REDIS_PORT || 6379,
  },
});

// Ensure processed directory exists
const processedDir = path.join(__dirname, "../processed/images");
fs.ensureDirSync(processedDir);

// Queue processor
imageProcessingQueue.process(5, async (job) => {
  const { uploadId, zipPath, userId, folderName } = job.data;

  try {
    console.log(`Processing upload ${uploadId}...`);

    // Update status to processing
    await Upload.findByIdAndUpdate(uploadId, { status: "processing" });

    const images = await extractAndProcessImages(
      zipPath,
      userId,
      folderName,
      uploadId
    );

    // Update upload record with processed images
    await Upload.findByIdAndUpdate(uploadId, {
      images,
      totalImages: images.length,
      processedImages: images.length,
      status: "completed",
      completedAt: new Date(),
    });

    // Clean up temp zip file
    await fs.remove(zipPath);

    console.log(`Completed processing upload ${uploadId}`);
  } catch (error) {
    console.error(`Error processing upload ${uploadId}:`, error);

    // Update upload record with error
    await Upload.findByIdAndUpdate(uploadId, {
      status: "failed",
      errorMessage: error.message,
      completedAt: new Date(),
    });

    // Clean up temp zip file even on error
    try {
      await fs.remove(zipPath);
    } catch (cleanupError) {
      console.error("Error cleaning up zip file:", cleanupError);
    }

    throw error;
  }
});

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

                  // Update progress
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

// Add job to queue
function addToQueue(uploadData) {
  return imageProcessingQueue.add(uploadData, {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 2000,
    },
  });
}

module.exports = {
  addToQueue,
  imageProcessingQueue,
};
