import React, { useState } from "react";
import { motion } from "framer-motion";
import { BookOpen, Sparkles, Film, Scroll, Users, GitBranch } from "lucide-react";
import StoryWeaverChatInput from "@/app-components/StoryWeaverChatInput.jsx";
import StoryWeaverMessage from "@/app-components/StoryWeaverMessage.jsx";

// Save chat to MongoDB
const SAVE_CHAT_URL = `${import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080'}/api/chats/save`;
const PYTHON_API_URL = `${import.meta.env.VITE_INFERENCE_API_URL}/story_weaver_chat`;


const saveChatToDB = async (userMessage, assistantResponse) => {
  try {
    await fetch(SAVE_CHAT_URL, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        aiType: "story",
        message: userMessage,
        response: assistantResponse,
      }),
    });
  } catch (err) {
    console.error("StoryWeaver Chat Save Error:", err);
  }
};

export default function StoryWeaverRoom() {
  const [messages, setMessages] = useState([]);
  const [storyText, setStoryText] = useState("");  
  const [isLoading, setIsLoading] = useState(false);

  const triggerRequest = async (action, optionalPrompt = "") => {
    const finalPrompt = optionalPrompt || action;

    setMessages((prev) => [...prev, { role: "user", content: finalPrompt }]);
    setIsLoading(true);

    try {
      const res = await fetch(PYTHON_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          story: storyText,
          prompt: finalPrompt,
        }),
      });

      const data = await res.json();

      if (data.updated_story) {
        setStoryText(data.updated_story);
      }

      const assistantReply = data.response || "No response received.";

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: assistantReply,
          confidence: data.confidence || Math.floor(Math.random() * 10) + 90,
        },
      ]);

      // SAVE CHAT TO DATABASE
      await saveChatToDB(finalPrompt, assistantReply);

    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Unable to generate content. Please try again.",
          confidence: 0,
        },
      ]);
    }

    setIsLoading(false);
  };

  const handleSend = (message) => {
    if (!message.trim()) return;

    if (storyText === "") setStoryText(message);

    triggerRequest("continue_story", message);
  };

  const handleWriteScript = () => triggerRequest("Write Script");
  const handleAddCharacter = () => triggerRequest("Add Character");
  const handlePlotOutline = () => triggerRequest("Plot Outline");
  const handleAltDirections = () => triggerRequest("Alternate Directions");

  const handleNewStory = () => {
    setMessages([]);
    setStoryText("");
  };

  const handleExploreAIs = () => {
    alert("Redirect to AI menu or dashboard here.");
  };

  return (
    <div className="flex-1 flex flex-col h-screen">
      
      {/* HEADER */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500/20 
          to-orange-600/20 border border-orange-500/30 flex items-center justify-center">
            <BookOpen className="w-7 h-7 text-orange-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">The Story Weaver's Room</h1>
            <p className="text-gray-400 text-sm">
              Craft compelling narratives, scripts, characters, and story arcs.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 mt-4">
          <button
            className="px-5 py-2 bg-gradient-to-r from-orange-500 to-orange-600 
            text-white rounded-full text-sm font-medium"
          >
            Explore Our AIs
          </button>

          <button
            onClick={handleNewStory}
            className="px-5 py-2 bg-white/10 hover:bg-white/20 text-white rounded-full 
            text-sm font-medium transition-colors flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            New Story
          </button>
        </div>
      </div>

      {/* QUICK ACTIONS */}
<div className="px-6 py-4 border-b border-white/10">
  <div className="flex items-center gap-3 flex-wrap">

    <button
      onClick={handleWriteScript}
      disabled={storyText.trim() === ""}
      className={`px-4 py-2 rounded-lg text-sm flex items-center gap-2 border 
        ${storyText.trim() !== "" 
          ? "bg-orange-500/10 border-orange-500/30 text-orange-400 hover:bg-orange-500/20" 
          : "bg-gray-800/40 border-gray-700 text-gray-600 cursor-not-allowed"
        }`}
    >
      <Film className="w-4 h-4" />
      Write Script
    </button>

    <button
      onClick={handleAddCharacter}
      disabled={storyText.trim() === ""}
      className={`px-4 py-2 rounded-lg text-sm flex items-center gap-2 border
        ${storyText.trim() !== "" 
          ? "bg-orange-500/10 border-orange-500/30 text-orange-400 hover:bg-orange-500/20" 
          : "bg-gray-800/40 border-gray-700 text-gray-600 cursor-not-allowed"
        }`}
    >
      <Users className="w-4 h-4" />
      Add Character
    </button>

    <button
      onClick={handlePlotOutline}
      disabled={storyText.trim() === ""}
      className={`px-4 py-2 rounded-lg text-sm flex items-center gap-2 border
        ${storyText.trim() !== "" 
          ? "bg-orange-500/10 border-orange-500/30 text-orange-400 hover:bg-orange-500/20" 
          : "bg-gray-800/40 border-gray-700 text-gray-600 cursor-not-allowed"
        }`}
    >
      <Scroll className="w-4 h-4" />
      Plot Outline
    </button>

    <button
      onClick={handleAltDirections}
      disabled={storyText.trim() === ""}
      className={`px-4 py-2 rounded-lg text-sm flex items-center gap-2 border
        ${storyText.trim() !== "" 
          ? "bg-orange-500/10 border-orange-500/30 text-orange-400 hover:bg-orange-500/20" 
          : "bg-gray-800/40 border-gray-700 text-gray-600 cursor-not-allowed"
        }`}
    >
      <GitBranch className="w-4 h-4" />
      Alternative Directions
    </button>

  </div>
</div>


      {/* CHAT AREA */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        
        {messages.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <BookOpen className="w-16 h-16 text-orange-400/50 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">
              Welcome to The Story Weaver's Room
            </h2>
            <p className="text-gray-400 max-w-md mx-auto">
              Start by typing your story idea, and I will expand it into plots,
              characters, scripts, arcs, twists, and more.
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

        {isLoading && (
          <div className="flex items-center gap-2 text-gray-400">
            <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" />
            <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
            <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
          </div>
        )}

      </div>

      {/* INPUT */}
      <div className="p-6 border-t border-white/10">
        <StoryWeaverChatInput
          onSend={handleSend}
          placeholder="Start by typing your story..."
          isLoading={isLoading}
        />
      </div>

    </div>
  );
}
