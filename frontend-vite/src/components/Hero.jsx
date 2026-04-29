import React from "react";
import Typewriter from 'typewriter-effect';

export default function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center py-[120px] px-4 sm:px-[5vw] text-center overflow-hidden bg-[#020818]">
      
      {/* ─── SPIDER WEB EFFECT (SVG MESH) ─── */}
      <div className="absolute inset-0 opacity-40 pointer-events-none">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="mesh" width="100" height="100" patternUnits="userSpaceOnUse">
              <path d="M 100 0 L 0 0 0 100" fill="none" stroke="rgba(99,102,241,0.15)" strokeWidth="0.5" />
              <circle cx="0" cy="0" r="1" fill="rgba(99,102,241,0.3)" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#mesh)" />
        </svg>
      </div>

      {/* ─── FLOATING 3D GLASS ORBS (BOWLS) - Hidden on mobile ─── */}
      {/* Orb 1 */}
      <div className="float-slow absolute top-[15%] left-[10%] w-[100px] h-[100px] sm:w-[150px] sm:h-[150px] rounded-full border border-white/10 backdrop-blur-md 
        bg-[radial-gradient(circle_at_30%_30%,rgba(99,102,241,0.2),transparent)] 
        shadow-[inset_-10px_-10px_20px_rgba(0,0,0,0.5),0_0_30px_rgba(99,102,241,0.2)] hidden md:block" />

      {/* Orb 2 (Small) */}
      <div className="float absolute bottom-[20%] right-[15%] w-14 h-14 sm:w-20 sm:h-20 rounded-full border border-white/10 backdrop-blur-sm delay-1000
        bg-[radial-gradient(circle_at_30%_30%,rgba(139,92,246,0.15),transparent)] hidden md:block" />

      {/* Orb 3 (Large Glass Bowl Style) */}
      <div className="float-slow absolute top-[40%] right-[5%] w-[150px] h-[150px] sm:w-[200px] sm:h-[200px] rounded-full border border-white/10 backdrop-blur-[2px] 
        bg-white/[0.01] shadow-[0_0_50px_rgba(99,102,241,0.1)] -rotate-[15deg] delay-[2s]
        [clip-path:polygon(0%_0%,100%_0%,100%_100%,0%_100%,0%_50%)] hidden lg:block" />

      {/* ─── HERO CONTENT ─── */}
      <div className="fade-up relative z-10 inline-flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 mb-6 sm:mb-8 text-[11px] sm:text-xs font-medium text-indigo-300">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
        </span>
        Now live in 50+ cities across India
      </div>


    <h1 className="fade-up fade-up-1 relative z-10 text-[clamp(32px,8vw,88px)] font-extrabold leading-[1.05] tracking-tighter mb-4 sm:mb-6 max-w-[900px] text-white">
        Your Home Deserves<br />
        <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-sky-400 bg-clip-text text-transparent inline-block">
          
          {/* 3. Yahan par Typewriter component paste karo */}
          <Typewriter
            options={{
              strings: ['Expert Care', 'Quality Service', 'Verified Pros'],
              autoStart: true,
              loop: true,
              delay: 75,
              deleteSpeed: 50,
              cursor: '<span style="color: #818cf8; font-weight: 300;">|</span>', 
            }}
          />

        </span>
      </h1>

      <p className="fade-up fade-up-2 relative z-10 text-[clamp(14px,3vw,20px)] text-white/50 max-w-[560px] mb-8 sm:mb-12 leading-relaxed font-light px-4">
        Book verified plumbers, electricians, cleaners & more. Trusted by 50,000+ homeowners.
      </p>

      {/* Search Bar */}
      <div className="fade-up fade-up-3 relative z-10 w-full max-w-[640px] flex flex-col sm:flex-row items-center gap-3 bg-white/[0.03] border border-white/10 rounded-[20px] p-3 sm:p-2 sm:pl-6 backdrop-blur-xl mb-8 sm:mb-12">
        <span className="text-xl hidden sm:inline">🔍</span>
        <input 
          type="text"
          placeholder="Search for a service..." 
          className="w-full sm:flex-1 bg-transparent border-none outline-none text-base text-white placeholder:text-white/30" 
        />
        <button className="shimmer-btn bg-gradient-to-r from-indigo-600 to-purple-600 px-6 sm:px-8 py-3 sm:py-3.5 rounded-xl text-white font-bold transition-all hover:scale-[1.02] active:scale-95 whitespace-nowrap w-full sm:w-auto">
          Search
        </button>
      </div>

      {/* Popular Tags Section */}
<div className="fade-up fade-up-4 mt-6 sm:mt-8 flex flex-wrap justify-center gap-2 sm:gap-3 relative z-10 px-4">
  <span className="text-xs sm:text-sm text-white/40 font-medium self-center mr-2">
    Popular:
  </span>
  
  {["🔧 Plumber", "⚡ Electrician", "❄️ AC Repair", "🧹 Cleaning", "🎨 Painting"].map((tag) => (
    <button
      key={tag}
      className="px-3 py-1.5 sm:px-5 sm:py-2 rounded-full bg-white/5 border border-white/10 text-xs sm:text-sm text-white/70 
                 hover:bg-indigo-500/20 hover:border-indigo-500/40 hover:text-indigo-300 
                 transition-all duration-300 cursor-pointer backdrop-blur-sm"
    >
      {tag}
    </button>
  ))}
</div>

      {/* Floating Labels - Hidden on mobile/tablet */}
      <div className="float absolute left-[5%] top-[45%] px-5 py-3 bg-white/[0.05] border border-white/10 rounded-2xl backdrop-blur-md text-left hidden xl:block">
        <div className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider">Average Rating</div>
        <div className="text-sm text-white font-medium">4.3/5 ⭐⭐⭐⭐</div>
      </div>

      {/* Global CSS for Animations (Put this in your index.css) */}
      <style jsx="true">{`
        .float { animation: float 4s ease-in-out infinite; }
        .float-slow { animation: float-slow 6s ease-in-out infinite; }
        @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-20px); } }
        @keyframes float-slow { 0%, 100% { transform: translate(0, 0); } 50% { transform: translate(10px, -30px); } }
        .shimmer-btn {
          background-size: 200% auto;
          animation: shimmer 2.5s linear infinite;
        }
        @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
      `}</style>

    </section>
  );
}