import React, { useContext } from "react";
import { motion } from "framer-motion";
import CosmicBackground from "@/app-components/CosmicBackground.jsx";
import Header from "@/app-components/Header.jsx";
import Footer from "@/app-components/Footer.jsx";
import { AuthContext } from "@/context/AuthContext.jsx";
import { Mail, User, Calendar, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";

export default function Profile() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();


  if (!user)
    return (
      <CosmicBackground>
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-1 flex justify-center items-center text-white text-xl">
            Loading...
          </main>
          <Footer />
        </div>
      </CosmicBackground>
    );

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
            {/* ------------------- PROFILE HEADER ------------------- */}
            <div className="flex flex-col items-center mb-8">
              <div className="w-20 h-20 rounded-full bg-purple-600 flex items-center justify-center text-white text-3xl font-bold shadow-xl">
                {user?.name?.charAt(0).toUpperCase()}
              </div>

              <h1 className="text-3xl font-bold text-white mt-4">
                {user?.name}
              </h1>

              <p className="text-gray-300 mt-1">Member of the House</p>
            </div>

            {/* ------------------- DETAILS SECTION ------------------- */}
            <div className="flex flex-col gap-5">

              {/* NAME */}
              <div>
                <label className="text-gray-300 text-sm">Full Name</label>
                <div className="flex items-center gap-3 bg-white/5 border border-white/10
                                rounded-lg px-4 py-3 mt-1">
                  <User className="w-5 h-5 text-purple-300" />
                  <span className="text-white">{user?.name}</span>
                </div>
              </div>

              {/* EMAIL */}
              <div>
                <label className="text-gray-300 text-sm">Email</label>
                <div className="flex items-center gap-3 bg-white/5 border border-white/10
                                rounded-lg px-4 py-3 mt-1">
                  <Mail className="w-5 h-5 text-purple-300" />
                  <span className="text-white">{user?.email}</span>
                </div>
              </div>

              {/* JOIN DATE */}
              <div>
                <label className="text-gray-300 text-sm">Joined On</label>
                <div className="flex items-center gap-3 bg-white/5 border border-white/10
                                rounded-lg px-4 py-3 mt-1">
                  <Calendar className="w-5 h-5 text-purple-300" />
                  <span className="text-white">
                    {new Date(user?.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            <motion.button
              whileTap={{ scale: 0.97 }}
              className="w-full mt-10 bg-gradient-to-r from-purple-500 to-purple-700 
             hover:from-purple-600 hover:to-purple-800 text-white py-3 rounded-lg 
             shadow-lg font-semibold flex items-center justify-center gap-2"
              onClick={() => navigate("/")}
            >
              <ArrowLeft className="w-5 h-5" />
              Go Back
            </motion.button>
          </motion.div>
        </main>

        <Footer />
      </div>
    </CosmicBackground>
  );
}
