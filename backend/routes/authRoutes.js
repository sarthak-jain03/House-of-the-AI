import express from "express";
import {
  signup,
  login,
  googleAuth,
  logout,
  getMe,
  verifyOtp,
  resendOtp,
} from "../controllers/authController.js";
import auth from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/verify-otp", verifyOtp);
router.post("/resend-otp", resendOtp);

router.post("/login", login);
router.post("/google", googleAuth);
router.post("/logout", logout);

router.get("/me", auth, getMe);

export default router;
