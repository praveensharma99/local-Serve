import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import FloatingIcons from "./FloatingIcons";
import {
  Search,
  Sparkles
} from "lucide-react";

export default function Hero() {
  const [services, setServices] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    fetch("http://127.0.0.1:5000/api/user/services")
      .then(res => res.json())
      .then(data => {
        if(data.success) {
          setServices(data.services);
        }
      })
      .catch(err => console.error("Error fetching services:", err));
  }, []);

  const popularTags = services.slice(0, 5);
  const filteredServices = searchQuery 
    ? services.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];

  const handleSearch = (e) => {
    e.preventDefault();
    setShowDropdown(false);
    const section = document.getElementById("services");
    if(section) {
       section.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleSelectService = (serviceName) => {
    setSearchQuery(serviceName);
    setShowDropdown(false);
    const section = document.getElementById("services");
    if(section) {
       section.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section
      id="home"
      className="relative overflow-hidden px-4 pt-36 pb-16 sm:px-[5vw] sm:pt-40 sm:pb-20"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(99,102,241,0.2),transparent_50%),radial-gradient(circle_at_80%_10%,rgba(56,189,248,0.14),transparent_40%),radial-gradient(circle_at_50%_85%,rgba(139,92,246,0.2),transparent_50%)]" />

      <div className="relative z-10 grid items-center gap-12 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7 }}
          className="max-w-2xl"
        >
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-400/30 bg-indigo-500/10 px-4 py-2 text-xs font-semibold text-indigo-200">
            <Sparkles size={14} />
            Now live in 50+ cities across India
          </div>

          <h1 className="text-[clamp(34px,6vw,72px)] font-extrabold leading-[1.04] tracking-tight text-white">
            Your Home
            <br />
            Deserves{" "}
            <span className="bg-gradient-to-r from-indigo-300 via-purple-300 to-sky-300 bg-clip-text text-transparent">
              Verified
            </span>
          </h1>

          <p className="mt-6 max-w-xl text-base leading-7 text-white/60 sm:text-lg">
            Book verified plumbers, electricians, cleaners and more. Fast booking,
            transparent pricing, and trusted professionals at your doorstep.
          </p>

          <div className="relative mt-8 w-full max-w-xl">
            <form onSubmit={handleSearch} className="flex w-full items-center gap-2 rounded-2xl border border-white/10 bg-white/5 p-2 backdrop-blur-xl">
              <Search size={18} className="ml-2 text-white/60" />
              <input
                type="text"
                placeholder="Search for a service..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowDropdown(true);
                }}
                onFocus={() => setShowDropdown(true)}
                onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                className="flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/35 sm:text-base"
              />
              <button type="submit" className="rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:brightness-110 sm:px-7 sm:text-base">
                Search
              </button>
            </form>
            
            {/* Search Dropdown */}
            {showDropdown && filteredServices.length > 0 && (
              <div className="absolute left-0 right-0 top-[110%] z-50 max-h-60 overflow-y-auto rounded-xl border border-white/10 bg-[#0f172a] shadow-2xl backdrop-blur-xl">
                {filteredServices.map(service => (
                  <div 
                    key={service.id} 
                    onClick={() => handleSelectService(service.name)}
                    className="flex cursor-pointer items-center gap-3 border-b border-white/5 px-4 py-3 text-sm text-white/80 transition hover:bg-white/5 hover:text-white"
                  >
                    {service.icon && <span className="text-lg">{service.icon}</span>}
                    <span>{service.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-2">
            <span className="mr-2 text-xs font-medium text-white/45">Popular:</span>
            {popularTags.map((service) => (
              <button
                key={service.id}
                onClick={() => handleSelectService(service.name)}
                className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/75 transition hover:border-indigo-400/40 hover:bg-indigo-500/20 hover:text-indigo-200"
              >
                {service.icon && <span>{service.icon}</span>}
                {service.name}
              </button>
            ))}
            {popularTags.length === 0 && (
              <span className="text-xs text-white/30">Loading services...</span>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="relative mx-auto w-full max-w-[560px] lg:max-w-[620px]"
        >
          <div className="pointer-events-none absolute inset-[8%] rounded-full bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.28),transparent_70%)] blur-3xl" />
          <div className="relative z-10 mx-auto aspect-square w-full max-w-[520px] rounded-full border-4 border-indigo-300/45 p-2 shadow-[0_0_80px_rgba(99,102,241,0.35)]">
            <img
              src="/images/hero.png"
              alt="Professional home services"
              className="h-full w-full rounded-full object-cover"
            />
          </div>
          <FloatingIcons />
        </motion.div>
      </div>
    </section>
  );
}