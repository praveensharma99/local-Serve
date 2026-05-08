import React, { useState, useEffect, useMemo } from "react";
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
  Star,
} from "lucide-react";

const iconMap = {
  plumber: Wrench,
  plumbing: Wrench,
  electrical: Zap,
  electrician: Zap,
  carpentry: Hammer,
  carpenter: Hammer,
  "deep cleaning": Wind,
  cleaning: Wind,
  painting: Paintbrush,
  painter: Paintbrush,
  "ac repair": AirVent,
  ac: AirVent,
};

const styleMap = [
  { iconColor: "text-sky-400", iconBox: "bg-sky-500/10 border-sky-400/30", tag: "Most Booked", price: "₹299" },
  { iconColor: "text-amber-400", iconBox: "bg-amber-500/10 border-amber-400/30", tag: "Fast Response", price: "₹199" },
  { iconColor: "text-emerald-400", iconBox: "bg-emerald-500/10 border-emerald-400/30", tag: "Top Rated", price: "₹399" },
  { iconColor: "text-cyan-400", iconBox: "bg-cyan-500/10 border-cyan-400/30", tag: "Most Booked", price: "₹499" },
  { iconColor: "text-violet-400", iconBox: "bg-violet-500/10 border-violet-400/30", tag: "Top Rated", price: "₹699" },
  { iconColor: "text-blue-400", iconBox: "bg-blue-500/10 border-blue-400/30", tag: "Fast Response", price: "₹349" },
];

const HoverDots = () => {
  const dots = useMemo(() => {
    return Array.from({ length: 20 }).map((_, i) => {
      const size = Math.random() * 2 + 1; // very small dots
      const startX = Math.random() * 100;
      const startY = Math.random() * 100;
      return (
        <motion.div
          key={i}
          className="absolute rounded-full bg-indigo-300/40 shadow-[0_0_6px_rgba(165,180,252,0.4)]"
          style={{
            width: size,
            height: size,
            left: `${startX}%`,
            top: `${startY}%`,
          }}
          animate={{
            y: [0, Math.random() * -15 - 5], // slow movement
            x: [0, (Math.random() - 0.5) * 10], // slight flicker/drift
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: Math.random() * 2 + 2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: Math.random() * 2,
          }}
        />
      );
    });
  }, []);

  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden rounded-2xl opacity-0 transition-opacity duration-300 ease-in-out group-hover:opacity-100">
      {dots}
    </div>
  );
};

export default function Services() {
  const navigate = useNavigate();
  const [dynamicServices, setDynamicServices] = useState([]);

  useEffect(() => {
    fetch("http://127.0.0.1:5000/api/user/services")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setDynamicServices(data.services);
        }
      })
      .catch((err) => console.error("Error fetching services:", err));
  }, []);

  const handleServiceClick = (serviceName) => {
    navigate(`/services/${serviceName.toLowerCase()}`);
  };

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
        viewport={{ once: true, amount: 0.4 }}
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

      {dynamicServices.length > 0 && (
        <motion.div
          className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
          variants={gridVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
        >
          {dynamicServices.map((service, i) => {
            const style = styleMap[i % styleMap.length];
            const mappedIcon = iconMap[service.name.toLowerCase()];
            const IconComponent = mappedIcon || Star;

            return (
              <motion.div
                key={service.id || i}
                variants={cardVariants}
                whileHover={{
                  y: -4,
                  borderColor: "rgba(56,189,248,0.35)",
                  boxShadow: "0 12px 24px rgba(2,6,23,0.32)",
                }}
                onClick={() => handleServiceClick(service.name)}
                className="group relative cursor-pointer rounded-2xl border border-white/10 bg-[#0B1220] p-[22px] shadow-[0_6px_14px_rgba(2,6,23,0.2)] transition-all duration-300 ease-in-out"
              >
                <HoverDots />

                {style.tag && (
                  <div className="absolute right-4 top-4 rounded-full border border-sky-400/25 bg-sky-400/10 px-2.5 py-1 text-[10px] font-semibold tracking-[0.02em] text-sky-400 transition-all duration-300 group-hover:border-sky-300/40 group-hover:bg-sky-400/15">
                    {style.tag}
                  </div>
                )}

                <div
                  className={`mb-4 flex h-[42px] w-[42px] items-center justify-center rounded-[10px] border transition-all duration-300 group-hover:scale-105 ${style.iconBox}`}
                >
                  {mappedIcon ? (
                    <IconComponent
                      size={18}
                      strokeWidth={2}
                      className={`${style.iconColor} transition-transform duration-300 group-hover:scale-110`}
                    />
                  ) : service.icon ? (
                    <span className="text-xl transition-transform duration-300 group-hover:scale-110">
                      {service.icon}
                    </span>
                  ) : (
                    <IconComponent
                      size={18}
                      strokeWidth={2}
                      className={`${style.iconColor} transition-transform duration-300 group-hover:scale-110`}
                    />
                  )}
                </div>

                <h3 className="mb-1.5 text-[18px] font-bold text-slate-50">{service.name}</h3>
                <p className="mb-[18px] truncate text-sm leading-[1.5] text-slate-300/60">
                  {service.description || "Expert service professionals for your needs."}
                </p>

                <div className="mb-[14px] h-px bg-white/10" />
                <div className="flex items-center justify-between">
                  <div>
                    <div className="mb-0.5 text-[11px] text-slate-400">Starting From</div>
                    <div className="text-[18px] font-bold text-slate-50">{style.price}</div>
                  </div>
                  <motion.button
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
            );
          })}
        </motion.div>
      )}
    </section>
  );
}