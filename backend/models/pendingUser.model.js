import mongoose from "mongoose";

const pendingUserSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, unique: true },
    password: String, 
    otpHash: String,
    otpExpiry: Date,
  },
  { timestamps: true }
);

export default mongoose.model("PendingUser", pendingUserSchema);
