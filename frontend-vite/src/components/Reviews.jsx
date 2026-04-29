import React from "react";

const reviews = [
  { name: "Priya Sharma", role: "Homeowner, Delhi", text: "Booked a plumber at midnight — arrived in 28 mins. Absolutely shocked by the speed and quality.", avatar: "PS", rating: 5 },
  { name: "Rahul Mehra", role: "Business Owner, Mumbai", text: "Used LocalServe for our office AC installation. Professional crew, clean work, on-budget.", avatar: "RM", rating: 5 },
  { name: "Anjali Singh", role: "Resident, Bangalore", text: "The deep cleaning team was phenomenal. My apartment looks brand new. Highly recommended!", avatar: "AS", rating: 5 },
];

export default function Reviews() {
  return (
    <section id="reviews" className="px-4 sm:px-[5vw] py-16 sm:py-24">
      <div className="text-center mb-12 sm:mb-16">
        <div className="inline-block px-4 py-1.5 sm:px-[18px] sm:py-[6px] rounded-[100px] bg-amber-500/10 border border-amber-500/20 text-xs sm:text-[13px] text-amber-400 mb-4 sm:mb-5 font-semibold">
          TESTIMONIALS
        </div>
        <h2 className="text-[clamp(28px,5vw,52px)] font-extrabold text-white tracking-tighter mb-3 sm:mb-4">
          50,000+ Happy Homes
        </h2>
        <p className="text-white/45">Real feedback from our regular customers.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
        {reviews.map((r, i) => (
          <div key={i} style={{ 
            background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", 
            borderRadius: 24, padding: "32px", position: "relative", backdropFilter: "blur(10px)"
          }}>
            <div style={{ fontSize: 18, color: "#fbbf24", marginBottom: 20, letterSpacing: "2px" }}>
              {"★".repeat(r.rating)}
            </div>
            <p style={{ fontSize: 16, lineHeight: 1.7, color: "rgba(255,255,255,0.7)", marginBottom: 28, fontStyle: "italic" }}>
              "{r.text}"
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ 
                width: 48, height: 48, borderRadius: "50%", 
                background: "linear-gradient(135deg, #6366f1, #a855f7)", 
                display: "flex", alignItems: "center", justifyContent: "center", 
                fontSize: 16, fontWeight: 700, color: "#fff" 
              }}>
                {r.avatar}
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 600, color: "#fff" }}>{r.name}</div>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>{r.role}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}