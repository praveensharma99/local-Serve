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
    <footer className="bg-[#020818] border-t border-white/10 px-6 py-12 lg:px-[5vw] lg:py-16">
      {/* Main Grid Section */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12 mb-12">
        
        {/* Brand Section - Mobile par full width le lega */}
        <div className="col-span-2 lg:col-span-1 flex flex-col items-center lg:items-start text-center lg:text-left">
          <div className="flex items-center gap-3 mb-5">
            <img
              src="/images/logo3.png"
              alt="LocalServe logo"
              className="w-20 h-20 object-contain drop-shadow-[0_0_14px_rgba(99,102,241,0.35)]"
            />
            <span className="text-2xl font-extrabold text-white tracking-tight">
              Local<span className="text-indigo-400">Serve</span>
            </span>
          </div>
          <p className="text-sm text-white/40 leading-relaxed max-w-[280px]">
            India's most trusted home services platform. Bringing quality and reliability to your doorstep.
          </p>
          
          {/* Social Icons */}
          <div className="flex gap-3 mt-6">
            {["𝕏", "in", "fb", "▶"].map(s => (
              <div 
                key={s} 
                className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-sm cursor-pointer text-white hover:bg-indigo-600 hover:border-indigo-600 transition-all duration-300"
              >
                {s}
              </div>
            ))}
          </div>
        </div>

        {/* Links Sections - Mobile par 2-column grid mein aayenge */}
        {footerData.map(col => (
          <div key={col.title} className="flex flex-col items-center lg:items-start text-center lg:text-left">
            <h4 className="text-[11px] font-bold text-white/30 tracking-[0.15em] uppercase mb-6">
              {col.title}
            </h4>
            <div className="flex flex-col gap-3">
              {col.links.map(l => (
                <div 
                  key={l} 
                  className="text-sm text-white/50 cursor-pointer transition-colors duration-200 hover:text-indigo-400"
                >
                  {l}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/5 pt-8 flex flex-col lg:flex-row justify-between items-center gap-6">
        <div className="text-[12px] text-white/30 text-center lg:text-left order-2 lg:order-1">
          © 2026 LocalServe Technologies Pvt. Ltd. All rights reserved.
        </div>
        
        <div className="flex flex-wrap justify-center gap-5 lg:gap-8 order-1 lg:order-2">
          {["Privacy Policy", "Terms of Service", "Cookie Policy"].map(l => (
            <span 
              key={l} 
              className="text-[12px] text-white/30 hover:text-white cursor-pointer transition-colors"
            >
              {l}
            </span>
          ))}
        </div>
      </div>
    </footer>
  );
}