import React, { useState } from 'react';
import { Send, Paperclip, Code } from 'lucide-react';

export default function DataSageChatInput({ onSend, placeholder, isLoading }) {
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() && !isLoading) {
      onSend(message);
      setMessage('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative">
      <div className="bg-[#1e1e2f] border border-white/10 rounded-2xl overflow-hidden">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={placeholder || "Type your message..."}
          disabled={isLoading}
          className="w-full bg-transparent px-5 py-4 text-white placeholder-gray-500 focus:outline-none pr-24"
        />
        
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
          <button
            type="button"
            className="p-2 text-gray-500 hover:text-gray-300 transition-colors"
          >
            {/* <Paperclip className="w-5 h-5" /> */}
          </button>
          <button
            type="button"
            className="p-2 text-gray-500 hover:text-gray-300 transition-colors"
          >
            {/* <Code className="w-5 h-5" /> */}
          </button>
          <button
            type="submit"
            disabled={!message.trim() || isLoading}
            className="p-2 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-all"
          >
            <Send className="w-5 h-5 text-white " />
          </button>
        </div>
      </div>
      
    
    </form>
  );
}