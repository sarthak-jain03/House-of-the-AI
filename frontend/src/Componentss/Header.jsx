import React, { useContext, useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  Home, 
  User, 
  LogOut, 
  UserRoundPen, 
  MessageCircleMore 
} from "lucide-react";
import { AuthContext } from "../context/AuthContext";

export default function Header() {
  const { user, logout } = useContext(AuthContext);
  const [openMenu, setOpenMenu] = useState(false);
  const navigate = useNavigate();

  const menuRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpenMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="w-full bg-gradient-to-r from-[#1a1535] via-[#121425] to-[#0c0f1a] border-b border-white/5">
      <div className="w-full px-6 py-4 flex items-center justify-between">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center shadow-md shadow-purple-500/30">
            <Home className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-white font-bold text-lg leading-tight">House of the AI</h1>
            <p className="text-purple-300/70 text-xs">Where AI Meets Intelligence</p>
          </div>
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-10">
          <Link to="/" className="text-gray-300 hover:text-white transition-all text-sm font-medium">Home</Link>
          <Link to="/ai" className="text-gray-300 hover:text-white transition-all text-sm font-medium">Our AIs</Link>
          <Link to="/about" className="text-gray-300 hover:text-white transition-all text-sm font-medium">About</Link>
          <Link to="/contact" className="text-gray-300 hover:text-white transition-all text-sm font-medium">Contact</Link>
        </nav>

        {/* Right Section */}
        <div className="flex items-center gap-4">

          {/* If NOT LOGGED IN */}
          {!user && (
            <Link
              to="/login"
              className="px-6 py-2.5 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 
              hover:from-orange-600 hover:to-orange-700 text-white font-semibold text-sm shadow-lg
              shadow-orange-500/30 hover:shadow-orange-500/50 transition-all"
            >
              Enter the House
            </Link>
          )}

          {/* If LOGGED IN */}
          {user && (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setOpenMenu((prev) => !prev)}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 
                hover:from-orange-600 hover:to-orange-700 text-white font-semibold text-sm shadow-lg
                shadow-orange-500/30 hover:shadow-orange-500/50 transition-all"
              >
                <User className="w-4 h-4" />
                Welcome Home, {user.name.split(" ")[0]}
              </button>

              {/* Dropdown */}
              {openMenu && (
                <div className="absolute right-0 mt-2 w-44 bg-[#121425] border border-white/10 rounded-lg shadow-xl p-2 z-50">

                  {/* PROFILE */}
                  <button
                    onClick={() => navigate("/profile")}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-300 
                    hover:bg-white/10 rounded-md transition-all"
                  >
                    <UserRoundPen className="w-4 h-4" />
                    Profile
                  </button>

                  {/* MY TALKS */}
                  <button
                    onClick={() => navigate("/my-talks")}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-300 
                    hover:bg-white/10 rounded-md transition-all"
                  >
                    <MessageCircleMore className="w-4 h-4" />
                    My Talks
                  </button>

                  {/* LOGOUT */}
                  <button
                    onClick={logout}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 
                    hover:bg-red-400/20 rounded-md transition-all"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>

                </div>
              )}
            </div>
          )}

        </div>

      </div>
    </header>
  );
}
