import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function AuthBranding() {
  const navigate = useNavigate();

  return (
    <div className="absolute top-0 left-0 w-full z-[1000] px-[5vw] h-24 flex items-center pointer-events-none">
      <div 
        onClick={() => navigate('/')}
        className="flex items-center gap-0.5 cursor-pointer group pointer-events-auto"
      >
        <img
          src="/images/logo3.png"
          alt="LocalServe logo"
          className="w-20 h-20 object-contain drop-shadow-[0_0_24px_rgba(6,182,212,0.4)] group-hover:drop-shadow-[0_0_32px_rgba(6,182,212,0.6)] group-hover:scale-105 transition-all duration-300"
        />
        <span className="hidden sm:inline -ml-1 text-2xl font-extrabold text-white tracking-tight">
          Local<span className="text-indigo-400">Serve</span>
        </span>
      </div>
    </div>
  );
}
