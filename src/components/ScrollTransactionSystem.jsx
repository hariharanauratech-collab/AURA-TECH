import React, { useState, useEffect, useRef } from 'react';
import { Activity, ShieldCheck, Zap, Sparkles, ChevronDown, ChevronUp, Layers } from 'lucide-react';

/**
 * ScrollTransactionSystem
 * Provides:
 * 1. Smooth scroll-triggered section reveal transitions across all pages.
 * 2. High-tech scroll transaction laser progress bar.
 * 3. Live transaction telemetry HUD (velocity, block hash, active section).
 * 4. Reactive floating transaction data particles emitted dynamically on every scroll gesture.
 */
export default function ScrollTransactionSystem({ theme }) {
  const isDark = theme === 'dark';

  const [scrollProgress, setScrollProgress] = useState(0);
  const [scrollY, setScrollY] = useState(0);
  const [scrollVelocity, setScrollVelocity] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const [activeSection, setActiveSection] = useState('HERO');
  const [txHash, setTxHash] = useState('TX#AURA-0000-INIT');
  const [particles, setParticles] = useState([]);
  const [isHudMinimized, setIsHudMinimized] = useState(false);

  const lastScrollYRef = useRef(0);
  const lastTimeRef = useRef(Date.now());
  const scrollTimeoutRef = useRef(null);
  const particleIdRef = useRef(0);

  // SECTION LABELS MAPPER
  const getSectionLabel = (id) => {
    switch (id) {
      case 'services': return '02 // SERVICES';
      case 'showcase': return '03 // SHOWCASE';
      case 'clients': return '04 // OUR CLIENTS';
      case 'us': return '05 // OUR TEAM';
      case 'advantages': return '06 // WHY US';
      case 'faq': return '07 // FAQ';
      case 'contact': return '08 // CONTACT';
      case 'hr-portal': return '09 // HR PORTAL';
      default: return '01 // HERO ATRIUM';
    }
  };

  // 1. OBSERVE SECTIONS FOR SCROLL ENTRANCE TRANSITIONS
  useEffect(() => {
    const sections = document.querySelectorAll('section');
    
    // Add base transition class to all sections
    sections.forEach((sec, idx) => {
      sec.classList.add('scroll-section-transition');
      // Hero section enters immediately
      if (idx === 0 || sec.getBoundingClientRect().top < window.innerHeight * 0.8) {
        sec.classList.add('is-entered');
      }
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-entered');
            const secId = entry.target.getAttribute('id');
            if (secId) {
              setActiveSection(getSectionLabel(secId));
            }
          }
        });
      },
      {
        root: null,
        rootMargin: '-40px 0px -60px 0px',
        threshold: 0.15
      }
    );

    sections.forEach((sec) => observer.observe(sec));

    return () => {
      observer.disconnect();
    };
  }, []);

  // 2. SCROLL VELOCITY, PROGRESS & TRANSACTION PARTICLE GENERATION
  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentY = window.scrollY || window.pageYOffset || 0;
          const now = Date.now();
          const dt = Math.max(now - lastTimeRef.current, 1);
          const dy = Math.abs(currentY - lastScrollYRef.current);
          const velocity = Math.round((dy / dt) * 1000); // px/sec

          const maxScroll = Math.max(
            document.documentElement.scrollHeight - window.innerHeight,
            1
          );
          const progress = Math.min(Math.max(currentY / maxScroll, 0), 1);

          setScrollY(currentY);
          setScrollProgress(progress);
          setScrollVelocity(velocity);
          setIsScrolling(true);

          // Update dynamic transaction hash
          const hashHexA = Math.floor(currentY * 3.14).toString(16).toUpperCase().padStart(4, '0');
          const hashHexB = Math.floor(progress * 0xFFFF).toString(16).toUpperCase().padStart(4, '0');
          setTxHash(`TX#AURA-${hashHexA.slice(-4)}-${hashHexB}`);

          // Emit transaction micro-particles on active scroll
          if (velocity > 120 && Math.random() > 0.4) {
            const side = Math.random() > 0.5 ? 'left' : 'right';
            const newParticle = {
              id: ++particleIdRef.current,
              side,
              x: side === 'left' ? Math.random() * 24 + 12 : Math.random() * 24 + 12, // px from side
              y: Math.random() * (window.innerHeight * 0.7) + (window.innerHeight * 0.15),
              size: Math.random() * 4 + 2,
              duration: Math.random() * 0.6 + 0.8
            };

            setParticles((prev) => [...prev.slice(-12), newParticle]);
          }

          lastScrollYRef.current = currentY;
          lastTimeRef.current = now;
          ticking = false;

          // Reset isScrolling state after scrolling stops
          clearTimeout(scrollTimeoutRef.current);
          scrollTimeoutRef.current = setTimeout(() => {
            setIsScrolling(false);
            setScrollVelocity(0);
          }, 180);
        });

        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimeoutRef.current);
    };
  }, []);

  // Clean up old particles
  useEffect(() => {
    if (particles.length > 0) {
      const timer = setTimeout(() => {
        setParticles((prev) => prev.slice(1));
      }, 900);
      return () => clearTimeout(timer);
    }
  }, [particles]);

  return (
    <>
      {/* =========================================================================
          1. TOP TRANSACTION PROGRESS LASER BAR (Scroll-Reactive)
          ========================================================================= */}
      <div 
        className="fixed top-0 left-0 right-0 z-50 pointer-events-none select-none h-[3px]"
        aria-hidden="true"
      >
        {/* Background track */}
        <div className="absolute inset-0 bg-transparent" />

        {/* Dynamic laser bar with pulse on scroll */}
        <div
          className={`h-full transition-all duration-75 will-change-transform relative ${
            isDark
              ? 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-300 shadow-[0_0_12px_rgba(251,191,36,0.8)]'
              : 'bg-gradient-to-r from-blue-600 via-indigo-500 to-cyan-400 shadow-[0_0_10px_rgba(37,99,235,0.7)]'
          }`}
          style={{
            width: `${scrollProgress * 100}%`
          }}
        >
          {/* Leading transaction energy flare */}
          <div className={`absolute top-1/2 -right-1 -translate-y-1/2 w-3 h-3 rounded-full blur-[1px] animate-pulse ${
            isDark ? 'bg-amber-300 shadow-[0_0_8px_#fde047]' : 'bg-cyan-300 shadow-[0_0_8px_#38bdf8]'
          }`} />

          {/* Active scroll sweep shimmer */}
          {isScrolling && (
            <div className="absolute inset-0 bg-white/40 animate-pulse" />
          )}
        </div>
      </div>

      {/* =========================================================================
          2. FLOATING TRANSACTION MICRO-PARTICLES (Active on every scroll)
          ========================================================================= */}
      <div 
        className="fixed inset-0 pointer-events-none z-40 overflow-hidden select-none"
        aria-hidden="true"
      >
        {particles.map((p) => (
          <div
            key={p.id}
            className={`absolute rounded-full animate-transaction-float will-change-transform ${
              isDark 
                ? 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.9)]' 
                : 'bg-blue-500 shadow-[0_0_8px_rgba(37,99,235,0.9)]'
            }`}
            style={{
              [p.side]: `${p.x}px`,
              top: `${p.y}px`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              animationDuration: `${p.duration}s`
            }}
          />
        ))}
      </div>

      {/* =========================================================================
          3. SCROLL TRANSACTION TELEMETRY HUD (Bottom Left Ambient Indicator)
          ========================================================================= */}
      <div 
        className="fixed bottom-4 left-4 z-40 hidden md:block select-none pointer-events-auto transition-all duration-300"
        aria-label="Scroll Telemetry and Transaction Indicator"
      >
        {isHudMinimized ? (
          // Minimized Pill
          <button
            type="button"
            onClick={() => setIsHudMinimized(false)}
            title="Expand Scroll Transaction Telemetry"
            className={`p-2 rounded-xl border shadow-lg backdrop-blur-xl flex items-center gap-1.5 transition-transform hover:scale-105 active:scale-95 cursor-pointer text-[10px] font-black uppercase tracking-wider ${
              isDark 
                ? 'bg-slate-950/85 border-amber-500/30 text-amber-400 hover:border-amber-400' 
                : 'bg-white/90 border-slate-300 text-blue-600 hover:border-blue-500'
            }`}
          >
            <Zap size={12} className={isScrolling ? 'animate-bounce text-amber-400' : ''} />
            <span>{Math.round(scrollProgress * 100)}%</span>
            <ChevronUp size={12} />
          </button>
        ) : (
          // Full Interactive HUD Card
          <div className={`p-2.5 sm:p-3 rounded-2xl border shadow-2xl backdrop-blur-xl max-w-xs transition-all duration-300 ${
            isDark 
              ? 'bg-slate-950/90 border-amber-500/30 text-white shadow-black/80' 
              : 'bg-white/95 border-slate-200 text-slate-900 shadow-slate-300/60'
          } ${isScrolling ? 'ring-2 ring-amber-400/40' : ''}`}>
            
            {/* Header of HUD */}
            <div className="flex items-center justify-between gap-3 mb-1.5 pb-1 border-b border-white/10">
              <div className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${
                  isScrolling 
                    ? 'bg-amber-400 animate-ping' 
                    : isDark ? 'bg-emerald-400' : 'bg-blue-600'
                }`} />
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                  {isScrolling ? 'STREAMING SCROLL TX' : 'SCROLL SYNCED'}
                </span>
              </div>

              <div className="flex items-center gap-1">
                <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                  isDark ? 'bg-slate-900 text-amber-400' : 'bg-blue-50 text-blue-600'
                }`}>
                  {Math.round(scrollProgress * 100)}%
                </span>
                <button
                  type="button"
                  onClick={() => setIsHudMinimized(true)}
                  title="Minimize HUD"
                  className="text-slate-400 hover:text-white p-0.5 cursor-pointer"
                >
                  <ChevronDown size={12} />
                </button>
              </div>
            </div>

            {/* Telemetry Data Grid */}
            <div className="space-y-1 text-[10px] font-mono">
              <div className="flex items-center justify-between gap-2 text-slate-400">
                <span className="text-[9px] font-sans font-extrabold uppercase">Section:</span>
                <span className={`font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                  {activeSection}
                </span>
              </div>

              <div className="flex items-center justify-between gap-2 text-slate-400">
                <span className="text-[9px] font-sans font-extrabold uppercase">Tx Hash:</span>
                <span className={`font-semibold ${isDark ? 'text-amber-400/90' : 'text-blue-600'}`}>
                  {txHash}
                </span>
              </div>

              <div className="flex items-center justify-between gap-2 text-slate-400">
                <span className="text-[9px] font-sans font-extrabold uppercase">Velocity:</span>
                <span className={`font-semibold ${
                  scrollVelocity > 0 ? (isDark ? 'text-amber-400' : 'text-blue-600') : 'text-slate-500'
                }`}>
                  {scrollVelocity} px/s
                </span>
              </div>
            </div>

            {/* Subtle Laser Beam inside HUD */}
            <div className="relative mt-2 h-[2px] bg-white/10 overflow-hidden rounded-full">
              <div 
                className={`h-full transition-all duration-100 ${
                  isDark ? 'bg-amber-400' : 'bg-blue-600'
                }`}
                style={{ width: `${scrollProgress * 100}%` }}
              />
            </div>

          </div>
        )}
      </div>
    </>
  );
}
