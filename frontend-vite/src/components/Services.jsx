
import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Wrench,
  Zap,
  Hammer,
  Paintbrush,
  AirVent,
  ArrowRight,
  Wind,
} from "lucide-react";

const services = [
  {
    Icon: Wrench,
    name: "Plumbing",
    desc: "Leak repair, pipe fittings and installations.",
    price: "₹299",
    tag: "Most Booked",
    iconColor: "text-sky-400",
    iconBox: "bg-sky-500/10 border-sky-400/30",
  },
  {
    Icon: Zap,
    name: "Electrical",
    desc: "Wiring, switch replacement and panel upgrades.",
    price: "₹199",
    tag: "Fast Response",
    iconColor: "text-amber-400",
    iconBox: "bg-amber-500/10 border-amber-400/30",
  },
  {
    Icon: Hammer,
    name: "Carpentry",
    desc: "Furniture fixes, fittings and woodwork jobs.",
    price: "₹399",
    tag: "Top Rated",
    iconColor: "text-emerald-400",
    iconBox: "bg-emerald-500/10 border-emerald-400/30",
  },
  {
    Icon: Wind,
    name: "Deep Cleaning",
    desc: "Full home cleaning and sanitization service.",
    price: "₹499",
    tag: "Most Booked",
    iconColor: "text-cyan-400",
    iconBox: "bg-cyan-500/10 border-cyan-400/30",
  },
  {
    Icon: Paintbrush,
    name: "Painting",
    desc: "Interior and exterior painting with clean finish.",
    price: "₹699",
    tag: "Top Rated",
    iconColor: "text-violet-400",
    iconBox: "bg-violet-500/10 border-violet-400/30",
  },
  {
    Icon: AirVent,
    name: "AC Repair",
    desc: "Servicing, gas refill and cooling diagnostics.",
    price: "₹349",
    tag: "Fast Response",
    iconColor: "text-blue-400",
    iconBox: "bg-blue-500/10 border-blue-400/30",
  },
];

export default function Services() {
  const navigate = useNavigate();
  const gridVariants = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 26, scale: 0.98 },
    show: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.45, ease: "easeOut" },
    },
  };

  return (
    <section
      id="services"
      className="bg-gradient-to-b from-slate-900/35 via-slate-900/55 to-indigo-950/45 px-4 py-20 sm:px-[5vw] sm:py-24"
      style={{ fontFamily: "Inter, Poppins, system-ui, sans-serif" }}
    >
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, amount: 0.4 }}
        transition={{ duration: 0.45 }}
        className="text-center mb-12"
      >
        <h2 className="mb-2 text-[clamp(2rem,4vw,2.8rem)] font-bold leading-tight tracking-[-0.02em] text-slate-50">
          Everything Your Home Needs
        </h2>
        <p className="mx-auto max-w-[560px] text-[15px] leading-relaxed text-slate-300/70">
          Reliable home services from verified professionals, with clear pricing and fast response times.
        </p>
      </motion.div>

      <motion.div
        className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
        variants={gridVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: false, amount: 0.2 }}
      >
        {services.map(({ Icon, name, desc, price, tag, iconColor, iconBox }, i) => (
          <motion.div
            key={i}
            variants={cardVariants}
            whileHover={{
              y: -4,
              borderColor: "rgba(56,189,248,0.35)",
              boxShadow: "0 12px 24px rgba(2,6,23,0.32)",
            }}
            className="group relative cursor-pointer rounded-2xl border border-white/10 bg-[#0B1220] p-[22px] shadow-[0_6px_14px_rgba(2,6,23,0.2)] transition-all duration-300 ease-in-out"
          >
            {tag && (
              <div className="absolute right-4 top-4 rounded-full border border-sky-400/25 bg-sky-400/10 px-2.5 py-1 text-[10px] font-semibold tracking-[0.02em] text-sky-400 transition-all duration-300 group-hover:border-sky-300/40 group-hover:bg-sky-400/15">
                {tag}
              </div>
            )}

            <div
              className={`mb-4 flex h-[42px] w-[42px] items-center justify-center rounded-[10px] border transition-all duration-300 group-hover:scale-105 ${iconBox}`}
            >
              <Icon size={18} strokeWidth={2} className={`${iconColor} transition-transform duration-300 group-hover:scale-110`} />
            </div>

            <h3 className="mb-1.5 text-[18px] font-bold text-slate-50">{name}</h3>
            <p className="mb-[18px] truncate text-sm leading-[1.5] text-slate-300/60">
              {desc}
            </p>

            <div className="mb-[14px] h-px bg-white/10" />
            <div className="flex items-center justify-between">
              <div>
                <div className="mb-0.5 text-[11px] text-slate-400">Starting From</div>
                <div className="text-[18px] font-bold text-slate-50">{price}</div>
              </div>
              <motion.button
                onClick={() => navigate("/register")}
                whileHover={{ backgroundColor: "rgba(56,189,248,0.08)" }}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-transparent transition-all duration-300 ease-in-out group-hover:border-sky-300/45 group-hover:bg-sky-400/10"
              >
                <ArrowRight
                  size={14}
                  strokeWidth={2}
                  className="text-slate-200 transition-transform duration-300 group-hover:translate-x-0.5"
                />
              </motion.button>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}