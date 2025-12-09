import mongoose from "mongoose";

const talkSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  agent: { type: String, enum: ["poet", "coder", "story", "datasage"] },
  user: String,
  assistant: String,
  confidence: Number,
}, { timestamps: true });

export default mongoose.model("Talk", talkSchema);
