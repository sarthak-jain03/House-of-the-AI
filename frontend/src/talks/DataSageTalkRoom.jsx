import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { BarChart3 } from "lucide-react";
import DataSageMessage from "../Componentss/DataSageMessage";

// const API_URL = "http://localhost:8080/api/chats/history/datasage";
const API_URL = `${import.meta.env.VITE_BACKEND_URL}/api/chats/history/datasage`;

export default function DataSageTalkRoom() {
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
           
            formatted.push({
              role: "user",
              content: item.message,
              confidence: null,
            });

           
            formatted.push({
              role: "assistant",
              content: item.response,
              confidence: "95%",
            });
          });

          setMessages(formatted);
        }
      } catch (err) {
        console.error("Failed to load Data Sage history:", err);
      }

      setLoading(false);
    };

    fetchHistory();
  }, []);

  return (
    <div className="flex-1 flex flex-col h-screen">

      {/* Header */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br 
              from-blue-500/20 to-blue-600/20 border border-blue-500/30 
              flex items-center justify-center">
            <BarChart3 className="w-7 h-7 text-blue-400" />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-white">The Data Sage's Talk Room</h1>
            <p className="text-gray-400 text-sm">
              Your saved dataset questions, insights & analysis.
            </p>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">

        {loading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <BarChart3 className="w-16 h-16 text-blue-400/40 mx-auto mb-4" />
            <p className="text-gray-400">Fetching your Data Sage chats...</p>
          </motion.div>
        ) : messages.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <BarChart3 className="w-16 h-16 text-blue-400/40 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">
              No Past Conversations
            </h2>
            <p className="text-gray-400 max-w-md mx-auto">
              Once you interact with The Data Sage, your previous dataset chats will
              appear here.
            </p>
          </motion.div>
        ) : (
          messages.map((msg, idx) => (
            <DataSageMessage
              key={idx}
              message={msg.content}
              isUser={msg.role === "user"}
              // confidence={msg.confidence}
            />
          ))
        )}

      </div>
    </div>
  );
}
