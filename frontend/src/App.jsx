import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "@/App.css";
import { Toaster } from "react-hot-toast";

import CodeWhispererRoom from "@/rooms/CodeWhispererRoom.jsx";
import DoctorRoom from "@/rooms/DoctorRoom";
import DataSageRoom from "@/rooms/DataSageRoom";
import PoetRoom from "@/rooms/PoetRoom.jsx";
import StoryWeaverRoom from "@/rooms/StoryWeaverRoom.jsx";

import Home from "@/pages/Home.jsx";
import AIRoom from "@/pages/AIRoom.jsx";
import About from "@/pages/About.jsx";
import Contact from "@/pages/Contact.jsx";
import Login from "@/pages/Login.jsx";
import Signup from "@/pages/Signup.jsx";
import VerifyOtp from "@/pages/VerifyOtp.jsx";

import MyTalks from "@/pages/MyTalks.jsx";

import Profile from "@/pages/Profile.jsx";

function App() {
  return (
    <Router>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 2500,

          style: {
            background: "rgba(20, 20, 35, 0.65)",   
            backdropFilter: "blur(10px)",
            color: "#fff",
            border: "1px solid rgba(120, 90, 255, 0.4)", 
            boxShadow: "0 0 12px rgba(120, 90, 255, 0.35)", 
            padding: "12px 16px",
            borderRadius: "12px",
          },

          success: {
            iconTheme: {
              primary: "#85ff4dff",
              secondary: "#fff",
            },
            style: {
              border: "1px solid rgba(77, 255, 77, 0.6)",
              boxShadow: "0 0 15px rgba(77, 255, 86, 0.45)",
            },
          },

          error: {
            iconTheme: {
              primary: "#ff4d4d",
              secondary: "#fff",
            },
            style: {
              border: "1px solid rgba(255, 77, 77, 0.6)",
              boxShadow: "0 0 15px rgba(255, 77, 77, 0.4)",
            },
          },
        }}
      />

      <div className="w-full min-h-screen bg-[#0a0a14] text-white overflow-x-hidden">

        <Routes>

          <Route path="/" element={<Home />} />


          <Route path="/ai" element={<AIRoom />} />


          <Route path="/code-whisperer" element={<CodeWhispererRoom />} />
          <Route path="/doctor" element={<DoctorRoom />} />
          <Route path="/data-sage" element={<DataSageRoom />} />
          <Route path="/poet" element={<PoetRoom />} />
          <Route path="/story-weaver" element={<StoryWeaverRoom />} />




          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/verify-otp" element={<VerifyOtp />} />

          <Route path="/my-talks" element={<MyTalks />} />
          <Route path="/profile" element={<Profile />} />

        </Routes>
      </div>
    </Router>
  );
}

export default App;
