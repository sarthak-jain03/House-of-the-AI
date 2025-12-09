import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";

import CodeWhispererRoom from "./rooms/CodeWhispererRoom";
import DoctorRoom from "./rooms/DoctorRoom";
import DataSageRoom from "./rooms/DataSageRoom";
import PoetRoom from "./rooms/PoetRoom";
import StoryWeaverRoom from "./rooms/StoryWeaverRoom";

import Home from "./pages/Home";
import AIRoom from "./pages/AIRoom";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import VerifyOtp from "./pages/VerifyOtp";

import MyTalks from "./pages/MyTalks";

import Profile from "./pages/Profile";

function App() {
  return (
    <Router>
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
