import { useEffect, useRef, useState } from "react";

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
    { value: "50K+", label: "Happy Customers", target: "50" },
    { value: "1200+", label: "Expert Pros", target: "1200" },
    { value: "4.9★", label: "Average Rating", target: "4.9" },
    { value: "30 Min", label: "Avg Response Time", target: "30" },
  ];

  return (
    <section className="px-4 sm:px-[5vw] pb-16 sm:pb-20">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 rounded-[20px] overflow-hidden border border-white/7">
        {stats.map((s, i) => (
          <div key={i} className="bg-white/[0.03] p-6 sm:p-9 text-center" style={{ borderRight: i < 3 ? "1px solid rgba(255,255,255,0.07)" : "none" }}>
            <div className="text-[clamp(24px,5vw,40px)] font-extrabold text-white mb-1.5 sm:mb-2">
              <AnimatedCounter target={s.target} />
              {s.value.includes("+") ? "+" : s.value.includes("★") ? "★" : " Min"}
            </div>
            <div className="text-xs sm:text-sm text-white/40">{s.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}