import asyncHandler from "../middleware/asyncHandler.js";
import User from "../models/User.js";
import jwt from "jsonwebtoken";

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '6d'
  })
}

const createResToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  const cookieOption = {
    expire: new Date(
      Date.now() + 6 * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    security: false,
  }
  res.cookie('jwt', token, cookieOption);

  user.password = undefined;
  res.status(statusCode).json({
    user
  })
}

export const registerUser = asyncHandler(async (req, res) => {
  const isFirstUser = (await User.countDocuments()) === 0 ? 'admin' : 'user';
  const user = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    role: isFirstUser,
  });

  createResToken(user, 201, res)
});

export const loginUser = asyncHandler(async (req, res) => {
  // 1. validation input from user 
  if (!req.body.email && !req.body.password) {
    res.status(400);
    throw new Error("Input email and password required");
  }
  // 2. what if condition email and password is wrong
  const userData = await User.findOne({
    email: req.body.email
  })
  if (userData && (await userData.comparePassword(req.body.password))) {
    createResToken(userData, 200, res)
  } else {
    res.status(400);
    throw new Error("Invalid credentials");
  }

})
