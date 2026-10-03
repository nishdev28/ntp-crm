import "dotenv/config";
import express from "express";
import connectDB from "./src/config/db.js";
import cors from "cors";
import morgan from "morgan";
import { errorHandler, notFound } from "./src/middleware/error.middleware.js";
import authRoutes from "./src/routes/authRoutes.js";
import leadRoutes from "./src/routes/leadRoutes.js";
import contactRoutes from "./src/routes/contactRoutes.js"
import noteRoutes from "./src/routes/noteRoutes.js"
import taskRouter from "./src/routes/taskRoutes.js"

const app = express();

// Connect to the database
connectDB();

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", success: true, message: "NTP CRM API is running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/leads", leadRoutes);
app.use("/api/contacts", contactRoutes);
app.use("/api/notes", noteRoutes);
app.use("/api/tasks", taskRouter);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`Server is running in ${process.env.NODE_ENV} mode on port http://localhost${PORT}`);
});