// const express = require("express");
// const mongoose = require("mongoose");
// const cors = require("cors");
// const path = require("path");
// require("dotenv").config();

// const uploadRoutes = require("./routes/upload");

// const app = express();
// const PORT = process.env.PORT || 3001;

// // Middleware
// app.use(cors());
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// // Serve static files
// app.use("/processed", express.static(path.join(__dirname, "processed")));

// // Routes
// app.use("/api", uploadRoutes);

// // MongoDB Connection
// mongoose
//   .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/imageupload", {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//   })
//   .then(() => console.log("MongoDB connected 👍"))
//   .catch((err) => console.error("MongoDB connection error ✖️:", err));

// // Error handling middleware
// app.use((error, req, res, next) => {
//   console.error(error);
//   res.status(500).json({ error: "Something went wrong!" });
// });

// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });


const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const uploadRoutes = require("./routes/upload");
const authRoutes = require("./routes/auth");

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use("/processed", express.static(path.join(__dirname, "processed")));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api", uploadRoutes);

// MongoDB Connection
mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/imageupload", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected 👍"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Error handling middleware
app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).json({ error: "Something went wrong!" });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});