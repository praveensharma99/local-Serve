import React, { useEffect, useRef } from 'react';

const ParticleBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    let particlesArray = [];
    let animationFrameId;
    
    // Global Mouse tracking (since pointer-events is none on canvas)
    let mouse = {
      x: null,
      y: null,
      radius: 180 // Radius of influence for the magnetic repulsion
    };

    const handleMouseMove = (event) => {
      // clientX/Y gives coordinates relative to the viewport
      mouse.x = event.clientX;
      mouse.y = event.clientY;
    };

    const handleMouseOut = () => {
      mouse.x = null;
      mouse.y = null;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseout', handleMouseOut);

    // Responsive Canvas
    const setCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    window.addEventListener('resize', () => {
      setCanvasSize();
      initParticles(); // Reinitialize to adapt to new dimensions
    });
    setCanvasSize();

    // Futuristic Premium Palette
    const colors = ['#38bdf8', '#818cf8', '#c084fc', '#e879f9', '#6366f1'];

    class Particle {
      constructor(x, y) {
        this.x = x;
        this.y = y;
        this.originX = x;
        this.originY = y;
        // Size variation for depth
        this.size = Math.random() * 2 + 0.5; 
        this.color = colors[Math.floor(Math.random() * colors.length)];
        
        // Physics
        this.vx = 0;
        this.vy = 0;
        this.ease = 0.04;
        this.friction = 0.88;
        
        // Natural Floating Wave parameters
        this.floatAngle = Math.random() * Math.PI * 2;
        this.floatSpeed = 0.005 + Math.random() * 0.015;
        this.floatRadius = Math.random() * 25 + 10;
        
        // Appearance
        this.baseOpacity = Math.random() * 0.5 + 0.3;
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        
        // Premium Glow Effect
        ctx.shadowBlur = 12;
        ctx.shadowColor = this.color;
        
        // Convert hex to rgb for opacity control
        ctx.fillStyle = this.color; 
        ctx.globalAlpha = this.baseOpacity;
        ctx.fill();
        
        ctx.globalAlpha = 1; // Reset
        ctx.shadowBlur = 0;  // Reset
      }

      update() {
        // 1. Calculate Natural Fluid Target Position
        this.floatAngle += this.floatSpeed;
        const targetX = this.originX + Math.cos(this.floatAngle) * this.floatRadius;
        const targetY = this.originY + Math.sin(this.floatAngle) * this.floatRadius;

        // 2. Interactive Cursor Repulsion Force
        if (mouse.x != null && mouse.y != null) {
          const dx = mouse.x - this.x;
          const dy = mouse.y - this.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < mouse.radius) {
            const angle = Math.atan2(dy, dx);
            // Exponential force for smoother interaction
            const force = (mouse.radius - distance) / mouse.radius;
            
            // Push away from mouse
            const pushX = Math.cos(angle) * force * 4.5; 
            const pushY = Math.sin(angle) * force * 4.5;
            
            this.vx -= pushX;
            this.vy -= pushY;
          }
        }

        // 3. Apply physics (Friction & Easing)
        this.vx *= this.friction;
        this.vy *= this.friction;

        // Spring back to target position
        this.vx += (targetX - this.x) * this.ease;
        this.vy += (targetY - this.y) * this.ease;

        // 4. Update Position
        this.x += this.vx;
        this.y += this.vy;

        this.draw();
      }
    }

    const initParticles = () => {
      particlesArray = [];
      const isMobile = window.innerWidth < 768;
      // Balance density dynamically
      const particleCount = isMobile ? 60 : 180; 

      for (let i = 0; i < particleCount; i++) {
        let x = Math.random() * canvas.width;
        let y = Math.random() * canvas.height;
        particlesArray.push(new Particle(x, y));
      }
    };

    const animate = () => {
      // Clear canvas fully to avoid heavy trails which look messy
      ctx.clearRect(0, 0, canvas.width, canvas.height); 
      
      for (let i = 0; i < particlesArray.length; i++) {
        particlesArray[i].update();
      }
      
      animationFrameId = requestAnimationFrame(animate);
    };

    initParticles();
    animate();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseout', handleMouseOut);
      window.removeEventListener('resize', setCanvasSize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full z-0 pointer-events-none"
      style={{ opacity: 0.8 }} // Controls global visibility to keep it subtle
    />
  );
};

export default ParticleBackground;
