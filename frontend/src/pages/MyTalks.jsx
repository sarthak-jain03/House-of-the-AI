import React, { useState } from 'react';
import { Menu } from "lucide-react";

import MyTalksSideBar from '@/app-components/MyTalksSideBar.jsx';
import PoetTalkRoom from '@/talks/PoetTalkRoom.jsx';
import CodeWhispererTalkRoom from '@/talks/CodeWhispererTalkRoom.jsx';
import DataSageTalkRoom from '@/talks/DataSageTalkRoom.jsx';
import StoryWeaverTalkRoom from '@/talks/StoryWeaverTalkRoom.jsx';
import DoctorRoom from '@/rooms/DoctorRoom.jsx';

const roomComponents = {
  poet: PoetTalkRoom,
  code_whisperer: CodeWhispererTalkRoom,
  data_sage: DataSageTalkRoom,
  story_weaver: StoryWeaverTalkRoom,
  doctor: DoctorRoom
};

export default function MyTalks() {
  const urlParams = new URLSearchParams(window.location.search);
  const initialAI = urlParams.get("ai") || "code_whisperer";
  const [currentAI, setCurrentAI] = useState(initialAI);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const handleSelectAI = (aiType) => {
    setCurrentAI(aiType);
    window.history.pushState({}, "", `?ai=${aiType}`);
    setMobileSidebarOpen(false); // close on mobile
  };

  const RoomComponent = roomComponents[currentAI] || CodeWhispererTalkRoom;

  return (
    <div className="flex h-screen overflow-hidden bg-[#0f0f1a] relative">

     
      <div
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse at 20% 20%, rgba(124, 58, 237, 0.08) 0%, transparent 50%),
            radial-gradient(ellipse at 80% 30%, rgba(59, 130, 246, 0.06) 0%, transparent 50%),
            radial-gradient(ellipse at 40% 80%, rgba(168, 85, 247, 0.08) 0%, transparent 50%)
          `,
        }}
      />

   
      <button
        onClick={() => setMobileSidebarOpen(true)}
        className="md:hidden fixed top-4 left-4 z-30 bg-white/10 hover:bg-white/20 
                   text-white p-2 rounded-lg backdrop-blur-md border border-white/10"
      >
        <Menu className="w-6 h-6" />
      </button>

      
      <div className="hidden md:block z-20">
        <MyTalksSideBar currentAI={currentAI} onSelectAI={handleSelectAI} />
      </div>

   
      {mobileSidebarOpen && (
        <div className="md:hidden fixed inset-0 z-30 flex">

         
          <div
            className="flex-1 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileSidebarOpen(false)}
          />

         
          <div className="w-64 bg-[#171527] border-r border-white/10 animate-slideInLeft absolute left-0 top-0 bottom-0">
            <MyTalksSideBar currentAI={currentAI} onSelectAI={handleSelectAI} />
          </div>

        </div>
      )}

      {/* MAIN CONTENT */}
      <main className="flex-1 overflow-y-auto min-h-0 relative z-10">
        <RoomComponent />
      </main>

    
      <style>{`
        @keyframes slideInLeft {
          from { transform: translateX(-100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .animate-slideInLeft {
          animation: slideInLeft 0.28s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
