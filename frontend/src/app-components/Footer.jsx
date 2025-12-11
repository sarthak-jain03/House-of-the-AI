import React, { useEffect, useState } from "react";
import { Twitter, Linkedin, Github, Users } from "lucide-react";

const VISITOR_KEY = "visitorId_v1";

function getOrCreateVisitorId() {
  try {
    let id = localStorage.getItem(VISITOR_KEY);
    if (id) return id;

   
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
      id = crypto.randomUUID();
    } else {
     
      id = `${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    }

    localStorage.setItem(VISITOR_KEY, id);
    return id;
  } catch (err) {
    console.error("visitorId error:", err);
    return null;
  }
}

export default function Footer() {
  const [visitors, setVisitors] = useState(null);

  useEffect(() => {
    const fetchVisitors = async () => {
      try {
        
        const visitorId = getOrCreateVisitorId();

        
        const base = import.meta.env.VITE_BACKEND_URL || "";
        const url = `${base}/api/visitors${visitorId ? "?visitorId=" + encodeURIComponent(visitorId) : ""}`;

        const res = await fetch(url, { credentials: "include" });
        if (!res.ok) {
          
          const txt = await res.text().catch(() => "");
          console.error("Visitor fetch failed:", res.status, txt);
          return;
        }

        const data = await res.json();
        if (data.success) {
          setVisitors(data.count);
        } else {
          console.warn("Visitor API returned failure:", data);
        }
      } catch (err) {
        console.error("Visitor count error:", err);
      }
    };

    fetchVisitors();
  }, []);

  return (
    <footer className="z-10 border-t border-white/10 py-6 px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-gray-400 text-sm">© 2025 House of the AI</p>

       
        <div className="flex items-center gap-2 text-gray-400 text-sm">
          <Users className="w-4 h-4" />
          {visitors !== null ? (
            <span>{visitors.toLocaleString()} visitors</span>
          ) : (
            <span>Loading...</span>
          )}
        </div>

        
        <div className="flex items-center gap-4">
          <a href="https://x.com/Sarthak__jain_" target="_blank" rel="noreferrer" className="hover:text-white text-gray-400">
            <Twitter className="w-5 h-5" />
          </a>
          <a href="https://www.linkedin.com/in/sarthak-jain-3a2b38276/" target="_blank" rel="noreferrer" className="hover:text-white text-gray-400">
            <Linkedin className="w-5 h-5" />
          </a>
          <a href="https://github.com/sarthak-jain03/" target="_blank" rel="noreferrer" className="hover:text-white text-gray-400">
            <Github className="w-5 h-5" />
          </a>
        </div>
      </div>
    </footer>
  );
}
