import React, { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import {
  Wrench,
  Zap,
  Hammer,
  Paintbrush,
  AirVent,
  ArrowRight,
  Wind,
  Star,
  Sparkles
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
  { iconColor: "text-cyan-400", iconBox: "bg-cyan-500/10 border-cyan-400/30", tag: "Most Booked", price: "₹299", glow: "rgba(6,182,212,0.5)", hex: "#06B6D4" },
  { iconColor: "text-purple-400", iconBox: "bg-purple-500/10 border-purple-400/30", tag: "Fast Response", price: "₹199", glow: "rgba(139,92,246,0.5)", hex: "#8B5CF6" },
  { iconColor: "text-blue-400", iconBox: "bg-blue-500/10 border-blue-400/30", tag: "Top Rated", price: "₹399", glow: "rgba(59,130,246,0.5)", hex: "#3B82F6" },
  { iconColor: "text-indigo-400", iconBox: "bg-indigo-500/10 border-indigo-400/30", tag: "Most Booked", price: "₹499", glow: "rgba(99,102,241,0.5)", hex: "#6366F1" },
  { iconColor: "text-sky-400", iconBox: "bg-sky-500/10 border-sky-400/30", tag: "Top Rated", price: "₹699", glow: "rgba(14,165,233,0.5)", hex: "#0EA5E9" },
  { iconColor: "text-violet-400", iconBox: "bg-violet-500/10 border-violet-400/30", tag: "Fast Response", price: "₹349", glow: "rgba(139,92,246,0.5)", hex: "#8B5CF6" },
];

const HoverDots = ({ isHovered }) => {
  const dots = useMemo(() => {
    return Array.from({ length: 15 }).map((_, i) => {
      const size = Math.random() * 2 + 1;
      const startX = Math.random() * 100;
      const startY = Math.random() * 100;
      return (
        <motion.div
          key={i}
          className="absolute rounded-full bg-blue-400/60 shadow-[0_0_8px_rgba(96,165,250,0.8)]"
          style={{
            width: size,
            height: size,
            left: `${startX}%`,
            top: `${startY}%`,
          }}
          animate={isHovered ? {
            y: [0, Math.random() * -30 - 10],
            x: [0, (Math.random() - 0.5) * 20],
            opacity: [0, 0.8, 0],
            scale: [0, 1.5, 0]
          } : { opacity: 0 }}
          transition={{
            duration: Math.random() * 1.5 + 1,
            repeat: Infinity,
            ease: "easeOut",
            delay: Math.random() * 1,
          }}
        />
      );
    });
  }, [isHovered]);

  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden rounded-2xl opacity-0 transition-opacity duration-300 ease-in-out group-hover:opacity-100">
      {dots}
    </div>
  );
};

const ServiceCard = ({ service, style, handleServiceClick }) => {
  const mappedIcon = iconMap[service.name.toLowerCase()];
  const IconComponent = mappedIcon || Star;

  const cardRef = useRef(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  // 3D Tilt setup
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 20 });
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 20 });
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["8deg", "-8deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-8deg", "8deg"]);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    x.set(mouseX / width - 0.5);
    y.set(mouseY / height - 0.5);
    setMousePosition({ x: mouseX, y: mouseY });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    x.set(0);
    y.set(0);
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    show: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] },
    },
  };

  return (
    <motion.div
      ref={cardRef}
      variants={cardVariants}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      onClick={() => handleServiceClick(service.name)}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      className="group relative cursor-pointer rounded-2xl transition-all duration-300 z-10"
    >
      {/* Background radial glow that expands on hover */}
      <div
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-2xl -z-10"
        style={{ background: `radial-gradient(circle at center, ${style.glow} 0%, transparent 80%)` }}
      ></div>

      {/* Main Content Container */}
      <div className="relative h-full w-full rounded-2xl bg-gradient-to-br from-[#0F172A]/85 to-[#1E293B]/55 backdrop-blur-xl p-[22px] shadow-[inset_0_1px_1px_rgba(255,255,255,0.15),0_8px_32px_rgba(0,0,0,0.4)] transition-all duration-500 overflow-hidden border border-white/5 group-hover:border-white/10 group-hover:shadow-[inset_0_1px_1px_rgba(255,255,255,0.2),0_15px_40px_rgba(0,0,0,0.5)]">

        {/* Dynamic mouse follow light */}
        <div
          className="absolute pointer-events-none rounded-full blur-[60px] transition-opacity duration-300 mix-blend-screen"
          style={{
            width: "240px",
            height: "240px",
            background: `radial-gradient(circle, ${style.glow.replace('0.5', '0.2')} 0%, transparent 70%)`,
            left: mousePosition.x - 120,
            top: mousePosition.y - 120,
            opacity: isHovered ? 1 : 0,
          }}
        />

        {/* Top Glossy Reflection */}
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-white/[0.04] to-transparent pointer-events-none rounded-t-2xl"></div>

        <HoverDots isHovered={isHovered} />

        {/* Content with 3D Pop Effect */}
        <div style={{ transform: "translateZ(30px)" }}>
          {style.tag && (
            <div
              className={`absolute right-4 top-4 rounded-full border px-3 py-1.5 text-[10px] font-bold tracking-widest uppercase transition-all duration-300 shadow-[0_0_15px_rgba(0,0,0,0)] ${style.iconBox} ${style.iconColor} bg-opacity-20 backdrop-blur-md`}
              style={{ boxShadow: isHovered ? `0 0 15px ${style.glow}` : "none", borderColor: isHovered ? style.hex : "rgba(255,255,255,0.1)" }}
            >
              {style.tag}
            </div>
          )}

          <div
            className={`mb-5 flex h-[48px] w-[48px] items-center justify-center rounded-xl border transition-all duration-500 group-hover:scale-110 ${style.iconBox} relative overflow-hidden`}
            style={{ boxShadow: isHovered ? `0 0 25px ${style.glow}` : "none", borderColor: isHovered ? style.hex : "rgba(255,255,255,0.1)" }}
          >
            {/* Shimmer sweep inside icon box */}
            <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:animate-shimmer" />

            {mappedIcon ? (
              <IconComponent
                size={22}
                strokeWidth={2}
                className={`${style.iconColor} transition-transform duration-300 drop-shadow-[0_0_8px_currentColor]`}
              />
            ) : service.icon ? (
              <span className="text-2xl transition-transform duration-300 drop-shadow-[0_0_8px_currentColor]">
                {service.icon}
              </span>
            ) : (
              <IconComponent
                size={22}
                strokeWidth={2}
                className={`${style.iconColor} transition-transform duration-300 drop-shadow-[0_0_8px_currentColor]`}
              />
            )}
          </div>

          <h3 className="mb-2 text-[20px] font-bold text-slate-50 tracking-tight drop-shadow-md group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-slate-300 transition-all duration-300">{service.name}</h3>
          <p className="mb-6 truncate text-sm leading-[1.6] text-slate-300/60 group-hover:text-slate-300/90 transition-colors duration-300">
            {service.description || "Expert service professionals for your needs."}
          </p>

          <div className="mb-5 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
          <div className="flex items-center justify-between">
            <div>
              <div className="mb-1 text-[11px] font-medium text-slate-400 uppercase tracking-wider">Starting From</div>
              <div className="text-[20px] font-bold text-slate-50 drop-shadow-md">{style.price}</div>
            </div>
            <motion.button
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 backdrop-blur-md transition-all duration-500 ease-in-out relative overflow-hidden"
              style={{
                borderColor: isHovered ? style.hex : "rgba(255,255,255,0.1)",
                backgroundColor: isHovered ? style.glow.replace('0.5', '0.15') : "rgba(255,255,255,0.05)",
                boxShadow: isHovered ? `0 0 20px ${style.glow}` : "none",
              }}
            >
              <ArrowRight
                size={16}
                strokeWidth={2.5}
                className={`${style.iconColor} transition-transform duration-300 group-hover:translate-x-1 drop-shadow-[0_0_8px_currentColor]`}
              />
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
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

  return (
    <section
      id="services"
      className="relative overflow-hidden bg-transparent px-4 py-20 sm:px-[5vw] sm:py-24"
      style={{ fontFamily: "Inter, Poppins, system-ui, sans-serif" }}
    >
      {/* Futuristic Background Ambience */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {/* Animated Gradient Aurora / Blobs */}
        <div className="absolute top-0 left-[20%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] animate-blob"></div>
        <div className="absolute bottom-0 right-[10%] w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[120px] animate-blob" style={{ animationDelay: "2s" }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-cyan-900/10 rounded-full blur-[150px] animate-pulse" style={{ animationDuration: "10s" }}></div>

        {/* Subtle grid texture */}
        <div
          className="absolute inset-0 opacity-[0.1]"
          style={{
            backgroundImage: "radial-gradient(rgba(255, 255, 255, 0.2) 1px, transparent 1px)",
            backgroundSize: "40px 40px"
          }}
        ></div>
      </div>

      <div className="relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center mb-16 flex flex-col items-center"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-semibold tracking-wide mb-4 shadow-[0_0_15px_rgba(59,130,246,0.15)]">
            <Sparkles size={14} /> PREMIUM SERVICES
          </div>
          <h2 className="mb-4 text-[clamp(2.2rem,4vw,3.5rem)] font-extrabold leading-tight tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-slate-300 drop-shadow-lg">
            Everything Your Home Needs
          </h2>
          <p className="mx-auto max-w-[600px] text-[16px] leading-relaxed text-blue-100/60 font-medium">
            Reliable home services from verified professionals, beautifully designed for a modern experience. Clear pricing, fast response.
          </p>
        </motion.div>

        {dynamicServices.length > 0 && (
          <motion.div
            className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:gap-8"
            style={{ perspective: "1000px" }}
            variants={gridVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.1 }}
          >
            {dynamicServices.map((service, i) => (
              <ServiceCard
                key={service.id || i}
                service={service}
                style={styleMap[i % styleMap.length]}
                handleServiceClick={handleServiceClick}
              />
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
}