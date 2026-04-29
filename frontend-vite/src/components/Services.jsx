import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const services = [
  { icon: "🔧", name: "Plumbing", desc: "Leak repair, pipe fitting & installations", price: "₹299", tag: "Most Booked", color: "#3B82F6" },
  { icon: "⚡", name: "Electrical", desc: "Wiring, switches & panel upgrades", price: "₹199", tag: "Fast Response", color: "#F59E0B" },
  { icon: "🪚", name: "Carpentry", desc: "Custom furniture & wood repairs", price: "₹399", tag: "", color: "#10B981" },
  { icon: "🧹", name: "Deep Cleaning", desc: "Full home sanitization & cleaning", price: "₹499", tag: "Top Rated", color: "#8B5CF6" },
  { icon: "🎨", name: "Painting", desc: "Interior & exterior wall painting", price: "₹999", tag: "", color: "#EF4444" },
  { icon: "❄️", name: "AC Repair", desc: "Gas refill, servicing & installation", price: "₹349", tag: "24/7 Available", color: "#06B6D4" },
];

export default function Services() {
  const navigate = useNavigate();
  const [hoveredIndex, setHoveredIndex] = useState(null);

  return (
 
    <section id="services" className="px-4 sm:px-[5vw] py-16 sm:py-24" style={{ position: "relative" }}>
      {/* Background Glow Decorations */}
      <div  style={{ position: "absolute",left: "-5%", width: "400px", height: "400px", background: "rgba(99,102,241,0.05)", filter: "blur(100px)", borderRadius: "50%", pointerEvents: "none" }} />
      
      <div className="text-center mb-12 sm:mb-16">
        <div className="inline-block px-4 py-1.5 sm:px-[18px] sm:py-[6px] rounded-[100px] bg-indigo-500/10 border border-indigo-500/20 text-xs sm:text-[13px] text-indigo-400 mb-4 sm:mb-5 font-semibold tracking-wider">
          OUR EXPERTISE
        </div>
        <h2 className="text-[clamp(28px,5vw,52px)] font-extrabold tracking-tighter mb-3 sm:mb-4 text-white">
          Everything Your Home Needs
        </h2>
        <p className="text-base sm:text-[17px] text-white/45 max-w-[550px] mx-auto leading-relaxed">
          Premium home services delivered by verified professionals. Quality guaranteed on every task.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-7">
        {services.map((s, i) => (
          <div 
            key={i} 
            onMouseEnter={() => setHoveredIndex(i)}
            onMouseLeave={() => setHoveredIndex(null)}
            style={{ 
              background: "rgba(255,255,255,0.02)", 
              backdropFilter: "blur(10px)",
              border: `1px solid ${hoveredIndex === i ? s.color : "rgba(255,255,255,0.1)"}`, 
              borderRadius: 24, 
              padding: "40px 30px", 
              cursor: "pointer", 
              position: "relative", 
              overflow: "hidden",
              transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
              transform: hoveredIndex === i ? "translateY(-12px)" : "translateY(0)",
              boxShadow: hoveredIndex === i ? `0 20px 40px ${s.color}15` : "none"
            }}
          >
            {/* Hover Gradient Overlay */}
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "4px", background: `linear-gradient(90deg, transparent, ${s.color}, transparent)`, opacity: hoveredIndex === i ? 1 : 0, transition: "0.3s" }} />

            {s.tag && (
              <div style={{ position: "absolute", top: 20, right: 20, padding: "4px 12px", borderRadius: 100, background: `${s.color}20`, fontSize: 10, color: s.color, fontWeight: 700, border: `1px solid ${s.color}40`, textTransform: "uppercase" }}>
                {s.tag}
              </div>
            )}

            <div style={{ 
              width: 64, height: 64, borderRadius: 20, 
              background: hoveredIndex === i ? s.color : "rgba(255,255,255,0.05)", 
              display: "flex", alignItems: "center", justifyContent: "center", 
              fontSize: 32, marginBottom: 28, transition: "all 0.3s ease",
              boxShadow: hoveredIndex === i ? `0 0 20px ${s.color}40` : "none",
              transform: hoveredIndex === i ? "rotate(-10deg)" : "rotate(0)"
            }}>
              {s.icon}
            </div>

            <h3 style={{ fontSize: 22, fontWeight: 700, color: "#fff", margin: "0 0 12px" }}>{s.name}</h3>
            <p style={{ fontSize: 15, color: "rgba(255,255,255,0.45)", margin: "0 0 32px", lineHeight: 1.6 }}>{s.desc}</p>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: 24 }}>
              <div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", marginBottom: 4 }}>Starting From</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: "#fff" }}>{s.price}</div>
              </div>
              <button 
                onClick={() => navigate("/register")}
                style={{ 
                  width: 44, height: 44, borderRadius: "50%", 
                  border: `1px solid ${hoveredIndex === i ? s.color : "rgba(255,255,255,0.2)"}`,
                  background: hoveredIndex === i ? s.color : "transparent",
                  color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "all 0.3s"
                }}
              >
                →
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}