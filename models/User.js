import mongoose, { mongo } from "mongoose";
import validator from "validator";
import bcrypt from 'bcryptjs'
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
const User = mongoose.model("User", userSchema);

export default User;
