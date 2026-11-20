export const SERVICES_DATA = [
  {
    id: "1",
    title: "Website Design",
    description: "Visual storytelling through modern, responsive web layouts.",
    icon: "Palette",
    category: "Design"
  },
  {
    id: "2",
    title: "Website Development",
    description: "Robust and scalable web solutions tailored to business needs.",
    icon: "Globe",
    category: "Development"
  },
  {
    id: "3",
    title: "Frontend Development",
    description: "Crafting interactive and lightning-fast user interfaces.",
    icon: "Layout",
    category: "Development"
  },
  {
    id: "4",
    title: "Backend Development",
    description: "High-performance server-side logic and database management.",
    icon: "Database",
    category: "Development"
  },
  {
    id: "5",
    title: "App Interface Design",
    description: "Modern, intuitive interfaces for mobile platforms.",
    icon: "Smartphone",
    category: "Design"
  },
  {
    id: "6",
    title: "Flutter Projects",
    description: "Multi-platform development using Google's powerful SDK.",
    icon: "Layers",
    category: "Development"
  },
  {
    id: "7",
    title: "Software Development",
    description: "Custom enterprise-grade software built for efficiency.",
    icon: "Code",
    category: "Development"
  },
  {
    id: "8",
    title: "UI/UX Design",
    description: "User-centric design focused on accessibility and delight.",
    icon: "Sparkles",
    category: "Design"
  },
  {
    id: "9",
    title: "Logo Design",
    description: "Iconic branding that captures your company's unique aura.",
    icon: "Palette",
    category: "Design"
  },
  {
    id: "10",
    title: "Video Editing",
    description: "Professional post-production for engaging visual content.",
    icon: "Video",
    category: "Design"
  },
  {
    id: "11",
    title: "Data Visualization",
    description: "Transforming complex datasets into clear, actionable insights.",
    icon: "BarChart",
    category: "Development"
  },
  {
    id: "12",
    title: "AI Chatbot Development",
    description: "Intelligent automation powered by modern LLMs.",
    icon: "MessageSquare",
    category: "Development"
  },
  {
    id: "13",
    title: "AI Video Editing",
    description: "Transforming raw footage into cinematic masterpieces using advanced AI enhancement and neural effects.",
    icon: "Zap",
    category: "Design"
  },
  {
    id: "14",
    title: "IoT Solutions & Projects",
    description: "Smart hardware integration, microcontrollers (ESP32/Arduino), sensor networks, and real-time IoT dashboard development.",
    icon: "Cpu",
    category: "Development"
  }
];

export const PROJECTS_DATA = [
  {
    id: "p1",
    name: "AI Chatbot For College",
    client: "Sankara College of Science & Commerce",
    type: "Development",
    description: "An intelligent virtual assistant designed to streamline college inquiries, course admissions, and 24/7 student support.",
    badge: "Live Production"
  },
  {
    id: "p2",
    name: "Mozhi Translation Chatbot",
    client: "Mozhi Regional AI Initiative",
    type: "Development",
    description: "A specialized multi-lingual translation engine focusing on regional linguistic accuracy and real-time conversation.",
    badge: "AI Application"
  },
  {
    id: "p3",
    name: "EventReg Pro Datathon Engine",
    client: "National Datathon Event Committee",
    type: "Development",
    description: "High-performance registration engine built for large-scale datathons, handling massive concurrent user traffic.",
    badge: "Enterprise Platform"
  },
  {
    id: "p4",
    name: "IoT Smart Hardware Dashboard",
    client: "Smart Automation Systems",
    type: "Development",
    description: "Real-time IoT dashboard integrating ESP32 & Arduino microcontrollers for remote sensor monitoring and relay control.",
    badge: "IoT & Hardware"
  },
  {
    id: "p5",
    name: "AI Cinematic Video Reel",
    client: "Aura Creative Studios",
    type: "Design",
    description: "Advanced AI-generated video production merging neural style transfer with professional post-production and editing.",
    badge: "Generative AI"
  },
  {
    id: "p6",
    name: "Aura Brand Identity & Design System",
    client: "Tech Startups & Corporate Clients",
    type: "Design",
    description: "Full visual brand system including logo architecture, typography standards, and color palettes for modern tech companies.",
    badge: "Branding"
  },
  {
    id: "p7",
    name: "Fintech Enterprise Dashboard UI",
    client: "Financial Banking Corporation",
    type: "Design",
    description: "A comprehensive UI/UX dashboard overhaul for banking applications focusing on accessibility and real-time data visualization.",
    badge: "UI/UX Architecture"
  }
];

export const FAQ_DATA = [
  {
    question: "What is the typical turnaround time for a project?",
    answer: "Project timelines vary by complexity. A standard business website usually takes 2-4 weeks, while complex custom software or AI integrations may range from 2 to 4 months."
  },
  {
    question: "Do you offer post-launch support and maintenance?",
    answer: "Yes, we provide flexible support packages ensuring your platforms stay secure, updated, and optimized as your business grows."
  },
  {
    question: "Can you help with legacy system migration?",
    answer: "Absolutely. Our engineering team specializes in modernizing legacy architectures and migrating data to high-performance cloud environments like Supabase or AWS."
  },
  {
    question: "Is AI integration right for my small business?",
    answer: "AI can benefit businesses of all sizes. From automated customer support chatbots to data-driven insights, we tailor AI solutions that provide direct ROI."
  }
];

export const PROJECT_TYPES = [
  "Website",
  "Application",
  "AI Chatbot",
  "IoT Project",
  "Logo",
  "Poster",
  "UI/UX (for website or app)",
  "Software",
  "Video Editing",
  "Data Visualization",
  "AI Video"
];

export function matchProjectType(title) {
  if (!title) return PROJECT_TYPES[0];
  if (PROJECT_TYPES.includes(title)) return title;
  const lower = title.toLowerCase();
  if (lower.includes('chatbot') || lower.includes('bot')) return 'AI Chatbot';
  if (lower.includes('iot') || lower.includes('hardware') || lower.includes('sensor') || lower.includes('esp32')) return 'IoT Project';
  if (lower.includes('ai video') || lower.includes('cinematic')) return 'AI Video';
  if (lower.includes('video')) return 'Video Editing';
  if (lower.includes('ui') || lower.includes('ux') || (lower.includes('design') && lower.includes('app'))) return 'UI/UX (for website or app)';
  if (lower.includes('logo') || lower.includes('branding') || lower.includes('brand') || lower.includes('identity')) return 'Logo';
  if (lower.includes('poster')) return 'Poster';
  if (lower.includes('data') || lower.includes('visualization') || lower.includes('chart')) return 'Data Visualization';
  if (lower.includes('flutter') || lower.includes('mobile') || lower.includes('app') || lower.includes('datathon')) return 'Application';
  if (lower.includes('software') || lower.includes('backend') || lower.includes('saas') || lower.includes('enterprise')) return 'Software';
  if (lower.includes('web') || lower.includes('site') || lower.includes('frontend')) return 'Website';
  return PROJECT_TYPES[0];
}

export const TEAM_MEMBERS = [
  {
    id: "tm1",
    name: "NIRANJAN A",
    role: "FOUNDER & CEO",
    tagline: "Visionary leadership & core strategic engineering.",
    image: "/team/niranjan.jpg",
    badge: "Founder & CEO",
    color: "from-amber-500 to-amber-700",
    bio: "Pioneering the vision, technical roadmap, and architectural backbone of AURA TECH. Niranjan leads core engineering teams across full-stack cloud ecosystems, enterprise web platforms, and client system integrations.",
    specialization: "Enterprise Full Stack Architecture & Executive Leadership",
    skills: ["System Architecture", "Full Stack Engineering", "Cloud Infrastructure", "Product Strategy", "Technical Leadership"],
    experience: "Founder & Lead Architect",
    contributions: "Drives end-to-end digital transformation, oversees all tech deliverables, and orchestrates core project executions."
  },
  {
    id: "tm2",
    name: "MAKIZH N",
    role: "OPERATIONS MANAGER",
    tagline: "Project management, operational workflow & client relations.",
    image: "/team/makizh.jpg",
    badge: "Operations Manager",
    color: "from-blue-500 to-indigo-600",
    bio: "Orchestrating agile delivery sprints, cross-departmental alignment, and seamless client interactions. Makizh ensures projects transition from initial inquiry to final handover with precision and timeliness.",
    specialization: "Agile Project Delivery, Operations & Client Success",
    skills: ["Project Management", "Sprint Planning", "Client Relations", "Workflow Optimization", "Quality Assurance"],
    experience: "Operations & Delivery Head",
    contributions: "Coordinates developer-designer milestones, streamlines client requirements, and maintains operational SLA excellence."
  },
  {
    id: "tm3",
    name: "DHANYA D",
    role: "FULL STACK / SAAS DEVELOPER",
    tagline: "SaaS architecture, cloud APIs & full stack software.",
    image: "/team/dhanya.jpg",
    badge: "SaaS Developer",
    color: "from-purple-500 to-indigo-600",
    bio: "Architecting robust SaaS backends and dynamic web interfaces. Dhanya specializes in high-concurrency database designs, modern RESTful APIs, and scalable user-facing web applications.",
    specialization: "Cloud SaaS Development, REST APIs & Database Engineering",
    skills: ["React.js", "Node.js", "SaaS Systems", "PostgreSQL / SQL", "RESTful APIs", "State Management"],
    experience: "Senior Software Engineer",
    contributions: "Engineered high-performance web applications, client dashboards, and automated database sync workflows."
  },
  {
    id: "tm4",
    name: "PRIYANKA S",
    role: "FULL STACK / AI VIDEO EDITOR",
    tagline: "Generative AI video pipelines & full stack web applications.",
    image: "/team/priyanka.jpg",
    badge: "AI & Full Stack",
    color: "from-pink-500 to-rose-600",
    bio: "Pushing the frontiers of Generative AI in visual media alongside full-stack development. Priyanka builds creative web tools and automated video pipelines that fuse neural styling with cinematic polish.",
    specialization: "Generative AI Pipelines & Full Stack Web Apps",
    skills: ["Generative AI", "AI Video Editing", "Full Stack Development", "Python / Web Services", "Visual Storytelling"],
    experience: "AI & Full Stack Specialist",
    contributions: "Developed AI video production reels, automated media transformations, and modern interactive frontend modules."
  },
  {
    id: "tm5",
    name: "VENGATESHWARAN N",
    role: "FULL STACK / IOT DEVELOPER",
    tagline: "Hardware integration, microcontrollers (ESP32/Arduino) & IoT dashboards.",
    image: "/team/vengateshwaran.jpg",
    badge: "IoT Lead",
    color: "from-emerald-500 to-teal-600",
    bio: "Bridging the physical and digital divide through embedded hardware integration. Vengateshwaran connects microcontrollers and sensory systems with cloud-connected telemetry dashboards and automation relays.",
    specialization: "Embedded IoT Architecture, ESP32/Arduino & Cloud Telemetry",
    skills: ["IoT Architecture", "ESP32 & Arduino", "Sensor Integration", "Real-Time Telemetry", "Full Stack Dashboards"],
    experience: "Hardware & IoT Systems Lead",
    contributions: "Constructed real-time hardware telemetry dashboards, sensor networking nodes, and smart automated control units."
  },
  {
    id: "tm6",
    name: "HARIHARAN S",
    role: "DESIGNER / VIDEO EDITOR",
    tagline: "Visual identity, UI/UX aesthetics & cinematic post-production.",
    image: "/team/hariharan.jpg",
    badge: "Design Lead",
    color: "from-amber-400 to-orange-600",
    bio: "The creative architect behind AURA TECH's visual excellence. Hariharan designs modern UI/UX design systems, bespoke brand visual guidelines, and cinematic post-production promotional reels.",
    specialization: "UI/UX Design Systems, Brand Identity & Cinematic Editing",
    skills: ["UI/UX Design", "Figma", "Cinematic Video Editing", "Design Systems", "Motion Graphics", "Brand Architecture"],
    experience: "Lead UI/UX & Creative Designer",
    contributions: "Designed the modern visual language of AURA TECH platforms, crafted brand systems, and directed cinematic media."
  },
  {
    id: "tm7",
    name: "PRAVEEN RAJA G",
    role: "DESIGNER / CONTENT WRITER",
    tagline: "Brand copywriting, creative layout & strategic content.",
    image: "/team/praveen.jpg",
    badge: "Creative & Content",
    color: "from-cyan-500 to-blue-600",
    bio: "Combining strategic messaging with artistic layout design. Praveen shapes brand narratives, user engagement documentation, editorial collateral, and marketing graphic layouts for enterprise and academic clients.",
    specialization: "Creative Copywriting, Graphic Design & Content Strategy",
    skills: ["Brand Copywriting", "Content Architecture", "Graphic Layout", "Technical Writing", "Creative Strategy"],
    experience: "Content & Design Strategist",
    contributions: "Authored brand copy architectures, project documentation systems, and creative visual presentation decks."
  }
];

export const CLIENTS_DATA = [
  {
    id: "c1",
    brandName: "SISC COIR",
    companyName: "South Indian Coir Substrates Private Limited",
    industryBadge: "Coir Manufacturing & Agricultural Substrates",
    category: "Manufacturing & Agriculture",
    website: "https://southindiancoir.com/",
    displayUrl: "southindiancoir.com",
    location: "Tamil Nadu, India",
    companyOverview: "South Indian Coir Substrates Private Limited (SISC COIR) is a distinguished enterprise operating in the natural coir and agricultural substrate sector. The business produces eco-friendly, high-grade coconut coir growing media engineered for horticulture, floriculture, commercial greenhouse cultivation, hydroponics, and soil conditioning.",
    businessAreas: [
      "Coir and coco peat products",
      "Agricultural and horticultural growing substrates",
      "Hydroponics and greenhouse cultivation inputs",
      "Natural coconut fibre products",
      "B2B bulk supply and export-oriented product distribution"
    ],
    productCategories: [
      "Coco peat blocks and compressed growing media",
      "Coir grow bags and grow slabs for greenhouse cultivation",
      "Coco chips and premium growing-media components",
      "Natural coir fibre and machine-spun coir yarn",
      "Tailored agricultural coir substrate solutions"
    ],
    auraDeliverable: {
      category: "Corporate Website Development & Digital Presence",
      title: "Corporate Website Development & Digital Presence",
      description: "AURA TECH supported the digital presentation of SISC COIR through an elegant, high-performance corporate business website showcasing the company's full coir product catalogue, technical parameters, and global business enquiry channels.",
      features: [
        "Responsive corporate website layout optimized for mobile, tablet, and desktop",
        "Interactive product catalogue with structured specification pages",
        "Automated B2B business enquiry capture form",
        "Direct WhatsApp Business instant messaging integration",
        "Technical SEO setup, meta-tag architecture, and performance optimization"
      ]
    },
    natureOfBusinessNote: "Coir manufacturing, substrate processing, and bulk export represent SISC COIR's business operations; AURA TECH delivered corporate web engineering and digital presence architecture."
  },
  {
    id: "c2",
    brandName: "InfoPluto Media Works",
    companyName: "InfoPluto Media Works Private Limited",
    industryBadge: "Media, Entertainment & Technology",
    category: "Media & Entertainment",
    website: "https://www.infopluto.com/",
    displayUrl: "infopluto.com",
    associatedPlatform: {
      name: "IndieMa.in",
      url: "https://indiema.in/",
      displayUrl: "indiema.in",
      description: "An innovative social networking and digital creative platform associated with InfoPluto Media Works."
    },
    location: "RS Puram, Coimbatore, Tamil Nadu, India",
    founder: "Arun Kanth",
    companyType: "Private Limited Company",
    companyOverview: "InfoPluto Media Works Private Limited is an innovative media and technology company blending creative media production, software and digital platform development, digital publishing, and advanced technology-driven services. Its business positioning bridges modern cinematic production with cutting-edge digital software systems.",
    businessAreas: [
      "Media and entertainment production",
      "Media technology and digital platform engineering",
      "Artificial intelligence-enabled content production",
      "Software and web application development",
      "OTT and video-streaming platform technology",
      "Digital and print publishing services",
      "Cloud hosting, DNS, SSL, and web infrastructure",
      "Advertising, creative design, and branding production"
    ],
    serviceAreas: [
      "AI-assisted video, advertising, and creative content production",
      "Custom websites, software applications, and digital platforms",
      "OTT and video streaming platform solutions",
      "Mobile applications and modern web portals",
      "Domain, hosting, DNS, SSL, and server infrastructure services",
      "Digital and print publishing distribution",
      "Strategic digital marketing and advertising solutions"
    ],
    auraDeliverable: {
      category: "Digital Technology & Media Solutions",
      title: "Digital Technology & Media Solutions Collaboration",
      description: "InfoPluto is a media technology business working across digital content, software platforms, AI-enabled production, and publishing. AURA TECH collaborates on digital technology architectures, AI-assisted media workflows, and high-performance digital platform solutions.",
      features: [
        "Digital technology and media platform architecture consulting",
        "AI-assisted creative workflow technical support and integrations",
        "Custom software and scalable platform infrastructure",
        "Digital content infrastructure and streaming systems consultation"
      ]
    },
    natureOfBusinessNote: "Media production, publishing, and creative entertainment represent InfoPluto's business operations; AURA TECH collaborates on digital software engineering and technical platform solutions."
  }
];
