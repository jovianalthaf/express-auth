import mongoose, { mongo } from "mongoose";

const { Schema } = mongoose;

const otpcodeSchema = new Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    otp: {
        type: String,
        required: [true, 'Otp Code required'],

    },
    validUntil: {
        type: Date,
        required: true,
        expires: 300 //5 mins
    },
});


const Otpcode = mongoose.model("Otpcode", otpcodeSchema);
export default Otpcode;
