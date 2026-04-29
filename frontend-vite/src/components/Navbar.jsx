import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Navbar({ scrolled }) {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  // ✅ Scroll function (clean & working)
  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    } else {
      console.log("Section not found:", id);
    }
  };

  return (
    <>
      {/* Styles */}
      <style>{`
        .nav-link:hover { color: #A5B4FC !important; }
        .nav-link { transition: color 0.2s; }

        .btn-primary:hover { 
          transform: translateY(-2px); 
          box-shadow: 0 16px 40px rgba(99,102,241,0.45); 
        }
        .btn-primary { transition: all 0.25s ease; }

        .btn-secondary:hover { 
          background: rgba(255,255,255,0.12) !important; 
          transform: translateY(-1px); 
        }
        .btn-secondary { transition: all 0.25s ease; }

        .shimmer-btn { 
          background: linear-gradient(90deg, #6366f1, #818cf8, #6366f1); 
          background-size: 200% auto; 
          animation: shimmer 2.5s linear infinite; 
        }

        @keyframes shimmer { 
          0% { background-position: -200% 0; } 
          100% { background-position: 200% 0; } 
        }

        /* ✅ FIX: navbar overlap issue */
        section {
          scroll-margin-top: 80px;
        }
      `}</style>

      <nav
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          padding: "0 5vw",
          background: scrolled ? "rgba(2,8,24,0.9)" : "transparent",
          backdropFilter: scrolled ? "blur(20px)" : "none",
          borderBottom: scrolled
            ? "1px solid rgba(255,255,255,0.06)"
            : "none",
          transition: "all 0.4s ease",
          height: 72,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 18,
            }}
          >
            🔧
          </div>

          <span
            style={{
              fontSize: 20,
              fontWeight: 700,
              color: "#fff",
            }}
          >
            Local<span style={{ color: "#818cf8" }}>Serve</span>
          </span>
        </div>

        {/* Links - Desktop */}
        <div style={{ display: "flex", gap: 36, alignItems: "center" }} className="hidden lg:flex">
          {["Services", "How it Works", "Reviews", "Pricing"].map((l) => {
            const sectionId = l.toLowerCase().replace(/\s+/g, "-");

            return (
              <span
                key={l}
                className="nav-link"
                onClick={() => scrollToSection(sectionId)}
                style={{
                  fontSize: 14,
                  color: "rgba(255,255,255,0.6)",
                  cursor: "pointer",
                  fontWeight: 500,
                }}
              >
                {l}
              </span>
            );
          })}
        </div>

        {/* Buttons - Desktop */}
        <div style={{ display: "flex", gap: 12 }} className="hidden lg:flex">
          <button
            onClick={() => navigate("/login")}
            className="btn-secondary"
            style={{
              padding: "9px 22px",
              borderRadius: 10,
              border: "1px solid rgba(255,255,255,0.15)",
              background: "transparent",
              color: "#fff",
              cursor: "pointer",
            }}
          >
            Sign In
          </button>

          <button
            onClick={() => navigate("/register")}
            className="shimmer-btn btn-primary"
            style={{
              padding: "9px 22px",
              borderRadius: 10,
              border: "none",
              color: "#fff",
              cursor: "pointer",
            }}
          >
            Get Started →
          </button>
        </div>

        {/* Mobile Menu Toggle */}
        <button 
          onClick={() => setMenuOpen(!menuOpen)}
          className="lg:hidden"
          style={{
            background: "transparent",
            border: "none",
            cursor: "pointer",
            padding: "8px",
            display: "flex",
            flexDirection: "column",
            gap: "5px"
          }}
        >
          <span style={{
            width: "24px",
            height: "2px",
            background: "#fff",
            transition: "all 0.3s ease",
            transform: menuOpen ? "rotate(45deg) translateY(7px)" : "none"
          }} />
          <span style={{
            width: "24px",
            height: "2px",
            background: "#fff",
            transition: "all 0.3s ease",
            opacity: menuOpen ? 0 : 1
          }} />
          <span style={{
            width: "24px",
            height: "2px",
            background: "#fff",
            transition: "all 0.3s ease",
            transform: menuOpen ? "rotate(-45deg) translateY(-7px)" : "none"
          }} />
        </button>
      </nav>

      {/* Mobile Menu */}
      <div style={{
        position: "fixed",
        top: "72px",
        left: 0,
        right: 0,
        background: "rgba(2,8,24,0.98)",
        backdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        padding: menuOpen ? "24px 5vw" : "0",
        maxHeight: menuOpen ? "500px" : "0",
        overflow: "hidden",
        transition: "all 0.3s ease",
        zIndex: 99
      }} className="lg:hidden">
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {["Services", "How it Works", "Reviews", "Pricing"].map((l) => {
            const sectionId = l.toLowerCase().replace(/\s+/g, "-");
            return (
              <span
                key={l}
                onClick={() => {
                  scrollToSection(sectionId);
                  setMenuOpen(false);
                }}
                style={{
                  fontSize: 16,
                  color: "rgba(255,255,255,0.7)",
                  cursor: "pointer",
                  fontWeight: 500,
                  padding: "8px 0",
                  borderBottom: "1px solid rgba(255,255,255,0.05)"
                }}
              >
                {l}
              </span>
            );
          })}
          <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "12px" }}>
            <button
              onClick={() => {
                navigate("/login");
                setMenuOpen(false);
              }}
              className="btn-secondary"
              style={{
                padding: "12px 22px",
                borderRadius: 10,
                border: "1px solid rgba(255,255,255,0.15)",
                background: "transparent",
                color: "#fff",
                cursor: "pointer",
                fontSize: 15,
                fontWeight: 500
              }}
            >
              Sign In
            </button>
            <button
              onClick={() => {
                navigate("/register");
                setMenuOpen(false);
              }}
              className="shimmer-btn btn-primary"
              style={{
                padding: "12px 22px",
                borderRadius: 10,
                border: "none",
                color: "#fff",
                cursor: "pointer",
                fontSize: 15,
                fontWeight: 600
              }}
            >
              Get Started →
            </button>
          </div>
        </div>
      </div>
    </>
  );
}