import express from "express";
import User from "../models/User.js";
import { loginUser, registerUser } from "../controllers/authController.js";
const router = express.Router();

router.post("/login", loginUser);
router.post("/register", registerUser);

router.post("/logout", (req, res) => {
  res.send("Logout Router");
});

router.get("/getuser", (req, res) => {
  res.send("Get User");
});

export default router;
