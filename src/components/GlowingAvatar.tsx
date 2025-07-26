import React from 'react';

interface GlowingAvatarProps {
  isActive: boolean;
}

const GlowingAvatar: React.FC<GlowingAvatarProps> = ({ isActive }) => {
  return (
    <div className="relative flex items-center justify-center">
      {/* Outer glow rings - much more dramatic when active */}
      <div className={`absolute w-96 h-96 rounded-full transition-all duration-500 ${
        isActive 
          ? 'bg-gradient-to-r from-blue-400/50 to-indigo-500/50 animate-ping' 
          : 'bg-gradient-to-r from-blue-300/20 to-indigo-400/20'
      }`} />
      
      <div className={`absolute w-80 h-80 rounded-full transition-all duration-700 ${
        isActive 
          ? 'bg-gradient-to-r from-blue-500/60 to-indigo-600/60 animate-pulse' 
          : 'bg-gradient-to-r from-blue-400/30 to-indigo-500/30'
      }`} />
      
      <div className={`absolute w-64 h-64 rounded-full transition-all duration-300 ${
        isActive 
          ? 'bg-gradient-to-r from-blue-600/70 to-indigo-700/70 animate-bounce' 
          : 'bg-gradient-to-r from-blue-500/40 to-indigo-600/40'
      }`} />
      
      {/* Main avatar circle - much more dramatic scaling and glow */}
      <div className={`relative rounded-full transition-all duration-300 transform ${
        isActive 
          ? 'w-56 h-56 bg-gradient-to-r from-blue-700 to-indigo-800 shadow-2xl shadow-blue-500/80 scale-110' 
          : 'w-48 h-48 bg-gradient-to-r from-blue-500 to-indigo-600 shadow-xl shadow-blue-400/30 scale-100'
      }`}>
        {/* Inner light effect - more prominent when active */}
        <div className={`absolute inset-4 rounded-full transition-all duration-300 ${
          isActive 
            ? 'bg-gradient-to-r from-white/40 to-transparent animate-pulse' 
            : 'bg-gradient-to-r from-white/20 to-transparent'
        }`} />
        
        {/* Pulsing center dot - much larger when active */}
        <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-full transition-all duration-200 ${
          isActive 
            ? 'w-8 h-8 bg-white animate-ping shadow-lg' 
            : 'w-4 h-4 bg-white/70'
        }`} />
        
        {/* Speaking indicator waves - more prominent */}
        {isActive && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="absolute w-12 h-2 bg-white/80 rounded-full animate-pulse" style={{ top: '-6px' }} />
            <div className="absolute w-16 h-2 bg-white/60 rounded-full animate-pulse delay-100" style={{ top: '-2px' }} />
            <div className="absolute w-20 h-2 bg-white/40 rounded-full animate-pulse delay-200" style={{ top: '2px' }} />
            <div className="absolute w-16 h-2 bg-white/60 rounded-full animate-pulse delay-300" style={{ top: '6px' }} />
            <div className="absolute w-12 h-2 bg-white/80 rounded-full animate-pulse delay-400" style={{ top: '10px' }} />
          </div>
        )}
        
        {/* Breathing effect border when active */}
        {isActive && (
          <div className="absolute inset-0 rounded-full border-4 border-white/50 animate-ping" />
        )}
      </div>
      
      {/* Floating particles effect - more particles when active */}
      {isActive && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="absolute w-3 h-3 bg-blue-300 rounded-full animate-bounce opacity-80"
              style={{
                left: `${15 + i * 6}%`,
                top: `${20 + (i % 3) * 20}%`,
                animationDelay: `${i * 0.15}s`,
                animationDuration: `${1.5 + (i % 3) * 0.5}s`
              }}
            />
          ))}
        </div>
      )}
      
      {/* Ripple effect when speaking */}
      {isActive && (
        <>
          <div className="absolute w-72 h-72 rounded-full border-2 border-blue-400/30 animate-ping" />
          <div className="absolute w-80 h-80 rounded-full border-2 border-blue-300/20 animate-ping delay-300" />
          <div className="absolute w-88 h-88 rounded-full border-2 border-blue-200/10 animate-ping delay-500" />
        </>
      )}
      </div>
  );
};

export default GlowingAvatar;