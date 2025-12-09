import React, { useContext, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Home, ChevronDown, Code2, Feather, BarChart3, BookOpen, 
  LogOut, MessageSquare, LogIn,
  MessageCircleMore,
  Info
} from 'lucide-react';
import { AuthContext } from '@/context/AuthContext.jsx';

const aiList = [
  { type: 'code_whisperer', title: 'The Code Whisperer', description: 'Assists in writing and reviewing code', icon: Code2, color: 'text-teal-400' },
  { type: 'poet', title: 'The Poet', description: 'Drafts imaginative stories and verses', icon: Feather, color: 'text-purple-400' },
  { type: 'data_sage', title: 'The Data Sage', description: 'Analyzes data and generates insights', icon: BarChart3, color: 'text-blue-400' },
  { type: 'story_weaver', title: 'The Story Weaver', description: 'Develops narratives and scripts', icon: BookOpen, color: 'text-orange-400' },
];

export default function AISidebar({ currentAI, onSelectAI }) {
  const [isExpanded, setIsExpanded] = React.useState(true);
  const [showMenu, setShowMenu] = React.useState(false);

  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const menuRef = useRef(null);

  // ⭐ Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <aside className="w-72 min-h-screen bg-[#12121f] border-r border-white/10 flex flex-col">

      {/* HEADER */}
      <Link to="/" className="flex items-center gap-3 p-4 border-b border-white/10">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center">
          <Home className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-white font-bold text-sm leading-tight">House of the AI</h1>
          <p className="text-purple-300/60 text-xs">Where AI Meets Intelligence</p>
        </div>
      </Link>

      {/* MENU */}
      <nav className="flex-1 p-3 overflow-y-auto">
        <div className="mb-2">
          <Link to="/ai" className="flex items-center gap-3 px-3 py-2 text-gray-400 hover:text-white text-sm transition">
            <Home className="w-4 h-4" />
            <span>Our AIs</span>
          </Link>

          <Link to="/about" className="flex items-center gap-3 px-3 py-2 text-gray-400 hover:text-white text-sm transition">
            <span className="w-4 h-4 flex items-center justify-center">ℹ</span>
            <span>About</span>
          </Link>
        </div>

        {/* OUR AIs COLLAPSIBLE */}
        <div className="border-t border-white/10 pt-3 mt-3">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center justify-between w-full px-3 py-2 text-gray-300 hover:text-white transition"
          >
            <span className="text-sm font-medium">Our AIs</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
          </button>

          {isExpanded && (
            <div className="mt-2 space-y-1">
              {aiList.map((ai) => (
                <button
                  key={ai.type}
                  onClick={() => onSelectAI(ai.type)}
                  className={`w-full flex items-start gap-3 px-3 py-3 rounded-lg transition text-left border ${
                    currentAI === ai.type
                      ? 'bg-purple-500/20 border-purple-500/30'
                      : 'border-transparent hover:bg-white/5'
                  }`}
                >
                  <ai.icon className={`w-5 h-5 mt-0.5 ${ai.color}`} />
                  <div>
                    <p className={`text-sm font-medium ${currentAI === ai.type ? 'text-white' : 'text-gray-300'}`}>
                      {ai.title}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">{ai.description}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </nav>

      {/* USER MENU */}
      <div ref={menuRef} className="p-3 mt-auto border-t border-white/10 relative">

        {/* USER DISPLAY BUTTON */}
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="w-full flex items-center justify-between px-3 py-2 rounded-lg transition hover:bg-white/5"
        >
          <div className="flex items-center gap-3">

            {/* Avatar */}
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-gray-100 text-lg font-semibold">
              {user ? user.name?.charAt(0)?.toUpperCase() : "U"}
            </div>

            {/* User Info */}
            <div className="text-left">
              <p className="text-sm text-white font-medium">
                {user ? user.name : "Guest User"}
              </p>

              {/* HIDE EMAIL if NOT logged in */}
              {user && (
                <p className="text-xs text-gray-400 leading-none">{user.email}</p>
              )}
            </div>

          </div>

          <ChevronDown
            className={`w-4 h-4 text-gray-400 transition-transform ${showMenu ? "rotate-180" : ""}`}
          />
        </button>

        {/* DROPDOWN MENU */}
        {showMenu && (
          <div
            className="
              absolute bottom-14 left-0 right-0 z-20 bg-[#1a1a2e] 
              border border-white/10 rounded-lg shadow-xl py-1 
              transform origin-bottom animate-slideFadeIn
            "
          >
            {/* HOME */}
            <button
              onClick={() => navigate('/')}
              className="w-full px-4 py-2 text-sm text-gray-300 hover:bg-white/10 flex items-center gap-2 rounded-md transition"
            >
              <Home className="w-4 h-4 text-gray-300" />
              Home
            </button>


            {user && (
              <button
                onClick={() => navigate('/my-talks')}
                className="w-full px-4 py-2 text-sm text-purple-300 hover:bg-purple-500/10 flex items-center gap-2 rounded-md transition"
              >
                <MessageCircleMore className="w-4 h-4" />
                My Talks
              </button>
            )}

            {/* ABOUT — ONLY WHEN LOGGED OUT */}
            {!user && (
              <button
                onClick={() => navigate('/about')}
                className="w-full px-4 py-2 text-sm text-gray-300 hover:bg-white/10 flex items-center gap-2 rounded-md transition"
              >
                <Info className="w-4 h-4" />
                About
              </button>
            )}

            {/* FEEDBACK */}
            <button
              onClick={() => navigate('/contact')}
              className="w-full px-4 py-2 text-sm text-blue-300 hover:bg-blue-500/10 flex items-center gap-2 rounded-md transition"
            >
              <MessageSquare className="w-4 h-4 text-blue-300" />
              Feedback
            </button>

            {/* CONDITIONAL LOGIN / LOGOUT */}
            {!user ? (
              <button
                onClick={() => navigate('/login')}
                className="w-full px-4 py-2 text-sm text-green-300 hover:bg-green-500/10 flex items-center gap-2 rounded-md transition"
              >
                <LogIn className="w-4 h-4 text-green-300" />
                Login
              </button>
            ) : (
              <button
                onClick={() => {
                  logout();
                  navigate('/');
                }}
                className="w-full px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-2 rounded-md transition"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            )}

          </div>
        )}

      </div>
    </aside>
  );
}
