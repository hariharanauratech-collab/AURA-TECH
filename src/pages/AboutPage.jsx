import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Home, ShieldCheck, Award, Target, Rocket, 
  Code2, Sparkles, Building2, Briefcase, Zap, CheckCircle2, 
  Users, Layers, ExternalLink, ArrowRight
} from 'lucide-react';
import Navbar from '../components/Navbar';
import TeamSection from '../components/TeamSection';
import AdvantageSection from '../components/AdvantageSection';
import Footer from '../components/Footer';
import AboutModal from '../components/AboutModal';
import OurClientsModal from '../components/OurClientsModal';
import RegistrationModal from '../components/RegistrationModal';
import JobApplicationModal from '../components/JobApplicationModal';
import ClientDashboardModal from '../components/ClientDashboardModal';
import AIChatAssistant from '../components/AIChatAssistant';
import AnimatedOfficeBackground from '../components/AnimatedOfficeBackground';
import ScrollTransactionSystem from '../components/ScrollTransactionSystem';

export default function AboutPage({ theme, onToggleTheme }) {
  const navigate = useNavigate();
  const isDark = theme === 'dark';

  const [portalMode, setPortalMode] = useState('student');
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [isJobModalOpen, setIsJobModalOpen] = useState(false);
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);
  const [isClientsModalOpen, setIsClientsModalOpen] = useState(false);
  const [isClientDashOpen, setIsClientDashOpen] = useState(false);
  const [initialService, setInitialService] = useState('');
  const [initialJobRole, setInitialJobRole] = useState('');

  const handleOpenBookModal = (serviceName = '') => {
    setInitialService(serviceName);
    setIsBookModalOpen(true);
  };

  const handleOpenJobModal = (roleTitle = '') => {
    setInitialJobRole(roleTitle);
    setIsJobModalOpen(true);
  };

  const pillars = [
    {
      icon: Rocket,
      title: "Academic & Student Innovation",
      desc: "Delivering fully functional capstone and final-year projects with IEEE reports, architecture diagrams, and 1-on-1 viva prep. Subsidized up to 50% for college students.",
      badge: "Academic Focus"
    },
    {
      icon: ShieldCheck,
      title: "Enterprise Web & Cloud Platforms",
      desc: "Scalable, secure, and performance-driven web systems. Trusted by corporate leaders such as SISC COIR (South Indian Coir Substrates) and InfoPluto Media Works.",
      badge: "Enterprise Standard"
    },
    {
      icon: Sparkles,
      title: "Artificial Intelligence & Automation",
      desc: "Custom LLM chatbots, automated business intelligence dashboards, generative AI media pipelines, and IoT microcontroller integration (ESP32 / Arduino).",
      badge: "Emerging Tech"
    }
  ];

  const metrics = [
    { label: "Delivery SLA", value: "100%", sub: "Strict milestone schedule" },
    { label: "Completed Projects", value: "50+", sub: "Student & enterprise solutions" },
    { label: "Support Availability", value: "24/7", sub: "Direct phone & WhatsApp desk" },
    { label: "Hiring Turnaround", value: "48h", sub: "Fast talent application review" }
  ];

  return (
    <div className="min-h-screen font-sans relative transition-colors duration-300">
      {/* Background and Scroll Transition FX */}
      <AnimatedOfficeBackground theme={theme} />
      <ScrollTransactionSystem theme={theme} />

      {/* Global Navbar */}
      <Navbar
        theme={theme}
        portalMode={portalMode}
        setPortalMode={setPortalMode}
        onOpenPortalSelector={() => navigate('/')}
        onToggleTheme={onToggleTheme}
        onOpenBookModal={handleOpenBookModal}
        onOpenAboutModal={() => setIsAboutModalOpen(true)}
        onOpenClientsModal={() => navigate('/clients')}
        onOpenAdminModal={() => navigate('/admin')}
        onOpenClientDashboard={() => setIsClientDashOpen(true)}
        onOpenJobModal={handleOpenJobModal}
      />

      <main className="pt-24 sm:pt-28">
        {/* Navigation Breadcrumb Bar */}
        <div className="max-w-7xl 2xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 mb-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/')}
              className={`p-2 rounded-xl border flex items-center gap-2 text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-sm ${
                isDark 
                  ? 'bg-slate-900 border-slate-800 text-slate-300 hover:text-amber-400 hover:border-amber-500/40' 
                  : 'bg-white border-slate-300 text-slate-700 hover:text-blue-600 hover:border-blue-400'
              }`}
            >
              <ArrowLeft size={14} />
              <span>Back to Home</span>
            </button>

            <div className={`flex items-center gap-2 text-xs font-bold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              <Home size={13} />
              <span>/</span>
              <span className={isDark ? 'text-amber-400' : 'text-blue-600'}>About Us</span>
            </div>
          </div>
        </div>

        {/* Hero Section: Brand & Story */}
        <section className="max-w-7xl 2xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 mb-16">
          <div className={`p-6 sm:p-12 rounded-3xl border relative overflow-hidden backdrop-blur-xl ${
            isDark 
              ? 'bg-slate-950/80 border-amber-500/20 shadow-2xl' 
              : 'bg-white/90 border-slate-200 shadow-xl'
          }`}>
            {/* Top Accent Gradient */}
            <div className={`absolute top-0 left-0 right-0 h-1.5 ${
              isDark ? 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600' : 'bg-gradient-to-r from-blue-600 via-indigo-500 to-blue-700'
            }`} />

            <div className="max-w-3xl">
              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest mb-4 border ${
                isDark 
                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' 
                  : 'bg-blue-50 text-blue-600 border-blue-200'
              }`}>
                <ShieldCheck size={14} />
                <span>Our Foundation & Vision</span>
              </div>

              <h1 className={`text-3xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight leading-tight mb-4 ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}>
                ABOUT <span className="text-gradient-main">AURA TECH</span>
              </h1>

              <p className={`text-base sm:text-xl font-bold uppercase tracking-wider mb-6 ${
                isDark ? 'text-amber-400' : 'text-blue-600'
              }`}>
                A Reliable Backbone Of Your Business
              </p>

              <p className={`text-sm sm:text-base leading-relaxed mb-6 ${
                isDark ? 'text-slate-300' : 'text-slate-700'
              }`}>
                AURA TECH is a forward-thinking digital software engineering agency founded by Niranjan A and a cross-functional team of passionate architects, designers, and developers in Tamil Nadu, India.
              </p>

              <p className={`text-sm sm:text-base leading-relaxed mb-8 ${
                isDark ? 'text-slate-300' : 'text-slate-700'
              }`}>
                We bridge the gap between complex software engineering and high-velocity digital delivery. Whether developing verified corporate websites for export enterprises like <strong>SISC COIR</strong>, collaborating on media tech with <strong>InfoPluto Media Works</strong>, or guiding students through capstone datathons, we deliver high-performance, budget-friendly solutions that exceed ordinary expectations.
              </p>

              {/* Quick Action CTAs */}
              <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                <button
                  type="button"
                  onClick={() => handleOpenBookModal()}
                  className="px-5 py-3 rounded-xl font-black text-xs sm:text-sm uppercase tracking-wider btn-primary-action shadow-lg flex items-center gap-2 cursor-pointer transition-all hover:scale-105 active:scale-95"
                >
                  <Zap size={16} />
                  <span>Book a Project</span>
                </button>

                <button
                  type="button"
                  onClick={() => navigate('/clients')}
                  className={`px-5 py-3 rounded-xl font-black text-xs sm:text-sm uppercase tracking-wider border flex items-center gap-2 cursor-pointer transition-all ${
                    isDark 
                      ? 'bg-slate-900/80 border-slate-700 text-slate-200 hover:text-amber-400 hover:border-amber-500/50' 
                      : 'bg-white border-slate-300 text-slate-800 hover:text-blue-600 hover:border-blue-400'
                  }`}
                >
                  <Building2 size={16} />
                  <span>View Our Clients</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleOpenJobModal()}
                  className={`px-5 py-3 rounded-xl font-black text-xs sm:text-sm uppercase tracking-wider border flex items-center gap-2 cursor-pointer transition-all ${
                    isDark 
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20' 
                      : 'bg-emerald-50 border-emerald-300 text-emerald-700 hover:bg-emerald-100'
                  }`}
                >
                  <Briefcase size={16} />
                  <span>Careers & Jobs</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Company Metrics Banner */}
        <section className="max-w-7xl 2xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 mb-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {metrics.map((item, idx) => (
              <div
                key={idx}
                className={`p-5 sm:p-6 rounded-2xl border text-center transition-all ${
                  isDark 
                    ? 'bg-slate-900/70 border-slate-800 hover:border-amber-500/30' 
                    : 'bg-white border-slate-200 hover:border-blue-300 shadow-sm'
                }`}
              >
                <div className={`text-3xl sm:text-4xl font-black mb-1 ${
                  isDark ? 'text-amber-400' : 'text-blue-600'
                }`}>
                  {item.value}
                </div>
                <div className={`text-xs font-black uppercase tracking-wider mb-1 ${
                  isDark ? 'text-white' : 'text-slate-900'
                }`}>
                  {item.label}
                </div>
                <div className={`text-[11px] ${
                  isDark ? 'text-slate-400' : 'text-slate-500'
                }`}>
                  {item.sub}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Strategic Pillars */}
        <section className="max-w-7xl 2xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 mb-16">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className={`text-xs font-black uppercase tracking-widest ${isDark ? 'text-amber-400' : 'text-blue-600'}`}>
              Core Competencies
            </span>
            <h2 className={`text-2xl sm:text-4xl font-black uppercase tracking-tight mt-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              What We Stand For
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {pillars.map((pillar, idx) => {
              const Icon = pillar.icon;
              return (
                <div
                  key={idx}
                  className={`p-6 sm:p-8 rounded-2xl border flex flex-col justify-between transition-all group ${
                    isDark 
                      ? 'bg-slate-900/60 border-slate-800 hover:border-amber-500/40 hover:bg-slate-900/90' 
                      : 'bg-white border-slate-200 hover:border-blue-400 hover:shadow-lg'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className={`p-3 rounded-xl ${
                        isDark ? 'bg-amber-500/10 text-amber-400' : 'bg-blue-50 text-blue-600'
                      }`}>
                        <Icon size={24} />
                      </div>
                      <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border ${
                        isDark ? 'bg-slate-800 text-slate-300 border-slate-700' : 'bg-slate-100 text-slate-700 border-slate-300'
                      }`}>
                        {pillar.badge}
                      </span>
                    </div>

                    <h3 className={`text-lg font-black uppercase tracking-tight mb-2 ${
                      isDark ? 'text-white' : 'text-slate-900'
                    }`}>
                      {pillar.title}
                    </h3>

                    <p className={`text-xs sm:text-sm leading-relaxed ${
                      isDark ? 'text-slate-400' : 'text-slate-600'
                    }`}>
                      {pillar.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Embedded Team Section */}
        <TeamSection
          theme={theme}
          onOpenBookModal={() => handleOpenBookModal()}
        />

        {/* Embedded Advantage Section */}
        <AdvantageSection
          theme={theme}
          onOpenBookModal={() => handleOpenBookModal()}
        />

        {/* Bottom Call to Action */}
        <section className="max-w-7xl 2xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 my-16">
          <div className={`p-8 sm:p-12 rounded-3xl border text-center relative overflow-hidden ${
            isDark 
              ? 'bg-gradient-to-br from-slate-900 via-slate-950 to-black border-amber-500/30 shadow-2xl' 
              : 'bg-gradient-to-br from-blue-50 via-white to-indigo-50 border-blue-200 shadow-xl'
          }`}>
            <h3 className={`text-2xl sm:text-4xl font-black uppercase tracking-tight mb-3 ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}>
              Ready to Build Your Next Milestone With Us?
            </h3>
            <p className={`text-sm sm:text-base max-w-xl mx-auto mb-6 ${
              isDark ? 'text-slate-300' : 'text-slate-600'
            }`}>
              Whether you need an enterprise digital presence or a final-year student project, AURA TECH delivers with speed, quality, and complete transparency.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <button
                type="button"
                onClick={() => handleOpenBookModal()}
                className="px-6 py-3.5 rounded-xl font-black text-xs sm:text-sm uppercase tracking-wider btn-primary-action shadow-xl flex items-center gap-2 cursor-pointer hover:scale-105 active:scale-95 transition-all"
              >
                <Zap size={16} />
                <span>Start Project Registration</span>
              </button>
              <button
                type="button"
                onClick={() => navigate('/crm')}
                className={`px-6 py-3.5 rounded-xl font-black text-xs sm:text-sm uppercase tracking-wider border flex items-center gap-2 cursor-pointer transition-all ${
                  isDark 
                    ? 'bg-slate-900 border-slate-700 text-slate-300 hover:text-white hover:border-slate-500' 
                    : 'bg-white border-slate-300 text-slate-700 hover:text-black hover:border-slate-400'
                }`}
              >
                <ShieldCheck size={16} />
                <span>CRM & Staff Portal</span>
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Global Footer */}
      <Footer
        theme={theme}
        portalMode={portalMode}
        setPortalMode={setPortalMode}
        onOpenAboutModal={() => setIsAboutModalOpen(true)}
        onOpenClientsModal={() => setIsClientsModalOpen(true)}
        onOpenBookModal={() => handleOpenBookModal()}
        onOpenAdminModal={() => navigate('/admin')}
        onOpenJobModal={handleOpenJobModal}
      />

      {/* Modals & AI Floating Widget */}
      <AboutModal
        theme={theme}
        isOpen={isAboutModalOpen}
        onClose={() => setIsAboutModalOpen(false)}
        onOpenBookModal={() => handleOpenBookModal()}
      />

      <OurClientsModal
        theme={theme}
        isOpen={isClientsModalOpen}
        onClose={() => setIsClientsModalOpen(false)}
        onOpenBookModal={handleOpenBookModal}
      />

      <RegistrationModal
        theme={theme}
        portalMode={portalMode}
        isOpen={isBookModalOpen}
        onClose={() => setIsBookModalOpen(false)}
        initialService={initialService}
      />

      <JobApplicationModal
        theme={theme}
        isOpen={isJobModalOpen}
        onClose={() => setIsJobModalOpen(false)}
        initialRole={initialJobRole}
      />

      <ClientDashboardModal
        theme={theme}
        isOpen={isClientDashOpen}
        onClose={() => setIsClientDashOpen(false)}
        onOpenBookModal={() => handleOpenBookModal()}
      />

      <AIChatAssistant
        theme={theme}
        portalMode={portalMode}
        onOpenBookModal={handleOpenBookModal}
        onOpenJobModal={handleOpenJobModal}
        onOpenClientsModal={() => navigate('/clients')}
        onOpenAboutModal={() => setIsAboutModalOpen(true)}
        onOpenClientDashboard={() => setIsClientDashOpen(true)}
      />
    </div>
  );
}
