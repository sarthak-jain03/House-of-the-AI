import React, { useState, useEffect } from 'react';
import AISidebar from '@/app-components/AISidebar.jsx';
import PoetRoom from '@/rooms/PoetRoom.jsx';
import CodeWhispererRoom from '@/rooms/CodeWhispererRoom.jsx';
import DataSageRoom from '@/rooms/DataSageRoom.jsx';
import StoryWeaverRoom from '@/rooms/StoryWeaverRoom.jsx';
import DoctorRoom from '@/rooms/DoctorRoom.jsx';
import { Menu } from 'lucide-react';

const roomComponents = {
  poet: PoetRoom,
  code_whisperer: CodeWhispererRoom,
  data_sage: DataSageRoom,
  story_weaver: StoryWeaverRoom,
  doctor: DoctorRoom
};

export default function AIRoom() {
  const urlParams = new URLSearchParams(window.location.search);
  const initialAI = urlParams.get('ai') || 'code_whisperer';
  const [currentAI, setCurrentAI] = useState(initialAI);

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const handleSelectAI = (aiType) => {
    setCurrentAI(aiType);
    window.history.pushState({}, '', `?ai=${aiType}`);
    setMobileSidebarOpen(false);
  };

  const RoomComponent = roomComponents[currentAI] || CodeWhispererRoom;

  return (
    <div className="flex min-h-screen bg-[#0f0f1a] relative overflow-hidden">

      
      <div
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse at 20% 20%, rgba(124, 58, 237, 0.08) 0%, transparent 50%),
            radial-gradient(ellipse at 80% 30%, rgba(59, 130, 246, 0.06) 0%, transparent 50%),
            radial-gradient(ellipse at 40% 80%, rgba(168, 85, 247, 0.08) 0%, transparent 50%)
          `
        }}
      />

   
      <button
        onClick={() => setMobileSidebarOpen(true)}
        className="md:hidden fixed top-4 left-4 z-20 bg-white/10 hover:bg-white/20 
                   text-white p-2 rounded-lg backdrop-blur-md border border-white/10"
      >
        <Menu className="w-6 h-6" />
      </button>

      <div className="hidden md:block z-20">
        <AISidebar currentAI={currentAI} onSelectAI={handleSelectAI} />
      </div>

     
      {mobileSidebarOpen && (
        <div className="md:hidden fixed inset-0 z-30 flex">

         
          <div
            className="flex-1 bg-black/30 backdrop-blur-sm"
            onClick={() => setMobileSidebarOpen(false)}
          />

    
          <div className="w-64 bg-[#12121f] border-r border-white/10 animate-slideInLeft absolute left-0 top-0 bottom-0">
            <AISidebar currentAI={currentAI} onSelectAI={handleSelectAI} />
          </div>
        </div>
      )}

 
      <main className="flex-1 relative z-10 h-screen overflow-hidden">
        <RoomComponent />
      </main>

      <style>{`
        @keyframes slideInLeft {
          from { transform: translateX(-100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .animate-slideInLeft {
          animation: slideInLeft 0.3s ease-out forwards;
        }
      `}</style>

    </div>
  );
}
