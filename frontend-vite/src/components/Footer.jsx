import React from "react";

export default function Footer() {
  const footerData = [
    { 
      title: "Services", 
      links: ["Plumbing", "Electrical", "Carpentry", "Cleaning", "Painting", "AC Repair"] 
    },
    { 
      title: "Company", 
      links: ["About Us", "Careers", "Blog", "Press", "Partners"] 
    },
    { 
      title: "Support", 
      links: ["Help Center", "Safety", "Terms", "Privacy", "Contact Us"] 
    },
  ];

  return (
    <footer className="border-t border-white/6 px-4 sm:px-[5vw] py-12 sm:py-16 pb-10 sm:pb-12" style={{ background: "#020818" }}>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12 mb-12">
        
        {/* Brand Section */}
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg,#6366f1,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🔧</div>
            <span style={{ fontSize: 20, fontWeight: 700, color: "#fff" }}>Local<span style={{ color: "#818cf8" }}>Serve</span></span>
          </div>
          <p className="text-sm text-white/40 leading-relaxed max-w-[280px]">
            India's most trusted home services platform. Bringing quality and reliability to your doorstep.
          </p>
          <div className="flex gap-3 mt-5">
            {["𝕏", "in", "fb", "▶"].map(s => (
              <div key={s} style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, cursor: "pointer", color: "#fff" }}>{s}</div>
            ))}
          </div>
        </div>

        {/* Links Sections */}
        {footerData.map(col => (
          <div key={col.title}>
            <h4 className="text-xs sm:text-[13px] font-bold text-white/50 tracking-wider uppercase mb-4 sm:mb-[18px]">{col.title}</h4>
            {col.links.map(l => (
              <div 
                key={l} 
                className="footer-link text-sm sm:text-[14px] text-white/45 mb-3 cursor-pointer transition-colors duration-200 hover:text-white"
              >
                {l}
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/6 pt-7 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="text-xs sm:text-[13px] text-white/30 text-center sm:text-left">
          © 2026 LocalServe Technologies Pvt. Ltd. All rights reserved.
        </div>
        <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
          {["Privacy Policy", "Terms of Service", "Cookie Policy"].map(l => (
            <span key={l} style={{ fontSize: 13, color: "rgba(255,255,255,0.3)", cursor: "pointer" }}>{l}</span>
          ))}
        </div>
      </div>
    </footer>
  );
}