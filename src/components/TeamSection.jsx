import React, { useState } from 'react';
import { TEAM_MEMBERS } from '../data/auraData';
import { Users, Sparkles, ShieldCheck, Award, Info, X } from 'lucide-react';

export default function TeamSection({ theme, onOpenBookModal }) {
  const [selectedMember, setSelectedMember] = useState(null);
  const isDark = theme === 'dark';

  return (
    <section id="us" className={`py-14 sm:py-24 relative overflow-hidden scroll-mt-20 border-t transition-colors duration-300 ${
      isDark ? 'bg-black/40 border-amber-500/15' : 'bg-slate-50/70 border-slate-200'
    }`}>
      {/* Office Environment Background: Creative Visionaries Collaboration Lounge */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <img 
          src="/office-team.jpg" 
          alt="Visionaries Collaboration Lounge" 
          className={`w-full h-full object-cover object-center transform scale-105 transition-all duration-700 ${
            isDark 
              ? 'opacity-[0.16] brightness-75 contrast-125' 
              : 'opacity-[0.11] brightness-95 contrast-110'
          }`}
        />
        <div className={`absolute inset-0 ${
          isDark 
            ? 'bg-gradient-to-b from-[#030305] via-[#030305]/75 to-[#030305]' 
            : 'bg-gradient-to-b from-[#f8fafc] via-[#f8fafc]/80 to-[#f8fafc]'
        }`} />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-16">
          <div className={`inline-flex items-center gap-2 px-3 sm:px-3.5 py-1.5 rounded-full text-[10px] sm:text-xs font-extrabold uppercase tracking-widest mb-3 sm:mb-4 border ${
            isDark 
              ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' 
              : 'bg-blue-50 border-blue-200 text-blue-600 shadow-sm'
          }`}>
            <Users className="w-3.5 h-3.5" />
            Meet The Visionaries Behind Aura Tech
          </div>

          <h2 className={`text-2xl sm:text-5xl font-black uppercase tracking-tight mb-3 sm:mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            OUR <span className="text-gradient-main">TEAM (US)</span>
          </h2>

          <p className={`text-xs sm:text-base leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
            A collective of passion-driven engineers, full stack developers, AI artists, IoT innovators, and creative designers powering digital transformation.
          </p>
        </div>

        {/* 7 Team Members Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {TEAM_MEMBERS.map((member) => (
            <div 
              key={member.id}
              className={`glass-card rounded-2xl sm:rounded-3xl p-5 sm:p-6 border transition-all duration-300 hover:-translate-y-2 flex flex-col justify-between group ${
                isDark 
                  ? 'border-amber-500/20 hover:border-amber-400/50 hover:shadow-2xl hover:shadow-amber-500/10' 
                  : 'border-slate-200 hover:border-blue-400 hover:shadow-xl'
              }`}
            >
              <div>
                {/* Photo Avatar with Details Button in the Photo */}
                <div 
                  onClick={() => setSelectedMember(member)}
                  className="relative mb-4 sm:mb-5 overflow-hidden rounded-xl sm:rounded-2xl aspect-square border border-slate-700/40 cursor-pointer group/photo"
                >
                  <img 
                    src={member.image} 
                    alt={member.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent transition-opacity" />

                  {/* Desktop Hover Quick Preview Indicator */}
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] opacity-0 group-hover/photo:opacity-100 transition-all duration-300 flex flex-col items-center justify-center p-3 text-center">
                    <span className={`p-2.5 rounded-full mb-2 shadow-lg ${
                      isDark ? 'bg-amber-500 text-black' : 'bg-blue-600 text-white'
                    }`}>
                      <Info size={18} />
                    </span>
                    <span className="text-xs font-black uppercase tracking-wider text-white">
                      View Member Details
                    </span>
                    <span className={`text-[10px] mt-0.5 font-bold ${isDark ? 'text-amber-400' : 'text-blue-300'}`}>
                      {member.role}
                    </span>
                  </div>
                  
                  {/* Badge & Details button inside our photos */}
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between z-10 gap-2">
                    <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-black/80 backdrop-blur-md text-white border border-white/20 truncate">
                      {member.badge}
                    </span>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedMember(member);
                      }}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-lg transition-all active:scale-95 cursor-pointer shrink-0 ${
                        isDark 
                          ? 'bg-amber-500 hover:bg-amber-400 text-black shadow-amber-500/20' 
                          : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/20'
                      }`}
                      title="View Member Details"
                    >
                      <Info size={12} />
                      <span>Details</span>
                    </button>
                  </div>
                </div>

                {/* Member Info */}
                <h3 className={`text-lg font-black tracking-tight uppercase mb-1 ${isDark ? 'text-white group-hover:text-amber-400' : 'text-slate-900 group-hover:text-blue-600'} transition-colors`}>
                  {member.name}
                </h3>

                <div className={`text-xs font-black uppercase tracking-wider mb-2.5 ${isDark ? 'text-amber-400' : 'text-blue-600'}`}>
                  {member.role}
                </div>

                <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  {member.tagline}
                </p>
              </div>

              {/* Bottom Info - Collaboration Button Removed */}
              <div className="mt-5 pt-3.5 border-t border-slate-800/40 flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 flex items-center gap-1.5">
                  <ShieldCheck size={13} className={isDark ? 'text-amber-400' : 'text-blue-600'} />
                  AURA TECH CREW
                </span>
                <span className={`inline-flex items-center gap-1 text-[10px] font-bold ${
                  isDark ? 'text-amber-400/80' : 'text-blue-600/80'
                }`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Verified
                </span>
              </div>

            </div>
          ))}
        </div>

      </div>

      {/* Team Member Details Modal */}
      {selectedMember && (
        <div 
          onClick={() => setSelectedMember(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className={`relative w-full max-w-xl rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-2xl my-4 border overflow-hidden max-h-[92vh] overflow-y-auto no-scrollbar ${
              isDark ? 'bg-slate-950 border-amber-500/30 text-white' : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            {/* Watermark Office Background */}
            <div className="absolute inset-0 pointer-events-none rounded-2xl sm:rounded-3xl overflow-hidden z-0">
              <img 
                src="/office-team.jpg" 
                alt="Office Environment" 
                className={`w-full h-full object-cover object-center ${
                  isDark ? 'opacity-[0.10] brightness-75 contrast-125' : 'opacity-[0.06] contrast-110'
                }`}
              />
              <div className={`absolute inset-0 ${
                isDark ? 'bg-slate-950/85 backdrop-blur-md' : 'bg-white/92 backdrop-blur-md'
              }`} />
            </div>

            {/* Close Button */}
            <button
              onClick={() => setSelectedMember(null)}
              aria-label="Close member details modal"
              className={`absolute top-3.5 right-3.5 sm:top-5 sm:right-5 p-2 rounded-full transition-colors cursor-pointer z-10 ${
                isDark ? 'bg-slate-900 text-slate-400 hover:text-white' : 'bg-slate-100 text-slate-600 hover:text-slate-900'
              }`}
              title="Close Details"
            >
              <X size={18} />
            </button>

            {/* Modal Header with Photo & Profile Overview */}
            <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-5 pb-5 border-b border-slate-800/60 text-center sm:text-left">
              <div className="relative shrink-0">
                <img 
                  src={selectedMember.image} 
                  alt={selectedMember.name} 
                  className={`w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border-2 shadow-xl ${
                    isDark ? 'border-amber-500/40 shadow-amber-500/10' : 'border-blue-500/40 shadow-blue-500/10'
                  }`}
                />
                <span className={`absolute -bottom-2 -right-2 px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider shadow-md ${
                  isDark ? 'bg-amber-500 text-black' : 'bg-blue-600 text-white'
                }`}>
                  Verified
                </span>
              </div>

              <div className="flex-1 min-w-0">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider mb-1.5 border bg-black/20 border-white/10">
                  <Sparkles size={11} className={isDark ? 'text-amber-400' : 'text-blue-600'} />
                  <span>{selectedMember.badge}</span>
                </div>

                <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight">
                  {selectedMember.name}
                </h3>

                <div className={`text-xs font-black uppercase tracking-wider mt-0.5 ${
                  isDark ? 'text-amber-400' : 'text-blue-600'
                }`}>
                  {selectedMember.role}
                </div>

                <p className={`text-xs mt-1.5 italic ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  "{selectedMember.tagline}"
                </p>
              </div>
            </div>

            {/* Modal Content Details */}
            <div className="relative z-10 space-y-4 pt-5 text-xs">
              
              {/* About / Bio */}
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                  Profile Overview & Background
                </span>
                <p className={`leading-relaxed p-3.5 rounded-xl border ${
                  isDark ? 'bg-slate-900/70 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}>
                  {selectedMember.bio}
                </p>
              </div>

              {/* Specialization */}
              {selectedMember.specialization && (
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                    Core Specialization
                  </span>
                  <div className={`p-3 rounded-xl border font-bold flex items-center gap-2 ${
                    isDark ? 'bg-slate-900/70 border-amber-500/20 text-amber-300' : 'bg-blue-50/70 border-blue-200 text-blue-700'
                  }`}>
                    <Award size={15} className="shrink-0" />
                    <span>{selectedMember.specialization}</span>
                  </div>
                </div>
              )}

              {/* Skills Grid */}
              {selectedMember.skills && selectedMember.skills.length > 0 && (
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-2">
                    Key Competencies & Technical Skills
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedMember.skills.map((skill, idx) => (
                      <span 
                        key={idx}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${
                          isDark 
                            ? 'bg-slate-900 border-slate-800 text-slate-300' 
                            : 'bg-slate-100 border-slate-300 text-slate-700'
                        }`}
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Core Contributions */}
              {selectedMember.contributions && (
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                    Contributions & Responsibilities at Aura Tech
                  </span>
                  <p className={`leading-relaxed p-3 rounded-xl border ${
                    isDark ? 'bg-slate-900/40 border-slate-800/80 text-slate-400' : 'bg-slate-50/80 border-slate-200 text-slate-600'
                  }`}>
                    {selectedMember.contributions}
                  </p>
                </div>
              )}

            </div>

            {/* Modal Footer */}
            <div className="relative z-10 mt-6 pt-4 border-t border-slate-800/60 flex items-center justify-between gap-3">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 flex items-center gap-1.5">
                <ShieldCheck size={14} className={isDark ? 'text-amber-400' : 'text-blue-600'} />
                AURA TECH CREW
              </span>

              <button
                type="button"
                onClick={() => setSelectedMember(null)}
                className="btn-primary-action px-6 py-2 rounded-xl text-xs font-black uppercase tracking-wider shadow-md cursor-pointer"
              >
                Close Details
              </button>
            </div>

          </div>
        </div>
      )}
    </section>
  );
}

