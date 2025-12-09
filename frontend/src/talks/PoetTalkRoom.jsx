import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Feather } from "lucide-react";
import ChatMessage from "../Componentss/ChatMessage";

// const API_URL = "http://localhost:8080/api/chats/history/poet";
const API_URL = `${import.meta.env.VITE_BACKEND_URL}/api/chats/history/poet`;


export default function PoetTalkRoom() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef(null);

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
            // USER MESSAGE
            formatted.push({
              role: "user",
              content: item.message,
            });

            // ASSISTANT RESPONSE
            formatted.push({
              role: "assistant",
              content: item.response,
            });
          });

          setMessages(formatted);
        }
      } catch (err) {
        console.error("Error loading poet history:", err);
      }

      setLoading(false);
    };

    fetchHistory();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex-1 flex flex-col h-screen">
      {/* HEADER */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500/20 
            to-purple-600/20 border border-purple-500/30 flex items-center justify-center">
            <Feather className="w-7 h-7 text-purple-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">The Poet's Talk Room</h1>
            <p className="text-gray-400 text-sm">Your poetic memories & conversations.</p>
          </div>
        </div>
      </div>

      {/* CHAT AREA */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">

        {loading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <Feather className="w-16 h-16 text-purple-400/40 mx-auto mb-4" />
            <p className="text-gray-400">Fetching your poetic chats...</p>
          </motion.div>
        ) : messages.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <Feather className="w-16 h-16 text-purple-400/50 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">No Past Conversations</h2>
            <p className="text-gray-400 max-w-md mx-auto">
              Once you talk with The Poet, your beautiful verses will appear here.
            </p>
          </motion.div>
        ) : (
          messages.map((msg, index) => (
            <ChatMessage
              key={index}
              message={msg.content}
              isUser={msg.role === "user"}
            />
          ))
        )}

        <div ref={bottomRef}></div>
      </div>
    </div>
  );
}
