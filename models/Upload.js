// const mongoose = require("mongoose");

// const uploadSchema = new mongoose.Schema({
//   userId: {
//     type: String,
//     required: true,
//     index: true,
//   },
//   folderName: {
//     type: String,
//     required: true,
//   },
//   originalZipName: {
//     type: String,
//     required: true,
//   },
//   images: [
//     {
//       originalName: String,
//       processedName: String,
//       url: String,
//       size: Number,
//       processedAt: Date,
//     },
//   ],
//   status: {
//     type: String,
//     enum: ["processing", "completed", "failed"],
//     default: "processing",
//   },
//   totalImages: {
//     type: Number,
//     default: 0,
//   },
//   processedImages: {
//     type: Number,
//     default: 0,
//   },
//   errorMessage: String,
//   uploadedAt: {
//     type: Date,
//     default: Date.now,
//   },
//   completedAt: Date,
// });

// module.exports = mongoose.model("Upload", uploadSchema);

const mongoose = require("mongoose");

const uploadSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true,
  },
  folderName: {
    type: String,
    required: true,
  },
  originalZipName: {
    type: String,
    required: true,
  },
  zipFilePath: {
    type: String,
    required: true,
  },
  zipFileUrl: {
    type: String,
    required: true,
  },
  images: [
    {
      originalName: String,
      processedName: String,
      url: String,
      size: Number,
      processedAt: Date,
    },
  ],
  status: {
    type: String,
    enum: ["processing", "completed", "failed"],
    default: "processing",
  },
  totalImages: {
    type: Number,
    default: 0,
  },
  processedImages: {
    type: Number,
    default: 0,
  },
  errorMessage: String,
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
  completedAt: Date,
});

module.exports = mongoose.model("Upload", uploadSchema);