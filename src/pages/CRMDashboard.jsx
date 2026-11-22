import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield, User, Sparkles, Building2, Layers, CheckCircle2, Moon, Sun, Lock } from 'lucide-react';
import { AdminPortal } from '../crm/AdminPortal';
import { EmployeePortal } from '../crm/EmployeePortal';
import { AuthModal } from '../crm/AuthModal';
import { crmDb } from '../crm/crmDbService';
import { ADMIN_EMAIL, EMPLOYEE_EMAIL_TO_ID } from '../crm/crmAuthConfig';
import AnimatedOfficeBackground from '../components/AnimatedOfficeBackground';

export default function CRMDashboard({ theme = 'dark', onToggleTheme }) {
  const navigate = useNavigate();
  const [authenticatedRole, setAuthenticatedRole] = useState(() => {
    return localStorage.getItem('aura_crm_role') || sessionStorage.getItem('aura_crm_role') || null;
  });
  const [currentEmployee, setCurrentEmployee] = useState(() => {
    const savedId = localStorage.getItem('aura_crm_emp_id') || sessionStorage.getItem('aura_crm_emp_id');
    const savedEmail = localStorage.getItem('aura_crm_emp_email') || sessionStorage.getItem('aura_crm_emp_email');
    if (savedId) {
      const emp = crmDb.getEmployeeById(savedId);
      if (emp) return emp;
    }
    if (savedEmail) {
      const matchedId = EMPLOYEE_EMAIL_TO_ID[savedEmail.toLowerCase()];
      if (matchedId) {
        const emp = crmDb.getEmployeeById(matchedId);
        if (emp) return emp;
      }
    }
    return null;
  });
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [initialPortal, setInitialPortal] = useState(null);

  const isDark = theme === 'dark';

  useEffect(() => {
    // If not authenticated on initial mount, open AuthModal by default
    if (!authenticatedRole) {
      setIsAuthModalOpen(true);
      return;
    }

    if (authenticatedRole === 'admin') {
      crmDb.initializeCloudDatabase(true, '').catch((e) => {
        console.warn('CRM cloud init note:', e);
      });
      setCurrentEmployee(null);
    } else if (authenticatedRole === 'employee') {
      const savedEmail = localStorage.getItem('aura_crm_emp_email') || sessionStorage.getItem('aura_crm_emp_email') || 'hariharan.auratech@gmail.com';
      const savedId = localStorage.getItem('aura_crm_emp_id') || sessionStorage.getItem('aura_crm_emp_id') || EMPLOYEE_EMAIL_TO_ID[savedEmail.toLowerCase()] || 'EMP003';
      const emp = crmDb.getEmployeeById(savedId) || crmDb.getEmployees()[0];
      if (emp) {
        setCurrentEmployee(emp);
      }
      crmDb.initializeCloudDatabase(false, emp ? emp.id : savedId).catch((e) => {
        console.warn('CRM cloud init note:', e);
      });
    }
  }, [authenticatedRole]);

  const handleAuthenticated = async (role) => {
    setAuthenticatedRole(role);
    localStorage.setItem('aura_crm_role', role);
    sessionStorage.setItem('aura_crm_role', role);
    setIsAuthModalOpen(false);

    if (role === 'admin') {
      localStorage.setItem('aura_admin_auth', 'true');
      sessionStorage.setItem('aura_admin_auth', 'true');
      try {
        await crmDb.initializeCloudDatabase(true, '');
      } catch (e) {
        console.warn('CRM cloud init note:', e);
      }
      setCurrentEmployee(null);
    } else {
      // Find employee
      const savedEmail = localStorage.getItem('aura_crm_emp_email') || sessionStorage.getItem('aura_crm_emp_email') || 'hariharan.auratech@gmail.com';
      const empId = EMPLOYEE_EMAIL_TO_ID[savedEmail.toLowerCase()] || localStorage.getItem('aura_crm_emp_id') || 'EMP003';
      localStorage.setItem('aura_crm_emp_id', empId);
      localStorage.setItem('aura_crm_emp_email', savedEmail);
      sessionStorage.setItem('aura_crm_emp_id', empId);
      sessionStorage.setItem('aura_crm_emp_email', savedEmail);
      const emp = crmDb.getEmployeeById(empId);
      setCurrentEmployee(emp || crmDb.getEmployees()[0]);

      try {
        await crmDb.initializeCloudDatabase(false, empId);
      } catch (e) {
        console.warn('CRM cloud init note:', e);
      }
    }
  };

  const handleLogout = () => {
    crmDb.disableCloudPersistence();
    localStorage.removeItem('aura_crm_role');
    localStorage.removeItem('aura_crm_emp_id');
    localStorage.removeItem('aura_crm_emp_email');
    localStorage.removeItem('aura_admin_auth');
    sessionStorage.removeItem('aura_crm_role');
    sessionStorage.removeItem('aura_crm_emp_id');
    sessionStorage.removeItem('aura_crm_emp_email');
    sessionStorage.removeItem('aura_admin_auth');
    setAuthenticatedRole(null);
    setCurrentEmployee(null);
    setIsAuthModalOpen(false);
  };

  const openAuth = (portal) => {
    setInitialPortal(portal);
    setIsAuthModalOpen(true);
  };

  // Render Admin Portal
  if (authenticatedRole === 'admin') {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100">
        <div className="bg-slate-900/90 border-b border-slate-800 px-6 py-3 flex items-center justify-between text-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/')}
              className="text-slate-300 hover:text-white flex items-center gap-1.5 font-semibold cursor-pointer"
            >
              <ArrowLeft size={16} /> Back to Aura Tech Site
            </button>
            <span className="text-slate-600">|</span>
            <span className="text-amber-400 font-bold flex items-center gap-1.5">
              <Shield size={15} /> Enterprise CRM Suite Active
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="text-red-400 hover:text-red-300 font-semibold px-3 py-1 rounded-lg hover:bg-red-500/10 transition-colors cursor-pointer"
          >
            Sign Out
          </button>
        </div>
        <AdminPortal onLogout={handleLogout} />
      </div>
    );
  }

  // Render Employee Portal
  if (authenticatedRole === 'employee' && currentEmployee) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100">
        <div className="bg-slate-900/90 border-b border-slate-800 px-6 py-3 flex items-center justify-between text-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/')}
              className="text-slate-300 hover:text-white flex items-center gap-1.5 font-semibold cursor-pointer"
            >
              <ArrowLeft size={16} /> Back to Aura Tech Site
            </button>
            <span className="text-slate-600">|</span>
            <span className="text-indigo-400 font-bold flex items-center gap-1.5">
              <User size={15} /> Employee Portal ({currentEmployee.name} - {currentEmployee.id})
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="text-red-400 hover:text-red-300 font-semibold px-3 py-1 rounded-lg hover:bg-red-500/10 transition-colors cursor-pointer"
          >
            Sign Out
          </button>
        </div>
        <EmployeePortal employee={currentEmployee} onLogout={handleLogout} />
      </div>
    );
  }

  // Non-authenticated Landing View
  return (
    <div className={`min-h-screen flex flex-col justify-between p-4 sm:p-8 relative overflow-hidden transition-colors duration-300 ${
      isDark ? 'bg-black text-slate-100' : 'bg-slate-50 text-slate-900'
    }`}>
      <AnimatedOfficeBackground theme={theme} />

      {/* Top Header */}
      <header className="max-w-7xl mx-auto w-full flex items-center justify-between relative z-10 py-4">
        <div className="flex items-center gap-3">
          <div className="logo-badge bg-white p-2 rounded-2xl border border-slate-200 shadow-md">
            <img src="/logo.png" alt="AURA TECH" className="h-8 w-auto object-contain" />
          </div>
          <div>
            <h1 className={`text-lg font-black tracking-tight uppercase ${isDark ? 'text-white' : 'text-slate-900'}`}>
              AURA <span className={isDark ? 'text-amber-400' : 'text-blue-600'}>TECH</span>
            </h1>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Enterprise CRM &amp; Operations Suite</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className={`px-4 py-2.5 rounded-xl border text-sm font-bold flex items-center gap-2 transition-colors ${
              isDark ? 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white' : 'bg-white border-slate-300 text-slate-700 hover:text-slate-900'
            }`}
          >
            <ArrowLeft size={16} /> Back to Website
          </button>
        </div>
      </header>

      {/* Main Center Cards */}
      <main className="max-w-5xl mx-auto w-full my-auto py-12 relative z-10 text-center">
        <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider mb-6 border ${
          isDark ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' : 'bg-blue-50 border-blue-200 text-blue-600'
        }`}>
          <Sparkles size={15} /> Unified Operations &amp; Workflow Hub
        </div>

        <h2 className={`text-3xl sm:text-5xl font-black uppercase tracking-tight mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>
          AURA TECH <span className="text-gradient-main">CRM SUITE</span>
        </h2>
        <p className={`text-sm sm:text-base max-w-2xl mx-auto mb-10 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
          Select your dedicated portal below to access live project requests, employee task management, client billing, and operational metrics.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {/* Main Admin Card */}
          <div className={`p-7 sm:p-8 rounded-3xl border text-left transition-all hover:scale-[1.02] shadow-xl ${
            isDark ? 'bg-slate-950/90 border-amber-500/30' : 'bg-white border-slate-200 shadow-slate-200'
          }`}>
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-5 border ${
              isDark ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' : 'bg-blue-50 text-blue-600 border-blue-200'
            }`}>
              <Shield size={24} />
            </div>
            <h3 className={`text-xl font-black uppercase mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Main Admin Portal
            </h3>
            <p className="text-sm text-slate-400 mb-6 leading-relaxed">
              Full enterprise control: review client leads, assign tasks to the 7 core developers, manage invoices, and download financial reports.
            </p>
            <button
              onClick={() => openAuth('admin')}
              className="w-full btn-primary-action py-3.5 rounded-xl text-sm font-black uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 cursor-pointer"
            >
              <Lock size={16} /> Enter Admin Suite
            </button>
          </div>

          {/* Employee Portal Card */}
          <div className={`p-7 sm:p-8 rounded-3xl border text-left transition-all hover:scale-[1.02] shadow-xl ${
            isDark ? 'bg-slate-950/90 border-indigo-500/30' : 'bg-white border-slate-200 shadow-slate-200'
          }`}>
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-5 border ${
              isDark ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30' : 'bg-indigo-50 text-indigo-600 border-indigo-200'
            }`}>
              <User size={24} />
            </div>
            <h3 className={`text-xl font-black uppercase mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Employee Workspace
            </h3>
            <p className="text-sm text-slate-400 mb-6 leading-relaxed">
              Personalized dashboard for Niranjan, Makizh, Hariharan, Priyanka, Dhanya, Praveen, and Vengat. Update task statuses &amp; log progress.
            </p>
            <button
              onClick={() => openAuth('employee')}
              className="w-full py-3.5 rounded-xl bg-linear-to-r from-indigo-500 to-purple-600 hover:opacity-95 text-white text-sm font-black uppercase tracking-wider shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2 cursor-pointer"
            >
              <User size={16} /> Access My Workspace
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto w-full text-center relative z-10 py-4 border-t border-slate-800/40 text-xs text-slate-500">
        © 2026 AURA TECH Operations Suite • Confidential & Authorized Staff Only
      </footer>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        initialPortal={initialPortal}
        recoveryRequired={false}
        errorMessage=""
        onClearError={() => {}}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthenticated={handleAuthenticated}
        onRecoveryComplete={() => {}}
      />
    </div>
  );
}

