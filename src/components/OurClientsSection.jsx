import React, { useState } from 'react';
import { 
  Building2, Globe, ExternalLink, ShieldCheck, CheckCircle2, 
  Sparkles, Layers, ArrowRight, Info, Zap, Factory, Film, 
  MapPin, UserCheck, MessageSquare, ArrowUpRight
} from 'lucide-react';
import { CLIENTS_DATA } from '../data/auraData';

export default function OurClientsSection({ theme, onOpenBookModal }) {
  const isDark = theme === 'dark';
  const [activeTab, setActiveTab] = useState('all');
  const [expandedClient, setExpandedClient] = useState(null);

  const filteredClients = activeTab === 'all' 
    ? CLIENTS_DATA 
    : CLIENTS_DATA.filter(c => c.category.toLowerCase().includes(activeTab.toLowerCase()));

  return (
    <section id="clients" className={`py-16 sm:py-24 relative overflow-hidden transition-colors duration-300 ${
      isDark ? 'bg-slate-950/70 text-white' : 'bg-slate-50/80 text-slate-900'
    }`}>
      {/* Decorative background glow accents */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[350px] bg-amber-500/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-500/5 blur-[100px] rounded-full pointer-events-none" />

      <div className="max-w-7xl 2xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border mb-4 shadow-sm animate-in fade-in duration-300 ${
            isDark 
              ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' 
              : 'bg-blue-50 text-blue-600 border-blue-200'
          }">
            <Building2 size={13} className={isDark ? 'text-amber-400' : 'text-blue-600'} />
            <span>Our Corporate Clients</span>
          </div>

          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight mb-4">
            PROUD PARTNERS &amp; <span className={isDark ? 'text-amber-400' : 'text-blue-600'}>CLIENT PROFILES</span>
          </h2>

          <p className={`text-sm sm:text-base leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
            Discover how AURA TECH accelerates growth for visionary organizations through bespoke web engineering, digital presence, and high-performance technology solutions.
          </p>

          {/* Clarity & Verification Notice Box */}
          <div className={`mt-6 p-3.5 sm:p-4 rounded-2xl border text-left flex items-start gap-3 shadow-md ${
            isDark 
              ? 'bg-slate-900/90 border-amber-500/30 text-slate-300' 
              : 'bg-white border-blue-200/80 text-slate-700'
          }`}>
            <Info size={18} className={`shrink-0 mt-0.5 ${isDark ? 'text-amber-400' : 'text-blue-600'}`} />
            <div className="text-xs leading-relaxed">
              <span className="font-extrabold block text-[11px] uppercase tracking-wider mb-0.5 ${isDark ? 'text-white' : 'text-slate-900'}">
                Enterprise Industry Notice
              </span>
              <span>
                The industry descriptions below highlight each client organization’s respective domain (e.g., Natural Coir Manufacturing and Media Production). AURA TECH’s engineering role is detailed under our dedicated digital deliverables.
              </span>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-8">
            {[
              { id: 'all', label: 'All Clients', count: CLIENTS_DATA.length },
              { id: 'manufacturing', label: 'Manufacturing & Agriculture', count: 1 },
              { id: 'media', label: 'Media & Technology', count: 1 }
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer border ${
                  activeTab === tab.id
                    ? isDark
                      ? 'bg-amber-400 text-slate-950 border-amber-400 shadow-lg shadow-amber-500/20'
                      : 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20'
                    : isDark
                      ? 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700'
                      : 'bg-white text-slate-600 border-slate-200 hover:text-slate-900 hover:border-slate-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Client Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10">
          {filteredClients.map((client) => {
            const isSisc = client.id === 'c1';
            const isInfoPluto = client.id === 'c2';

            return (
              <div
                key={client.id}
                className={`rounded-3xl border p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 hover:shadow-2xl relative overflow-hidden group transaction-card-glow ${
                  isDark 
                    ? 'bg-slate-900/70 border-slate-800 hover:border-amber-500/40 shadow-slate-950/80' 
                    : 'bg-white border-slate-200 hover:border-blue-400 shadow-slate-200/60'
                }`}
              >
                {/* Top Subtle Gradient Accent */}
                <div className={`absolute top-0 left-0 right-0 h-1.5 ${
                  isSisc
                    ? 'bg-gradient-to-r from-emerald-500 via-amber-400 to-emerald-600'
                    : 'bg-gradient-to-r from-purple-500 via-blue-500 to-indigo-600'
                }`} />

                <div>
                  {/* Top Client Header */}
                  <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-2xl border shadow-md flex items-center justify-center ${
                        isSisc
                          ? isDark ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-emerald-50 border-emerald-200 text-emerald-600'
                          : isDark ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400' : 'bg-indigo-50 border-indigo-200 text-indigo-600'
                      }`}>
                        {isSisc ? <Factory size={24} /> : <Film size={24} />}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className={`text-xl sm:text-2xl font-black uppercase tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                            {client.brandName}
                          </h3>
                          <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${
                            isDark 
                              ? 'bg-slate-800 text-amber-400 border-amber-500/30' 
                              : 'bg-slate-100 text-blue-600 border-blue-200'
                          }`}>
                            Verified Client
                          </span>
                        </div>
                        <p className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                          {client.companyName}
                        </p>
                      </div>
                    </div>

                    {/* Industry Badge */}
                    <span className={`text-[10px] font-extrabold uppercase px-3 py-1 rounded-full border tracking-wider ${
                      isSisc
                        ? isDark ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/30' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : isDark ? 'bg-purple-950/60 text-purple-300 border-purple-500/30' : 'bg-purple-50 text-purple-700 border-purple-200'
                    }`}>
                      {client.industryBadge}
                    </span>
                  </div>

                  {/* Metadata Row: Location, Founder (if any), Official Website */}
                  <div className={`flex flex-wrap items-center gap-y-2 gap-x-4 py-2.5 px-3.5 rounded-xl border mb-5 text-xs ${
                    isDark ? 'bg-black/50 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}>
                    <div className="flex items-center gap-1.5">
                      <MapPin size={13} className={isDark ? 'text-amber-400' : 'text-blue-600'} />
                      <span className="font-medium">{client.location}</span>
                    </div>

                    {client.founder && (
                      <div className="flex items-center gap-1.5">
                        <UserCheck size={13} className={isDark ? 'text-amber-400' : 'text-blue-600'} />
                        <span>Founder: <strong className="font-semibold">{client.founder}</strong></span>
                      </div>
                    )}

                    <div className="flex items-center gap-1.5 ml-auto">
                      <Globe size={13} className={isDark ? 'text-amber-400' : 'text-blue-600'} />
                      <a
                        href={client.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`font-black hover:underline inline-flex items-center gap-1 ${
                          isDark ? 'text-amber-400' : 'text-blue-600'
                        }`}
                        title={`Visit ${client.displayUrl}`}
                      >
                        <span>{client.displayUrl}</span>
                        <ArrowUpRight size={12} />
                      </a>
                    </div>
                  </div>

                  {/* Company Overview */}
                  <p className={`text-xs sm:text-sm leading-relaxed mb-6 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                    {client.companyOverview}
                  </p>

                  {/* Associated Platform (InfoPluto's IndieMa) */}
                  {client.associatedPlatform && (
                    <div className={`mb-6 p-3.5 rounded-2xl border flex items-center justify-between gap-3 ${
                      isDark ? 'bg-indigo-950/20 border-indigo-500/30' : 'bg-indigo-50/70 border-indigo-200'
                    }`}>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${
                            isDark ? 'bg-indigo-500/20 text-indigo-300' : 'bg-indigo-100 text-indigo-700'
                          }`}>
                            Associated Platform
                          </span>
                          <span className="font-bold text-xs">{client.associatedPlatform.name}</span>
                        </div>
                        <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                          {client.associatedPlatform.description}
                        </p>
                      </div>
                      <a
                        href={client.associatedPlatform.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`shrink-0 p-2 rounded-xl border text-xs font-bold inline-flex items-center gap-1 transition-transform hover:scale-105 ${
                          isDark 
                            ? 'bg-slate-900 border-indigo-500/30 text-indigo-300 hover:bg-slate-800' 
                            : 'bg-white border-indigo-200 text-indigo-600 hover:bg-indigo-50'
                        }`}
                      >
                        <span>Visit</span>
                        <ArrowUpRight size={13} />
                      </a>
                    </div>
                  )}

                  {/* Two Main Columns: Client Capabilities vs AURA TECH Deliverables */}
                  <div className="space-y-4 mb-6">
                    
                    {/* Block 1: Client Industry Capabilities */}
                    <div className={`p-4 rounded-2xl border ${
                      isDark ? 'bg-black/40 border-slate-800/80' : 'bg-slate-50/70 border-slate-200'
                    }`}>
                      <h4 className={`text-xs font-black uppercase tracking-wider mb-2.5 flex items-center gap-2 ${
                        isDark ? 'text-white' : 'text-slate-900'
                      }`}>
                        <Layers size={14} className={isDark ? 'text-amber-400' : 'text-blue-600'} />
                        {isSisc ? 'Core Product Categories (SISC COIR)' : 'Client Service Capabilities (InfoPluto)'}
                      </h4>
                      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                        {(isSisc ? client.productCategories : client.serviceAreas.slice(0, 6)).map((item, i) => (
                          <li key={i} className={`flex items-start gap-1.5 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                            <span className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${
                              isSisc ? 'bg-emerald-400' : 'bg-indigo-400'
                            }`} />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Block 2: AURA TECH Engagement Scope & Deliverables */}
                    <div className={`p-4 rounded-2xl border ${
                      isDark ? 'bg-slate-900/90 border-amber-500/20 shadow-inner' : 'bg-blue-50/50 border-blue-200/70 shadow-inner'
                    }`}>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <h4 className={`text-xs font-black uppercase tracking-wider flex items-center gap-2 ${
                          isDark ? 'text-amber-400' : 'text-blue-600'
                        }`}>
                          <Sparkles size={14} />
                          AURA TECH Engagement Scope
                        </h4>
                        <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                          isDark ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-blue-100 text-blue-700'
                        }`}>
                          Delivered By AURA TECH
                        </span>
                      </div>
                      
                      <p className={`text-xs leading-relaxed mb-3 font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                        {client.auraDeliverable.description}
                      </p>

                      <div className="space-y-1.5">
                        {client.auraDeliverable.features.map((feat, idx) => (
                          <div key={idx} className={`flex items-start gap-2 text-[11px] ${
                            isDark ? 'text-slate-300' : 'text-slate-700'
                          }`}>
                            <CheckCircle2 size={13} className={`shrink-0 mt-0.5 ${
                              isDark ? 'text-amber-400' : 'text-blue-600'
                            }`} />
                            <span>{feat}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>
                </div>

                {/* Bottom Action Footer */}
                <div className={`pt-4 border-t flex flex-wrap items-center justify-between gap-3 ${
                  isDark ? 'border-slate-800' : 'border-slate-200'
                }`}>
                  <a
                    href={client.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider inline-flex items-center gap-1.5 border transition-all cursor-pointer ${
                      isDark 
                        ? 'bg-slate-800 hover:bg-slate-700 text-white border-slate-700' 
                        : 'bg-white hover:bg-slate-100 text-slate-800 border-slate-300'
                    }`}
                  >
                    <span>Visit Official Site</span>
                    <ExternalLink size={13} />
                  </a>

                  {onOpenBookModal && (
                    <button
                      type="button"
                      onClick={() => onOpenBookModal(client.auraDeliverable.category)}
                      className="btn-primary-action px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider inline-flex items-center gap-1.5 shadow-md cursor-pointer"
                    >
                      <span>Request Similar Project</span>
                      <ArrowRight size={13} />
                    </button>
                  )}
                </div>

              </div>
            );
          })}
        </div>

        {/* Bottom Callout Banner */}
        <div className={`mt-14 p-6 sm:p-8 rounded-3xl border text-center max-w-4xl mx-auto shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6 ${
          isDark 
            ? 'bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 border-amber-500/30' 
            : 'bg-gradient-to-r from-blue-50 via-white to-blue-50 border-blue-200'
        }`}>
          <div className="text-left">
            <h4 className={`text-base sm:text-lg font-black uppercase tracking-tight mb-1 ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}>
              Become Our Next Success Story
            </h4>
            <p className={`text-xs sm:text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Whether you need corporate web systems, AI media pipelines, or custom enterprise platforms, AURA TECH delivers with 100% on-time SLA.
            </p>
          </div>

          {onOpenBookModal && (
            <button
              type="button"
              onClick={() => onOpenBookModal('Corporate Enterprise Solution')}
              className="btn-primary-action px-6 py-3.5 rounded-xl text-xs font-black uppercase tracking-wider shrink-0 flex items-center gap-2 shadow-xl cursor-pointer"
            >
              <Zap size={14} />
              <span>Partner With Us</span>
              <ArrowRight size={14} />
            </button>
          )}
        </div>

      </div>
    </section>
  );
}
