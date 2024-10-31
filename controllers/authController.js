import asyncHandler from "../middleware/asyncHandler.js";
import User from "../models/User.js";
import jwt from "jsonwebtoken";
import sendEmail from "../utils/sendEmail.js";
import Otpcode from "../models/OTPCode.js";
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '1h'
  })
}
const generateRefreshToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_TOKEN_REFRESH, {
    expiresIn: '7d'
  })
}

const createResToken = async (user, statusCode, res) => {
  // get user id from database, field id  in mongodb = _id
  // const token = signToken(user._id);

  const accessToken = signToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  await User.findByIdAndUpdate(user._id, {
    refreshToken: refreshToken
  })
  const cookieOptionToken = {
    expires: new Date(
      Date.now() + 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    security: false,
  }
  const cookiesOptionRefresh = {
    expires: new Date(
      Date.now() + 7 * 24 * 60 * 60 * 1000
    )
  }
  res.cookie('jwt', accessToken, cookieOptionToken);
  res.cookie('refreshToken', refreshToken, cookiesOptionRefresh);

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

  const otpData = await user.generateOtpCode();
  await sendEmail({
    to: user.email,
    subject: "Register Success",
    html: `
      <!doctype html>
        <html>
          <head>
            <meta http-equiv=3D"Content-Type" content=3D"text/html; charset=3DUTF-8">
          </head>
          <body style=3D"font-family: sans-serif;">
            <div style=3D"display: block; margin: auto; max-width: 600px;" class=3D"main">
              <h1 style=3D"font-size: 18px; font-weight: bold; margin-top: 20px">Selamat ${user.name} berhasil melakukan Generate OTP Code baru</h1>
              <p>Silahkan gunakan otp code dibawah untuk verifikasi akun </p>
              <img alt=3D"Inspect with Tabs" src=3D"https://assets-examples.mailtrap.io/integration-examples/welcome.png" style=3D"width: 100%;">
              <p style="text-align:center; background-color:yellow; font-width:bold; font-size:30px;">${otpData.otp}</p>
              <p strong style="font-size:12px"> waktu expire OTP Code  5 menit dari sekarang  </p>
            </div>
            <!-- Example of invalid for email html/css, will be detected by Mailtrap: -->
          </body>
        </html>
    `
  })
  createResToken(user, 201, res)
});

export const generateOtpCodeUser = asyncHandler(async (req, res) => {
  const currentUser = await User.findById(req.user._id);
  const otpData = await currentUser.generateOtpCode();

  await sendEmail({
    to: currentUser.email,
    subject: "Regenerate code success",
    html: `
      <!doctype html>
        <html>
          <head>
            <meta http-equiv=3D"Content-Type" content=3D"text/html; charset=3DUTF-8">
          </head>
          <body style=3D"font-family: sans-serif;">
            <div style=3D"display: block; margin: auto; max-width: 600px;" class=3D"main">
              <h1 style=3D"font-size: 18px; font-weight: bold; margin-top: 20px">Selamat ${currentUser.name} berhasil melakukan terdaftar</h1>
              <p>Silahkan gunakan otp code dibawah untuk verifikasi akun waktu expire OTP Code  5 menit dari sekarang </p>
              <img alt=3D"Inspect with Tabs" src=3D"https://assets-examples.mailtrap.io/integration-examples/welcome.png" style=3D"width: 100%;">
              <p style="text-align:center; background-color:yellow; font-width:bold; font-size:30px;">${otpData.otp}</p>
            </div>
            <!-- Example of invalid for email html/css, will be detected by Mailtrap: -->
          </body>
        </html>
    `
  })
  return res.status(200).json({
    message: "Generate OTP CODE Success,check your email"
  })
})

export const verifUserAccount = asyncHandler(async (req, res) => {
  // validation
  if (!req.body.otp) {
    res.status(400)
    throw new Error("OTP Field required")
  }
  // validation 2 if otp  in database not found
  const otp_code = await Otpcode.findOne({
    otp: req.body.otp,
    user: req.user._id,
  })
  if (!otp_code) {
    res.status(400)
    throw new Error("OTP not found");
  }
  // update value in user field
  const userData = await User.findById(req.user._id)

  await User.findByIdAndUpdate(userData._id, {
    isVerified: true,
    EmailVerifiedAt: Date.now(),
  })
  return res.status(200).json({
    message: "Verification Account Success"
  })
})


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
  // if userData and password correct, call function createResToken
  if (userData && (await userData.comparePassword(req.body.password))) {
    createResToken(userData, 200, res)
  } else {
    res.status(400);
    throw new Error("Invalid credentials");
  }

})

export const currentUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select('-password');
  if (user) {
    res.status(200).json({
      user
    })
  } else {
    res.status(401);
    throw new Error("User not found");
  }
})

export const logoutUser = async (req, res) => {
  res.cookie('jwt', '', {
    httpOnly: true,
    expire: new Date(Date.now())
  })
  await User.findByIdAndUpdate(req.user._id, {
    refreshToken: null
  })

  res.cookie('refreshToken', '', {
    httpOnly: true,
    expire: new Date(Date.now())
  })
  res.status(200).json({
    message: 'Logout success'
  })

}

export const refreshTokenUser = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    res.status(401)
    throw new Error("No Refresh Token")
  }
  const user = await User.findOne({
    refreshToken: refreshToken
  })

  if (!user) {
    res.status(401)
    throw new Error("Invalid Refresh Token")
  }

  jwt.verify(refreshToken, process.env.JWT_TOKEN_REFRESH, (err, decoded) => {
    if (err) {
      res.status(401)
      throw new Error("Invalid Refresh Token")
    }
    // create new Token
    // const newToken = generateRefreshToken(decoded.id)
    createResToken(user, 200, res);
  });
})