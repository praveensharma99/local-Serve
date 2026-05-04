import React from "react";
import { AirVent, Brush, Droplets, PaintRoller, Zap } from "lucide-react";

const floatingServices = [
  {
    Icon: Droplets,
    label: "Plumbing",
    pos: "top-[12%] left-[10%]",
    duration: "4.8s",
    delay: "0s",
    gradient: "from-[#06b6d4] to-[#3b82f6]",
    glow: "shadow-[0_0_22px_rgba(6,182,212,0.55)]",
  },
  {
    Icon: Zap,
    label: "Electrical",
    pos: "top-[16%] right-[8%]",
    duration: "5.5s",
    delay: "0.5s",
    gradient: "from-[#facc15] to-[#f97316]",
    glow: "shadow-[0_0_22px_rgba(250,204,21,0.55)]",
  },
  {
    Icon: Brush,
    label: "Cleaning",
    pos: "top-[44%] left-[6%]",
    duration: "4.4s",
    delay: "0.3s",
    gradient: "from-[#06b6d4] to-[#3b82f6]",
    glow: "shadow-[0_0_22px_rgba(59,130,246,0.5)]",
  },
  {
    Icon: PaintRoller,
    label: "Painting",
    pos: "bottom-[14%] left-[14%]",
    duration: "5.8s",
    delay: "0.9s",
    gradient: "from-[#ec4899] to-[#8b5cf6]",
    glow: "shadow-[0_0_24px_rgba(236,72,153,0.48)]",
  },
  {
    Icon: AirVent,
    label: "AC Repair",
    pos: "bottom-[24%] right-[7%]",
    duration: "5.1s",
    delay: "0.45s",
    gradient: "from-[#8b5cf6] to-[#3b82f6]",
    glow: "shadow-[0_0_22px_rgba(139,92,246,0.52)]",
  },
];

export default function FloatingIcons() {
  return (
    <div className="pointer-events-none absolute inset-0 z-20 hidden md:block">
      {floatingServices.map(({ Icon, label, pos, duration, delay, gradient, glow }) => (
        <div
          key={label}
          className={`floating-service-icon pointer-events-auto absolute ${pos} group`}
          style={{ animationDuration: duration, animationDelay: delay }}
        >
          <div className="rounded-2xl border border-white/10 bg-white/5 p-3 backdrop-blur-[10px] transition-all duration-300 group-hover:scale-105 group-hover:border-white/20">
            <span
              className={`inline-flex rounded-xl bg-gradient-to-br ${gradient} p-2.5 text-white ${glow} transition-all duration-300 group-hover:scale-110 group-hover:brightness-110`}
            >
              <Icon size={34} strokeWidth={2.1} />
            </span>
          </div>
        </div>
      ))}

      <style>{`
        @keyframes serviceIconFloat {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }

        .floating-service-icon {
          animation-name: serviceIconFloat;
          animation-timing-function: ease-in-out;
          animation-iteration-count: infinite;
        }
      `}</style>
    </div>
  );
}
