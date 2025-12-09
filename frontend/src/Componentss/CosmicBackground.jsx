import React from "react";

export default function CosmicBackground({ children }) {
  return (
    <div className="relative w-full min-h-screen overflow-hidden bg-[#0f0f1a]">
      
      
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse at 20% 20%, rgba(124, 58, 237, 0.15) 0%, transparent 50%),
            radial-gradient(ellipse at 80% 30%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
            radial-gradient(ellipse at 40% 80%, rgba(168, 85, 247, 0.12) 0%, transparent 50%),
            radial-gradient(ellipse at 90% 80%, rgba(20, 184, 166, 0.08) 0%, transparent 50%),
            linear-gradient(180deg, #0f0f1a 0%, #1a1a2e 50%, #16213e 100%)
          `
        }}
      />

      
      <div className="absolute inset-0 z-0 pointer-events-none">
        {[...Array(60)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white animate-pulse"
            style={{
              width: Math.random() * 3 + 1 + "px",
              height: Math.random() * 3 + 1 + "px",
              left: Math.random() * 100 + "%",
              top: Math.random() * 100 + "%",
              opacity: Math.random() * 0.5 + 0.3,
              animationDelay: Math.random() * 2 + "s",
              animationDuration: Math.random() * 2 + 2 + "s",
            }}
          />
        ))}
      </div>

      
      <div className="relative z-10 w-full">
        {children}
      </div>
    </div>
  );
}
