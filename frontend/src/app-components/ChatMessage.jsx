import React from 'react';
import { motion } from 'framer-motion';
import { User, Bot } from 'lucide-react';

export default function ChatMessage({ message, isUser, confidence }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}
    >
      {/* Avatar */}
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
        isUser 
          ? 'bg-gradient-to-br from-purple-500 to-purple-600' 
          : 'bg-gradient-to-br from-amber-500/20 to-amber-600/20 border border-amber-500/30'
      }`}>
        {isUser ? (
          <User className="w-4 h-4 text-white" />
        ) : (
          <Bot className="w-4 h-4 text-amber-400" /> 
        )}
      </div>

      {/* Message */}
      <div className={`max-w-[75%] ${isUser ? 'text-right' : ''}`}>
        <div className={`rounded-2xl px-4 py-3 ${
          isUser 
            ? 'bg-purple-500/30 border border-purple-500/30 text-white' 
            : 'bg-[#1e1e2f] border border-white/10 text-gray-200'
        }`}>
          <p className={`text-md text-left font-medium leading-relaxed whitespace-pre-wrap ${!isUser ? 'italic' : ''}`}>
                {message}
            </p>
        </div>
        
       
      </div>
    </motion.div>
  );
}