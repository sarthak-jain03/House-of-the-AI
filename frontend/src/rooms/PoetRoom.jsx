import React, { useState } from "react";
import { motion } from "framer-motion";
import { Feather, Sparkles } from "lucide-react";
import ChatMessage from "../Componentss/ChatMessage";
import ChatInput from "../Componentss/ChatInput";

const PYTHON_API = `${import.meta.env.VITE_INFERENCE_API_URL}/poet_chat`;
// const PYTHON_API = "http://127.0.0.1:5000/poet_chat";
const NODE_SAVE_API = `${import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080'}/api/chats/save`;

export default function PoetRoom() {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);


  const saveChat = async (message, response) => {
    try {
      await fetch(NODE_SAVE_API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          aiType: "poet",
          message,
          response,
        }),
      });
    } catch (err) {
      console.error("Save chat error:", err);
    }
  };


  const handleSend = async (message) => {
    if (!message.trim()) return;

    setMessages((prev) => [...prev, { role: "user", content: message }]);
    setIsLoading(true);

    const tempMessage = {
      role: "assistant",
      content: "The Poet is thinking...",
    };
    setMessages((prev) => [...prev, tempMessage]);

    try {
    
      const res = await fetch(PYTHON_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `
            You are **The Poet**, an AI spirit of verse.
            Always respond with beautiful, expressive poetry.
            User: ${message}
          `,
        }),
      });

      const data = await res.json();

      
      setMessages((prev) => prev.filter((m) => m !== tempMessage));

      const assistantMsg = {
        role: "assistant",
        content: data.response,
        confidence: data.confidence,
      };

      setMessages((prev) => [...prev, assistantMsg]);

      // SAVE CHAT INTO MONGODB
      saveChat(message, data.response);

    } catch (err) {
      console.error("Poet API Error:", err);

      setMessages((prev) =>
        prev.filter((m) => m !== tempMessage)
      );

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Connection Error: Could not reach the AI server.",
          confidence: "0%",
        },
      ]);
    }

    setIsLoading(false);
  };

  return (
    <div className="flex-1 flex flex-col h-screen">

      {/* Header */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500/20 
            to-purple-600/20 border border-purple-500/30 flex items-center justify-center">
            <Feather className="w-7 h-7 text-purple-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">The Poet's Room</h1>
            <p className="text-gray-400 text-sm">Where words become living art.</p>
          </div>
        </div>

        <div className="flex items-center gap-3 mt-4">
          <button className="px-5 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-full text-sm font-medium">
            Explore Our AIs
          </button>
          <button className="px-5 py-2 bg-white/10 hover:bg-white/20 text-white rounded-full text-sm font-medium transition-colors flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            New
          </button>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <Feather className="w-16 h-16 text-purple-400/50 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">
              Welcome to The Poet's Room
            </h2>
            <p className="text-gray-400 max-w-md mx-auto">
              Ask for verses, stories, or emotions—we shall craft beauty together.
            </p>
          </motion.div>
        ) : (
          messages.map((msg, index) => (
            <ChatMessage
              key={index}
              message={msg.content}
              isUser={msg.role === "user"}
              confidence={msg.confidence}
            />
          ))
        )}

        {isLoading && (
          <div className="flex items-center gap-2 text-gray-400">
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" />
            <div
              className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"
              style={{ animationDelay: "0.1s" }}
            />
            <div
              className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"
              style={{ animationDelay: "0.2s" }}
            />
          </div>
        )}
      </div>

      {/* Input Box */}
      <div className="p-6 border-t border-white/10">
        <ChatInput
          onSend={handleSend}
          placeholder="Speak to the Poet..."
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
