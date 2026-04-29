import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import Services from "../components/Services";
import HowItWorks from "../components/HowItWorks";
import Reviews from "../components/Reviews";
import Stats from "../components/Stats";
import Footer from "../components/Footer";

export default function Home() {
  return (
    <div className="bg-gradient-to-br from-black via-gray-900 to-indigo-950 min-h-screen">
      <Navbar />
      <Hero />
      <Stats />
      <Services />
      <HowItWorks />
      <Reviews />
      <Footer />
    </div>
  );
}
// import { useNavigate } from "react-router-dom";
// import { useEffect, useRef, useState } from "react";

// const services = [
//   { icon: "🔧", name: "Plumbing", desc: "Leak repair, pipe fitting & installations", price: "₹299", tag: "Most Booked", color: "#3B82F6" },
//   { icon: "⚡", name: "Electrical", desc: "Wiring, switches & panel upgrades", price: "₹199", tag: "Fast Response", color: "#F59E0B" },
//   { icon: "🪚", name: "Carpentry", desc: "Custom furniture & wood repairs", price: "₹399", tag: "", color: "#10B981" },
//   { icon: "🧹", name: "Deep Cleaning", desc: "Full home sanitization & cleaning", price: "₹499", tag: "Top Rated", color: "#8B5CF6" },
//   { icon: "🎨", name: "Painting", desc: "Interior & exterior wall painting", price: "₹999", tag: "", color: "#EF4444" },
//   { icon: "❄️", name: "AC Repair", desc: "Gas refill, servicing & installation", price: "₹349", tag: "24/7 Available", color: "#06B6D4" },
//   { icon: "🔒", name: "Security", desc: "CCTV, locks & door installation", price: "₹599", tag: "", color: "#F97316" },
//   { icon: "🪟", name: "Glass & Aluminium", desc: "Window & sliding door repairs", price: "₹449", tag: "", color: "#6366F1" },
// ];

// const stats = [
//   { value: "50K+", label: "Happy Customers" },
//   { value: "1200+", label: "Expert Pros" },
//   { value: "4.9★", label: "Average Rating" },
//   { value: "30 Min", label: "Avg Response Time" },
// ];

// const reviews = [
//   { name: "Priya Sharma", role: "Homeowner, Delhi", text: "Booked a plumber at midnight — arrived in 28 mins. Absolutely shocked by the speed and quality.", avatar: "PS", rating: 5 },
//   { name: "Rahul Mehra", role: "Business Owner, Mumbai", text: "Used LocalServe for our office AC installation. Professional crew, clean work, on-budget.", avatar: "RM", rating: 5 },
//   { name: "Anjali Singh", role: "Resident, Bangalore", text: "The deep cleaning team was phenomenal. My apartment looks brand new. Highly recommended!", avatar: "AS", rating: 5 },
// ];

// const steps = [
//   { num: "01", title: "Choose a Service", desc: "Browse from 50+ home services across all categories" },
//   { num: "02", title: "Pick Your Slot", desc: "Schedule at your convenience — same day or in advance" },
//   { num: "03", title: "Pro Arrives", desc: "Verified expert arrives on time with all required tools" },
//   { num: "04", title: "Pay & Rate", desc: "Secure payment. Rate your experience after completion" },
// ];

// function AnimatedCounter({ target, suffix = "" }) {
//   const [count, setCount] = useState(0);
//   const ref = useRef(null);
//   const started = useRef(false);

//   useEffect(() => {
//     const observer = new IntersectionObserver(([entry]) => {
//       if (entry.isIntersecting && !started.current) {
//         started.current = true;
//         const num = parseFloat(target.replace(/[^0-9.]/g, ""));
//         const duration = 1800;
//         const steps = 60;
//         const increment = num / steps;
//         let current = 0;
//         const timer = setInterval(() => {
//           current += increment;
//           if (current >= num) {
//             current = num;
//             clearInterval(timer);
//           }
//           setCount(Number.isInteger(num) ? Math.floor(current) : current.toFixed(1));
//         }, duration / steps);
//       }
//     }, { threshold: 0.5 });
//     if (ref.current) observer.observe(ref.current);
//     return () => observer.disconnect();
//   }, [target]);

//   const prefix = target.replace(/[0-9.]/g, "").replace(/[+★ Min]/g, "");
//   const post = target.match(/[+★]/) ? target.match(/[+★]/)[0] : suffix;
//   const pre = target.startsWith("₹") ? "₹" : "";

//   return <span ref={ref}>{pre}{count}{post}</span>;
// }

// export default function Home() {
//   const navigate = useNavigate();
//   const [activeService, setActiveService] = useState(null);
//   const [scrolled, setScrolled] = useState(false);
//   const [menuOpen, setMenuOpen] = useState(false);

//   useEffect(() => {
//     const onScroll = () => setScrolled(window.scrollY > 20);
//     window.addEventListener("scroll", onScroll);
//     return () => window.removeEventListener("scroll", onScroll);
//   }, []);

//   return (
//     <div style={{ fontFamily: "'DM Sans', 'Inter', sans-serif", background: "#020818", color: "#fff", overflowX: "hidden", minHeight: "100vh" }}>

//       {/* Google Font */}
//       <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800&family=DM+Serif+Display:ital@0;1&display=swap" rel="stylesheet" />

//       <style>{`
//         @keyframes fadeUp { from { opacity: 0; transform: translateY(32px); } to { opacity: 1; transform: translateY(0); } }
//         @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
//         @keyframes float { 0%,100% { transform: translateY(0px); } 50% { transform: translateY(-12px); } }
//         @keyframes glow { 0%,100% { opacity: 0.4; } 50% { opacity: 0.8; } }
//         @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
//         @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
//         @keyframes ping { 0% { transform: scale(1); opacity: 1; } 75%,100% { transform: scale(1.8); opacity: 0; } }
//         .fade-up { animation: fadeUp 0.7s ease both; }
//         .fade-up-1 { animation-delay: 0.1s; }
//         .fade-up-2 { animation-delay: 0.2s; }
//         .fade-up-3 { animation-delay: 0.3s; }
//         .fade-up-4 { animation-delay: 0.4s; }
//         .fade-up-5 { animation-delay: 0.5s; }
//         .float { animation: float 4s ease-in-out infinite; }
//         .float-slow { animation: float 6s ease-in-out infinite; }
//         .glow-pulse { animation: glow 3s ease-in-out infinite; }
//         .service-card:hover { transform: translateY(-8px) scale(1.01); box-shadow: 0 32px 64px rgba(0,0,0,0.5); }
//         .service-card { transition: all 0.35s cubic-bezier(0.4,0,0.2,1); }
//         .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 16px 40px rgba(99,102,241,0.45); }
//         .btn-primary { transition: all 0.25s ease; }
//         .btn-secondary:hover { background: rgba(255,255,255,0.12); transform: translateY(-1px); }
//         .btn-secondary { transition: all 0.25s ease; }
//         .review-card:hover { border-color: rgba(99,102,241,0.4); transform: translateY(-4px); }
//         .review-card { transition: all 0.3s ease; }
//         .nav-link:hover { color: #A5B4FC; }
//         .nav-link { transition: color 0.2s; }
//         .shimmer-btn { background: linear-gradient(90deg, #6366f1, #818cf8, #6366f1); background-size: 200% auto; animation: shimmer 2.5s linear infinite; }
//         .ping-dot::after { content: ''; position: absolute; top: 0; left: 0; width: 100%; height: 100%; border-radius: 50%; background: #22c55e; animation: ping 1.5s ease-out infinite; }
//         input::placeholder { color: rgba(255,255,255,0.3); }
//         ::-webkit-scrollbar { width: 6px; } ::-webkit-scrollbar-track { background: #020818; } ::-webkit-scrollbar-thumb { background: #312e81; border-radius: 3px; }
//       `}</style>

//       {/* ─── NAVBAR ─── */}
//       <nav style={{
//         position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
//         padding: "0 5vw",
//         background: scrolled ? "rgba(2,8,24,0.9)" : "transparent",
//         backdropFilter: scrolled ? "blur(20px)" : "none",
//         borderBottom: scrolled ? "1px solid rgba(255,255,255,0.06)" : "none",
//         transition: "all 0.4s ease",
//         height: 72, display: "flex", alignItems: "center", justifyContent: "space-between"
//       }}>
//         <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
//           <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg,#6366f1,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🔧</div>
//           <span style={{ fontSize: 20, fontWeight: 700, letterSpacing: "-0.5px" }}>Local<span style={{ color: "#818cf8" }}>Serve</span></span>
//         </div>

//         <div style={{ display: "flex", gap: 36, alignItems: "center" }}>
//           {["Services", "How it Works", "Reviews", "Pricing"].map(l => (
//             <span key={l} className="nav-link" style={{ fontSize: 14, color: "rgba(255,255,255,0.6)", cursor: "pointer", fontWeight: 500 }}>{l}</span>
//           ))}
//         </div>

//         <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
//           <button onClick={() => navigate("/login")} className="btn-secondary" style={{ padding: "9px 22px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.15)", background: "transparent", color: "#fff", fontSize: 14, fontWeight: 500, cursor: "pointer" }}>
//             Sign In
//           </button>
//           <button onClick={() => navigate("/register")} className="shimmer-btn btn-primary" style={{ padding: "9px 22px", borderRadius: 10, border: "none", color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
//             Get Started →
//           </button>
//         </div>
//       </nav>

//       {/* ─── HERO ─── */}
//       <section style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "120px 5vw 80px", position: "relative", textAlign: "center", overflow: "hidden" }}>

//         {/* Background orbs */}
//         <div className="glow-pulse" style={{ position: "absolute", top: "15%", left: "10%", width: 600, height: 600, background: "radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)", borderRadius: "50%", pointerEvents: "none" }} />
//         <div className="glow-pulse" style={{ position: "absolute", bottom: "10%", right: "5%", width: 500, height: 500, background: "radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)", borderRadius: "50%", pointerEvents: "none", animationDelay: "1.5s" }} />
//         <div style={{ position: "absolute", top: "40%", right: "15%", width: 300, height: 300, background: "radial-gradient(circle, rgba(6,182,212,0.08) 0%, transparent 70%)", borderRadius: "50%", pointerEvents: "none" }} />

//         {/* Noise grid overlay */}
//         <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)", backgroundSize: "60px 60px", pointerEvents: "none" }} />

//         {/* Badge */}
//         <div className="fade-up" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 20px", borderRadius: 100, border: "1px solid rgba(99,102,241,0.35)", background: "rgba(99,102,241,0.1)", marginBottom: 32, fontSize: 13, fontWeight: 500, color: "#a5b4fc" }}>
//           <span style={{ position: "relative", display: "inline-block", width: 8, height: 8 }}>
//             <span className="ping-dot" style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "#22c55e" }} />
//             <span style={{ position: "relative", display: "block", width: 8, height: 8, borderRadius: "50%", background: "#22c55e" }} />
//           </span>
//           Now live in 50+ cities across India
//         </div>

//         {/* Headline */}
//         <h1 className="fade-up fade-up-1" style={{ fontSize: "clamp(42px, 6vw, 88px)", fontWeight: 800, lineHeight: 1.05, letterSpacing: "-2px", margin: "0 0 24px", maxWidth: 900 }}>
//           Your Home Deserves<br />
//           <span style={{ background: "linear-gradient(135deg, #818cf8, #c084fc, #38bdf8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
//             Expert Care
//           </span>
//         </h1>

//         <p className="fade-up fade-up-2" style={{ fontSize: "clamp(16px, 2vw, 20px)", color: "rgba(255,255,255,0.5)", maxWidth: 560, margin: "0 0 48px", lineHeight: 1.7, fontWeight: 400 }}>
//           Book verified plumbers, electricians, cleaners & more. Trusted by 50,000+ homeowners. On-demand. On-time. Guaranteed.
//         </p>

//         {/* Search Bar */}
//         <div className="fade-up fade-up-3" style={{ width: "100%", maxWidth: 640, margin: "0 0 48px", display: "flex", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16, padding: "6px 6px 6px 20px", alignItems: "center", gap: 12, backdropFilter: "blur(12px)" }}>
//           <span style={{ fontSize: 18 }}>🔍</span>
//           <input placeholder="Search for a service (e.g. plumber, AC repair...)" style={{ flex: 1, background: "transparent", border: "none", outline: "none", fontSize: 15, color: "#fff", fontFamily: "inherit" }} />
//           <button className="btn-primary" style={{ padding: "12px 28px", borderRadius: 12, background: "linear-gradient(135deg,#6366f1,#8b5cf6)", border: "none", color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" }}>
//             Search
//           </button>
//         </div>

//         {/* Popular tags */}
//         <div className="fade-up fade-up-4" style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center" }}>
//           <span style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>Popular:</span>
//           {["🔧 Plumber", "⚡ Electrician", "❄️ AC Repair", "🧹 Cleaning", "🎨 Painting"].map(s => (
//             <span key={s} style={{ padding: "5px 14px", borderRadius: 100, background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)", fontSize: 13, color: "rgba(255,255,255,0.65)", cursor: "pointer" }}>{s}</span>
//           ))}
//         </div>

//         {/* Floating cards */}
//         <div className="float" style={{ position: "absolute", left: "4%", top: "38%", background: "rgba(255,255,255,0.05)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16, padding: "14px 18px", textAlign: "left", minWidth: 190 }}>
//           <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", marginBottom: 6 }}>⚡ Just booked</div>
//           <div style={{ fontSize: 14, fontWeight: 600 }}>Electrical Wiring Fix</div>
//           <div style={{ fontSize: 12, color: "#22c55e", marginTop: 4 }}>Pro arriving in 22 min</div>
//         </div>

//         <div className="float-slow" style={{ position: "absolute", right: "4%", top: "45%", background: "rgba(255,255,255,0.05)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16, padding: "14px 18px", textAlign: "left", minWidth: 190, animationDelay: "1s" }}>
//           <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", marginBottom: 6 }}>🛡️ Verified Pro</div>
//           <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
//             <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg,#6366f1,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>👷</div>
//             <div>
//               <div style={{ fontSize: 13, fontWeight: 600 }}>Rakesh Kumar</div>
//               <div style={{ fontSize: 12, color: "#fbbf24" }}>⭐ 4.9 · 234 jobs</div>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* ─── STATS ─── */}
//       <section style={{ padding: "0 5vw 80px" }}>
//         <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 2, borderRadius: 20, overflow: "hidden", border: "1px solid rgba(255,255,255,0.07)" }}>
//           {stats.map((s, i) => (
//             <div key={i} style={{ background: "rgba(255,255,255,0.03)", padding: "36px 24px", textAlign: "center", borderRight: i < 3 ? "1px solid rgba(255,255,255,0.07)" : "none" }}>
//               <div style={{ fontSize: "clamp(28px,3vw,40px)", fontWeight: 800, letterSpacing: "-1px", color: "#fff", marginBottom: 6 }}>
//                 {s.value.includes("★") ? (
//                   <><AnimatedCounter target="4.9" />★</>
//                 ) : s.value.includes("Min") ? (
//                   <><AnimatedCounter target="30" /> Min</>
//                 ) : (
//                   <AnimatedCounter target={s.value} />
//                 )}
//               </div>
//               <div style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", fontWeight: 500 }}>{s.label}</div>
//             </div>
//           ))}
//         </div>
//       </section>

//       {/* ─── SERVICES ─── */}
//       <section style={{ padding: "80px 5vw" }}>
//         <div style={{ textAlign: "center", marginBottom: 64 }}>
//           <div style={{ display: "inline-block", padding: "6px 18px", borderRadius: 100, background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.3)", fontSize: 13, color: "#818cf8", marginBottom: 20, fontWeight: 500 }}>
//             All Services
//           </div>
//           <h2 style={{ fontSize: "clamp(32px,4vw,52px)", fontWeight: 800, letterSpacing: "-1.5px", margin: "0 0 16px" }}>
//             Everything Your Home Needs
//           </h2>
//           <p style={{ fontSize: 17, color: "rgba(255,255,255,0.45)", maxWidth: 500, margin: "0 auto" }}>
//             50+ professional services. All verified, insured & background-checked.
//           </p>
//         </div>

//         <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20 }}>
//           {services.map((s, i) => (
//             <div key={i} className="service-card" onMouseEnter={() => setActiveService(i)} onMouseLeave={() => setActiveService(null)}
//               style={{ background: activeService === i ? "rgba(99,102,241,0.08)" : "rgba(255,255,255,0.03)", border: `1px solid ${activeService === i ? "rgba(99,102,241,0.35)" : "rgba(255,255,255,0.07)"}`, borderRadius: 20, padding: "28px 24px", cursor: "pointer", position: "relative", overflow: "hidden" }}>

//               {s.tag && (
//                 <div style={{ position: "absolute", top: 16, right: 16, padding: "3px 10px", borderRadius: 100, background: "rgba(99,102,241,0.2)", border: "1px solid rgba(99,102,241,0.3)", fontSize: 11, color: "#a5b4fc", fontWeight: 600 }}>
//                   {s.tag}
//                 </div>
//               )}

//               <div style={{ width: 52, height: 52, borderRadius: 14, background: `${s.color}20`, border: `1px solid ${s.color}40`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, marginBottom: 18 }}>
//                 {s.icon}
//               </div>

//               <h3 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 8px", letterSpacing: "-0.3px" }}>{s.name}</h3>
//               <p style={{ fontSize: 14, color: "rgba(255,255,255,0.45)", margin: "0 0 24px", lineHeight: 1.6 }}>{s.desc}</p>

//               <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
//                 <div>
//                   <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginBottom: 2 }}>Starting at</div>
//                   <div style={{ fontSize: 20, fontWeight: 800, color: "#818cf8" }}>{s.price}</div>
//                 </div>
//                 <button onClick={() => navigate("/register")} style={{ padding: "10px 20px", borderRadius: 12, background: "rgba(99,102,241,0.2)", border: "1px solid rgba(99,102,241,0.3)", color: "#a5b4fc", fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all 0.2s" }}>
//                   Book Now
//                 </button>
//               </div>
//             </div>
//           ))}
//         </div>
//       </section>

//       {/* ─── HOW IT WORKS ─── */}
//       <section style={{ padding: "80px 5vw", background: "rgba(255,255,255,0.01)", borderTop: "1px solid rgba(255,255,255,0.05)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
//         <div style={{ textAlign: "center", marginBottom: 64 }}>
//           <div style={{ display: "inline-block", padding: "6px 18px", borderRadius: 100, background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.3)", fontSize: 13, color: "#34d399", marginBottom: 20, fontWeight: 500 }}>
//             How It Works
//           </div>
//           <h2 style={{ fontSize: "clamp(32px,4vw,52px)", fontWeight: 800, letterSpacing: "-1.5px", margin: 0 }}>
//             4 Simple Steps
//           </h2>
//         </div>

//         <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 2, maxWidth: 1000, margin: "0 auto" }}>
//           {steps.map((s, i) => (
//             <div key={i} style={{ padding: "32px 28px", position: "relative" }}>
//               {i < steps.length - 1 && (
//                 <div style={{ position: "absolute", top: 44, right: 0, width: "50%", height: 1, background: "linear-gradient(90deg, rgba(99,102,241,0.4), transparent)", display: "block" }} />
//               )}
//               <div style={{ fontSize: 13, fontWeight: 700, color: "#6366f1", letterSpacing: 1, marginBottom: 16, fontVariantNumeric: "tabular-nums" }}>{s.num}</div>
//               <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.25)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, marginBottom: 16 }}>
//                 {["🔍", "📅", "🏠", "💳"][i]}
//               </div>
//               <h3 style={{ fontSize: 17, fontWeight: 700, margin: "0 0 8px", letterSpacing: "-0.3px" }}>{s.title}</h3>
//               <p style={{ fontSize: 14, color: "rgba(255,255,255,0.45)", margin: 0, lineHeight: 1.65 }}>{s.desc}</p>
//             </div>
//           ))}
//         </div>
//       </section>

//       {/* ─── TRUST BANNER ─── */}
//       <section style={{ padding: "60px 5vw" }}>
//         <div style={{ background: "linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.1))", border: "1px solid rgba(99,102,241,0.25)", borderRadius: 24, padding: "48px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 24 }}>
//           <div>
//             <h3 style={{ fontSize: "clamp(22px,3vw,36px)", fontWeight: 800, margin: "0 0 12px", letterSpacing: "-0.8px" }}>Every Pro is Background Verified</h3>
//             <p style={{ fontSize: 16, color: "rgba(255,255,255,0.5)", margin: 0, maxWidth: 480 }}>Police verified, skill-tested, and insured. If you're not 100% satisfied, we'll redo the job — free of charge.</p>
//           </div>
//           <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
//             {["✅ Police Verified", "🛡️ Fully Insured", "⭐ Top Rated", "🔄 Free Redo"].map(t => (
//               <div key={t} style={{ padding: "10px 18px", borderRadius: 12, background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)", fontSize: 14, fontWeight: 500 }}>{t}</div>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* ─── REVIEWS ─── */}
//       <section style={{ padding: "80px 5vw" }}>
//         <div style={{ textAlign: "center", marginBottom: 64 }}>
//           <div style={{ display: "inline-block", padding: "6px 18px", borderRadius: 100, background: "rgba(251,191,36,0.15)", border: "1px solid rgba(251,191,36,0.3)", fontSize: 13, color: "#fbbf24", marginBottom: 20, fontWeight: 500 }}>
//             Customer Love
//           </div>
//           <h2 style={{ fontSize: "clamp(32px,4vw,52px)", fontWeight: 800, letterSpacing: "-1.5px", margin: "0 0 12px" }}>
//             50,000+ Happy Homes
//           </h2>
//           <p style={{ fontSize: 17, color: "rgba(255,255,255,0.45)" }}>Don't take our word for it.</p>
//         </div>

//         <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20 }}>
//           {reviews.map((r, i) => (
//             <div key={i} className="review-card" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 20, padding: "28px" }}>
//               <div style={{ fontSize: 18, color: "#fbbf24", marginBottom: 16 }}>{"★".repeat(r.rating)}</div>
//               <p style={{ fontSize: 15, lineHeight: 1.7, color: "rgba(255,255,255,0.7)", margin: "0 0 24px" }}>"{r.text}"</p>
//               <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
//                 <div style={{ width: 40, height: 40, borderRadius: "50%", background: "linear-gradient(135deg,#6366f1,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700 }}>{r.avatar}</div>
//                 <div>
//                   <div style={{ fontSize: 14, fontWeight: 600 }}>{r.name}</div>
//                   <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>{r.role}</div>
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>
//       </section>

//       {/* ─── APP DOWNLOAD CTA ─── */}
//       <section style={{ padding: "80px 5vw" }}>
//         <div style={{ background: "linear-gradient(135deg, #1e1b4b, #312e81)", border: "1px solid rgba(99,102,241,0.3)", borderRadius: 28, padding: "64px 48px", textAlign: "center", position: "relative", overflow: "hidden" }}>
//           <div style={{ position: "absolute", top: -100, right: -100, width: 400, height: 400, background: "radial-gradient(circle, rgba(139,92,246,0.3), transparent 70%)", borderRadius: "50%", pointerEvents: "none" }} />
//           <div style={{ position: "absolute", bottom: -80, left: -80, width: 300, height: 300, background: "radial-gradient(circle, rgba(99,102,241,0.2), transparent 70%)", borderRadius: "50%", pointerEvents: "none" }} />

//           <h2 style={{ fontSize: "clamp(28px,4vw,52px)", fontWeight: 800, letterSpacing: "-1.5px", margin: "0 0 16px", position: "relative" }}>
//             Ready to Get Started?
//           </h2>
//           <p style={{ fontSize: 18, color: "rgba(255,255,255,0.55)", margin: "0 0 40px", position: "relative" }}>
//             Join 50,000+ homeowners. First booking gets ₹100 off.
//           </p>

//           <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap", position: "relative" }}>
//             <button onClick={() => navigate("/register")} className="btn-primary" style={{ padding: "16px 36px", borderRadius: 14, background: "#fff", border: "none", color: "#312e81", fontSize: 16, fontWeight: 700, cursor: "pointer" }}>
//               Book Your First Service 🚀
//             </button>
//             <button onClick={() => navigate("/login")} className="btn-secondary" style={{ padding: "16px 36px", borderRadius: 14, border: "1px solid rgba(255,255,255,0.2)", background: "transparent", color: "#fff", fontSize: 16, fontWeight: 600, cursor: "pointer" }}>
//               Sign In
//             </button>
//           </div>

//           <div style={{ display: "flex", justifyContent: "center", gap: 32, marginTop: 40, flexWrap: "wrap", position: "relative" }}>
//             {["No hidden charges", "Cancellation anytime", "100% satisfaction"].map(f => (
//               <div key={f} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, color: "rgba(255,255,255,0.55)" }}>
//                 <span style={{ color: "#22c55e" }}>✓</span> {f}
//               </div>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* ─── FOOTER ─── */}
//       <footer style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: "60px 5vw 40px" }}>
//         <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 48, marginBottom: 48 }}>
//           <div>
//             <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
//               <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg,#6366f1,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🔧</div>
//               <span style={{ fontSize: 20, fontWeight: 700 }}>Local<span style={{ color: "#818cf8" }}>Serve</span></span>
//             </div>
//             <p style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", lineHeight: 1.7, maxWidth: 280 }}>
//               India's most trusted home services platform. Bringing quality and reliability to your doorstep.
//             </p>
//             <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
//               {["𝕏", "in", "fb", "▶"].map(s => (
//                 <div key={s} style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, cursor: "pointer" }}>{s}</div>
//               ))}
//             </div>
//           </div>

//           {[
//             { title: "Services", links: ["Plumbing", "Electrical", "Carpentry", "Cleaning", "Painting", "AC Repair"] },
//             { title: "Company", links: ["About Us", "Careers", "Blog", "Press", "Partners"] },
//             { title: "Support", links: ["Help Center", "Safety", "Terms", "Privacy", "Contact Us"] },
//           ].map(col => (
//             <div key={col.title}>
//               <h4 style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.5)", letterSpacing: 1, textTransform: "uppercase", marginBottom: 18 }}>{col.title}</h4>
//               {col.links.map(l => (
//                 <div key={l} style={{ fontSize: 14, color: "rgba(255,255,255,0.45)", marginBottom: 12, cursor: "pointer", transition: "color 0.2s" }} onMouseEnter={e => e.target.style.color = "#fff"} onMouseLeave={e => e.target.style.color = "rgba(255,255,255,0.45)"}>{l}</div>
//               ))}
//             </div>
//           ))}
//         </div>

//         <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 28, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
//           <div style={{ fontSize: 13, color: "rgba(255,255,255,0.3)" }}>© 2026 LocalServe Technologies Pvt. Ltd. All rights reserved.</div>
//           <div style={{ display: "flex", gap: 24 }}>
//             {["Privacy Policy", "Terms of Service", "Cookie Policy"].map(l => (
//               <span key={l} style={{ fontSize: 13, color: "rgba(255,255,255,0.3)", cursor: "pointer" }}>{l}</span>
//             ))}
//           </div>
//         </div>
//       </footer>
//     </div>
//   );
// }
