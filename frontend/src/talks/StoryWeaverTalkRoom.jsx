import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { BookOpen } from "lucide-react";
import StoryWeaverMessage from "@/app-components/StoryWeaverMessage.jsx";

// const API_URL = "http://localhost:8080/api/chats/history/story";
const API_URL = `${import.meta.env.VITE_BACKEND_URL}/api/chats/history/story`;

export default function StoryWeaverTalkRoom() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

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
            // User message
            formatted.push({
              role: "user",
              content: item.message,
              confidence: null,
            });

            // Assistant response
            formatted.push({
              role: "assistant",
              content: item.response,
              confidence: "95%",
            });
          });

          setMessages(formatted);
        }
      } catch (err) {
        console.error("Failed to load Story Weaver history:", err);
      }
      setLoading(false);
    };

    fetchHistory();
  }, []);

  return (
    <div className="flex-1 flex flex-col h-screen">

      {/* HEADER */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-4">
          <div
            className="w-14 h-14 rounded-2xl bg-gradient-to-br 
            from-orange-500/20 to-orange-600/20 
            border border-orange-500/30 flex items-center justify-center"
          >
            <BookOpen className="w-7 h-7 text-orange-400" />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-white">
              The Story Weaver’s Talk Room
            </h1>
            <p className="text-gray-400 text-sm">
              Revisit your stories, scripts, characters & ideas.
            </p>
          </div>
        </div>
      </div>

      {/* CHAT HISTORY AREA */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">

        {loading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <BookOpen className="w-16 h-16 text-orange-400/40 mx-auto mb-4" />
            <p className="text-gray-400">Loading your story conversations...</p>
          </motion.div>
        ) : messages.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <BookOpen className="w-16 h-16 text-orange-400/40 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">
              No Past Conversations
            </h2>
            <p className="text-gray-400 max-w-md mx-auto">
              When you create stories with The Story Weaver, they will
              appear here automatically.
            </p>
          </motion.div>
        ) : (
          messages.map((msg, index) => (
            <StoryWeaverMessage
              key={index}
              message={msg.content}
              isUser={msg.role === "user"}
              confidence={msg.confidence}
            />
          ))
        )}

      </div>
    </div>
  );
}
