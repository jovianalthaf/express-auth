import mongoose, { mongo } from "mongoose";
import validator from "validator";
import bcrypt from 'bcryptjs'
import Randomstring from "randomstring";
import Otpcode from "./OTPCode.js";
const { Schema } = mongoose;

const userSchema = new Schema({
  name: {
    type: String,
    required: [true, "Username required"],
    minlength: [3, "Username minimal has 3 character"],
  },

  email: {
    type: String,
    required: [true, "Email required"],
    validate: {
      validator: validator.isEmail,
      message: "The email must be in a valid email format ",
    },
    unique: true,
  },

  password: {
    type: String,
    required: [true, "Password required"],
    minlength: [6, "Password minimal has 6 character"],
  },

  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  refreshToken: {
    type: String
  },
  EmailVerifiedAt: {
    type: Date,
  },
});

userSchema.pre("save", async function () {
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
})

userSchema.methods.comparePassword = async function (reqBody) {
  return await bcrypt.compare(reqBody, this.password);
}

userSchema.methods.generateOtpCode = async function () {
  const randomstring = Randomstring.generate({
    length: 6,
    charset: 'numeric'
  })
  let now = new Date();
  const otp = await Otpcode.findOneAndUpdate({
    'user': this._id
  }, {
    // update field user
    'otp': randomstring,
    'validUntil': now.setMinutes(now.getMinutes() + 5)

  }, {
    new: true,
    // update or insert
    upsert: true,
  })

  return otp;
}
const User = mongoose.model("User", userSchema);

export default User;
