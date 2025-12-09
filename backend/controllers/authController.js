import User from "../models/user.model.js";
import PendingUser from "../models/pendingUser.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { sendOTPEmail } from "../utils/sendEmail.js";

// Create JWT cookie
const sendToken = (user, res) => {
  const token = jwt.sign(
    { id: user._id, email: user.email, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "None" : "Strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

// Generate OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// -------------------- SIGNUP --------------------
export const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user exists already
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "Email already registered." });

    // Remove leftover pending signup
    await PendingUser.deleteOne({ email });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate OTP
    const otp = generateOTP();
    const otpHash = await bcrypt.hash(otp, 10);
    const otpExpiry = Date.now() + 10 * 60 * 1000;

    // Store in PendingUser
    const pending = await PendingUser.create({
      name,
      email,
      password: hashedPassword,
      otpHash,
      otpExpiry,
    });

    // Send OTP email
    await sendOTPEmail(email, otp);

    res.json({
      message: "OTP sent. Please verify to complete signup.",
      tempId: pending._id,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Signup failed." });
  }
};

// -------------------- VERIFY OTP --------------------
export const verifyOtp = async (req, res) => {
  try {
    const { tempId, otp } = req.body;

    const pending = await PendingUser.findById(tempId);
    if (!pending)
      return res.status(400).json({ message: "Signup session expired." });

    if (pending.otpExpiry < Date.now())
      return res.status(400).json({ message: "OTP expired." });

    const isMatch = await bcrypt.compare(otp, pending.otpHash);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid OTP." });

    // Create real user
    const user = await User.create({
      name: pending.name,
      email: pending.email,
      password: pending.password,
      emailVerified: true,
    });

    // Remove pending signup
    await PendingUser.findByIdAndDelete(tempId);

    // Auto login
    sendToken(user, res);

    res.json({ message: "Signup complete!", user });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "OTP verification failed." });
  }
};

// -------------------- RESEND OTP --------------------
export const resendOtp = async (req, res) => {
  try {
    const { tempId } = req.body;

    const pending = await PendingUser.findById(tempId);
    if (!pending)
      return res.status(400).json({ message: "Signup expired." });

    const otp = generateOTP();
    pending.otpHash = await bcrypt.hash(otp, 10);
    pending.otpExpiry = Date.now() + 10 * 60 * 1000;
    await pending.save();

    await sendOTPEmail(pending.email, otp);

    res.json({ message: "OTP resent successfully." });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Could not resend OTP." });
  }
};

// -------------------- LOGIN --------------------
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: "Invalid email or password." });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid email or password." });

    sendToken(user, res);
    res.json({ message: "Login successful", user });

  } catch (error) {
    res.status(500).json({ message: "Login failed." });
  }
};

// -------------------- GOOGLE AUTH (auto verified) --------------------
export const googleAuth = async (req, res) => {
  try {
    const { googleId, email, name } = req.body;

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        googleId,
        name,
        email,
        emailVerified: true,
      });
    }

    sendToken(user, res);
    res.json({ message: "Google login successful", user });

  } catch (error) {
    res.status(500).json({ message: "Google auth failed." });
  }
};

// -------------------- LOGOUT --------------------
export const logout = (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logged out" });
};

// -------------------- GET ME --------------------
export const getMe = async (req, res) => {
  const user = await User.findById(req.user.id).select("-password");
  res.json({ user });
};
