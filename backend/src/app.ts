//express backend entry point
//initializes middleware, routes, and starts the server

import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { errorHandler } from "./middleware/error.middleware";

//import all routes files
import authRoutes from "./routes/auth.routes";
import matchRoutes from "./routes/matches.routes";
import messageRoutes from "./routes/messages.routes";
import postsRoutes from "./routes/posts.routes";
import profileRoutes from "./routes/profile.routes";
import reviewsRoutes from "./routes/reviews.routes";
import process = require("node:process");

//load env variables from .env file
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

//middleware
//cors - allow requests from frontend
app.use(cors({
    origin: ["http://localhost:3000", "http://localhost:3001", "http://localhost:3002"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
}));

//parse incoming JSON requests
app.use(express.json());
app.use(express.urlencoded({ extended: true })); //for parsing application/x-www-form-urlencoded

//routes

//test if the server is running 
app.get("/", (req, res) => {
    res.json({ message: "Roomie API is running!"});
});

//auth routes - register, login, logout 
app.use("/api/auth", authRoutes);

//profile routes - get and update user profile
app.use("/api/profile", profileRoutes);

//posts routes - create, read, update, delete posts
app.use("/api/posts", postsRoutes);

//match routes- send , accept , decline match requests
app.use("/api/matches", matchRoutes);

//message routes - send and receive messages between matched users
app.use("/api/messages", messageRoutes);

//reviews routes - leave reviews for matched users
app.use("/api/reviews", reviewsRoutes);

//global error handler
app.use(errorHandler);

//start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

export default app;
