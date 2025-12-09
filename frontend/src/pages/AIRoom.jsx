import React, { useState, useEffect } from 'react';
import AISidebar from '../app-components/AISidebar';
import PoetRoom from '../rooms/PoetRoom';
import CodeWhispererRoom from '../rooms/CodeWhispererRoom';
import DataSageRoom from '../rooms/DataSageRoom';
import StoryWeaverRoom from '../rooms/StoryWeaverRoom';
import DoctorRoom from '../rooms/DoctorRoom';

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

  const handleSelectAI = (aiType) => {
    setCurrentAI(aiType);
    window.history.pushState({}, '', `?ai=${aiType}`);
  };

  const RoomComponent = roomComponents[currentAI] || CodeWhispererRoom;

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
      
      <AISidebar currentAI={currentAI} onSelectAI={handleSelectAI} />
      
      <main className="flex-1 relative z-10">
        <RoomComponent />
      </main>
    </div>
  );
}