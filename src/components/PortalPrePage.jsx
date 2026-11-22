import React from 'react';
import {
  GraduationCap,
  Building2,
  Briefcase,
  ArrowRight,
  Sun,
  Moon,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  Search
} from 'lucide-react';
import AnimatedOfficeBackground from './AnimatedOfficeBackground';

export default function PortalPrePage({
  theme,
  onToggleTheme,
  onSelectPortal,
  onOpenClientDashboard
}) {
  const isDark = theme === 'dark';

  const portalOptions = [
    {
      id: 'student',
      title: 'Student',
      badge: 'Academic & Capstone Hub',
      icon: GraduationCap,
      description:
        'Final-year IEEE & capstone engineering projects, datathon systems, college AI chatbots, IoT prototypes, and 1-on-1 mentorship.',
      highlights: [
        'Up to 50% Student Concession',
        'Complete Source Code & Docs',
        'Live Demo & Review Guidance'
      ],
      cta: 'Enter Student Portal',
      accentClass: isDark
        ? 'border-amber-500/35 hover:border-amber-400 bg-slate-950/85 hover:shadow-amber-500/15'
        : 'border-blue-200 hover:border-blue-500 bg-white/95 hover:shadow-blue-500/15',
      iconWrapClass: isDark
        ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
        : 'bg-blue-50 text-blue-600 border-blue-200',
      badgeClass: isDark
        ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
        : 'bg-blue-50 text-blue-700 border-blue-200',
      buttonClass: 'btn-primary-action'
    },
    {
      id: 'company',
      title: 'Organisation',
      badge: 'Company / Enterprise',
      icon: Building2,
      description:
        'Enterprise web applications, cross-platform mobile apps, custom AI agents, cloud infrastructure, and dedicated engineering support.',
      highlights: [
        'Scalable Full-Stack Systems',
        'Custom AI & Automation Workflows',
        'Dedicated Delivery & SLA Support'
      ],
      cta: 'Enter Organisation Portal',
      accentClass: isDark
        ? 'border-indigo-500/35 hover:border-indigo-400 bg-slate-950/85 hover:shadow-indigo-500/15'
        : 'border-slate-200 hover:border-slate-900 bg-white/95 hover:shadow-slate-900/10',
      iconWrapClass: isDark
        ? 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30'
        : 'bg-slate-900 text-white border-slate-800',
      badgeClass: isDark
        ? 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30'
        : 'bg-slate-100 text-slate-800 border-slate-300',
      buttonClass: isDark
        ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:opacity-95 shadow-lg shadow-indigo-500/25'
        : 'bg-gradient-to-r from-slate-900 via-blue-900 to-blue-700 text-white hover:opacity-95 shadow-lg'
    },
    {
      id: 'hr',
      title: 'Seeking for Job',
      badge: 'HR & Careers Portal',
      icon: Briefcase,
      description:
        'Join Aura Tech as a Full-Stack Engineer, UI/UX Designer, Video Editor, or AI Developer. Explore openings and apply directly.',
      highlights: [
        'Open Tech & Design Roles',
        'Direct Portfolio & Resume Review',
        'Fast Track Onboarding Process'
      ],
      cta: 'Explore Openings & Apply',
      accentClass: isDark
        ? 'border-emerald-500/35 hover:border-emerald-400 bg-slate-950/85 hover:shadow-emerald-500/15'
        : 'border-emerald-200 hover:border-emerald-600 bg-white/95 hover:shadow-emerald-500/15',
      iconWrapClass: isDark
        ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
        : 'bg-emerald-50 text-emerald-600 border-emerald-200',
      badgeClass: isDark
        ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
        : 'bg-emerald-50 text-emerald-700 border-emerald-200',
      buttonClass: isDark
        ? 'bg-gradient-to-r from-emerald-400 to-teal-500 text-slate-950 font-black hover:opacity-95 shadow-lg shadow-emerald-500/25'
        : 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-black hover:opacity-95 shadow-lg shadow-emerald-500/20'
    }
  ];

  return (
    <div className="min-h-screen font-sans relative transition-colors duration-300 flex flex-col justify-between overflow-x-hidden">
      <AnimatedOfficeBackground theme={theme} />

      {/* Ambient Glows */}
      <div className="hero-glow-gold z-[1]" />
      <div
        className={`fixed bottom-0 right-0 w-96 h-96 rounded-full blur-[130px] pointer-events-none z-[1] ${
          isDark ? 'bg-amber-500/10' : 'bg-blue-500/15'
        }`}
      />

      {/* Minimal Top Bar */}
      <header className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-5 pb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="logo-badge shrink-0 bg-white p-1.5 rounded-xl shadow-md border border-slate-200">
            <img
              src="/logo.png"
              alt="AURA TECH Logo"
              className="h-7 sm:h-9 w-auto object-contain"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span
                className={`font-black text-lg sm:text-xl tracking-tight uppercase ${
                  isDark ? 'text-white' : 'text-slate-900'
                }`}
              >
                AURA <span className={isDark ? 'text-amber-400' : 'text-blue-600'}>TECH</span>
              </span>
              <span
                className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full border tracking-widest ${
                  isDark
                    ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                    : 'bg-blue-50 text-blue-600 border-blue-200'
                }`}
              >
                PRO
              </span>
            </div>
            <p
              className={`text-[10px] font-semibold tracking-wide hidden sm:block ${
                isDark ? 'text-slate-400' : 'text-slate-500'
              }`}
            >
              A Reliable Backbone Of Your Business
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {onOpenClientDashboard && (
            <button
              type="button"
              onClick={onOpenClientDashboard}
              className={`px-3 py-2 rounded-xl border text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${
                isDark
                  ? 'bg-slate-900/90 border-slate-800 text-slate-300 hover:text-white hover:border-amber-500/40'
                  : 'bg-white border-slate-300 text-slate-700 hover:text-blue-600 hover:border-blue-500'
              }`}
            >
              <Search size={14} />
              <span className="hidden sm:inline">Track Project</span>
            </button>
          )}

          <a
            href="/crm"
            className={`px-3 py-2 rounded-xl border text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all ${
              isDark
                ? 'bg-slate-900/90 border-slate-800 text-amber-400 hover:border-amber-400'
                : 'bg-white border-slate-300 text-blue-600 hover:border-blue-600'
            }`}
          >
            <ShieldCheck size={14} />
            <span className="hidden sm:inline">Staff &amp; CRM</span>
          </a>

          <button
            type="button"
            onClick={onToggleTheme}
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle Theme"
            className={`p-2.5 rounded-xl border transition-all flex items-center justify-center cursor-pointer shadow-sm ${
              isDark
                ? 'bg-slate-900 border-amber-500/30 text-amber-400 hover:bg-slate-800'
                : 'bg-white border-slate-300 text-blue-600 hover:bg-blue-50'
            }`}
          >
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>
      </header>

      {/* Center Gateway Content */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-12">
          <h1
            className={`text-3xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight leading-tight mb-4 ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}
          >
            Who Are You <span className="text-gradient-main">Visiting As?</span>
          </h1>

          <p
            className={`text-xs sm:text-base leading-relaxed ${
              isDark ? 'text-slate-300' : 'text-slate-600'
            }`}
          >
            Choose one of the portals below—whether you&apos;re a <strong>Student</strong>, representing an{' '}
            <strong>Organisation</strong>, or <strong>Seeking for a Job</strong>—to open the tailored AURA TECH workspace.
          </p>
        </div>

        {/* 3 Selection Cards */}
        <div
          role="tablist"
          aria-label="Portal Type Selection"
          className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 w-full max-w-6xl"
        >
          {portalOptions.map((option) => {
            const Icon = option.icon;
            return (
              <button
                key={option.id}
                type="button"
                role="tab"
                onClick={() => onSelectPortal(option.id)}
                className={`group text-left rounded-3xl p-6 sm:p-8 border backdrop-blur-xl shadow-2xl transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between cursor-pointer ${option.accentClass}`}
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-5">
                    <div
                      className={`w-14 h-14 rounded-2xl flex items-center justify-center border shadow-md transition-transform group-hover:scale-105 ${option.iconWrapClass}`}
                    >
                      <Icon className="w-7 h-7" />
                    </div>
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${option.badgeClass}`}
                    >
                      {option.badge}
                    </span>
                  </div>

                  <h2
                    className={`text-2xl font-black uppercase tracking-tight mb-2 ${
                      isDark ? 'text-white' : 'text-slate-900'
                    }`}
                  >
                    {option.title}
                  </h2>

                  <p
                    className={`text-xs sm:text-sm leading-relaxed mb-5 ${
                      isDark ? 'text-slate-400' : 'text-slate-600'
                    }`}
                  >
                    {option.description}
                  </p>

                  <ul className="space-y-2 mb-7">
                    {option.highlights.map((item) => (
                      <li
                        key={item}
                        className={`flex items-center gap-2 text-xs font-semibold ${
                          isDark ? 'text-slate-300' : 'text-slate-700'
                        }`}
                      >
                        <CheckCircle2
                          size={14}
                          className={isDark ? 'text-amber-400 shrink-0' : 'text-blue-600 shrink-0'}
                        />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div
                  className={`w-full py-3.5 px-5 rounded-xl text-xs uppercase tracking-wider font-extrabold flex items-center justify-center gap-2 transition-all ${option.buttonClass}`}
                >
                  <span>{option.cta}</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </div>
              </button>
            );
          })}
        </div>
      </main>

      {/* Footer Note */}
      <footer className="relative z-10 py-5 text-center px-4">
        <p className={`text-[11px] font-semibold ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
          © {new Date().getFullYear()} AURA TECH COLLECTIVE • Coimbatore, Tamil Nadu • Need help?{' '}
          <a href="mailto:auratech008@gmail.com" className="underline hover:text-amber-400">
            auratech008@gmail.com
          </a>
        </p>
      </footer>
    </div>
  );
}

