import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Navbar({ scrolled }) {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const scrollToSection = (id) => {
    if (id === "home") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
    setMenuOpen(false);
  };

  return (
    <>
      <nav
        className={`fixed top-0 left-0 w-full z-[1000] transition-all duration-300 px-[5vw] flex items-center justify-between
        ${scrolled 
          ? "h-20 bg-[#020818]/95 backdrop-blur-md border-b border-white/10 shadow-2xl" 
          : "h-24 bg-gradient-to-b from-black/70 to-transparent"
        }`}
      >
        {/* --- LOGO --- */}
        <div 
          onClick={() => scrollToSection("home")}
          className="flex items-center gap-0.5 cursor-pointer group"
        >
          <img
            src="/images/logo3.png"
            alt="LocalServe logo"
            className="w-20 h-20 object-contain drop-shadow-[0_0_14px_rgba(99,102,241,0.4)] group-hover:scale-105 transition-transform"
          />
          <span className="hidden sm:inline -ml-1 text-2xl font-extrabold text-white tracking-tight">
            Local<span className="text-indigo-400">Serve</span>
          </span>
        </div>

        {/* --- DESKTOP LINKS --- */}
        <div className="hidden lg:flex items-center gap-8">
          {["Home", "Services", "How it Works", "Pricing"].map((l) => (
            <button
              key={l}
              onClick={() => scrollToSection(l.toLowerCase().replace(/\s+/g, "-"))}
              className="text-sm font-medium text-gray-400 hover:text-white transition-colors duration-200"
            >
              {l}
            </button>
          ))}
        </div>

        {/* --- DESKTOP BUTTONS --- */}
        <div className="hidden lg:flex items-center gap-4">
          <button
            onClick={() => navigate("/login")}
            className="px-5 py-2 text-sm font-medium text-white border border-white/20 rounded-lg hover:bg-white/10 transition-all shadow-sm"
          >
            Sign In
          </button>
          <button
            onClick={() => navigate("/register")}
            className="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-500 hover:-translate-y-0.5 transition-all shadow-[0_0_20px_rgba(99,102,241,0.4)]"
          >
            Get Started →
          </button>
        </div>

        {/* --- MOBILE TOGGLE --- */}
        <button 
          onClick={() => setMenuOpen(!menuOpen)}
          className="lg:hidden p-2 text-white z-[1100]"
        >
          <div className="w-6 h-0.5 bg-current mb-1.5 transition-all duration-300" 
               style={{ transform: menuOpen ? "rotate(45deg) translateY(8px)" : "" }} />
          <div className="w-6 h-0.5 bg-current mb-1.5 transition-all duration-300" 
               style={{ opacity: menuOpen ? 0 : 1 }} />
          <div className="w-6 h-0.5 bg-current transition-all duration-300" 
               style={{ transform: menuOpen ? "rotate(-45deg) translateY(-8px)" : "" }} />
        </button>
      </nav>

      {/* --- MOBILE MENU OVERLAY --- */}
      <div className={`fixed inset-0 bg-[#020818] z-[900] flex flex-col items-center justify-center gap-8 transition-transform duration-500 lg:hidden
        ${menuOpen ? "translate-y-0" : "-translate-y-full"}`}
      >
        {["Home", "Services", "How it Works", "Pricing"].map((l) => (
          <button
            key={l}
            onClick={() => scrollToSection(l.toLowerCase().replace(/\s+/g, "-"))}
            className="text-2xl font-bold text-white hover:text-indigo-400 transition-colors"
          >
            {l}
          </button>
        ))}
        <div className="flex flex-col gap-4 w-[80%] mt-4">
          <button 
            onClick={() => { navigate("/login"); setMenuOpen(false); }}
            className="w-full py-4 rounded-xl border border-white/10 text-white font-medium"
          >
            Sign In
          </button>
          <button 
            onClick={() => { navigate("/register"); setMenuOpen(false); }}
            className="w-full py-4 rounded-xl bg-indigo-600 text-white font-bold shadow-xl"
          >
            Get Started
          </button>
        </div>
      </div>
    </>
  );
}