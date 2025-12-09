import React, { useContext, useState } from "react";
import { motion } from "framer-motion";
import CosmicBackground from "../app-components/CosmicBackground";
import Header from "../app-components/Header";
import Footer from "../app-components/Footer";
import GoogleLoginButton from "../app-components/GoogleLoginButton";
import { AuthContext } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { Lock, Mail, LogIn } from "lucide-react";


export default function Login() {
      const { login, setUser, loading: authLoading } = useContext(AuthContext);
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    const res = await login(form);
    if (res.success) {
      navigate("/");
    } else {
      setError(res.message);
    }
  };

  if (authLoading) {
    return (
      <CosmicBackground>
        <Header />
        <div className="flex justify-center items-center h-screen text-white text-lg">
          Loading...
        </div>
      </CosmicBackground>
    );
  }


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
            Welcome Back
          </h1>
          <p className="text-gray-300 text-center mb-8">
            Login to continue your journey
          </p>

            <form onSubmit={handleLogin} className="flex flex-col gap-5">
                <div>
              <label className="text-gray-300 text-sm">Email</label>
              <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-lg px-4 py-3 mt-1">
                <Mail className="w-5 h-5 text-purple-300" />
                <input
                  type="email"
                  placeholder="example@email.com"
                  className="bg-transparent outline-none text-white w-full"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>
            </div>

            
            <div>
              <label className="text-gray-300 text-sm">Password</label>
              <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-lg px-4 py-3 mt-1">
                <Lock className="w-5 h-5 text-purple-300" />
                <input
                  type="password"
                  placeholder="********"
                  className="bg-transparent outline-none text-white w-full"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                />
              </div>
            </div>

            {error && (
              <p className="text-red-400 bg-red-400/10 border border-red-400/20 text-sm p-2 rounded-lg">
                {error}
              </p>
            )}

            <motion.button
              whileTap={{ scale: 0.97 }}
              className="bg-gradient-to-r from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800 
                         text-white py-3 rounded-lg shadow-lg font-semibold flex items-center justify-center gap-2"
              type="submit"
            >
              <LogIn className="w-5 h-5" />
              Login
            </motion.button>

            </form>

            <div className="flex items-center my-8">
            <div className="flex-1 h-px bg-white/10"></div>
            <span className="px-4 text-gray-400 text-sm">OR CONTINUE WITH</span>
            <div className="flex-1 h-px bg-white/10"></div>
          </div>


          <div className="flex justify-center">
            <GoogleLoginButton
              onSuccess={(user) => {
                setUser(user);
                navigate("/");
              }}
            />
          </div>

           <p className="text-gray-300 text-center text-sm mt-8">
            Don't have an account?{" "}
            <Link to="/signup" className="text-purple-400 hover:underline">
              Sign up
            </Link>
          </p>
        </motion.div>


        
      </main>

      

      <Footer />
    </CosmicBackground>
  );
}
