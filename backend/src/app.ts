import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import profileRoutes from "./routes/profile.routes";
import postRoutes from "./routes/post.routes";
import matchRoutes from "./routes/match.routes";
import messageRoutes from "./routes/message.routes";
import { errorHandler } from "./middleware/error.middleware";

export const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disable CSP for development; configure properly for production
}));

app.use(morgan("dev"));
app.use(express.json());

//end points check server for testing
app.get("/health", (_req, res) => {
  res.json({ ok: true });
});
// Root endpoint for basic check
app.get("/", (_req, res) => {
  res.send("Backend is running"); 
});


// API routes
app.use("/api/profile", profileRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/matches", matchRoutes);
app.use("/api/messages", messageRoutes);

app.use(errorHandler);
