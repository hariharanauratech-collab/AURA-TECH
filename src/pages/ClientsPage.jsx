import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Building2, Home } from 'lucide-react';
import Navbar from '../components/Navbar';
import OurClientsSection from '../components/OurClientsSection';
import Footer from '../components/Footer';
import AboutModal from '../components/AboutModal';
import OurClientsModal from '../components/OurClientsModal';
import RegistrationModal from '../components/RegistrationModal';
import JobApplicationModal from '../components/JobApplicationModal';
import AIChatAssistant from '../components/AIChatAssistant';
import AnimatedOfficeBackground from '../components/AnimatedOfficeBackground';
import ScrollTransactionSystem from '../components/ScrollTransactionSystem';

export default function ClientsPage({ theme, onToggleTheme }) {
  const navigate = useNavigate();
  const isDark = theme === 'dark';

  const [portalMode, setPortalMode] = useState('student');
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [isJobModalOpen, setIsJobModalOpen] = useState(false);
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);
  const [isClientsModalOpen, setIsClientsModalOpen] = useState(false);
  const [initialService, setInitialService] = useState('');

  const handleOpenBookModal = (serviceName = '') => {
    setInitialService(serviceName);
    setIsBookModalOpen(true);
  };

  return (
    <div className="min-h-screen font-sans relative transition-colors duration-300">
      <AnimatedOfficeBackground theme={theme} />
      <ScrollTransactionSystem theme={theme} />

      <Navbar
        theme={theme}
        portalMode={portalMode}
        setPortalMode={setPortalMode}
        onOpenPortalSelector={() => navigate('/')}
        onToggleTheme={onToggleTheme}
        onOpenBookModal={handleOpenBookModal}
        onOpenAboutModal={() => setIsAboutModalOpen(true)}
        onOpenClientsModal={() => setIsClientsModalOpen(true)}
        onOpenAdminModal={() => navigate('/admin')}
        onOpenClientDashboard={() => navigate('/')}
        onOpenJobModal={() => setIsJobModalOpen(true)}
      />

      <main className="pt-24 sm:pt-28">
        {/* Navigation Breadcrumb Bar */}
        <div className="max-w-7xl 2xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 mb-4">
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
              <span className={isDark ? 'text-amber-400' : 'text-blue-600'}>Our Clients</span>
            </div>
          </div>
        </div>

        {/* Section View */}
        <OurClientsSection
          theme={theme}
          onOpenBookModal={handleOpenBookModal}
        />
      </main>

      <Footer
        theme={theme}
        portalMode={portalMode}
        onOpenAboutModal={() => setIsAboutModalOpen(true)}
        onOpenClientsModal={() => setIsClientsModalOpen(true)}
        onOpenBookModal={() => handleOpenBookModal()}
        onOpenAdminModal={() => navigate('/admin')}
        onOpenJobModal={() => setIsJobModalOpen(true)}
      />

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
      />

      <AIChatAssistant
        theme={theme}
        portalMode={portalMode}
        onOpenBookModal={handleOpenBookModal}
        onOpenJobModal={() => setIsJobModalOpen(true)}
        onOpenClientsModal={() => setIsClientsModalOpen(true)}
        onOpenAboutModal={() => setIsAboutModalOpen(true)}
      />
    </div>
  );
}
