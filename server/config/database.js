const mongoose = require("mongoose");
const MONGO_URI = process.env.MONGO_URI;

const connectDatabase = () => {
  if (!MONGO_URI) {
    console.error("MONGO_URI not defined in environment variables");
    return;
  }

  mongoose
    .connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
      console.log("MongoDB Connected:", MONGO_URI);
    })
    .catch((err) => {
      console.error("MongoDB Connection Error:", err.message);
      process.exit(1);
    });
};

module.exports = connectDatabase;
