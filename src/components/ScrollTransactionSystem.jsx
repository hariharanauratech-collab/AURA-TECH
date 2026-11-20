import React, { useState, useEffect } from 'react';

/**
 * ScrollTransactionSystem (Smooth Scroll & Transition Engine)
 * - Automatically triggers smooth reveal transitions as the user scrolls.
 * - Displays an ultra-thin, elegant top progress laser bar.
 * - Zero intrusive floating debug/telemetry boxes.
 */
export default function ScrollTransactionSystem({ theme }) {
  const isDark = theme === 'dark';
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);

  // 1. OBSERVE SECTIONS & CARDS FOR SMOOTH SCROLL TRANSITIONS
  useEffect(() => {
    const sections = document.querySelectorAll('section');
    
    sections.forEach((sec, idx) => {
      sec.classList.add('scroll-section-transition');

      // Tag cards inside section for staggered smooth reveal
      const cards = sec.querySelectorAll('.glass-card, [data-card], .transaction-card-glow');
      cards.forEach((card, cardIdx) => {
        card.classList.add('scroll-card-item');
        card.style.transitionDelay = `${(cardIdx % 6) * 0.08}s`;
      });

      // Topmost section or sections already in view enter immediately
      const rect = sec.getBoundingClientRect();
      if (idx === 0 || rect.top < window.innerHeight * 0.85) {
        sec.classList.add('is-entered');
      }
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-entered');
          }
        });
      },
      {
        root: null,
        rootMargin: '0px 0px -80px 0px',
        threshold: 0.1
      }
    );

    sections.forEach((sec) => observer.observe(sec));

    return () => {
      observer.disconnect();
    };
  }, []);

  // 2. ULTRA-SMOOTH PROGRESS BAR & SCROLL STATE
  useEffect(() => {
    let ticking = false;
    let scrollTimeout = null;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentY = window.scrollY || window.pageYOffset || 0;
          const maxScroll = Math.max(
            document.documentElement.scrollHeight - window.innerHeight,
            1
          );
          const progress = Math.min(Math.max(currentY / maxScroll, 0), 1);

          setScrollProgress(progress);
          setIsScrolling(true);

          clearTimeout(scrollTimeout);
          scrollTimeout = setTimeout(() => {
            setIsScrolling(false);
          }, 150);

          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, []);

  return (
    <>
      {/* =========================================================================
          SLEEK MINIMALIST TOP SCROLL PROGRESS BAR (No Clutter, Pure Smoothness)
          ========================================================================= */}
      <div 
        className="fixed top-0 left-0 right-0 z-50 pointer-events-none select-none h-[2.5px]"
        aria-hidden="true"
      >
        <div
          className={`h-full transition-all duration-150 ease-out will-change-transform relative ${
            isDark
              ? 'bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-300 shadow-[0_0_8px_rgba(251,191,36,0.6)]'
              : 'bg-gradient-to-r from-blue-600 via-indigo-500 to-sky-400 shadow-[0_0_8px_rgba(37,99,235,0.5)]'
          }`}
          style={{
            width: `${scrollProgress * 100}%`
          }}
        >
          {/* Subtle leading glow point while scrolling */}
          <div className={`absolute top-1/2 -right-1 -translate-y-1/2 w-2 h-2 rounded-full blur-[1px] transition-opacity duration-300 ${
            isScrolling ? 'opacity-100' : 'opacity-40'
          } ${
            isDark ? 'bg-amber-300 shadow-[0_0_6px_#fde047]' : 'bg-sky-300 shadow-[0_0_6px_#38bdf8]'
          }`} />
        </div>
      </div>
    </>
  );
}
