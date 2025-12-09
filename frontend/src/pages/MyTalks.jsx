import React, { useState, useEffect } from 'react';
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
  const initialAI = urlParams.get('ai') || 'code_whisperer';
  const [currentAI, setCurrentAI] = useState(initialAI);

  const handleSelectAI = (aiType) => {
    setCurrentAI(aiType);
    window.history.pushState({}, '', `?ai=${aiType}`);
  };

  const RoomComponent = roomComponents[currentAI] || CodeWhispererTalkRoom;

  return (
    <div className="flex min-h-screen bg-[#0f0f1a]">

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
      
      <MyTalksSideBar currentAI={currentAI} onSelectAI={handleSelectAI} />

      
      
      <main className="flex-1 relative z-10">
        <RoomComponent />
      </main>
      
    </div>

    
  );
}
