import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ServicesSection from './components/ServicesSection';
import ProjectsSection from './components/ProjectsSection';
import HRServiceSection from './components/HRServiceSection';
import TeamSection from './components/TeamSection';
import AdvantageSection from './components/AdvantageSection';
import FAQSection from './components/FAQSection';
import ContactSection from './components/ContactSection';
import Footer from './components/Footer';
import AboutModal from './components/AboutModal';
import RegistrationModal from './components/RegistrationModal';
import JobApplicationModal from './components/JobApplicationModal';
import AdminModal from './components/AdminModal';
import ClientDashboardModal from './components/ClientDashboardModal';
import AIChatAssistant from './components/AIChatAssistant';
import AnimatedOfficeBackground from './components/AnimatedOfficeBackground';
import ScrollTransactionSystem from './components/ScrollTransactionSystem';
import PortalPrePage from './components/PortalPrePage';
import OurClientsSection from './components/OurClientsSection';
import OurClientsModal from './components/OurClientsModal';
import AdminDashboard from './pages/AdminDashboard';
import CRMDashboard from './pages/CRMDashboard';
import ClientsPage from './pages/ClientsPage';
import AboutPage from './pages/AboutPage';

export default function App() {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('aura_theme') || 'light';
  });

  const [portalMode, setPortalMode] = useState('student'); // 'student' | 'company' | 'hr'
  const [hasSelectedPortal, setHasSelectedPortal] = useState(false);
  const navigate = useNavigate();
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [isJobModalOpen, setIsJobModalOpen] = useState(false);
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);
  const [isClientsModalOpen, setIsClientsModalOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [isClientDashOpen, setIsClientDashOpen] = useState(false);
  const [initialService, setInitialService] = useState('');
  const [initialJobRole, setInitialJobRole] = useState('');
  const location = useLocation();

  // Scroll to hash target on navigation / initial load & auto-enter portal
  useEffect(() => {
    if (location.hash) {
      setHasSelectedPortal(true);
      const targetId = location.hash.replace('#', '');
      const timer = setTimeout(() => {
        const el = document.getElementById(targetId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [location.hash, location.pathname]);

  useEffect(() => {
    localStorage.setItem('aura_theme', theme);
    document.body.className = theme === 'dark' ? 'dark-theme' : 'light-theme';
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const handleOpenBookModal = (serviceName = '') => {
    setInitialService(serviceName);
    setIsBookModalOpen(true);
  };

  const handleOpenJobModal = (roleTitle = '') => {
    setInitialJobRole(roleTitle);
    setIsJobModalOpen(true);
  };


  const handleOpenAdmin = () => {
    navigate('/admin');
  };

  const handleSelectPortal = (mode) => {
    setPortalMode(mode);
    setHasSelectedPortal(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenPortalSelector = () => {
    setHasSelectedPortal(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <Routes>
      
      {/* Dedicated Admin Portal Extension (/admin) */}
      <Route 
        path="/admin" 
        element={
          <AdminDashboard 
            theme={theme} 
            onToggleTheme={toggleTheme} 
          />
        } 
      />

      {/* Dedicated Enterprise CRM & Staff Portal (/crm & /portal) */}
      <Route 
        path="/crm" 
        element={
          <CRMDashboard 
            theme={theme} 
            onToggleTheme={toggleTheme} 
          />
        } 
      />
      <Route 
        path="/portal" 
        element={
          <CRMDashboard 
            theme={theme} 
            onToggleTheme={toggleTheme} 
          />
        } 
      />

      {/* Dedicated Our Clients Page (/clients) */}
      <Route 
        path="/clients" 
        element={
          <ClientsPage 
            theme={theme} 
            onToggleTheme={toggleTheme} 
          />
        } 
      />

      {/* Dedicated About Us Page (/about) */}
      <Route 
        path="/about" 
        element={
          <AboutPage 
            theme={theme} 
            onToggleTheme={toggleTheme} 
          />
        } 
      />

      {/* Main Public Website (/ and all sub-paths) */}
      <Route 
        path="*" 
        element={
          !hasSelectedPortal ? (
            <>
              <PortalPrePage
                theme={theme}
                onToggleTheme={toggleTheme}
                onSelectPortal={handleSelectPortal}
                onOpenClientDashboard={() => setIsClientDashOpen(true)}
              />

              <ClientDashboardModal
                theme={theme}
                isOpen={isClientDashOpen}
                onClose={() => setIsClientDashOpen(false)}
                onOpenBookModal={() => {
                  setIsClientDashOpen(false);
                  setPortalMode('student');
                  setHasSelectedPortal(true);
                  handleOpenBookModal();
                }}
              />

              <RegistrationModal
                theme={theme}
                portalMode={portalMode}
                isOpen={isBookModalOpen}
                onClose={() => setIsBookModalOpen(false)}
                initialService={initialService}
              />
            </>
          ) : (
          <div className="min-h-screen font-sans relative transition-colors duration-300">
            
            {/* Scroll-Reactive Animated Office Interface Background for the whole page */}
            <AnimatedOfficeBackground theme={theme} />

            {/* Scroll Transaction & Transition System */}
            <ScrollTransactionSystem theme={theme} />
            
            {/* Navigation Bar */}
            <Navbar
              theme={theme}
              portalMode={portalMode}
              setPortalMode={setPortalMode}
              onOpenPortalSelector={handleOpenPortalSelector}
              onToggleTheme={toggleTheme}
              onOpenBookModal={handleOpenBookModal}
              onOpenAboutModal={() => setIsAboutModalOpen(true)}
              onOpenClientsModal={() => setIsClientsModalOpen(true)}
              onOpenAdminModal={handleOpenAdmin}
              onOpenClientDashboard={() => setIsClientDashOpen(true)}
              onOpenJobModal={handleOpenJobModal}
            />

            {/* Main Page Sections */}
            <main>
              <Hero
                theme={theme}
                portalMode={portalMode}
                onOpenBookModal={(srv) => handleOpenBookModal(srv)}
                onOpenAboutModal={() => setIsAboutModalOpen(true)}
                onOpenClientsModal={() => setIsClientsModalOpen(true)}
                onOpenClientDashboard={() => setIsClientDashOpen(true)}
                onOpenJobModal={handleOpenJobModal}
              />

              {portalMode === 'hr' ? (
                <>
                  {/* HR Service Portal: Strictly HR positions, culture, and Apply Now options */}
                  <HRServiceSection
                    theme={theme}
                    onOpenJobModal={handleOpenJobModal}
                  />

                  <OurClientsSection
                    theme={theme}
                    onOpenBookModal={(srv) => handleOpenBookModal(srv)}
                  />

                  <FAQSection
                    theme={theme}
                  />

                  <ContactSection
                    theme={theme}
                    portalMode={portalMode}
                    onOpenJobModal={handleOpenJobModal}
                    onOpenBookModal={() => handleOpenBookModal()}
                  />
                </>
              ) : (
                <>
                  {/* Student & Company Portals: Retain 100% of all existing sections and booking unchanged */}
                  <HRServiceSection
                    theme={theme}
                    onOpenJobModal={handleOpenJobModal}
                  />

                  <ServicesSection
                    theme={theme}
                    onBookService={(serviceTitle) => handleOpenBookModal(serviceTitle)}
                  />

                  <ProjectsSection
                    theme={theme}
                    onOpenBookModal={(projectTitle) => handleOpenBookModal(projectTitle)}
                  />

                  <OurClientsSection
                    theme={theme}
                    onOpenBookModal={(srv) => handleOpenBookModal(srv)}
                  />

                  <TeamSection
                    theme={theme}
                    onOpenBookModal={() => handleOpenBookModal()}
                  />

                  <AdvantageSection
                    theme={theme}
                    onOpenBookModal={() => handleOpenBookModal()}
                  />

                  <FAQSection
                    theme={theme}
                  />

                  <ContactSection
                    theme={theme}
                    portalMode={portalMode}
                    onOpenBookModal={() => handleOpenBookModal()}
                  />
                </>
              )}
            </main>

            {/* Footer */}
            <Footer
              theme={theme}
              portalMode={portalMode}
              setPortalMode={setPortalMode}
              onOpenAboutModal={() => setIsAboutModalOpen(true)}
              onOpenClientsModal={() => setIsClientsModalOpen(true)}
              onOpenBookModal={() => handleOpenBookModal()}
              onOpenAdminModal={handleOpenAdmin}
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

            <AdminModal
              theme={theme}
              isOpen={isAdminModalOpen}
              onClose={() => setIsAdminModalOpen(false)}
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
              onOpenBookModal={(service) => handleOpenBookModal(service)}
              onOpenJobModal={handleOpenJobModal}
              onOpenClientsModal={() => setIsClientsModalOpen(true)}
              onOpenAboutModal={() => setIsAboutModalOpen(true)}
              onOpenClientDashboard={() => setIsClientDashOpen(true)}
            />

          </div>
          )
        } 
      />

    </Routes>
  );
}
