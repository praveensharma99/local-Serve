import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config/api";

export default function Footer() {
  const navigate = useNavigate();
  const [dynamicServices, setDynamicServices] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Mouse tracking for reactive lighting
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const footerRef = useRef(null);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/categories/footer`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setDynamicServices(data.categories.slice(0, 8));
        }
      })
      .catch((err) => console.error("Error fetching footer services:", err))
      .finally(() => setLoading(false));
  }, []);

  const handleMouseMove = (e) => {
    if (footerRef.current) {
      const rect = footerRef.current.getBoundingClientRect();
      setMousePosition({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
  };

  const footerData = [
    { 
      title: "Company", 
      links: [
        { name: "About Us", action: () => {} }, 
        { name: "Careers", action: () => {} }, 
        { name: "Blog", action: () => {} }, 
        { name: "Press", action: () => {} }, 
        { name: "Partners", action: () => {} }
      ] 
    },
    { 
      title: "Support", 
      links: [
        { name: "Help Center", action: () => {} }, 
        { name: "Safety", action: () => {} }, 
        { name: "Terms", action: () => {} }, 
        { name: "Privacy", action: () => {} }, 
        { name: "Contact Us", action: () => {} }
      ] 
    },
  ];

  return (
    <footer 
      ref={footerRef}
      onMouseMove={handleMouseMove}
      className="relative overflow-hidden border-t border-indigo-500/20 px-6 py-12 lg:px-[5vw] lg:py-16 transition-all duration-500"
      style={{
        background: "linear-gradient(to bottom, #070B1A, #0F172A)",
      }}
    >
      {/* Background Effects */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Animated Gradient Aurora */}
        <div className="absolute top-[-50%] left-[-10%] w-[120%] h-[200%] bg-gradient-to-br from-blue-600/5 via-purple-600/5 to-cyan-500/5 blur-[100px] mix-blend-screen animate-pulse" style={{ animationDuration: '8s' }}></div>
        
        {/* Slow moving blur blobs */}
        <div className="absolute top-10 left-10 w-64 h-64 bg-indigo-600/10 rounded-full blur-[80px] animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-purple-600/10 rounded-full blur-[80px] animate-blob" style={{ animationDelay: "2s" }}></div>
        <div className="absolute -bottom-20 left-1/2 w-80 h-80 bg-blue-600/10 rounded-full blur-[100px] animate-blob" style={{ animationDelay: "4s" }}></div>
        
        {/* Subtle grid/noise texture */}
        <div 
          className="absolute inset-0 opacity-[0.15] mix-blend-overlay"
          style={{
            backgroundImage: "radial-gradient(rgba(255, 255, 255, 0.15) 1px, transparent 1px)",
            backgroundSize: "32px 32px"
          }}
        ></div>
        
        {/* Mouse reactive lighting */}
        <div 
          className="absolute w-[500px] h-[500px] rounded-full blur-[120px] bg-blue-500/10 transition-transform duration-300 ease-out"
          style={{
            transform: `translate(${mousePosition.x - 250}px, ${mousePosition.y - 250}px)`,
          }}
        ></div>
        
        {/* Top border glow sweep */}
        <div className="absolute top-0 left-0 h-[1px] w-[200%] bg-gradient-to-r from-transparent via-indigo-500/80 to-transparent animate-shimmer"></div>
        <div className="absolute top-0 left-0 w-full h-[1px] shadow-[0_0_15px_rgba(99,102,241,0.5)]"></div>
      </div>

      {/* Main Content (z-10 relative) */}
      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12 mb-12">
          
          {/* Brand Section */}
          <div className="col-span-2 lg:col-span-1 flex flex-col items-center lg:items-start text-center lg:text-left">
            <div className="flex items-center gap-3 mb-5 group cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <img
                src="/images/logo3.png"
                alt="LocalServe logo"
                className="w-20 h-20 object-contain drop-shadow-[0_0_15px_rgba(59,130,246,0.5)] group-hover:scale-105 group-hover:drop-shadow-[0_0_25px_rgba(139,92,246,0.8)] transition-all duration-500"
              />
              <span className="text-2xl font-extrabold text-white tracking-tight group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-400 group-hover:to-purple-500 transition-all duration-300">
                Local<span className="text-indigo-400 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-purple-400 group-hover:to-cyan-400">Serve</span>
              </span>
            </div>
            <p className="text-sm text-blue-100/60 leading-relaxed max-w-[280px]">
              India's most trusted home services platform. Bringing quality and reliability to your doorstep.
            </p>
            
            {/* Social Icons */}
            <div className="flex gap-4 mt-6">
              {["𝕏", "in", "fb", "▶"].map(s => (
                <div 
                  key={s} 
                  className="relative group w-10 h-10 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md flex items-center justify-center text-sm cursor-pointer text-white/80 hover:text-white transition-all duration-300 hover:-translate-y-1 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <span className="relative z-10 drop-shadow-[0_0_8px_rgba(255,255,255,0.5)] group-hover:drop-shadow-[0_0_12px_rgba(255,255,255,1)]">{s}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Dynamic Services Section */}
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
            <h4 className="text-[11px] font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 tracking-[0.2em] uppercase mb-6 drop-shadow-[0_0_5px_rgba(59,130,246,0.3)]">
              Services
            </h4>
            <div className="flex flex-col gap-3">
              {loading ? (
                <div className="text-sm text-white/20 animate-pulse">Loading...</div>
              ) : dynamicServices.length > 0 ? (
                dynamicServices.map((service) => (
                  <div 
                    key={service.slug} 
                    onClick={() => {
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                      navigate(`/services/${service.slug}`);
                    }}
                    className="group flex items-center gap-2 text-sm text-blue-100/50 cursor-pointer transition-all duration-300 hover:text-white"
                  >
                    <span className="h-[1px] w-0 bg-blue-500 group-hover:w-3 transition-all duration-300 ease-out"></span>
                    <span className="group-hover:drop-shadow-[0_0_8px_rgba(59,130,246,0.8)] transition-all duration-300">{service.name}</span>
                  </div>
                ))
              ) : (
                <div className="text-sm text-white/50">No services found</div>
              )}
            </div>
          </div>

          {/* Static Links Sections */}
          {footerData.map(col => (
            <div key={col.title} className="flex flex-col items-center lg:items-start text-center lg:text-left">
              <h4 className="text-[11px] font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 tracking-[0.2em] uppercase mb-6 drop-shadow-[0_0_5px_rgba(139,92,246,0.3)]">
                {col.title}
              </h4>
              <div className="flex flex-col gap-3">
                {col.links.map(l => (
                  <div 
                    key={l.name} 
                    onClick={l.action}
                    className="group flex items-center gap-2 text-sm text-blue-100/50 cursor-pointer transition-all duration-300 hover:text-white"
                  >
                    <span className="h-[1px] w-0 bg-purple-500 group-hover:w-3 transition-all duration-300 ease-out"></span>
                    <span className="group-hover:drop-shadow-[0_0_8px_rgba(139,92,246,0.8)] transition-all duration-300">{l.name}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="relative mt-12 pt-8 border-t border-white/5 flex flex-col lg:flex-row justify-between items-center gap-6">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-[1px] bg-gradient-to-r from-transparent via-blue-500/20 to-transparent"></div>
          
          <div className="text-[12px] text-blue-100/40 text-center lg:text-left order-2 lg:order-1 transition-colors duration-300 hover:text-blue-100/60">
            © 2026 LocalServe Technologies Pvt. Ltd. All rights reserved.
          </div>
          
          <div className="flex flex-wrap justify-center gap-5 lg:gap-8 order-1 lg:order-2">
            {["Privacy Policy", "Terms of Service", "Cookie Policy"].map(l => (
              <span 
                key={l} 
                className="text-[12px] text-blue-100/40 hover:text-white cursor-pointer transition-all duration-300 hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.6)]"
              >
                {l}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}