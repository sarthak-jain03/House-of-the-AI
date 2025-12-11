import mongoose from "mongoose";

const visitorSchema = new mongoose.Schema({
  visitorId: { type: String, required: true, unique: true, index: true },
  createdAt: { type: Date, default: Date.now }
});


const Visitor = mongoose.model("Visitor", visitorSchema);

export default Visitor;
