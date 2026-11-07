import React, { useState } from 'react';
import { FAQ_DATA } from '../data/auraData';
import { ChevronDown, HelpCircle } from 'lucide-react';

export default function FAQSection({ theme }) {
  const [openIndex, setOpenIndex] = useState(0);
  const isDark = theme === 'dark';

  const toggleFAQ = (idx) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section id="faq" className={`py-14 sm:py-24 relative overflow-hidden scroll-mt-20 border-t ${
      isDark ? 'bg-black/40 border-amber-500/15' : 'bg-white/70 border-slate-200'
    }`}>
      {/* Office Environment Background: Consultation Pods & Tech Assistance */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <img 
          src="/office-faq.jpg" 
          alt="Acoustic Consultation & Tech Assist Pods" 
          className={`w-full h-full object-cover object-center transform scale-105 transition-all duration-700 ${
            isDark 
              ? 'opacity-[0.15] brightness-75 contrast-125' 
              : 'opacity-[0.10] brightness-95 contrast-110'
          }`}
        />
        <div className={`absolute inset-0 ${
          isDark 
            ? 'bg-gradient-to-b from-[#030305] via-[#030305]/75 to-[#030305]' 
            : 'bg-gradient-to-b from-[#f8fafc] via-[#f8fafc]/80 to-[#f8fafc]'
        }`} />
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        <div className="text-center mb-10 sm:mb-16">
          <div className={`inline-flex items-center gap-2 text-[10px] sm:text-xs font-extrabold uppercase tracking-widest mb-2 sm:mb-3 ${
            isDark ? 'text-amber-400' : 'text-blue-600'
          }`}>
            <HelpCircle className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isDark ? 'text-amber-400' : 'text-blue-600'}`} />
            Common Inquiries
          </div>
          <h2 className={`text-2xl sm:text-5xl font-black uppercase tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Frequently Asked <span className="text-gradient-main">Questions</span>
          </h2>
          <p className={`text-xs sm:text-base mt-1.5 sm:mt-2 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Clear answers to common questions about working with AURA TECH.
          </p>
        </div>

        <div className="space-y-3 sm:space-y-4">
          {FAQ_DATA.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className={`glass-card rounded-2xl transition-all duration-200 overflow-hidden border ${
                  isOpen 
                    ? isDark 
                      ? 'border-amber-500/50 bg-slate-950/90 shadow-lg shadow-amber-500/10' 
                      : 'border-blue-500/50 bg-white shadow-lg shadow-blue-500/10'
                    : isDark 
                      ? 'border-slate-800 hover:border-amber-500/30' 
                      : 'border-slate-200 hover:border-blue-400'
                }`}
              >
                <button
                  onClick={() => toggleFAQ(idx)}
                  className="w-full p-4 sm:p-6 text-left flex items-center justify-between gap-3 sm:gap-4 focus:outline-none cursor-pointer"
                >
                  <span className={`text-sm sm:text-lg font-bold pr-2 sm:pr-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {faq.question}
                  </span>
                  <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-transform duration-200 shrink-0 ${
                    isOpen 
                      ? isDark 
                        ? 'rotate-180 bg-amber-500 text-black font-extrabold' 
                        : 'rotate-180 bg-blue-600 text-white font-extrabold'
                      : isDark 
                        ? 'bg-slate-900 text-slate-400' 
                        : 'bg-slate-100 text-slate-600'
                  }`}>
                    <ChevronDown size={16} />
                  </div>
                </button>

                {isOpen && (
                  <div className={`px-4 sm:px-6 pb-4 sm:pb-6 pt-0 text-xs sm:text-sm leading-relaxed border-t mt-1 sm:mt-2 ${
                    isDark ? 'text-slate-300 border-slate-800/80' : 'text-slate-700 border-slate-100'
                  }`}>
                    <p className="pt-3 sm:pt-4">{faq.answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
