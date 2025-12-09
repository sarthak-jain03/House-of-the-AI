import React, { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { Code2 } from "lucide-react";
import CodeWhispererMessage from "../app-components/CodeWhispererMessage.jsx";
import ChatMessage from "../app-components/ChatMessage.jsx";

const API_URL = `${import.meta.env.VITE_BACKEND_URL}/api/chats/history/coder`;
// const API_URL = "http://localhost:8080/api/chats/history/coder";
export default function CodeWhispererTalkRoom() {
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
           
            formatted.push({
              role: "user",
              content: item.message,
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
        console.error("Failed to load Code Whisperer history:", err);
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

      {/* Header */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-500/20 
            to-teal-600/20 border border-teal-500/30 flex items-center justify-center">
            <Code2 className="w-7 h-7 text-teal-400" />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-white">The Code Whisperer's Talk Room</h1>
            <p className="text-gray-400 text-sm">
              Your saved reviews, debugging sessions & code explanations.
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
            <h2 className="text-xl font-semibold text-white mb-2">
              No Previous Conversations
            </h2>
            <p className="text-gray-400 max-w-md mx-auto">
              As you chat with the Code Whisperer, your history will appear here.
            </p>
          </motion.div>
        ) : (
          messages.map((msg, idx) =>
            msg.role === "assistant" ? (
              <CodeWhispererMessage
                key={idx}
                message={msg.content}
                confidence={msg.confidence}
                toolsUsed="Code Whisperer"
              />
            ) : (
              <ChatMessage key={idx} message={msg.content} isUser />
            )
          )
        )}

        <div ref={bottomRef}></div>
      </div>
    </div>
  );
}
