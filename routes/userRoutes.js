import express from "express";
import User from "../models/User.js";
import { protectedMiddleware, isAdmin } from "../middleware/authMiddleware.js";
import { allUser } from "../controllers/UserController.js"
const router = express.Router();

router.get("/", protectedMiddleware, isAdmin, allUser);


export default router;
