import React from "react";
import { motion } from "framer-motion";
import { CalendarClock, CheckCircle2, SearchCheck, Wallet } from "lucide-react";

const steps = [
  { num: "01", title: "Choose a Service", desc: "Browse from curated home services by category.", Icon: SearchCheck },
  { num: "02", title: "Pick Your Slot", desc: "Select your preferred date and exact time window.", Icon: CalendarClock },
  { num: "03", title: "Expert Arrives", desc: "Verified professional reaches your home on-time.", Icon: CheckCircle2 },
  { num: "04", title: "Pay & Review", desc: "Secure payment with invoice and quick rating.", Icon: Wallet },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="px-4 sm:px-[5vw] py-16 sm:py-24 bg-white/[0.01] border-t border-white/5">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.55 }}
        className="text-center mb-12 sm:mb-16"
      >
        <div className="inline-block px-4 py-1.5 sm:px-[18px] sm:py-[6px] rounded-[100px] bg-emerald-500/10 border border-emerald-500/20 text-xs sm:text-[13px] text-emerald-400 mb-4 sm:mb-5 font-semibold">
          PROCESS
        </div>
        <h2 className="text-[clamp(28px,5vw,52px)] font-extrabold text-white tracking-tighter">4 Simple Steps</h2>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 max-w-[1200px] mx-auto">
        {steps.map((s, i) => {
          const StepIcon = s.Icon;
          return (
          <motion.div
            key={s.title}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.45, delay: i * 0.1 }}
            style={{ position: "relative", textAlign: "center", padding: "20px" }}
          >
            {/* Connection Line for Desktop - Hidden on mobile */}
            {i < steps.length - 1 && (
              <div className="hidden lg:block" style={{ position: "absolute", top: "25%", left: "70%", width: "60%", height: "1px", background: "linear-gradient(90deg, #6366f1, transparent)", zIndex: 0 }} />
            )}
            
            <div style={{ 
              width: 80, height: 80, borderRadius: "24px", background: "rgba(99,102,241,0.05)", 
              border: "1px solid rgba(99,102,241,0.2)", display: "flex", alignItems: "center", 
              justifyContent: "center", fontSize: 32, margin: "0 auto 24px", position: "relative", zIndex: 1,
              boxShadow: "0 10px 30px rgba(0,0,0,0.3)"
            }}>
              <StepIcon size={30} className="text-indigo-300" />
              <div style={{ position: "absolute", top: -10, right: -10, width: 28, height: 28, borderRadius: "50%", background: "#6366f1", color: "#fff", fontSize: 12, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" }}>
                {s.num}
              </div>
            </div>

            <h3 style={{ fontSize: 20, fontWeight: 700, color: "#fff", marginBottom: 12 }}>{s.title}</h3>
            <p style={{ fontSize: 15, color: "rgba(255,255,255,0.45)", lineHeight: 1.6 }}>{s.desc}</p>
          </motion.div>
        );
        })}
      </div>
    </section>
  );
}