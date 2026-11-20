import React, { useState } from 'react';
import { 
  X, Building2, Globe, ExternalLink, ShieldCheck, CheckCircle2, 
  Sparkles, Layers, ArrowRight, Info, Zap, Factory, Film, 
  MapPin, UserCheck, ArrowUpRight
} from 'lucide-react';
import { CLIENTS_DATA } from '../data/auraData';

export default function OurClientsModal({ theme, isOpen, onClose, onOpenBookModal }) {
  if (!isOpen) return null;
  const isDark = theme === 'dark';
  const [selectedClientTab, setSelectedClientTab] = useState(CLIENTS_DATA[0]?.id || 'c1');

  const currentClient = CLIENTS_DATA.find(c => c.id === selectedClientTab) || CLIENTS_DATA[0];
  const isSisc = currentClient.id === 'c1';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
      <div className={`relative w-full max-w-4xl rounded-2xl sm:rounded-3xl p-4 sm:p-8 shadow-2xl my-3 sm:my-8 border overflow-hidden max-h-[92vh] overflow-y-auto custom-scrollbar ${
        isDark ? 'bg-slate-950 border-amber-500/30 text-white' : 'bg-white border-slate-200 text-slate-900'
      }`}>
        
        {/* Ambient glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/5 blur-[100px] pointer-events-none rounded-full" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500/5 blur-[100px] pointer-events-none rounded-full" />

        {/* Close Button */}
        <button
          type="button"
          name="close"
          value="close"
          onClick={onClose}
          aria-label="Close clients modal"
          title="Close clients modal"
          className={`absolute top-3.5 right-3.5 sm:top-6 sm:right-6 p-1.5 sm:p-2 rounded-full transition-colors cursor-pointer z-30 ${
            isDark 
              ? 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800' 
              : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
          }`}
        >
          <X size={18} />
        </button>

        {/* Header Branding */}
        <div className="flex items-center gap-3 mb-6">
          <div className="logo-badge bg-white p-1.5 sm:p-2 rounded-xl border border-slate-200 shadow-sm">
            <img src="/logo.png" alt="AURA TECH" className="h-7 sm:h-8 w-auto object-contain" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className={`text-lg sm:text-2xl font-black uppercase tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Our <span className={isDark ? 'text-amber-400' : 'text-blue-600'}>Clients</span> &amp; Corporate References
              </h3>
            </div>
            <span className={`text-[10px] sm:text-[11px] font-extrabold uppercase tracking-widest ${isDark ? 'text-amber-400' : 'text-blue-600'}`}>
              Enterprise Portfolio &amp; Digital Deliverables
            </span>
          </div>
        </div>

        {/* Verification & Industry Distinction Banner */}
        <div className={`p-3.5 rounded-2xl border text-left flex items-start gap-2.5 mb-6 text-xs leading-relaxed ${
          isDark ? 'bg-slate-900/80 border-amber-500/20 text-slate-300' : 'bg-blue-50/70 border-blue-200 text-slate-700'
        }`}>
          <Info size={16} className={`shrink-0 mt-0.5 ${isDark ? 'text-amber-400' : 'text-blue-600'}`} />
          <div>
            <strong className="font-bold">Important Reference Note:</strong> The company descriptions outline each organization's core business (Coir Manufacturing and Media Production). AURA TECH provides the technical engineering, corporate website development, and digital platform architectures.
          </div>
        </div>

        {/* Client Selection Tabs */}
        <div className="flex gap-2 mb-6 border-b pb-4 overflow-x-auto no-scrollbar">
          {CLIENTS_DATA.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setSelectedClientTab(c.id)}
              className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer border ${
                selectedClientTab === c.id
                  ? isDark
                    ? 'bg-amber-400 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20'
                    : 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20'
                  : isDark
                    ? 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                    : 'bg-slate-100 text-slate-600 border-slate-200 hover:text-slate-900'
              }`}
            >
              {c.id === 'c1' ? <Factory size={14} /> : <Film size={14} />}
              <span>{c.brandName}</span>
            </button>
          ))}
        </div>

        {/* Selected Client Detailed Profile */}
        <div className={`p-5 sm:p-6 rounded-2xl border mb-6 ${
          isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-50 border-slate-200'
        }`}>
          
          {/* Header of Active Client */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-xl sm:text-2xl font-black uppercase tracking-tight">
                  {currentClient.brandName}
                </h4>
                <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${
                  isDark ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' : 'bg-blue-50 text-blue-600 border-blue-200'
                }`}>
                  Verified Client
                </span>
              </div>
              <p className={`text-xs font-bold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                {currentClient.companyName}
              </p>
            </div>

            <a
              href={currentClient.website}
              target="_blank"
              rel="noopener noreferrer"
              className={`px-3.5 py-1.5 rounded-xl border text-xs font-black uppercase tracking-wider inline-flex items-center gap-1.5 transition-all shadow-sm ${
                isDark 
                  ? 'bg-slate-800 hover:bg-slate-700 text-amber-400 border-amber-500/30' 
                  : 'bg-white hover:bg-slate-100 text-blue-600 border-blue-200'
              }`}
            >
              <Globe size={13} />
              <span>{currentClient.displayUrl}</span>
              <ArrowUpRight size={13} />
            </a>
          </div>

          {/* Location & Details Badges */}
          <div className="flex flex-wrap gap-2 mb-4 text-xs">
            <span className={`px-2.5 py-1 rounded-lg border font-semibold flex items-center gap-1 ${
              isDark ? 'bg-black/60 border-slate-800 text-slate-300' : 'bg-white border-slate-200 text-slate-700'
            }`}>
              <MapPin size={12} className={isDark ? 'text-amber-400' : 'text-blue-600'} />
              {currentClient.location}
            </span>

            {currentClient.founder && (
              <span className={`px-2.5 py-1 rounded-lg border font-semibold flex items-center gap-1 ${
                isDark ? 'bg-black/60 border-slate-800 text-slate-300' : 'bg-white border-slate-200 text-slate-700'
              }`}>
                <UserCheck size={12} className={isDark ? 'text-amber-400' : 'text-blue-600'} />
                Founder: {currentClient.founder}
              </span>
            )}

            <span className={`px-2.5 py-1 rounded-lg border font-semibold ${
              isDark ? 'bg-black/60 border-slate-800 text-slate-300' : 'bg-white border-slate-200 text-slate-700'
            }`}>
              Industry: {currentClient.industryBadge}
            </span>
          </div>

          {/* Overview */}
          <p className={`text-xs sm:text-sm leading-relaxed mb-5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
            {currentClient.companyOverview}
          </p>

          {/* Associated Platform (IndieMa) */}
          {currentClient.associatedPlatform && (
            <div className={`p-3 rounded-xl border mb-5 flex items-center justify-between gap-3 ${
              isDark ? 'bg-indigo-950/20 border-indigo-500/30' : 'bg-indigo-50 border-indigo-200'
            }`}>
              <div className="text-xs">
                <div className="font-bold text-xs flex items-center gap-1.5 mb-0.5">
                  <span className={`text-[9px] uppercase px-1.5 py-0.5 rounded font-black ${
                    isDark ? 'bg-indigo-500/30 text-indigo-300' : 'bg-indigo-100 text-indigo-700'
                  }`}>
                    Platform
                  </span>
                  <span>{currentClient.associatedPlatform.name}</span>
                </div>
                <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  {currentClient.associatedPlatform.description}
                </p>
              </div>
              <a
                href={currentClient.associatedPlatform.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`p-2 rounded-lg border text-xs font-bold inline-flex items-center gap-1 shrink-0 ${
                  isDark ? 'bg-slate-900 border-indigo-500/30 text-indigo-300' : 'bg-white border-indigo-200 text-indigo-600'
                }`}
              >
                <span>Visit IndieMa</span>
                <ExternalLink size={12} />
              </a>
            </div>
          )}

          {/* Two-Column Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Column 1: Client Domain / Products */}
            <div className={`p-4 rounded-xl border ${
              isDark ? 'bg-black/40 border-slate-800' : 'bg-white border-slate-200'
            }`}>
              <h5 className={`text-xs font-black uppercase tracking-wider mb-2 flex items-center gap-1.5 ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}>
                <Layers size={13} className={isDark ? 'text-amber-400' : 'text-blue-600'} />
                {isSisc ? 'SISC COIR Product Lines' : 'InfoPluto Media Areas'}
              </h5>
              <ul className="space-y-1.5 text-[11px]">
                {(isSisc ? currentClient.productCategories : currentClient.serviceAreas.slice(0, 5)).map((item, idx) => (
                  <li key={idx} className={`flex items-start gap-1.5 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 2: AURA TECH Deliverables */}
            <div className={`p-4 rounded-xl border ${
              isDark ? 'bg-slate-900 border-amber-500/30' : 'bg-blue-50 border-blue-200'
            }`}>
              <h5 className={`text-xs font-black uppercase tracking-wider mb-2 flex items-center gap-1.5 ${
                isDark ? 'text-amber-400' : 'text-blue-600'
              }`}>
                <Sparkles size={13} />
                AURA TECH Deliverables
              </h5>
              <p className={`text-[11px] mb-2 font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                {currentClient.auraDeliverable.description}
              </p>
              <div className="space-y-1 text-[11px]">
                {currentClient.auraDeliverable.features.map((feat, i) => (
                  <div key={i} className={`flex items-start gap-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    <CheckCircle2 size={12} className={`shrink-0 mt-0.5 ${isDark ? 'text-amber-400' : 'text-blue-600'}`} />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>

        {/* Modal Actions Footer */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <a
            href={currentClient.website}
            target="_blank"
            rel="noopener noreferrer"
            className={`px-4 py-2.5 rounded-xl border text-xs font-black uppercase tracking-wider inline-flex items-center gap-1.5 transition-colors cursor-pointer ${
              isDark 
                ? 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white' 
                : 'bg-slate-100 border-slate-300 text-slate-700 hover:text-slate-900'
            }`}
          >
            <span>Visit Client Website</span>
            <ExternalLink size={13} />
          </a>

          {onOpenBookModal && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenBookModal(currentClient.auraDeliverable.category);
              }}
              className="btn-primary-action px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider inline-flex items-center gap-1.5 shadow-lg cursor-pointer"
            >
              <span>Book Similar Project</span>
              <ArrowRight size={13} />
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
