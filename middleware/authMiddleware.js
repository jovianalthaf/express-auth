import jwt from 'jsonwebtoken';
import User from "../models/User.js";
import asyncHandler from './asyncHandler.js';

export const protectedMiddleware = asyncHandler(async (req, res, next) => {
    let token;
    token = req.cookies.jwt;
    if (token) {
        try {
            const decode = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decode.id).select('-password');
            next();
        } catch (error) {
            res.status(401);
            throw new Error("Token fail");
        }
    } else {
        res.status(401);
        throw new Error("Not Authorization,no Token");
    }
})

export const isAdmin = asyncHandler(async (req, res, next) => {
    const isAdminUser = await User.findOne({
        _id: req.user.id,
        role: 'admin'
    });
    if (isAdminUser) {
        next();
    } else {
        res.status(401);
        throw new Error("Not Authorize, Admin Only");
    }
    // if (req.user && req.user.role === "admin") {
    //     next();
    // } else {
    //     res.status(401);
    //     throw new Error("Not Authorize, Admin Only");
    // }
})

export const verificationMiddleware = asyncHandler(async (req, res, next) => {
    if (req.user && req.user.isVerified && req.user.EmailVerifiedAt) {
        next()
    } else {
        res.status(401)
        throw new Error("Your account not verified");
    }
})