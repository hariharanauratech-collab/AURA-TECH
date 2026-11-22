import React, { useState, useRef, useEffect } from 'react';
import { 
  MessageSquare, X, Send, Bot, User, Sparkles, Loader2, 
  ExternalLink, ArrowRight, Building2, Briefcase, Zap, 
  CheckCircle2, Search, Info, Globe, Phone, Mail
} from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import { CLIENTS_DATA, SERVICES_DATA, TEAM_MEMBERS } from '../data/auraData';

export default function AIChatAssistant({ 
  theme, 
  portalMode, 
  onOpenBookModal, 
  onOpenJobModal, 
  onOpenClientsModal, 
  onOpenAboutModal, 
  onOpenClientDashboard 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const isHr = portalMode === 'hr';
  const isDark = theme === 'dark';

  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: isHr 
        ? "Hello! Welcome to the AURA TECH Job Seekers & Talent Portal. I am Aura AI, your career advisor. How can I help you explore open roles, hiring culture, or submit your job application at AURA TECH today?"
        : "Hello! I am Aura AI, your technical virtual assistant. Ask me anything about AURA TECH's services, our corporate clients (SISC COIR & InfoPluto), student project capstones, pricing, or project booking!",
      actions: isHr 
        ? [
            { label: '💼 Apply for Job', type: 'job' },
            { label: '🏢 Our Clients', type: 'clients' },
            { label: 'ℹ️ About AURA TECH', type: 'about' }
          ]
        : [
            { label: '🏢 Our Clients', type: 'clients' },
            { label: '🚀 Book a Project', type: 'book' },
            { label: '🔍 Track Status', type: 'track' }
          ]
    }
  ]);

  // Synchronize greeting when switching between Student / Company and Job Seekers portal
  useEffect(() => {
    setMessages(prev => {
      if (prev.length <= 1) {
        return [
          {
            sender: 'bot',
            text: isHr 
              ? "Hello! Welcome to the AURA TECH Job Seekers & Talent Portal. I am Aura AI, your career advisor. How can I help you explore open roles, hiring culture, or submit your job application at AURA TECH today?"
              : "Hello! I am Aura AI, your technical virtual assistant. Ask me anything about AURA TECH's services, our corporate clients (SISC COIR & InfoPluto), student project capstones, pricing, or project booking!",
            actions: isHr 
              ? [
                  { label: '💼 Apply for Job', type: 'job' },
                  { label: '🏢 Our Clients', type: 'clients' },
                  { label: 'ℹ️ About AURA TECH', type: 'about' }
                ]
              : [
                  { label: '🏢 Our Clients', type: 'clients' },
                  { label: '🚀 Book a Project', type: 'book' },
                  { label: '🔍 Track Status', type: 'track' }
                ]
          }
        ];
      }
      return prev;
    });
  }, [isHr]);

  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isTyping]);

  const defaultPrompts = [
    "Who are your clients?",
    "Tell me about SISC COIR",
    "Who is InfoPluto?",
    "What services do you offer?",
    "Do you offer student discounts?",
    "How to book a project?",
    "Who is on your team?",
    "How to track project status?"
  ];

  const hrPrompts = [
    "What roles are open?",
    "How do I apply for a job?",
    "Can freshers apply?",
    "What are the job perks?",
    "Who are your clients?",
    "HR contact details"
  ];

  const quickPrompts = isHr ? hrPrompts : defaultPrompts;

  const handleActionClick = (action) => {
    if (!action) return;
    if (action.type === 'book') {
      if (onOpenBookModal) onOpenBookModal(action.payload || '');
    } else if (action.type === 'job') {
      if (onOpenJobModal) onOpenJobModal(action.payload || '');
    } else if (action.type === 'clients') {
      if (onOpenClientsModal) onOpenClientsModal();
    } else if (action.type === 'about') {
      if (onOpenAboutModal) onOpenAboutModal();
    } else if (action.type === 'track') {
      if (onOpenClientDashboard) onOpenClientDashboard();
    } else if (action.type === 'link' && action.url) {
      window.open(action.url, '_blank', 'noopener,noreferrer');
    }
  };

  const handleSend = async (textToSend) => {
    const query = textToSend || input;
    if (!query.trim()) return;

    const userMsg = { sender: 'user', text: query };
    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setIsTyping(true);

    // Try Gemini API if API Key is available in environment
    const apiKey = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_GEMINI_API_KEY : null;

    if (apiKey && apiKey.trim() !== '') {
      try {
        const ai = new GoogleGenAI({ apiKey });
        const systemPrompt = `You are Aura AI, the intelligent virtual assistant and technical advisor for AURA TECH.
Your mission is to provide accurate, professional, friendly, and comprehensive answers to any question asked by users.

COMPANY IDENTITY:
- Name: AURA TECH (Tagline: "A Reliable Backbone of Your Business")
- Services: Website Design & Development, Custom Enterprise Software, AI Chatbots & Automation, Mobile Apps (Flutter), UI/UX Design, Logo & Brand Systems, Video Editing, AI Video reels, IoT & Hardware Systems (ESP32/Arduino), Data Visualization.
- Team: Niranjan A (Founder & CEO, Full Stack Architect), Makizh N (Operations Manager), Dhanya D (Full Stack / SaaS), Priyanka S (Full Stack / AI Video), Vengateshwaran N (IoT Lead), Hariharan S (Design & Video Lead), Praveen Raja G (Creative & Content).
- Contacts: Phone: +91 90252 55617 / +91 93452 56633 | Email: auratech008@gmail.com | Instagram: @__aura_tech_ | Location: Tamil Nadu, India.
- Student Policy: Academic capstone & mini projects, up to 50% discount with college email ID, 1-2 weeks turnaround, complete viva prep, diagrams, and report documentation.
- Enterprise SLA: 100% on-time milestone delivery, 2-4 weeks standard web, 2-4 months enterprise platforms.

CLIENT CORPORATE REFERENCES (IMPORTANT DISTINCTION):
1. SISC COIR (South Indian Coir Substrates Private Limited):
   - Industry: Coir manufacturing, coco peat blocks, grow bags, grow slabs, natural coconut fibre products, agricultural and horticultural growing substrates, B2B export distribution.
   - Official Website: https://southindiancoir.com/
   - Location: Tamil Nadu, India
   - AURA TECH Engagement: Corporate Website Development & Digital Presence (responsive layout, product catalogue & spec pages, B2B enquiry form, WhatsApp Business integration, SEO setup).
   - CRITICAL NOTE: Coir manufacturing is SISC COIR's business; AURA TECH developed their website and digital architecture. Do NOT claim AURA TECH manufactures coir.
2. InfoPluto Media Works Private Limited:
   - Industry: Media and entertainment technology, AI-enabled content production, digital and print publishing, OTT video streaming, cloud hosting, creative advertising.
   - Associated Platform: IndieMa.in (https://indiema.in/) - innovative social networking platform.
   - Location: RS Puram, Coimbatore, Tamil Nadu, India | Founder: Arun Kanth
   - Official Website: https://www.infopluto.com/
   - AURA TECH Engagement: Digital Technology & Media Solutions collaboration, AI production workflows, scalable web platform systems, media tech consulting.
   - CRITICAL NOTE: Media production is InfoPluto's business; AURA TECH collaborates on digital software engineering and platform technology.

CAREERS & HR:
- Roles: Full Stack Developer, UI/UX Designer, AI/ML Engineer, Mobile App Developer, Video Editor, IoT Engineer.
- Perks: 100% mentorship, competitive stipends, remote/hybrid, fast 48-hour response. Freshers are welcome!

Tone: Clear, polite, confident, concise, and structured with bullet points. Always offer relevant next steps.`;

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: [
            { role: 'user', parts: [{ text: `${systemPrompt}\n\nUser Question: ${query}` }] }
          ]
        });

        const replyText = response.text || "Thank you for reaching out to AURA TECH! How can our engineering team assist you further?";
        
        // Auto-generate relevant action pills based on query context
        const actions = deriveActionPills(query, isHr);

        setMessages(prev => [...prev, { 
          sender: 'bot', 
          text: replyText,
          actions: actions
        }]);
        setIsTyping(false);
        return;
      } catch (err) {
        console.warn("Gemini API call failed or timed out, falling back to local smart engine:", err);
      }
    }

    // High-performance, flexible smart local engine fallback
    setTimeout(() => {
      const { text, actions } = getSmartAuraResponse(query, isHr);
      setMessages(prev => [...prev, { sender: 'bot', text, actions }]);
      setIsTyping(false);
    }, 450);
  };

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40">
      
      {/* Floating Chat Trigger Button */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="group relative flex items-center gap-2 sm:gap-3 p-3 sm:p-4 rounded-full btn-primary-action shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer"
          aria-label="Open Aura AI Chat Assistant"
        >
          <div className="relative">
            <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-amber-400 rounded-full border-2 border-slate-950 animate-ping" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-amber-400 rounded-full border-2 border-slate-950" />
          </div>
          <span className="hidden sm:inline font-black text-xs uppercase tracking-wider pr-1">
            Aura AI
          </span>
        </button>
      )}

      {/* Chat Box Panel */}
      {isOpen && (
        <div className={`w-[calc(100vw-32px)] max-w-[420px] h-[520px] sm:h-[580px] max-h-[85vh] rounded-2xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200 border ${
          isDark ? 'bg-slate-950 border-amber-500/30' : 'bg-white border-slate-300'
        }`}>
          
          {/* Header */}
          <div className={`p-3.5 sm:p-4 border-b flex items-center justify-between ${
            isDark ? 'bg-black border-amber-500/20' : 'bg-slate-50 border-slate-200'
          }`}>
            <div className="flex items-center gap-3">
              <div className="logo-badge bg-white p-1 rounded-lg border border-slate-200 shadow-sm">
                <img src="/logo.png" alt="Aura Logo" className="h-6 w-auto object-contain" />
              </div>
              <div>
                <h4 className={`text-sm font-black flex items-center gap-1.5 uppercase tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Aura AI Assistant
                  <Sparkles size={13} className={isDark ? 'text-amber-400' : 'text-blue-600'} />
                </h4>
                <span className={`text-[10px] font-bold flex items-center gap-1 ${isDark ? 'text-amber-400' : 'text-blue-600'}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${isDark ? 'bg-amber-400' : 'bg-blue-600'}`} />
                  Always Active • Intelligent Answers
                </span>
              </div>
            </div>

            <button
              type="button"
              name="close"
              value="close"
              onClick={() => setIsOpen(false)}
              aria-label="Close Aura AI Assistant"
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                isDark ? 'text-slate-400 hover:text-white hover:bg-slate-900' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200'
              }`}
            >
              <X size={18} />
            </button>
          </div>

          {/* Messages Area */}
          <div className={`flex-1 p-3.5 sm:p-4 overflow-y-auto space-y-3.5 custom-scrollbar text-xs ${
            isDark ? 'bg-black/60' : 'bg-slate-50/50'
          }`}>
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'bot' && (
                  <div className={`w-7 h-7 rounded-lg border flex items-center justify-center shrink-0 mt-0.5 ${
                    isDark ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' : 'bg-blue-50 border-blue-200 text-blue-600'
                  }`}>
                    <Bot size={15} />
                  </div>
                )}
                
                <div className="max-w-[85%] space-y-2">
                  <div
                    className={`p-3 rounded-2xl leading-relaxed whitespace-pre-line ${
                      msg.sender === 'user'
                        ? 'btn-primary-action rounded-tr-none font-bold shadow-md'
                        : isDark 
                          ? 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none shadow-sm' 
                          : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none shadow-sm'
                    }`}
                  >
                    {renderFormattedMessage(msg.text, isDark)}
                  </div>

                  {/* Render Action Buttons / Pills if provided */}
                  {msg.actions && msg.actions.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {msg.actions.map((act, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => handleActionClick(act)}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1 border transition-all cursor-pointer shadow-sm hover:scale-105 active:scale-95 ${
                            isDark
                              ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20'
                              : 'bg-blue-50 border-blue-200 text-blue-600 hover:bg-blue-100'
                          }`}
                        >
                          {act.type === 'book' && <Zap size={11} />}
                          {act.type === 'clients' && <Building2 size={11} />}
                          {act.type === 'job' && <Briefcase size={11} />}
                          {act.type === 'track' && <Search size={11} />}
                          {act.type === 'about' && <Info size={11} />}
                          {act.type === 'link' && <ExternalLink size={11} />}
                          <span>{act.label}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {msg.sender === 'user' && (
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                    isDark ? 'bg-slate-800 text-amber-400' : 'bg-slate-200 text-slate-700'
                  }`}>
                    <User size={15} />
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-2 justify-start items-center text-slate-500 text-[11px]">
                <div className={`w-7 h-7 rounded-lg border flex items-center justify-center shrink-0 ${
                  isDark ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' : 'bg-blue-50 border-blue-200 text-blue-600'
                }`}>
                  <Bot size={15} />
                </div>
                <div className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border ${
                  isDark ? 'bg-slate-900 border-slate-800 text-slate-300' : 'bg-white border-slate-200 text-slate-700'
                }`}>
                  <Loader2 size={13} className={`animate-spin ${isDark ? 'text-amber-400' : 'text-blue-600'}`} />
                  <span>Aura AI is formulating response...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts Bar */}
          <div className={`px-3 py-2 border-t flex gap-1.5 overflow-x-auto no-scrollbar ${
            isDark ? 'bg-black/90 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            {quickPrompts.map((prompt, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSend(prompt)}
                className={`px-2.5 py-1 rounded-full text-[10px] font-bold whitespace-nowrap transition-colors border cursor-pointer ${
                  isDark 
                    ? 'bg-slate-900 hover:bg-amber-500/20 border-amber-500/20 text-slate-300 hover:text-amber-400' 
                    : 'bg-slate-100 hover:bg-blue-50 border-slate-200 text-slate-700 hover:text-blue-600'
                }`}
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Input Form */}
          <div className={`p-3 border-t ${isDark ? 'bg-black border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2"
            >
              <input
                id="aura-ai-input"
                name="auraAiInput"
                aria-label="Ask Aura AI a question"
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about clients, services, pricing, jobs..."
                className={`flex-1 rounded-xl px-3 py-2 text-xs focus:outline-none transition-colors border ${
                  isDark 
                    ? 'bg-slate-900 border-slate-800 focus:border-amber-500 text-white placeholder-slate-500' 
                    : 'bg-white border-slate-300 focus:border-blue-600 text-slate-900 placeholder-slate-400'
                }`}
              />
              <button
                type="submit"
                disabled={!input.trim()}
                aria-label="Send message to Aura AI"
                className="p-2 rounded-xl btn-primary-action disabled:opacity-40 transition-colors cursor-pointer"
              >
                <Send size={15} />
              </button>
            </form>
          </div>

        </div>
      )}

    </div>
  );
}

// Formats links and highlights inside bot responses
function renderFormattedMessage(text, isDark) {
  if (!text) return null;
  
  // Replace URLs with clickable anchors
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = text.split(urlRegex);

  return parts.map((part, index) => {
    if (part.match(urlRegex)) {
      return (
        <a
          key={index}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className={`font-black underline inline-flex items-center gap-0.5 ${
            isDark ? 'text-amber-400' : 'text-blue-600'
          }`}
        >
          {part.replace('https://', '')}
          <ExternalLink size={10} className="inline ml-0.5" />
        </a>
      );
    }
    return part;
  });
}

// Derive quick action pills from user query
function deriveActionPills(query, isHr) {
  const q = query.toLowerCase();
  const pills = [];

  if (isHr) {
    pills.push({ label: '💼 Apply for Job', type: 'job' });
  }

  if (q.includes('client') || q.includes('sisc') || q.includes('infopluto') || q.includes('indiema') || q.includes('coir')) {
    pills.push({ label: '🏢 View Our Clients', type: 'clients' });
  }
  if (!isHr && (q.includes('book') || q.includes('price') || q.includes('quote') || q.includes('cost') || q.includes('service') || q.includes('website') || q.includes('student'))) {
    pills.push({ label: '🚀 Book a Project', type: 'book' });
  }
  if (!isHr && (q.includes('job') || q.includes('career') || q.includes('role') || q.includes('hiring') || q.includes('apply') || q.includes('fresher') || q.includes('intern'))) {
    pills.push({ label: '💼 Apply for Job', type: 'job' });
  }
  if (q.includes('track') || q.includes('status') || q.includes('code') || q.includes('progress')) {
    pills.push({ label: '🔍 Track Status', type: 'track' });
  }
  if (q.includes('about') || q.includes('who') || q.includes('team') || q.includes('foundation')) {
    pills.push({ label: 'ℹ️ About AURA TECH', type: 'about' });
  }

  return pills.slice(0, 3);
}

// Advanced Multi-Intent Conversational Knowledge Engine
function getSmartAuraResponse(rawQuery, isHr) {
  const q = rawQuery.toLowerCase().trim();

  // 1. SISC COIR Questions
  if (
    q.includes('sisc') || 
    (q.includes('coir') && !q.includes('make')) || 
    q.includes('south indian coir') || 
    q.includes('coco peat') || 
    q.includes('substrate') ||
    q.includes('grow bag')
  ) {
    return {
      text: "🌱 SISC COIR (South Indian Coir Substrates Private Limited) is one of AURA TECH's premier corporate clients based in Tamil Nadu, India.\n\n• Client's Core Business: Natural coir manufacturing, coco peat blocks, greenhouse grow bags & grow slabs, coco chips, and horticultural growing substrates for global B2B distribution.\n• AURA TECH Deliverables: We engineered their responsive Corporate Website & Digital Presence (https://southindiancoir.com/), featuring an interactive product catalogue, B2B business enquiry capture form, WhatsApp Business integration, and full technical SEO configuration.\n\n*(Note: Coir manufacturing is SISC COIR's business; AURA TECH provides corporate web engineering and digital solutions.)*",
      actions: [
        { label: '🏢 View SISC Profile', type: 'clients' },
        { label: '🚀 Book Web Project', type: 'book', payload: 'Corporate Website Development' },
        { label: '🌐 southindiancoir.com', type: 'link', url: 'https://southindiancoir.com/' }
      ]
    };
  }

  // 2. InfoPluto Media Works & IndieMa Questions
  if (
    q.includes('infopluto') || 
    q.includes('info pluto') || 
    q.includes('indiema') || 
    q.includes('indie ma') || 
    q.includes('arun kanth') ||
    (q.includes('media works') && !q.includes('social'))
  ) {
    return {
      text: "🎬 InfoPluto Media Works Private Limited is a distinguished client headquartered in RS Puram, Coimbatore, Tamil Nadu, founded by Arun Kanth.\n\n• Client's Core Business: Media and entertainment technology, AI-enabled video and creative content production, OTT streaming platforms, digital and print publishing, cloud hosting, and creative advertising. They also operate the social platform IndieMa.in (https://indiema.in/).\n• AURA TECH Scope: Digital Technology & Media Solutions collaboration, AI content workflows, scalable platform infrastructure, and high-performance digital systems.\n\n*(Note: Media production and publishing are InfoPluto's business; AURA TECH collaborates on digital software engineering and technical platform solutions.)*",
      actions: [
        { label: '🏢 View InfoPluto Profile', type: 'clients' },
        { label: '🚀 Discuss Media Tech', type: 'book', payload: 'Digital Technology & Media Solutions' },
        { label: '🌐 infopluto.com', type: 'link', url: 'https://www.infopluto.com/' }
      ]
    };
  }

  // 3. Question: "Do you manufacture coir / do you produce movies?"
  if ((q.includes('do you') || q.includes('do we')) && (q.includes('coir') || q.includes('peat') || q.includes('movie') || q.includes('film'))) {
    return {
      text: "AURA TECH is a software development and digital engineering company!\n\n• SISC COIR is our client in the coir manufacturing and agricultural substrate sector. AURA TECH engineered their official corporate website (https://southindiancoir.com/).\n• InfoPluto Media Works is our client in media production, entertainment technology, and digital publishing. AURA TECH collaborates on digital software and AI platforms.\n\nWe provide the technology, websites, mobile apps, and AI software that power these enterprises!",
      actions: [
        { label: '🏢 View All Clients', type: 'clients' },
        { label: '🚀 Book Tech Project', type: 'book' }
      ]
    };
  }

  // 4. Client Listing & Corporate References
  if (
    q.includes('client') || 
    q.includes('customer') || 
    q.includes('portfolio') || 
    q.includes('case study') || 
    q.includes('reference') ||
    q.includes('who do you work with') ||
    q.includes('past work')
  ) {
    return {
      text: "AURA TECH is proud to partner with visionary organizations across manufacturing, media, and education:\n\n1. SISC COIR (South Indian Coir Substrates Pvt Ltd) — Natural coir & agricultural substrates (Deliverable: Corporate website, product catalogue & SEO).\n2. InfoPluto Media Works Pvt Ltd — Media technology, AI production & IndieMa.in platform (Deliverable: Digital Technology & Media Solutions).\n3. Sankara College of Science & Commerce — Academic admissions & student support AI Chatbot.\n4. National Datathon Committee — EventReg Pro high-traffic registration engine.\n\nClick 'Our Clients' to view in-depth profiles and official links!",
      actions: [
        { label: '🏢 Explore Our Clients', type: 'clients' },
        { label: '🚀 Request a Quote', type: 'book' }
      ]
    };
  }

  // 5. HR / Careers Questions (Active Roles, How to Apply, Freshers, Perks, Interview, Recruiter)
  const isJobRelatedQuery = (
    q.includes('job') || 
    q.includes('hiring') || 
    q.includes('vacancy') || 
    q.includes('vacancies') ||
    q.includes('opening') || 
    q.includes('openings') || 
    q.includes('career') || 
    q.includes('careers') || 
    q.includes('apply') || 
    q.includes('application') || 
    q.includes('resume') || 
    q.includes('cv') || 
    q.includes('interview') || 
    q.includes('stipend') || 
    q.includes('salary') || 
    q.includes('fresher') || 
    q.includes('intern') || 
    q.includes('internship') || 
    q.includes('perk') || 
    q.includes('work culture') ||
    q.includes('recruiter') ||
    q.includes('recruitment')
  );

  if (isJobRelatedQuery) {
    // 5A: How to apply & application steps
    if (q.includes('how to apply') || q.includes('how do i apply') || q.includes('apply process') || q.includes('resume') || q.includes('cv') || q.includes('submit application')) {
      return {
        text: "💼 How to Apply at AURA TECH:\n\n1. Online Application: Click 'Apply for Job' below to submit your details, choose your desired role, and attach your resume.\n2. Direct Email: You can also email your resume & GitHub / Portfolio link to auratech008@gmail.com.\n3. 15-Min Technical Chat: A friendly discussion on your projects, problem-solving mindset, and code.\n4. Fast 48-72h Offer SLA: We respect your time and provide fast interview feedback!\n\nNo rigid gatekeeping—we value demonstrable projects and passion above all.",
        actions: [
          { label: '💼 Open Application Form', type: 'job' },
          { label: '✉️ Email Resume', type: 'link', url: 'mailto:auratech008@gmail.com' },
          { label: '📞 HR Desk (+91 90252 55617)', type: 'link', url: 'tel:+919025255617' }
        ]
      };
    }

    // 5B: Freshers & Student Internships
    if (q.includes('fresher') || q.includes('freshers') || q.includes('intern') || q.includes('internship') || q.includes('student') || q.includes('experience requirement')) {
      return {
        text: "🎓 Freshers & Interns at AURA TECH:\n\n• 100% Welcomed: We actively hire freshers, pre-final/final year students, and self-taught developers!\n• Skills Over Degrees: We evaluate your GitHub repositories, personal projects, and curiosity rather than years on a resume.\n• 1-on-1 Mentorship: Every junior engineer and intern is paired with a senior software architect for daily guidance and pair programming.\n• Paid & Industry-Standard: All internships include competitive stipends and high-potential PPO (Pre-Placement Offer) conversion.",
        actions: [
          { label: '💼 Apply as Fresher / Intern', type: 'job' },
          { label: '📞 Contact HR Desk', type: 'link', url: 'tel:+919025255617' }
        ]
      };
    }

    // 5C: Perks, Salary, Stipend, Remote Work & Culture
    if (q.includes('perk') || q.includes('salary') || q.includes('stipend') || q.includes('culture') || q.includes('remote') || q.includes('hybrid') || q.includes('wfh') || q.includes('benefit') || q.includes('allowance')) {
      return {
        text: "🌟 AURA TECH Team Perks & Culture:\n\n• Flexible Remote & Hybrid Work: Work from wherever you are most productive with flexible working hours.\n• 1-on-1 Senior Mentorship: Direct pair programming on production systems.\n• Competitive Compensation: Industry-benchmark salaries for full-time roles and fair stipends for interns.\n• Cutting-Edge Modern Stack: Work with React 19, Vite, Tailwind v4, Python AI agents, Supabase, and ESP32 IoT hardware.\n• Guaranteed 48-Hour Response SLA: We never leave applicants hanging in silence.",
        actions: [
          { label: '💼 Submit Your Application', type: 'job' },
          { label: '🏢 Explore Our Clients', type: 'clients' }
        ]
      };
    }

    // 5D: Interview stages & selection process
    if (q.includes('interview') || q.includes('round') || q.includes('process') || q.includes('selection') || q.includes('test') || q.includes('assessment')) {
      return {
        text: "🎯 Transparent 3-Stage Interview Process:\n\n1. Stage 1: Portfolio & Code Walkthrough (15-20 mins) — We review your GitHub, past projects, or design showcase.\n2. Stage 2: Practical Architecture & Problem Solving — A practical chat on how you write code and think through challenges.\n3. Stage 3: Culture & Offer Rollout — Compensation alignment and onboarding plan. The entire turnaround is 48 to 72 hours!",
        actions: [
          { label: '💼 Apply for Job', type: 'job' },
          { label: '✉️ Email HR', type: 'link', url: 'mailto:auratech008@gmail.com' }
        ]
      };
    }

    // 5E: HR Contact & Recruiter info
    if (q.includes('hr') || q.includes('recruiter') || q.includes('recruitment') || q.includes('hiring team')) {
      return {
        text: "📞 AURA TECH Talent & Recruitment Team:\n\n• HR Direct Contact: +91 90252 55617\n• Careers Desk Email: auratech008@gmail.com\n• WhatsApp Support: +91 90252 55617\n• Location: Tamil Nadu, India\n\nOur hiring managers review all submissions within 2 business days!",
        actions: [
          { label: '📞 Call HR (+91 90252 55617)', type: 'link', url: 'tel:+919025255617' },
          { label: '💼 Apply Online', type: 'job' }
        ]
      };
    }

    // 5F: Active Open Positions & Roles
    return {
      text: "🚀 AURA TECH is actively recruiting passionate talent across 6 tracks:\n\n1. Full Stack Developer — React 19, TypeScript, Vite, Node.js, REST APIs, and database design.\n2. UI/UX Designer — Figma design systems, modern glassmorphism micro-interactions, responsive mobile/web layout.\n3. AI & ML Engineer — Python, LLM agents, Gemini API, RAG workflows, and computer vision.\n4. Flutter Mobile Developer — Cross-platform Android & iOS development with state management.\n5. Video Editor & Motion Graphics — Premiere Pro, After Effects, cinematic editing, and Generative AI reels.\n6. IoT & Embedded Systems Engineer — ESP32, Arduino, sensor integration, and real-time telemetry dashboards.\n\nClick 'Apply for Job' to begin your application!",
      actions: [
        { label: '💼 Apply for Job', type: 'job' },
        { label: '🏢 View Our Clients', type: 'clients' },
        { label: 'ℹ️ About AURA TECH', type: 'about' }
      ]
    };
  }

  // 6. Student Projects & Discounts
  if (
    q.includes('student') || 
    q.includes('college') || 
    q.includes('capstone') || 
    q.includes('final year') || 
    q.includes('mini project') || 
    q.includes('discount') || 
    q.includes('viva') || 
    q.includes('report') || 
    q.includes('documentation')
  ) {
    return {
      text: "🎓 Academic & Student Projects at AURA TECH:\n\n• Exclusive Discount: Up to 50% discount on project development when registering with your college email ID!\n• Comprehensive Support: We provide verified source code, architecture diagrams, IEEE format project reports, and 1-on-1 viva prep calls so you score top marks.\n• Fast Turnaround: 1 to 2 weeks delivery for rapid submission.\n• Popular Topics: AI Chatbots, Full-Stack Web Apps, Flutter Apps, IoT Hardware, and Machine Learning models.",
      actions: [
        { label: '🎓 Book Student Project', type: 'book', payload: 'College / Student Project' },
        { label: '🔍 Track Project', type: 'track' }
      ]
    };
  }

  // 7. Services & Technical Capabilities
  if (
    q.includes('service') || 
    q.includes('offer') || 
    q.includes('build') || 
    q.includes('create') || 
    q.includes('develop') || 
    q.includes('website') || 
    q.includes('app') || 
    q.includes('chatbot') || 
    q.includes('ai') || 
    q.includes('iot') || 
    q.includes('flutter') || 
    q.includes('ui') || 
    q.includes('ux') || 
    q.includes('design') || 
    q.includes('video')
  ) {
    return {
      text: "AURA TECH provides end-to-end digital solutions:\n\n• Website Development: High-speed responsive web applications & corporate portals\n• AI Chatbots & Agents: Intelligent conversational bots powered by LLMs\n• Mobile Applications: Flutter cross-platform iOS & Android apps\n• UI/UX & Brand Design: Figma interfaces, logos, and comprehensive design systems\n• IoT Solutions: ESP32 & Arduino hardware microcontrollers & live telemetry dashboards\n• Video & Motion Design: Cinematic editing, post-production, and generative AI reels\n• Data Visualization: Interactive business intelligence analytics dashboards",
      actions: [
        { label: '🚀 Book a Service', type: 'book' },
        { label: '🏢 View Client Work', type: 'clients' }
      ]
    };
  }

  // 8. Pricing, Quotes & Estimates
  if (
    q.includes('price') || 
    q.includes('cost') || 
    q.includes('quote') || 
    q.includes('quotation') || 
    q.includes('how much') || 
    q.includes('rate') || 
    q.includes('charge') || 
    q.includes('budget') || 
    q.includes('cheap') || 
    q.includes('affordable')
  ) {
    return {
      text: "💰 Transparent & Budget-Friendly Pricing:\n\n• Student & Academic: Heavily subsidized packages with up to 50% discount for students.\n• Corporate & Business: Milestone-based pricing tailored to exact scope, with zero hidden charges and free consultation.\n• Instant Quotes: Click 'Book a Project', choose your project type, and our team will provide a detailed quote within 24 hours!",
      actions: [
        { label: '🚀 Request Project Quote', type: 'book' },
        { label: '📞 Contact Support', type: 'link', url: 'tel:+919025255617' }
      ]
    };
  }

  // 9. Timelines & Turnaround Time
  if (
    q.includes('time') || 
    q.includes('turnaround') || 
    q.includes('duration') || 
    q.includes('how long') || 
    q.includes('days') || 
    q.includes('weeks') || 
    q.includes('deadline') || 
    q.includes('fast')
  ) {
    return {
      text: "⚡ Delivery Timelines & SLA Guarantee:\n\n• Student & Fast-Track Projects: 1 to 2 Weeks\n• Standard Business Websites: 2 to 4 Weeks\n• Custom Software & Enterprise AI: 2 to 4 Months\n\nEvery project comes with milestone tracking and 100% on-time delivery commitment!",
      actions: [
        { label: '🚀 Book Fast-Track Project', type: 'book' },
        { label: '🔍 Track Project', type: 'track' }
      ]
    };
  }

  // 10. Project Tracking & Status
  if (
    q.includes('track') || 
    q.includes('status') || 
    q.includes('tracking code') || 
    q.includes('where is my project') || 
    q.includes('progress')
  ) {
    return {
      text: "🔍 You can track your project progress in real time!\n\nWhen you book a project, you receive a unique Project ID / Tracking Code (e.g., AURA-101). Click 'Track Project Status' to view live milestones, developer notes, and completion percentages.",
      actions: [
        { label: '🔍 Track Project Status', type: 'track' },
        { label: '🚀 Book New Project', type: 'book' }
      ]
    };
  }

  // 11. Team & Leadership
  if (
    q.includes('team') || 
    q.includes('who is') || 
    q.includes('founder') || 
    q.includes('ceo') || 
    q.includes('niranjan') || 
    q.includes('makizh') || 
    q.includes('hariharan') || 
    q.includes('priyanka') || 
    q.includes('dhanya') || 
    q.includes('praveen') || 
    q.includes('vengateshwaran')
  ) {
    return {
      text: "Meet the core leadership and engineering team of AURA TECH:\n\n• Niranjan A — Founder & CEO (Enterprise Full Stack Architecture & Leadership)\n• Makizh N — Operations Manager (Agile Project Delivery & Client Relations)\n• Dhanya D — Full Stack / SaaS Developer (Cloud APIs & Web Architecture)\n• Priyanka S — Full Stack / AI Video Specialist (Generative AI & Media Pipelines)\n• Vengateshwaran N — IoT & Embedded Systems Lead (ESP32/Arduino & Telemetry)\n• Hariharan S — Lead UI/UX Designer & Video Editor (Brand Systems & Aesthetics)\n• Praveen Raja G — Creative Designer & Content Strategist (Copywriting & Layout)",
      actions: [
        { label: 'ℹ️ About AURA TECH', type: 'about' },
        { label: '🏢 View Our Clients', type: 'clients' }
      ]
    };
  }

  // 12. Contact, Helpdesk & Address
  if (
    q.includes('contact') || 
    q.includes('phone') || 
    q.includes('number') || 
    q.includes('call') || 
    q.includes('email') || 
    q.includes('location') || 
    q.includes('office') || 
    q.includes('address') || 
    q.includes('coimbatore') || 
    q.includes('instagram') || 
    q.includes('reach') || 
    q.includes('helpdesk')
  ) {
    return {
      text: "Reach out to AURA TECH directly:\n\n• AURA TECH Direct: +91 90252 55617\n• Helpdesk & Support: +91 93452 56633\n• Official Email: auratech008@gmail.com\n• Instagram: @__aura_tech_\n• Headquarters: Tamil Nadu, India\n\nOur client response team is available 24/7!",
      actions: [
        { label: '📞 Call Now (+91 90252 55617)', type: 'link', url: 'tel:+919025255617' },
        { label: '✉️ Email Us', type: 'link', url: 'mailto:auratech008@gmail.com' },
        { label: '🚀 Book Consultation', type: 'book' }
      ]
    };
  }

  // 13. About Us & Company Philosophy
  if (
    q.includes('about') || 
    q.includes('who are you') || 
    q.includes('what is aura tech') || 
    q.includes('why choose') || 
    q.includes('reliable') || 
    q.includes('guarantee')
  ) {
    return {
      text: "AURA TECH is 'A Reliable Backbone of Your Business'. We deliver high-performance, budget-friendly web systems, AI software, mobile apps, and branding solutions for students, growing startups, and established enterprises.\n\nFrom concept and UI/UX design to cloud deployment and post-launch maintenance, we ensure seamless execution with zero downtime.",
      actions: [
        { label: 'ℹ️ Read About Us', type: 'about' },
        { label: '🏢 Explore Our Clients', type: 'clients' },
        { label: '🚀 Book Project', type: 'book' }
      ]
    };
  }

  // 14. Conversational Greetings & Thanks
  if (
    q.startsWith('hi') || 
    q.startsWith('hello') || 
    q.startsWith('hey') || 
    q.includes('vanakkam') || 
    q.includes('namaste') || 
    q.includes('good morning') || 
    q.includes('good afternoon') || 
    q.includes('good evening') ||
    q === 'yo' || 
    q === 'hola'
  ) {
    if (isHr) {
      return {
        text: "Hello! Welcome to the AURA TECH Job Seekers & Talent Portal. I am Aura AI, your career advisor.\n\nHow can I help you take the next step in your career?\n1. Check active openings (Full Stack, UI/UX, AI/ML, Flutter, Video, IoT)?\n2. Learn about freshers & internship mentorship?\n3. Explore our remote work perks and culture?\n4. Learn about our company, founders, and corporate clients?",
        actions: [
          { label: '💼 View Open Roles', type: 'job' },
          { label: '🏢 Our Clients', type: 'clients' },
          { label: 'ℹ️ About AURA TECH', type: 'about' }
        ]
      };
    }

    return {
      text: "Hello! Welcome to AURA TECH. I am Aura AI, ready to assist you.\n\nWould you like to:\n1. Explore our corporate clients (SISC COIR & InfoPluto)?\n2. Learn about student project discounts?\n3. Request a customized project quotation?\n4. Inquire about open job positions?",
      actions: [
        { label: '🏢 Our Clients', type: 'clients' },
        { label: '🚀 Book a Project', type: 'book' },
        { label: '💼 Careers & Jobs', type: 'job' }
      ]
    };
  }

  if (q.includes('thank') || q.includes('super') || q.includes('awesome') || q.includes('great') || q.includes('good job') || q.includes('nice')) {
    return {
      text: isHr 
        ? "You're very welcome! If you have any further questions about our roles, interview stages, or work culture, just let me know. Best of luck with your application!"
        : "You're very welcome! It's our absolute pleasure to assist you. If you need any technical help or want to book a project, our team is right here.",
      actions: isHr 
        ? [
            { label: '💼 Apply for Job', type: 'job' },
            { label: '🏢 View Our Clients', type: 'clients' }
          ]
        : [
            { label: '🚀 Book a Project', type: 'book' },
            { label: '🏢 View Our Clients', type: 'clients' }
          ]
    };
  }

  // 15. Intelligent Universal Fallback with Contextual Assistance
  if (isHr) {
    return {
      text: "Thank you for asking! In the AURA TECH Job Seekers Portal, you can explore open engineering roles (Full Stack, UI/UX, AI/ML, Flutter, Video, IoT), verify our freshers mentorship policy, check remote perks, or submit your job application.\n\nYou can also ask me about our corporate clients (like SISC COIR and InfoPluto), our engineering team, or reach out to recruitment at auratech008@gmail.com.",
      actions: [
        { label: '💼 Apply for Job', type: 'job' },
        { label: '🏢 View Our Clients', type: 'clients' },
        { label: 'ℹ️ About AURA TECH', type: 'about' }
      ]
    };
  }

  return {
    text: `Thank you for asking! AURA TECH specializes in high-performance digital engineering, including corporate web systems, AI chatbots, mobile applications, and cloud platforms.\n\nWhether you're looking for client references (like SISC COIR and InfoPluto), student capstones, job openings, or an enterprise quotation, I'm here to assist!`,
    actions: [
      { label: '🏢 View Our Clients', type: 'clients' },
      { label: '🚀 Book a Project', type: 'book' },
      { label: 'ℹ️ About AURA TECH', type: 'about' }
    ]
  };
}
