require("dotenv").config({ path: "./backend/config/config.env" });
const app = require("./app");
process.env.DOTENV_KEY = "";
const connectDatabase = require("./config/database");
const cloudinary = require("cloudinary");
const swaggerDocs = require("./config/swagger");

// Handling uncaught exceptions
process.on("uncaughtException", (err) => {
  console.log(`❌ Error: ${err.message}`);
  console.log("Shutting down the server due to uncaught exception");
  process.exit(1);
});

// Config
if (process.env.NODE_ENV !== "PRODUCTION"){
require("dotenv").config({ path: "./backend/config/config.env" });
}
// Connect Database
connectDatabase();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Start server
const server = app.listen(process.env.PORT, () => {
  console.log(`✅ Server running on http://localhost:${process.env.PORT}`);

  // ✅ Initialize Swagger docs once server starts
  swaggerDocs(app);
});

// Handling unhandled promise rejections (e.g., wrong DB URI)
process.on("unhandledRejection", (err) => {
  console.log(`❌ Error: ${err.message}`);
  console.log("Shutting down the server due to unhandled promise rejection");
  server.close(() => {
    process.exit(1);
  });
});





