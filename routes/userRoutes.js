import express from "express";
import User from "../models/User.js";
import { protectedMiddleware, isAdmin, verificationMiddleware } from "../middleware/authMiddleware.js";
import { allUser } from "../controllers/UserController.js"
const router = express.Router();

router.get("/", protectedMiddleware, isAdmin, allUser);
router.get("/verification", protectedMiddleware, verificationMiddleware, (req, res) => {
    return res.status(200).json({
        message: "User verified"
    });
})

export default router;
