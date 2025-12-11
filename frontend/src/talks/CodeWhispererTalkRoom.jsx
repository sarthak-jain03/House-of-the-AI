import React, { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { Code2 } from "lucide-react";
import CodeWhispererMessage from "@/app-components/CodeWhispererMessage.jsx";
import ChatMessage from "@/app-components/ChatMessage.jsx";

const API_URL = `${import.meta.env.VITE_BACKEND_URL}/api/chats/history/coder`;

export default function CodeWhispererTalkRoom() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [headerCollapsed, setHeaderCollapsed] = useState(false);

  const bottomRef = useRef(null);
  const chatRef = useRef(null);

  
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch(API_URL, {
          method: "GET",
          credentials: "include",
        });

        const data = await res.json();

        if (data.success && Array.isArray(data.history)) {
          const formatted = [];

          data.history.forEach((item) => {
            formatted.push({ role: "user", content: item.message });
            formatted.push({
              role: "assistant",
              content: item.response,
              confidence: "95%",
            });
          });

          setMessages(formatted);
        }
      } catch (err) {
        console.error("Failed to load Code Whisperer history:", err);
      }

      setLoading(false);
    };

    fetchHistory();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);


  useEffect(() => {
    const div = chatRef.current;

    if (!div) return;

    const handleScroll = () => {
      if (div.scrollTop > 40) setHeaderCollapsed(true);
      else setHeaderCollapsed(false);
    };

    div.addEventListener("scroll", handleScroll);
    return () => div.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="flex-1 flex flex-col h-screen overflow-x-hidden">

      {/* HEADER */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-4">
          <div className="flex w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-teal-500/20 
            to-teal-600/20 border border-teal-500/30 items-center justify-center">
            
            <Code2 className="w-5 h-5 sm:w-7 sm:h-7 text-teal-400" />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-white hidden sm:block">The Code Whisperer's Talk Room</h1>
            <h1 className="text-xl font-bold text-white sm:hidden">Code Whisperer's Talk Room</h1>
            <p className="text-gray-400 text-sm hidden sm:block">
              Your saved reviews, debugging sessions & code explanations.
            </p>
            <p className="sm:hidden text-sm text-gray-400">Your saved codes & explaination</p>
          </div>
        </div>
      </div>

      {/* CHAT AREA */}
      <div
        ref={chatRef}
        className="
          flex-1 overflow-y-auto 
          px-3 sm:px-6 
          py-4 sm:py-6 
          space-y-3 sm:space-y-6
          overflow-x-hidden
        "
      >
        {loading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <Code2 className="w-16 h-16 text-teal-400/40 mx-auto mb-4" />
            <p className="text-gray-400">Loading your Code Whisperer chats...</p>
          </motion.div>
        ) : messages.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <Code2 className="w-16 h-16 text-teal-400/40 mx-auto mb-4" />
            <h2 className="text-lg sm:text-xl font-semibold text-white mb-2">
              No Previous Conversations
            </h2>
            <p className="text-gray-400 max-w-md mx-auto text-sm sm:text-base">
              As you chat with the Code Whisperer, your history will appear here.
            </p>
          </motion.div>
        ) : (
          messages.map((msg, idx) =>
            msg.role === "assistant" ? (
              <div key={idx} className="max-w-full break-words break-all overflow-x-hidden">
                <CodeWhispererMessage
                  message={msg.content}
                  confidence={msg.confidence}
                  toolsUsed="Code Whisperer"
                />
              </div>
            ) : (
              <div key={idx} className="max-w-full break-words break-all overflow-x-hidden">
                <ChatMessage message={msg.content} isUser />
              </div>
            )
          )
        )}

        <div ref={bottomRef}></div>
      </div>
    </div>
  );
}
