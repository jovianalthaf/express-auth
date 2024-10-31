import express from "express";
import User from "../models/User.js";
import { loginUser, registerUser, currentUser, logoutUser, generateOtpCodeUser, verifUserAccount, refreshTokenUser } from "../controllers/authController.js";
import { protectedMiddleware } from "../middleware/authMiddleware.js";
const router = express.Router();

router.post("/login", loginUser);
router.post("/register", registerUser);

router.post("/logout", protectedMiddleware, logoutUser)
router.get("/getuser", protectedMiddleware, currentUser);
router.post("/generate-otp-code", protectedMiddleware, generateOtpCodeUser);
router.post("/verification-account", protectedMiddleware, verifUserAccount)
router.post("/refresh-token", protectedMiddleware, refreshTokenUser)
export default router;
