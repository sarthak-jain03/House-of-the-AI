import React, { useContext, useState } from "react";
import { motion } from "framer-motion";
import CosmicBackground from "../Componentss/CosmicBackground";
import Header from "../Componentss/Header";
import Footer from "../Componentss/Footer";
import GoogleLoginButton from "../Componentss/GoogleLoginButton";
import { AuthContext } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, User, LogIn } from "lucide-react";
import API from "../api/axios";
import toast from "react-hot-toast";

export default function Signup() {
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loadingOTP, setLoadingOTP] = useState(false); // 🔥 New Loader State

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    setLoadingOTP(true); // Start loader

    try {
      const res = await API.post("/auth/signup", form, { withCredentials: true });

      // Save tempId for OTP verification
      localStorage.setItem("tempId", res.data.tempId);

      toast.success("OTP sent to your email!");
      navigate("/verify-otp");

    } catch (err) {
      console.log(err);
      const msg = err.response?.data?.message || "Signup failed";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoadingOTP(false); // Stop loader
    }
  };

  return (
    <CosmicBackground>
      <Header />

      <main className="flex justify-center pt-[40px] px-6 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl p-10 shadow-2xl"
        >
          <h1 className="text-3xl font-bold text-white text-center mb-2">
            Create Account
          </h1>
          <p className="text-gray-300 text-center mb-8">
            Become a member of the House
          </p>

          <form onSubmit={handleSignup} className="flex flex-col gap-5">

            {/* NAME */}
            <div>
              <label className="text-gray-300 text-sm">Full Name</label>
              <div className={`flex items-center gap-3 bg-white/5 border border-white/10 rounded-lg px-4 py-3 mt-1 
                ${loadingOTP ? "opacity-50 cursor-not-allowed" : ""}`}>
                <User className="w-5 h-5 text-purple-300" />
                <input
                  type="text"
                  placeholder="Sarthak Jain"
                  className="bg-transparent outline-none text-white w-full"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  disabled={loadingOTP}
                  required
                />
              </div>
            </div>

            {/* EMAIL */}
            <div>
              <label className="text-gray-300 text-sm">Email</label>
              <div className={`flex items-center gap-3 bg-white/5 border border-white/10 rounded-lg px-4 py-3 mt-1
                ${loadingOTP ? "opacity-50 cursor-not-allowed" : ""}`}>
                <Mail className="w-5 h-5 text-purple-300" />
                <input
                  type="email"
                  placeholder="you@example.com"
                  className="bg-transparent outline-none text-white w-full"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  disabled={loadingOTP}
                  required
                />
              </div>
            </div>

            {/* PASSWORD */}
            <div>
              <label className="text-gray-300 text-sm">Password</label>
              <div className={`flex items-center gap-3 bg-white/5 border border-white/10 rounded-lg px-4 py-3 mt-1
                ${loadingOTP ? "opacity-50 cursor-not-allowed" : ""}`}>
                <Lock className="w-5 h-5 text-purple-300" />
                <input
                  type="password"
                  placeholder="********"
                  className="bg-transparent outline-none text-white w-full"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  disabled={loadingOTP}
                  required
                />
              </div>
            </div>

            {/* ERROR MESSAGE */}
            {error && (
              <p className="text-red-400 bg-red-400/10 border border-red-400/20 text-sm p-2 rounded-lg">
                {error}
              </p>
            )}

            {/* SIGNUP BUTTON */}
            <motion.button
              whileTap={{ scale: loadingOTP ? 1 : 0.97 }}
              disabled={loadingOTP}
              className={`bg-gradient-to-r from-purple-500 to-purple-700 
                         hover:from-purple-600 hover:to-purple-800 
                         text-white py-3 rounded-lg shadow-lg 
                         font-semibold flex items-center justify-center gap-2
                         ${loadingOTP ? "opacity-60 cursor-wait" : ""}`}
              type="submit"
            >
              {loadingOTP ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin"></div>
                  Sending OTP...
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  Sign Up
                </>
              )}
            </motion.button>

          </form>

          {/* DIVIDER */}
          <div className="flex items-center my-8">
            <div className="flex-1 h-px bg-white/10"></div>
            <span className="px-4 text-gray-400 text-sm">OR CONTINUE WITH</span>
            <div className="flex-1 h-px bg-white/10"></div>
          </div>

          {/* GOOGLE LOGIN */}
          <div className="flex justify-center">
            <GoogleLoginButton
              onSuccess={(user) => {
                toast.success("Welcome!");
                navigate("/");
              }}
            />
          </div>

          {/* SWITCH TO LOGIN */}
          <p className="text-gray-300 text-center text-sm mt-8">
            Already have an account?{" "}
            <Link to="/login" className="text-purple-400 hover:underline">
              Login
            </Link>
          </p>
        </motion.div>
      </main>

      <Footer />
    </CosmicBackground>
  );
}
