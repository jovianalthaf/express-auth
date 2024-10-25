import express from "express";
import authRoutes from "./routes/authRoutes.js";
import "dotenv/config";
import mongoose from "mongoose";
import { errorHandler, notFoundPath } from "./middleware/errorMiddleware.js";
const app = express();
const port = 3000;
app.use(express.json());
// urlencoded request body
app.use(express.urlencoded({ extended: true }));
app.use("/api/v1/auth", authRoutes);
app.use(notFoundPath);
app.use(errorHandler);

try {
  await mongoose.connect(process.env.DATABASE_URL);
  console.log("Database connect success");
} catch (error) {
  console.log("database error");
}
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
