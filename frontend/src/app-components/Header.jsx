import React, { useContext, useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Home,
  User,
  LogOut,
  UserRoundPen,
  MessageCircleMore,
  Menu,
  X
} from "lucide-react";
import { AuthContext } from "@/context/AuthContext.jsx";

export default function Header() {
  const { user, logout } = useContext(AuthContext);
  const [openMenu, setOpenMenu] = useState(false);
  const [mobileNav, setMobileNav] = useState(false);
  const navigate = useNavigate();

  const menuRef = useRef(null);

  // Avatar URL (Google or fallback)
  const avatarUrl =
    user?.avatar ||
    user?.picture ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      user?.name || "User"
    )}&background=FF7A00&color=fff`;

  // Close dropdown on outside click
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
      <div className="w-full px-4 sm:px-6 py-4 flex items-center justify-between">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center shadow-md shadow-purple-500/30">
            <Home className="w-5 h-5 text-white" />
          </div>

          {/* Mobile title */}
          <div className="md:hidden lg:hidden text-white font-bold text-lg leading-tight">
            House of the AI
          </div>

          {/* Desktop title */}
          <div className="hidden sm:block">
            <h1 className="text-white font-bold text-lg leading-tight">House of the AI</h1>
            <p className="text-purple-300/70 text-xs">Where AI Meets Intelligence</p>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-10">
          <Link to="/" className="text-gray-300 hover:text-white transition-all text-sm font-medium">Home</Link>
          <Link to="/ai" className="text-gray-300 hover:text-white transition-all text-sm font-medium">Our AIs</Link>
          <Link to="/about" className="text-gray-300 hover:text-white transition-all text-sm font-medium">About</Link>
          <Link to="/contact" className="text-gray-300 hover:text-white transition-all text-sm font-medium">Contact</Link>
        </nav>

        {/* RIGHT SECTION */}
        <div className="flex items-center gap-3 sm:gap-4">

          {/* MOBILE LOGGED-IN AVATAR */}
          {user && (
            <div className="md:hidden">
              <img
                src={avatarUrl}
                alt="avatar"
                className="w-9 h-9 rounded-full border border-white/20 object-cover"
              />
            </div>
          )}

          {/* MOBILE LOGIN BUTTON */}
          {!user && (
            <Link
              to="/login"
              className="md:hidden px-4 py-2 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 
              hover:from-orange-600 hover:to-orange-700 text-white font-semibold text-sm shadow-md
              shadow-orange-500/20 transition-all"
            >
              Enter the House
            </Link>
          )}

          {/* MOBILE HAMBURGER */}
          <button
            className="md:hidden text-gray-200 hover:text-white"
            onClick={() => setMobileNav(true)}
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* DESKTOP LOGIN BUTTON */}
          {!user && (
            <Link
              to="/login"
              className="hidden md:block px-6 py-2.5 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 
              hover:from-orange-600 hover:to-orange-700 text-white font-semibold text-sm shadow-lg
              shadow-orange-500/30 hover:shadow-orange-500/50 transition-all"
            >
              Enter the House
            </Link>
          )}

          {/* DESKTOP USER MENU */}
          {user && (
            <div className="relative hidden md:block" ref={menuRef}>
              <button
                onClick={() => setOpenMenu((prev) => !prev)}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 
                hover:from-orange-600 hover:to-orange-700 text-white font-semibold text-sm shadow-lg
                shadow-orange-500/30 hover:shadow-orange-500/50 transition-all"
              >
                <User className="w-4 h-4" />
                Welcome, {user.name.split(" ")[0]}
              </button>

              {openMenu && (
                <div className="absolute right-0 mt-2 w-44 bg-[#121425] border border-white/10 rounded-lg shadow-xl p-2 z-50">

                  <button
                    onClick={() => navigate("/profile")}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-300 
                    hover:bg-white/10 hover:text-white rounded-md transition-all"
                  >
                    <UserRoundPen className="w-4 h-4" />
                    Profile
                  </button>

                  <button
                    onClick={() => navigate("/my-talks")}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-300 
                    hover:bg-white/10 hover:text-white rounded-md transition-all"
                  >
                    <MessageCircleMore className="w-4 h-4" />
                    My Talks
                  </button>

                  <button
                    onClick={logout}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 
                    hover:bg-red-400/20 hover:text-red-300 rounded-md transition-all"
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

      {/* MOBILE NAVIGATION PANEL */}
      {mobileNav && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm">

          <div className="absolute right-0 top-0 w-64 h-full
             bg-white/5 backdrop-blur-xl 
             border-l border-white/10 shadow-2xl
             rounded-l-2xl animate-slideLeft
             p-5 flex flex-col">

            <button className="self-end mb-4 text-gray-400 hover:text-white" onClick={() => setMobileNav(false)}>
              <X className="w-6 h-6" />
            </button>

            {/* Beautiful Hover Buttons */}
            <Link to="/" onClick={() => setMobileNav(false)}
              className="py-3 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-all text-sm">
              Home
            </Link>

            <Link to="/ai" onClick={() => setMobileNav(false)}
              className="py-3 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-all text-sm">
              Our AIs
            </Link>

            <Link to="/about" onClick={() => setMobileNav(false)}
              className="py-3 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-all text-sm">
              About
            </Link>

            <Link to="/contact" onClick={() => setMobileNav(false)}
              className="py-3 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-all text-sm">
              Contact
            </Link>

            <div className="mt-5 border-t border-white/10 pt-4">

              {/* LOGGED-IN MENU */}
              {user && (
                <>
                  <button
                    onClick={() => { setMobileNav(false); navigate("/profile"); }}
                    className="flex w-full items-center gap-3 px-4 py-3 text-sm text-gray-300 hover:bg-white/10 hover:text-white rounded-lg transition-all"
                  >
                    <UserRoundPen className="w-4 h-4" /> Profile
                  </button>

                  <button
                    onClick={() => { setMobileNav(false); navigate("/my-talks"); }}
                    className="flex w-full items-center gap-3 px-4 py-3 text-sm text-gray-300 hover:bg-white/10 hover:text-white rounded-lg transition-all"
                  >
                    <MessageCircleMore className="w-4 h-4" /> My Talks
                  </button>

                  <button
                    onClick={() => { logout(); setMobileNav(false); }}
                    className="flex w-full items-center gap-3 px-4 py-3 text-sm text-red-400 
      hover:bg-red-500/20 hover:text-red-200 rounded-lg transition-all"
                  >
                    <LogOut className="w-4 h-4" /> Logout
                  </button>
                </>
              )}

            </div>

          </div>

        </div>
      )}
    </header>
  );
}
