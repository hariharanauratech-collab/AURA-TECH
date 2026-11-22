import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X, ShieldCheck, Award, Target, Rocket, ArrowRight, Zap, CheckCircle2 } from 'lucide-react';

export default function AboutModal({ theme, isOpen, onClose, onOpenBookModal }) {
  if (!isOpen) return null;
  const navigate = useNavigate();
  const isDark = theme === 'dark';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
      <div className={`relative w-full max-w-2xl rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-2xl my-4 sm:my-8 border overflow-hidden max-h-[92vh] overflow-y-auto no-scrollbar transition-colors ${
        isDark ? 'bg-slate-950 border-amber-500/30 text-slate-100' : 'bg-white border-slate-300 text-slate-900'
      }`}>
        {/* Ambient Top Glow Line */}
        <div className={`absolute top-0 left-0 right-0 h-1.5 z-20 ${
          isDark 
            ? 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600' 
            : 'bg-gradient-to-r from-blue-600 via-indigo-500 to-blue-700'
        }`} />

        {/* Close Button */}
        <button
          type="button"
          name="close"
          value="close"
          onClick={onClose}
          aria-label="Close about modal"
          title="Close about modal"
          className={`absolute top-4 right-4 sm:top-6 sm:right-6 p-2 rounded-full transition-colors cursor-pointer z-30 ${
            isDark 
              ? 'bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800' 
              : 'bg-slate-100 text-slate-700 hover:text-slate-950 hover:bg-slate-200 border border-slate-300'
          }`}
        >
          <X size={18} />
        </button>

        {/* Guaranteed Z-10 High Contrast Foreground Content */}
        <div className="relative z-10 flex flex-col">
          
          {/* Header Branding */}
          <div className="flex items-center gap-3.5 mb-5 sm:mb-6">
            <div className="logo-badge bg-white p-2 rounded-2xl border border-slate-200 shadow-md shrink-0">
              <img src="/logo.png" alt="AURA TECH" className="h-8 sm:h-9 w-auto object-contain" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className={`text-xl sm:text-2xl font-black uppercase tracking-tight ${
                  isDark ? 'text-white' : 'text-slate-950'
                }`}>
                  About <span className={isDark ? 'text-amber-400' : 'text-blue-600'}>AURA TECH</span>
                </h3>
                <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full border tracking-widest ${
                  isDark ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' : 'bg-blue-50 text-blue-700 border-blue-200'
                }`}>
                  Official
                </span>
              </div>
              <span className={`text-xs font-black uppercase tracking-wider block mt-0.5 ${
                isDark ? 'text-amber-400' : 'text-blue-600'
              }`}>
                A Reliable Backbone of Your Business
              </span>
            </div>
          </div>

          {/* Core Story & Foundation */}
          <div className={`space-y-3 text-sm leading-relaxed mb-6 ${
            isDark ? 'text-slate-300' : 'text-slate-700'
          }`}>
            <p className={`text-base font-bold leading-snug ${
              isDark ? 'text-white' : 'text-slate-950'
            }`}>
              AURA TECH is a modern digital engineering collective delivering high-performance, budget-friendly software solutions for students, startups, and established enterprises.
            </p>
            <p className="leading-relaxed">
              Founded in Tamil Nadu, India by Niranjan A and a cross-functional team of passionate architects, we engineer user-friendly web portals, intelligent AI agents, mobile applications, and visual media systems that go beyond ordinary expectations.
            </p>
          </div>

          {/* Key Competencies 4-Card Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-6">
            <div className={`p-4 rounded-2xl border flex items-start gap-3.5 transition-all ${
              isDark ? 'bg-slate-900/90 border-amber-500/20 shadow-md' : 'bg-slate-50 border-slate-200 shadow-sm'
            }`}>
              <div className={`p-2.5 rounded-xl shrink-0 ${
                isDark ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' : 'bg-blue-50 text-blue-600 border border-blue-200'
              }`}>
                <Rocket size={20} />
              </div>
              <div>
                <h4 className={`text-xs font-black uppercase tracking-wider mb-1 ${
                  isDark ? 'text-white' : 'text-slate-900'
                }`}>
                  Complete Guidance
                </h4>
                <p className={`text-xs leading-relaxed ${
                  isDark ? 'text-slate-400' : 'text-slate-600'
                }`}>
                  End-to-end guidance from architectural conception to final cloud deployment.
                </p>
              </div>
            </div>

            <div className={`p-4 rounded-2xl border flex items-start gap-3.5 transition-all ${
              isDark ? 'bg-slate-900/90 border-amber-500/20 shadow-md' : 'bg-slate-50 border-slate-200 shadow-sm'
            }`}>
              <div className={`p-2.5 rounded-xl shrink-0 ${
                isDark ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' : 'bg-blue-50 text-blue-600 border border-blue-200'
              }`}>
                <ShieldCheck size={20} />
              </div>
              <div>
                <h4 className={`text-xs font-black uppercase tracking-wider mb-1 ${
                  isDark ? 'text-white' : 'text-slate-900'
                }`}>
                  Enterprise Standard
                </h4>
                <p className={`text-xs leading-relaxed ${
                  isDark ? 'text-slate-400' : 'text-slate-600'
                }`}>
                  Trusted by enterprises like SISC COIR and InfoPluto Media Works for robust SLA systems.
                </p>
              </div>
            </div>

            <div className={`p-4 rounded-2xl border flex items-start gap-3.5 transition-all ${
              isDark ? 'bg-slate-900/90 border-amber-500/20 shadow-md' : 'bg-slate-50 border-slate-200 shadow-sm'
            }`}>
              <div className={`p-2.5 rounded-xl shrink-0 ${
                isDark ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' : 'bg-blue-50 text-blue-600 border border-blue-200'
              }`}>
                <Target size={20} />
              </div>
              <div>
                <h4 className={`text-xs font-black uppercase tracking-wider mb-1 ${
                  isDark ? 'text-white' : 'text-slate-900'
                }`}>
                  Student Focus
                </h4>
                <p className={`text-xs leading-relaxed ${
                  isDark ? 'text-slate-400' : 'text-slate-600'
                }`}>
                  Subsidized pricing, IEEE documentation & 1-on-1 viva prep for academic projects.
                </p>
              </div>
            </div>

            <div className={`p-4 rounded-2xl border flex items-start gap-3.5 transition-all ${
              isDark ? 'bg-slate-900/90 border-amber-500/20 shadow-md' : 'bg-slate-50 border-slate-200 shadow-sm'
            }`}>
              <div className={`p-2.5 rounded-xl shrink-0 ${
                isDark ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' : 'bg-blue-50 text-blue-600 border border-blue-200'
              }`}>
                <Award size={20} />
              </div>
              <div>
                <h4 className={`text-xs font-black uppercase tracking-wider mb-1 ${
                  isDark ? 'text-white' : 'text-slate-900'
                }`}>
                  24/7 Direct Support
                </h4>
                <p className={`text-xs leading-relaxed ${
                  isDark ? 'text-slate-400' : 'text-slate-600'
                }`}>
                  Continuous post-launch support via phone (+91 90252 55617) and WhatsApp.
                </p>
              </div>
            </div>
          </div>

          {/* SLA Metrics Pill Banner */}
          <div className={`p-3 rounded-xl border flex flex-wrap items-center justify-around gap-2 mb-6 text-center ${
            isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-100/80 border-slate-200'
          }`}>
            <div className="flex items-center gap-1.5 text-xs font-extrabold uppercase">
              <CheckCircle2 size={14} className={isDark ? 'text-amber-400' : 'text-blue-600'} />
              <span>100% On-Time SLA</span>
            </div>
            <div className="text-slate-600 hidden sm:inline">•</div>
            <div className="flex items-center gap-1.5 text-xs font-extrabold uppercase">
              <CheckCircle2 size={14} className={isDark ? 'text-amber-400' : 'text-blue-600'} />
              <span>50+ Delivered Solutions</span>
            </div>
            <div className="text-slate-600 hidden sm:inline">•</div>
            <div className="flex items-center gap-1.5 text-xs font-extrabold uppercase">
              <CheckCircle2 size={14} className={isDark ? 'text-amber-400' : 'text-blue-600'} />
              <span>48h Talent Review</span>
            </div>
          </div>

          {/* Modal Actions */}
          <div className={`flex flex-col sm:flex-row gap-3 pt-4 border-t ${
            isDark ? 'border-slate-800' : 'border-slate-200'
          }`}>
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenBookModal();
              }}
              className="flex-1 btn-primary-action py-3 px-6 rounded-xl font-black text-xs uppercase tracking-wider shadow-lg text-center cursor-pointer flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-98 transition-all"
            >
              <Zap size={15} />
              <span>Register Your Project Now</span>
            </button>
            <button
              type="button"
              onClick={() => {
                onClose();
                navigate('/about');
              }}
              className={`py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider transition-all text-center border flex items-center justify-center gap-1.5 cursor-pointer ${
                isDark 
                  ? 'bg-slate-900 hover:bg-slate-800 text-amber-400 border-amber-500/30' 
                  : 'bg-white hover:bg-slate-100 text-blue-600 border-blue-300 shadow-sm'
              }`}
            >
              <span>View Full Page</span>
              <ArrowRight size={14} />
            </button>
            <button
              type="button"
              onClick={onClose}
              className={`py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider transition-colors text-center border cursor-pointer ${
                isDark 
                  ? 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-800' 
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
              }`}
            >
              Close
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
