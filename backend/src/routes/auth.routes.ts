import { Router } from "express";
import { login, logout, register } from "../controllers/auth.controller";
import { requireAuth } from "../middleware/auth.middleware";

//handles user registration, loging and logout

const router = Router();

//Register  new user
router.post("/register", register);

//Login user and return JWT token
router.post("/login", login);

//Logout user (requires auth)
router.post("/logout", requireAuth, logout);

export default router;