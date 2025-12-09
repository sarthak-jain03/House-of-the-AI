import React, { useState, useContext, useEffect } from "react";
import { motion } from "framer-motion";
import CosmicBackground from "@/app-components/CosmicBackground.jsx";
import Header from "@/app-components/Header.jsx";
import Footer from "@/app-components/Footer.jsx";
import { AuthContext } from "@/context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";
import { ShieldCheck, RefreshCcw } from "lucide-react";
import toast from "react-hot-toast";

export default function VerifyOtp() {
  const { verifyOtp, resendOtp } = useContext(AuthContext);
  const navigate = useNavigate();

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [timer, setTimer] = useState(30);
  const [otpError, setOtpError] = useState("");   // ⭐ NEW STATE
  const [shake, setShake] = useState(false);      // ⭐ For shake animation

  const tempId = localStorage.getItem("tempId");

  // ---------------------- TIMER ----------------------
  useEffect(() => {
    if (timer <= 0) return;
    const interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    return () => clearInterval(interval);
  }, [timer]);

  // ---------------------- VERIFY OTP ----------------------
  const handleVerify = async (e) => {
    e.preventDefault();
    if (!otp) return toast.error("Please enter the OTP");

    setLoading(true);
    setOtpError(""); // reset error

    const res = await verifyOtp({ tempId, otp });

    if (res.success) {
      toast.success("Verification successful!");
      localStorage.removeItem("tempId");
      navigate("/");
    } else {
      // ⭐ Show Wrong OTP message
      setOtpError("Wrong OTP. Please try again.");

      // ⭐ Shake input field
      setShake(true);
      setTimeout(() => setShake(false), 600);

      toast.error(res.message);
    }

    setLoading(false);
  };

  // ---------------------- RESEND OTP ----------------------
  const handleResend = async () => {
    setResendLoading(true);

    const res = await resendOtp(tempId);

    if (res.success) {
      toast.success("OTP resent to your email!");
      setTimer(30);
      setOtpError(""); // reset any previous errors
    } else {
      toast.error(res.message);
    }

    setResendLoading(false);
  };

  return (
    <CosmicBackground>
      <div className="min-h-screen flex flex-col">
        <Header />

        <main className="flex-1 flex justify-center pt-[40px] px-6 pb-20">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/10 
                       rounded-2xl p-10 shadow-2xl"
          >
            <h1 className="text-3xl font-bold text-white text-center mb-2">
              Verify OTP
            </h1>

            <p className="text-gray-300 text-center mb-8">
              Enter the 6-digit code sent to your email
            </p>

            {/* OTP INPUT */}
            <form onSubmit={handleVerify} className="flex flex-col gap-5">
              <div>
                <label className="text-gray-300 text-sm">OTP Code</label>

                {/* ⭐ SHAKE ANIMATION WRAPPER */}
                <motion.div
                  animate={shake ? { x: [-10, 10, -8, 8, -5, 5, 0] } : {}}
                  transition={{ duration: 0.4 }}
                  className="flex items-center gap-3 bg-white/5 border border-white/10 
                             rounded-lg px-4 py-3 mt-1"
                >
                  <ShieldCheck className="w-5 h-5 text-purple-300" />
                  <input
                    type="text"
                    placeholder="123456"
                    maxLength={6}
                    className="bg-transparent outline-none text-white w-full text-lg tracking-widest"
                    value={otp}
                    onChange={(e) => {
                      setOtpError(""); // remove error when typing
                      setOtp(e.target.value);
                    }}
                    required
                  />
                </motion.div>

                {/* ⭐ INLINE "Wrong OTP" MESSAGE */}
                {otpError && (
                  <p className="text-red-400 bg-red-400/10 border border-red-400/20 
                                text-sm p-2 rounded-lg mt-2">
                    {otpError}
                  </p>
                )}
              </div>

              {/* VERIFY BUTTON */}
              <motion.button
                whileTap={{ scale: 0.97 }}
                disabled={loading}
                className={`bg-gradient-to-r from-purple-500 to-purple-700 
                           hover:from-purple-600 hover:to-purple-800 
                           text-white py-3 rounded-lg shadow-lg font-semibold 
                           flex items-center justify-center gap-2
                           ${loading ? "opacity-70 cursor-not-allowed" : ""}`}
                type="submit"
              >
                <ShieldCheck className="w-5 h-5" />
                {loading ? "Verifying..." : "Verify OTP"}
              </motion.button>
            </form>

            {/* RESEND OTP */}
            <div className="flex flex-col items-center mt-6">
              <button
                onClick={handleResend}
                disabled={timer > 0 || resendLoading}
                className={`flex items-center gap-2 text-purple-300 hover:text-purple-400 
                  transition mt-4 
                  ${timer > 0 || resendLoading ? "opacity-40 cursor-not-allowed" : ""}`}
              >
                {resendLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-purple-300/40 border-t-purple-300 
                                    rounded-full animate-spin"></div>
                    Sending...
                  </>
                ) : (
                  <>
                    <RefreshCcw className="w-4 h-4" />
                    Resend OTP
                  </>
                )}
              </button>

              {timer > 0 && (
                <p className="text-gray-400 text-sm mt-2">
                  You can resend OTP in <span className="text-white">{timer}</span>s
                </p>
              )}
            </div>
          </motion.div>
        </main>

        <Footer />
      </div>
    </CosmicBackground>
  );
}
