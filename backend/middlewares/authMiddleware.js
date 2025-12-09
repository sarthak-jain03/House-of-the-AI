import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export default async function auth(req, res, next) {
  try {
    const token = req.cookies.token;

    if (!token)
      return res.status(401).json({ message: "Not authorized — No token" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select("-password");
    if (!user)
      return res.status(401).json({ message: "User no longer exists" });

    req.user = user;
    next();

  } catch (err) {
    console.log("Auth middleware error:", err);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}
