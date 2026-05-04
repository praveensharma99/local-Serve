import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ShieldCheck, Clock3, Star, Users } from "lucide-react";

function AnimatedCounter({ target }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        const num = parseFloat(target.replace(/[^0-9.]/g, ""));
        const duration = 1800;
        const steps = 60;
        const increment = num / steps;
        let current = 0;
        const timer = setInterval(() => {
          current += increment;
          if (current >= num) {
            current = num;
            clearInterval(timer);
          }
          setCount(Number.isInteger(num) ? Math.floor(current) : current.toFixed(1));
        }, duration / steps);
      }
    }, { threshold: 0.5 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return <span ref={ref}>{count}</span>;
}

export default function Stats() {
  const stats = [
    { value: "50K+", label: "Happy Customers", target: "50", Icon: Users },
    { value: "1200+", label: "Verified Experts", target: "1200", Icon: ShieldCheck },
    { value: "4.9★", label: "Average Rating", target: "4.9", Icon: Star },
    { value: "30 Min", label: "Avg Response Time", target: "30", Icon: Clock3 },
  ];

  return (
    <section className="px-4 pb-16 sm:px-[5vw] sm:pb-20">
      <div className="grid grid-cols-2 gap-3 rounded-3xl border border-white/10 bg-white/[0.02] p-3 backdrop-blur-xl lg:grid-cols-4">
        {stats.map((s, i) => {
          const SIcon = s.Icon;
          return (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.45, delay: i * 0.1 }}
              className="rounded-2xl border border-white/10 bg-[#0a1230]/70 p-5 text-center sm:p-7"
            >
              <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/15 text-indigo-300">
                <SIcon size={18} />
              </div>
              <div className="text-[clamp(24px,5vw,38px)] font-extrabold text-white">
                <AnimatedCounter target={s.target} />
                {s.value.includes("+") ? "+" : s.value.includes("★") ? "★" : " Min"}
              </div>
              <div className="mt-1 text-xs text-white/50 sm:text-sm">{s.label}</div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}