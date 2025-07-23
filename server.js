const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = 5000;

// ✅ Create /uploads folder if it doesn't exist
const uploadPath = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath);
}

// ✅ Middleware
app.use(cors());
app.use(bodyParser.json());

// ✅ Serve uploaded images
app.use("/uploads", express.static(uploadPath));

// ✅ MongoDB Connection
mongoose.connect("mongodb://localhost:27017/signupApp", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
mongoose.connection.once("open", () => {
  console.log("Connected to MongoDB");
});

// ✅ Routes
const authRoutes = require("./backend/routes/auth");
app.use("/api/auth", authRoutes);

// ✅ Start Server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
