import { 
  Employee, Client, Project, Task, TaskProgressLog, 
  Invoice, Payment, AuditLog, NotificationItem, WorkReportFilter, TaskStatus, TaskPriority 
} from './crmTypes';
import { supabase } from './supabase';
import { CrmSnapshot, disableCrmPersistence, initializeCrmDatabase, persistCrmSnapshot } from './crmSupabasePersistence';

const EMPLOYEES_KEY = 'aura_crm_employees';
const CLIENTS_KEY = 'aura_crm_clients';
const PROJECTS_KEY = 'aura_crm_projects';
const TASKS_KEY = 'aura_crm_tasks';
const PROGRESS_LOGS_KEY = 'aura_crm_progress_logs';
const INVOICES_KEY = 'aura_crm_invoices';
const PAYMENTS_KEY = 'aura_crm_payments';
const AUDIT_LOGS_KEY = 'aura_crm_audit_logs';
const NOTIFICATIONS_KEY = 'aura_crm_notifications';

function uniqueRecords<T>(records: T[], identityKeys: (record: T) => string[]): T[] {
  const seen = new Set<string>();
  return records.filter(record => {
    const keys = identityKeys(record).filter(Boolean);
    if (keys.some(key => seen.has(key))) return false;
    keys.forEach(key => seen.add(key));
    return true;
  });
}

// 7 Aura Tech Core Employees (Matching constants.tsx & public/team images)
export const DEFAULT_EMPLOYEES: Employee[] = [
  {
    id: 'EMP001',
    name: 'Niranjan',
    email: 'niranjan.auratech@gmail.com',
    phone: '+91 9025255617',
    designation: 'Full-Stack Developer',
    department: 'Software Engineering',
    skills: ['React', 'Node.js', 'PostgreSQL', 'Cloud Architecture'],
    avatar: '/team/niranjan.jpg',
    active: true,
    joinedDate: '2024-01-15'
  },
  {
    id: 'EMP002',
    name: 'Makizh',
    email: 'makizh.auratech@gmail.com',
    phone: '+91 9786943535',
    designation: 'Full-Stack Developer & Lead',
    department: 'Software Engineering',
    skills: ['React', 'TypeScript', 'Supabase', 'Python', 'DevOps'],
    avatar: '/team/makizh.jpg',
    active: true,
    joinedDate: '2024-01-10'
  },
  {
    id: 'EMP003',
    name: 'Hariharan',
    email: 'hariharan.auratech@gmail.com',
    phone: '+91 93452 56633',
    designation: 'Full-Stack Developer & Video Editor',
    department: 'Creative & Engineering',
    skills: ['Web Development', 'Video Editing', 'Premiere Pro', 'UI Design'],
    avatar: '/team/hariharan.jpg',
    active: true,
    joinedDate: '2024-02-01'
  },
  {
    id: 'EMP004',
    name: 'Priyanka',
    email: 'priyanka.auratech@gmail.com',
    phone: '+91 99946 85359',
    designation: 'UI/UX Designer & Video Editor',
    department: 'Design Studio',
    skills: ['Figma', 'UI/UX Design', 'Motion Design', 'Video Production'],
    avatar: '/team/priyanka.jpg',
    active: true,
    joinedDate: '2024-02-15'
  },
  {
    id: 'EMP005',
    name: 'Dhanya',
    email: 'dhanyadass.auratech@gmail.com',
    phone: '+91 91509 60105',
    designation: 'Full-Stack Developer & Web Designer',
    department: 'Software Engineering',
    skills: ['Frontend Architecture', 'TailwindCSS', 'REST APIs', 'Web Design'],
    avatar: '/team/dhanya.jpg',
    active: true,
    joinedDate: '2024-03-01'
  },
  {
    id: 'EMP006',
    name: 'Praveen Raja',
    email: 'praveenraja.auratech@gmail.com',
    phone: '+91 90928 88502',
    designation: 'UI/UX Designer & Script Writer',
    department: 'Creative & Strategy',
    skills: ['Wireframing', 'Prototyping', 'Creative Scripting', 'Design Systems'],
    avatar: '/team/praveen.jpg',
    active: true,
    joinedDate: '2024-03-10'
  },
  {
    id: 'EMP007',
    name: 'Vengateshwaran',
    email: 'vengat.auratech@gmail.com',
    phone: '+91 93420 85829',
    designation: 'Frontend Developer & Designer',
    department: 'Frontend Engineering',
    skills: ['React', 'JavaScript', 'CSS Animations', 'Responsive Layouts'],
    avatar: '/team/vengateshwaran.jpg',
    active: true,
    joinedDate: '2024-03-15'
  }
];

export const DEFAULT_CLIENTS: Client[] = [
  {
    id: 'CLI-1001',
    name: 'Anand Kumar',
    company: 'Apex Retailers Pvt Ltd',
    email: 'anand@apexretail.in',
    phone: '+91 98451 22340',
    address: '42, Tech Park Boulevard, Electronic City, Bangalore, KA 560100',
    gstin: '29AABCA1234F1Z5',
    clientType: 'Enterprise',
    status: 'Active',
    totalBudget: 150000,
    createdAt: '2026-09-01T10:00:00Z',
    notes: 'Premium enterprise e-commerce platform with multi-vendor backend.'
  },
  {
    id: 'CLI-1002',
    name: 'Dr. Shalini Menon',
    company: 'Nova Healthcare Diagnostics',
    email: 'contact@novadiagnostics.com',
    phone: '+91 94471 88990',
    address: '12-B, Medical Enclave, Gandhipuram, Coimbatore, TN 641012',
    gstin: '33AABCN5678G1Z2',
    clientType: 'Professional',
    status: 'Active',
    totalBudget: 85000,
    createdAt: '2026-09-10T11:30:00Z',
    notes: 'Telemedicine and report booking portal with SMS notifications.'
  },
  {
    id: 'CLI-1003',
    name: 'Vikram Seth',
    company: 'Horizon FinTech Labs',
    email: 'vikram@horizonfintech.io',
    phone: '+91 98112 34567',
    address: 'Tower 4, Cyber Gateway, Hitec City, Hyderabad, TS 500081',
    gstin: '36AABCH9012K1Z8',
    clientType: 'Enterprise',
    status: 'Active',
    totalBudget: 210000,
    createdAt: '2026-09-18T09:15:00Z',
    notes: 'Financial dashboard and real-time ledger visualization.'
  },
  {
    id: 'CLI-1004',
    name: 'Kavitha Radhakrishnan',
    company: 'EduSpark Global Academy',
    email: 'kavitha@eduspark.edu',
    phone: '+91 97908 12345',
    address: '88, College Road, Anna Nagar, Chennai, TN 600040',
    gstin: '33AABCE3456D1Z1',
    clientType: 'Professional',
    status: 'Active',
    totalBudget: 60000,
    createdAt: '2026-09-25T14:20:00Z',
    notes: 'Campus AI Chatbot for student queries and course registration.'
  },
  {
    id: 'CLI-1005',
    name: 'Rohan Sharma',
    company: 'GreenVibe Organics',
    email: 'rohan@greenvibe.in',
    phone: '+91 96500 77889',
    address: '15, Indiranagar 100ft Road, Bangalore, KA 560038',
    clientType: 'Professional',
    status: 'Lead',
    totalBudget: 45000,
    createdAt: '2026-10-05T16:00:00Z',
    notes: 'Brand visual identity, logo design and storefront.'
  }
];

export const DEFAULT_PROJECTS: Project[] = [
  {
    id: 'PRJ-2001',
    title: 'Apex E-Commerce Platform & Mobile App',
    description: 'High performance multi-vendor web portal with secure payment gateway, inventory sync, and client mobile dashboard.',
    clientId: 'CLI-1001',
    clientName: 'Apex Retailers Pvt Ltd',
    projectType: 'Website',
    budget: 150000,
    status: 'In Progress',
    startDate: '2026-09-05',
    dueDate: '2026-11-20',
    completionPercentage: 72,
    assignedEmployeeIds: ['EMP001', 'EMP002', 'EMP004', 'EMP007'],
    assignedEmployees: [
      { employeeId: 'EMP001', employeeName: 'Niranjan', role: 'Backend Lead', responsibility: 'High-throughput payment APIs & PostgreSQL schema' },
      { employeeId: 'EMP002', employeeName: 'Makizh', role: 'Full-Stack Lead', responsibility: 'System architecture, Supabase auth & order engine' },
      { employeeId: 'EMP004', employeeName: 'Priyanka', role: 'UI/UX Designer', responsibility: 'Design system, interactive checkout mockups' },
      { employeeId: 'EMP007', employeeName: 'Vengateshwaran', role: 'Frontend Developer', responsibility: 'Responsive catalog UI & animated cart drawer' }
    ],
    createdAt: '2026-09-05T10:00:00Z'
  },
  {
    id: 'PRJ-2002',
    title: 'Nova Healthcare Diagnostic Booking Portal',
    description: 'Patient lab test booking, doctor consultation scheduling, and automated PDF test report delivery.',
    clientId: 'CLI-1002',
    clientName: 'Nova Healthcare Diagnostics',
    projectType: 'Application',
    budget: 85000,
    status: 'In Progress',
    startDate: '2026-09-12',
    dueDate: '2026-11-10',
    completionPercentage: 58,
    assignedEmployeeIds: ['EMP003', 'EMP005', 'EMP006'],
    assignedEmployees: [
      { employeeId: 'EMP003', employeeName: 'Hariharan', role: 'Web Developer', responsibility: 'Appointment booking form & video consult widget' },
      { employeeId: 'EMP005', employeeName: 'Dhanya', role: 'Full-Stack Developer', responsibility: 'Patient record management & database encryption' },
      { employeeId: 'EMP006', employeeName: 'Praveen Raja', role: 'UI/UX Designer', responsibility: 'Clean medical design & accessibility compliance' }
    ],
    createdAt: '2026-09-12T11:00:00Z'
  },
  {
    id: 'PRJ-2003',
    title: 'Horizon FinTech Real-Time Analytics Dashboard',
    description: 'Enterprise transaction visualization with interactive charts, fraud detection alerts, and PDF statements.',
    clientId: 'CLI-1003',
    clientName: 'Horizon FinTech Labs',
    projectType: 'Data Visualization',
    budget: 210000,
    status: 'In Progress',
    startDate: '2026-09-20',
    dueDate: '2026-12-15',
    completionPercentage: 45,
    assignedEmployeeIds: ['EMP001', 'EMP002', 'EMP005', 'EMP007'],
    assignedEmployees: [
      { employeeId: 'EMP001', employeeName: 'Niranjan', role: 'Backend Architect', responsibility: 'WebSocket pipeline & real-time streaming queries' },
      { employeeId: 'EMP002', employeeName: 'Makizh', role: 'Tech Lead', responsibility: 'Data models, aggregation engine & cloud scaling' },
      { employeeId: 'EMP005', employeeName: 'Dhanya', role: 'Frontend Engineer', responsibility: 'High-frequency charting & metric tables' },
      { employeeId: 'EMP007', employeeName: 'Vengateshwaran', role: 'Frontend UI', responsibility: 'Dark mode theme & responsive navigation suite' }
    ],
    createdAt: '2026-09-20T09:30:00Z'
  },
  {
    id: 'PRJ-2004',
    title: 'EduSpark Campus AI Virtual Concierge',
    description: 'Intelligent AI chatbot trained on campus handbook, student syllabus, admissions faq, and event timetable.',
    clientId: 'CLI-1004',
    clientName: 'EduSpark Global Academy',
    projectType: 'AI Chatbot',
    budget: 60000,
    status: 'In Progress',
    startDate: '2026-09-28',
    dueDate: '2026-11-05',
    completionPercentage: 80,
    assignedEmployeeIds: ['EMP002', 'EMP003', 'EMP004'],
    assignedEmployees: [
      { employeeId: 'EMP002', employeeName: 'Makizh', role: 'AI & Backend Lead', responsibility: 'LLM RAG embeddings, Gemini API & prompt safety' },
      { employeeId: 'EMP003', employeeName: 'Hariharan', role: 'Integration Developer', responsibility: 'Chatbot embed snippet & speech synthesis' },
      { employeeId: 'EMP004', employeeName: 'Priyanka', role: 'UI Designer', responsibility: 'Chat bubble animations & avatar customization' }
    ],
    createdAt: '2026-09-28T14:00:00Z'
  }
];

export const DEFAULT_TASKS: Task[] = [
  {
    id: 'TSK-3001',
    title: 'Payment Gateway Integration & Webhook Handler',
    description: 'Configure Razorpay & Stripe webhooks with idempotent signature checks and automated invoice status updates.',
    projectId: 'PRJ-2001',
    projectTitle: 'Apex E-Commerce Platform & Mobile App',
    clientId: 'CLI-1001',
    clientName: 'Apex Retailers Pvt Ltd',
    assignedEmployeeId: 'EMP001',
    assignedEmployeeName: 'Niranjan',
    priority: 'Urgent',
    startDate: '2026-09-10',
    dueDate: '2026-10-30',
    estimatedHours: 35,
    actualHours: 30,
    status: 'In Progress',
    completionPercentage: 85,
    adminInstructions: 'Ensure zero payment drop rate and log all gateway verification errors.',
    employeeUpdates: 'Payment webhooks completed and verified in sandbox. Preparing production key switch.',
    weight: 1.5,
    history: [
      { timestamp: '2026-09-10T10:00:00Z', actor: 'Main Admin', action: 'Created task and assigned to Niranjan' },
      { timestamp: '2026-10-15T16:20:00Z', actor: 'Niranjan', action: 'Progress update: 50% -> 85%' }
    ],
    createdAt: '2026-09-10T10:00:00Z',
    updatedAt: '2026-10-15T16:20:00Z'
  },
  {
    id: 'TSK-3002',
    title: 'Multi-Vendor Product Catalog & Search Filtering',
    description: 'Build fast faceted search, category trees, and stock availability monitors.',
    projectId: 'PRJ-2001',
    projectTitle: 'Apex E-Commerce Platform & Mobile App',
    clientId: 'CLI-1001',
    clientName: 'Apex Retailers Pvt Ltd',
    assignedEmployeeId: 'EMP007',
    assignedEmployeeName: 'Vengateshwaran',
    priority: 'High',
    startDate: '2026-09-12',
    dueDate: '2026-10-25',
    estimatedHours: 40,
    actualHours: 38,
    status: 'In Progress',
    completionPercentage: 75,
    adminInstructions: 'Keep responsive filter drawer smooth on mobile viewports.',
    employeeUpdates: 'Filter drawer and search debounce implemented. Writing pagination tests.',
    weight: 1.0,
    history: [
      { timestamp: '2026-09-12T11:00:00Z', actor: 'Main Admin', action: 'Created and assigned to Vengateshwaran' }
    ],
    createdAt: '2026-09-12T11:00:00Z',
    updatedAt: '2026-10-20T14:30:00Z'
  },
  {
    id: 'TSK-3003',
    title: 'High-Fidelity Checkout & Mobile Cart UI/UX',
    description: 'Design complete checkout funnel in Figma including order review, shipping calculation, and discount coupon preview.',
    projectId: 'PRJ-2001',
    projectTitle: 'Apex E-Commerce Platform & Mobile App',
    clientId: 'CLI-1001',
    clientName: 'Apex Retailers Pvt Ltd',
    assignedEmployeeId: 'EMP004',
    assignedEmployeeName: 'Priyanka',
    priority: 'Medium',
    startDate: '2026-09-08',
    dueDate: '2026-09-28',
    estimatedHours: 25,
    actualHours: 24,
    status: 'Completed',
    completionPercentage: 100,
    adminInstructions: 'Follow modern dark and clean aesthetics aligned with Apex branding.',
    employeeUpdates: 'Designs approved by client and shared with engineering team.',
    weight: 1.0,
    history: [
      { timestamp: '2026-09-08T09:00:00Z', actor: 'Main Admin', action: 'Created task' },
      { timestamp: '2026-09-28T18:00:00Z', actor: 'Main Admin', action: 'Approved completed work' }
    ],
    createdAt: '2026-09-08T09:00:00Z',
    updatedAt: '2026-09-28T18:00:00Z'
  },
  {
    id: 'TSK-3004',
    title: 'Patient Diagnostic Report Auto-Generator & Cloud Storage',
    description: 'Generate secure encrypted PDF laboratory test reports with barcode verification and automated patient email delivery.',
    projectId: 'PRJ-2002',
    projectTitle: 'Nova Healthcare Diagnostic Booking Portal',
    clientId: 'CLI-1002',
    clientName: 'Nova Healthcare Diagnostics',
    assignedEmployeeId: 'EMP005',
    assignedEmployeeName: 'Dhanya',
    priority: 'Urgent',
    startDate: '2026-09-15',
    dueDate: '2026-10-28',
    estimatedHours: 30,
    actualHours: 26,
    status: 'In Progress',
    completionPercentage: 65,
    adminInstructions: 'Ensure HIPAA/data privacy compliance and strict access tokens for patient links.',
    employeeUpdates: 'PDF generation template calibrated. Connecting cloud storage bucket.',
    weight: 1.2,
    history: [
      { timestamp: '2026-09-15T10:00:00Z', actor: 'Main Admin', action: 'Created task and assigned to Dhanya' }
    ],
    createdAt: '2026-09-15T10:00:00Z',
    updatedAt: '2026-10-22T17:00:00Z'
  },
  {
    id: 'TSK-3005',
    title: 'Video Consultation WebRTC Component',
    description: 'Integrate browser-based encrypted video consultation between doctor and patient with waiting room countdown.',
    projectId: 'PRJ-2002',
    projectTitle: 'Nova Healthcare Diagnostic Booking Portal',
    clientId: 'CLI-1002',
    clientName: 'Nova Healthcare Diagnostics',
    assignedEmployeeId: 'EMP003',
    assignedEmployeeName: 'Hariharan',
    priority: 'High',
    startDate: '2026-09-18',
    dueDate: '2026-11-02',
    estimatedHours: 35,
    actualHours: 28,
    status: 'In Progress',
    completionPercentage: 55,
    adminInstructions: 'Make sure audio/video mute toggles and screen share work reliably on mobile browsers.',
    employeeUpdates: 'Signaling server hooked up. Testing multi-participant latency.',
    weight: 1.0,
    history: [
      { timestamp: '2026-09-18T14:00:00Z', actor: 'Main Admin', action: 'Assigned to Hariharan' }
    ],
    createdAt: '2026-09-18T14:00:00Z',
    updatedAt: '2026-10-24T12:00:00Z'
  },
  {
    id: 'TSK-3006',
    title: 'Real-Time Financial Ledger & Streaming Chart Widgets',
    description: 'Render sub-second WebSocket transaction tickers and candlestick financial metrics using optimized canvas.',
    projectId: 'PRJ-2003',
    projectTitle: 'Horizon FinTech Real-Time Analytics Dashboard',
    clientId: 'CLI-1003',
    clientName: 'Horizon FinTech Labs',
    assignedEmployeeId: 'EMP002',
    assignedEmployeeName: 'Makizh',
    priority: 'Urgent',
    startDate: '2026-09-22',
    dueDate: '2026-11-15',
    estimatedHours: 50,
    actualHours: 32,
    status: 'In Progress',
    completionPercentage: 60,
    adminInstructions: 'Zero memory leaks during continuous 8-hour browser execution.',
    employeeUpdates: 'Canvas chart renderer completed. Benchmarked at 60 FPS with 10k data points.',
    weight: 2.0,
    history: [
      { timestamp: '2026-09-22T09:00:00Z', actor: 'Main Admin', action: 'Assigned to Makizh' }
    ],
    createdAt: '2026-09-22T09:00:00Z',
    updatedAt: '2026-10-25T15:30:00Z'
  },
  {
    id: 'TSK-3007',
    title: 'RAG Knowledge Vector Base & Gemini Prompt Pipeline',
    description: 'Embed university documentation into vector store with contextual chunking and response safety validation.',
    projectId: 'PRJ-2004',
    projectTitle: 'EduSpark Campus AI Virtual Concierge',
    clientId: 'CLI-1004',
    clientName: 'EduSpark Global Academy',
    assignedEmployeeId: 'EMP002',
    assignedEmployeeName: 'Makizh',
    priority: 'High',
    startDate: '2026-09-30',
    dueDate: '2026-10-26',
    estimatedHours: 25,
    actualHours: 25,
    status: 'Under Review',
    completionPercentage: 95,
    adminInstructions: 'Verify bilingual Tamil and English answer accuracy.',
    employeeUpdates: 'Knowledge base ingested with 240 handbook pages. Ready for final admin acceptance.',
    weight: 1.5,
    history: [
      { timestamp: '2026-09-30T10:00:00Z', actor: 'Main Admin', action: 'Assigned to Makizh' },
      { timestamp: '2026-10-26T16:00:00Z', actor: 'Makizh', action: 'Submitted for Admin Review' }
    ],
    createdAt: '2026-09-30T10:00:00Z',
    updatedAt: '2026-10-26T16:00:00Z'
  },
  {
    id: 'TSK-3008',
    title: 'Medical UI Accessibility Overhaul',
    description: 'Review contrast ratios, typography scale, and keyboard navigability across patient test booking steps.',
    projectId: 'PRJ-2002',
    projectTitle: 'Nova Healthcare Diagnostic Booking Portal',
    clientId: 'CLI-1002',
    clientName: 'Nova Healthcare Diagnostics',
    assignedEmployeeId: 'EMP006',
    assignedEmployeeName: 'Praveen Raja',
    priority: 'Low',
    startDate: '2026-10-01',
    dueDate: '2026-10-20',
    estimatedHours: 15,
    actualHours: 14,
    status: 'Completed',
    completionPercentage: 100,
    adminInstructions: 'WCAG AAA contrast adherence.',
    employeeUpdates: 'Accessibility audit score 98/100 on Google Lighthouse.',
    weight: 0.8,
    history: [
      { timestamp: '2026-10-01T11:00:00Z', actor: 'Main Admin', action: 'Assigned to Praveen Raja' },
      { timestamp: '2026-10-20T17:00:00Z', actor: 'Main Admin', action: 'Approved completed work' }
    ],
    createdAt: '2026-10-01T11:00:00Z',
    updatedAt: '2026-10-20T17:00:00Z'
  }
];

export const DEFAULT_PROGRESS_LOGS: TaskProgressLog[] = [
  {
    id: 'LOG-4001',
    taskId: 'TSK-3001',
    taskTitle: 'Payment Gateway Integration & Webhook Handler',
    projectId: 'PRJ-2001',
    projectTitle: 'Apex E-Commerce Platform & Mobile App',
    employeeId: 'EMP001',
    employeeName: 'Niranjan',
    completionPercentage: 45,
    workCompleted: 'Created payment controller, signature verification utility, and test environment credentials setup.',
    workRemaining: 'Webhook idempotency tests and auto refund handlers.',
    timeSpentHours: 12,
    status: 'In Progress',
    blockers: 'Awaiting client production merchant webhook secret.',
    nextPlannedActivity: 'Run mock checkout tests on staging.',
    attachments: [],
    timestamp: '2026-09-20T15:30:00Z'
  },
  {
    id: 'LOG-4002',
    taskId: 'TSK-3001',
    taskTitle: 'Payment Gateway Integration & Webhook Handler',
    projectId: 'PRJ-2001',
    projectTitle: 'Apex E-Commerce Platform & Mobile App',
    employeeId: 'EMP001',
    employeeName: 'Niranjan',
    completionPercentage: 85,
    workCompleted: 'Completed Razorpay webhook listeners. Successfully processed 20 automated test transactions with status sync to invoices.',
    workRemaining: 'Final client acceptance testing and live webhook endpoint registration.',
    timeSpentHours: 18,
    status: 'In Progress',
    blockers: 'None',
    nextPlannedActivity: 'Conduct final load test with 50 concurrent transactions.',
    attachments: [],
    timestamp: '2026-10-15T16:20:00Z'
  },
  {
    id: 'LOG-4003',
    taskId: 'TSK-3004',
    taskTitle: 'Patient Diagnostic Report Auto-Generator & Cloud Storage',
    projectId: 'PRJ-2002',
    projectTitle: 'Nova Healthcare Diagnostic Booking Portal',
    employeeId: 'EMP005',
    employeeName: 'Dhanya',
    completionPercentage: 65,
    workCompleted: 'Designed PDF layout template, header branding, and lab reference values table.',
    workRemaining: 'Automated email dispatch with password-protected attachment.',
    timeSpentHours: 14,
    status: 'In Progress',
    blockers: 'Need hospital lab director signature asset for the stamp block.',
    nextPlannedActivity: 'Configure SMTP credentials for report mailing.',
    attachments: [],
    timestamp: '2026-10-22T17:00:00Z'
  },
  {
    id: 'LOG-4004',
    taskId: 'TSK-3007',
    taskTitle: 'RAG Knowledge Vector Base & Gemini Prompt Pipeline',
    projectId: 'PRJ-2004',
    projectTitle: 'EduSpark Campus AI Virtual Concierge',
    employeeId: 'EMP002',
    employeeName: 'Makizh',
    completionPercentage: 95,
    workCompleted: 'Ingested 240 handbook pages into vector embeddings. Verified 98% accuracy on syllabus questions.',
    workRemaining: 'Admin walkthrough and review.',
    timeSpentHours: 25,
    status: 'Under Review',
    blockers: 'None',
    nextPlannedActivity: 'Present demo to college dean and registrar.',
    attachments: [],
    timestamp: '2026-10-26T16:00:00Z'
  }
];

export const DEFAULT_INVOICES: Invoice[] = [
  {
    id: 'INV-5001',
    invoiceNumber: 'AT-INV-2026-001',
    invoiceDate: '2026-09-08',
    dueDate: '2026-09-22',
    clientId: 'CLI-1001',
    clientName: 'Anand Kumar',
    clientCompany: 'Apex Retailers Pvt Ltd',
    clientEmail: 'anand@apexretail.in',
    clientPhone: '+91 98451 22340',
    clientAddress: '42, Tech Park Boulevard, Electronic City, Bangalore, KA 560100',
    clientGstin: '29AABCA1234F1Z5',
    projectId: 'PRJ-2001',
    projectTitle: 'Apex E-Commerce Platform & Mobile App',
    items: [
      { id: '1', description: 'Phase 1: Architecture, UI/UX Design System & Mobile Prototypes', quantity: 1, unitPrice: 50000, amount: 50000 },
      { id: '2', description: 'Phase 2: Full-Stack Multi-Vendor Development & Database Setup', quantity: 1, unitPrice: 70000, amount: 70000 }
    ],
    subtotal: 120000,
    discountRate: 5,
    discountAmount: 6000,
    taxRate: 18,
    taxAmount: 20520,
    totalAmount: 134520,
    paidAmount: 134520,
    outstandingBalance: 0,
    status: 'Paid',
    paymentInstructions: 'Bank: HDFC Bank | A/C: 50200089271632 | IFSC: HDFC0001234 | UPI: auratech@hdfcbank',
    notes: 'Payment received in full with thanks. Work actively progressing into final stage.',
    createdAt: '2026-09-08T10:00:00Z'
  },
  {
    id: 'INV-5002',
    invoiceNumber: 'AT-INV-2026-002',
    invoiceDate: '2026-09-15',
    dueDate: '2026-10-15',
    clientId: 'CLI-1002',
    clientName: 'Dr. Shalini Menon',
    clientCompany: 'Nova Healthcare Diagnostics',
    clientEmail: 'contact@novadiagnostics.com',
    clientPhone: '+91 94471 88990',
    clientAddress: '12-B, Medical Enclave, Gandhipuram, Coimbatore, TN 641012',
    clientGstin: '33AABCN5678G1Z2',
    projectId: 'PRJ-2002',
    projectTitle: 'Nova Healthcare Diagnostic Booking Portal',
    items: [
      { id: '1', description: 'Patient Appointment Booking Engine & Consultation Scheduling', quantity: 1, unitPrice: 45000, amount: 45000 },
      { id: '2', description: 'Automated Diagnostic Report Generator & HIPAA Secure Cloud Storage', quantity: 1, unitPrice: 35000, amount: 35000 }
    ],
    subtotal: 80000,
    discountRate: 0,
    discountAmount: 0,
    taxRate: 18,
    taxAmount: 14400,
    totalAmount: 94400,
    paidAmount: 50000,
    outstandingBalance: 44400,
    status: 'Partially Paid',
    paymentInstructions: 'Bank: HDFC Bank | A/C: 50200089271632 | IFSC: HDFC0001234 | UPI: auratech@hdfcbank',
    notes: 'Advance installment received. Balance payable upon completion of Phase 2.',
    createdAt: '2026-09-15T12:00:00Z'
  },
  {
    id: 'INV-5003',
    invoiceNumber: 'AT-INV-2026-003',
    invoiceDate: '2026-10-02',
    dueDate: '2026-10-25',
    clientId: 'CLI-1003',
    clientName: 'Vikram Seth',
    clientCompany: 'Horizon FinTech Labs',
    clientEmail: 'vikram@horizonfintech.io',
    clientPhone: '+91 98112 34567',
    clientAddress: 'Tower 4, Cyber Gateway, Hitec City, Hyderabad, TS 500081',
    clientGstin: '36AABCH9012K1Z8',
    projectId: 'PRJ-2003',
    projectTitle: 'Horizon FinTech Real-Time Analytics Dashboard',
    items: [
      { id: '1', description: 'Real-time WebSocket Streaming Engine & Aggregation Pipeline', quantity: 1, unitPrice: 90000, amount: 90000 },
      { id: '2', description: 'High-Frequency Canvas Data Visualization Suite & Dark Obsidian UI', quantity: 1, unitPrice: 80000, amount: 80000 }
    ],
    subtotal: 170000,
    discountRate: 10,
    discountAmount: 17000,
    taxRate: 18,
    taxAmount: 27540,
    totalAmount: 180540,
    paidAmount: 0,
    outstandingBalance: 180540,
    status: 'Overdue',
    paymentInstructions: 'Bank: HDFC Bank | A/C: 50200089271632 | IFSC: HDFC0001234 | UPI: auratech@hdfcbank',
    notes: 'Invoice overdue by 3 days. Reminder email dispatched to finance department.',
    createdAt: '2026-10-02T10:00:00Z'
  },
  {
    id: 'INV-5004',
    invoiceNumber: 'AT-INV-2026-004',
    invoiceDate: '2026-10-10',
    dueDate: '2026-11-10',
    clientId: 'CLI-1004',
    clientName: 'Kavitha Radhakrishnan',
    clientCompany: 'EduSpark Global Academy',
    clientEmail: 'kavitha@eduspark.edu',
    clientPhone: '+91 97908 12345',
    clientAddress: '88, College Road, Anna Nagar, Chennai, TN 600040',
    clientGstin: '33AABCE3456D1Z1',
    projectId: 'PRJ-2004',
    projectTitle: 'EduSpark Campus AI Virtual Concierge',
    items: [
      { id: '1', description: 'Campus AI Chatbot RAG System & LLM Prompt Engineering', quantity: 1, unitPrice: 40000, amount: 40000 },
      { id: '2', description: 'Bilingual Tamil / English Knowledge Embeddings & Campus Web Widget', quantity: 1, unitPrice: 15000, amount: 15000 }
    ],
    subtotal: 55000,
    discountRate: 10,
    discountAmount: 5500,
    taxRate: 18,
    taxAmount: 8910,
    totalAmount: 58410,
    paidAmount: 58410,
    outstandingBalance: 0,
    status: 'Paid',
    paymentInstructions: 'Bank: HDFC Bank | A/C: 50200089271632 | IFSC: HDFC0001234 | UPI: auratech@hdfcbank',
    notes: 'Paid via RTGS. Invoice settled.',
    createdAt: '2026-10-10T14:00:00Z'
  }
];

export const DEFAULT_PAYMENTS: Payment[] = [
  {
    id: 'PAY-6001',
    invoiceId: 'INV-5001',
    invoiceNumber: 'AT-INV-2026-001',
    clientId: 'CLI-1001',
    clientName: 'Anand Kumar (Apex Retailers)',
    projectId: 'PRJ-2001',
    amount: 134520,
    paymentDate: '2026-09-12',
    paymentMethod: 'Bank Transfer',
    transactionReference: 'HDFC-RTGS-981273948',
    notes: 'Full payment received against invoice AT-INV-2026-001.',
    recordedBy: 'Main Admin',
    createdAt: '2026-09-12T16:00:00Z'
  },
  {
    id: 'PAY-6002',
    invoiceId: 'INV-5002',
    invoiceNumber: 'AT-INV-2026-002',
    clientId: 'CLI-1002',
    clientName: 'Dr. Shalini Menon (Nova Healthcare)',
    projectId: 'PRJ-2002',
    amount: 50000,
    paymentDate: '2026-09-20',
    paymentMethod: 'UPI',
    transactionReference: 'UPI-REF-238491823719',
    notes: 'First milestone advance received via UPI.',
    recordedBy: 'Main Admin',
    createdAt: '2026-09-20T11:30:00Z'
  },
  {
    id: 'PAY-6003',
    invoiceId: 'INV-5004',
    invoiceNumber: 'AT-INV-2026-004',
    clientId: 'CLI-1004',
    clientName: 'Kavitha Radhakrishnan (EduSpark)',
    projectId: 'PRJ-2004',
    amount: 58410,
    paymentDate: '2026-10-14',
    paymentMethod: 'Bank Transfer',
    transactionReference: 'SBI-NEFT-883719234',
    notes: 'Full settlement for AI Chatbot deployment.',
    recordedBy: 'Main Admin',
    createdAt: '2026-10-14T15:00:00Z'
  }
];

export const DEFAULT_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'AUD-7001',
    action: 'Task Reassigned',
    actor: 'Main Admin',
    actorRole: 'admin',
    entityType: 'Task',
    entityId: 'TSK-3001',
    details: 'Reassigned task priority to Urgent and updated milestone due date to 2026-10-30.',
    timestamp: '2026-10-12T10:15:00Z'
  },
  {
    id: 'AUD-7002',
    action: 'Work Progress Submitted',
    actor: 'Niranjan (EMP001)',
    actorRole: 'employee',
    entityType: 'Progress',
    entityId: 'TSK-3001',
    details: 'Submitted 85% progress: completed payment webhooks and verified test orders.',
    timestamp: '2026-10-15T16:20:00Z'
  },
  {
    id: 'AUD-7003',
    action: 'Payment Recorded',
    actor: 'Main Admin',
    actorRole: 'admin',
    entityType: 'Payment',
    entityId: 'PAY-6003',
    details: 'Recorded payment of Rs 58,410 from EduSpark Academy against AT-INV-2026-004.',
    timestamp: '2026-10-14T15:00:00Z'
  },
  {
    id: 'AUD-7004',
    action: 'Project Created',
    actor: 'Main Admin',
    actorRole: 'admin',
    entityType: 'Project',
    entityId: 'PRJ-2004',
    details: 'Created EduSpark Campus AI Concierge and distributed to Makizh, Hariharan & Priyanka.',
    timestamp: '2026-09-28T14:00:00Z'
  }
];

export const DEFAULT_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'NOTIF-8001',
    recipientEmployeeId: 'EMP001',
    title: 'Urgent Priority Updated',
    message: 'Main Admin elevated task "Payment Gateway Integration" priority to Urgent.',
    type: 'assignment',
    read: false,
    createdAt: '2026-10-12T10:15:00Z'
  },
  {
    id: 'NOTIF-8002',
    recipientEmployeeId: 'EMP002',
    title: 'New Project Assignment',
    message: 'You have been assigned as Lead for project "EduSpark Campus AI Virtual Concierge".',
    type: 'assignment',
    read: true,
    createdAt: '2026-09-28T14:00:00Z'
  },
  {
    id: 'NOTIF-8003',
    recipientEmployeeId: 'EMP005',
    title: 'Upcoming Deadline Reminder',
    message: 'Task "Patient Diagnostic Report Auto-Generator" is due on 2026-10-28.',
    type: 'deadline',
    read: false,
    createdAt: '2026-10-24T09:00:00Z'
  }
];

class CrmDbService {
  private cloudInitialization: Promise<void> | null = null;

  private initStorage() {
    if (typeof window === 'undefined') return;

    if (!localStorage.getItem(EMPLOYEES_KEY)) {
      localStorage.setItem(EMPLOYEES_KEY, JSON.stringify(DEFAULT_EMPLOYEES));
    }
    if (!localStorage.getItem(CLIENTS_KEY)) {
      localStorage.setItem(CLIENTS_KEY, JSON.stringify(DEFAULT_CLIENTS));
    }
    if (!localStorage.getItem(PROJECTS_KEY)) {
      localStorage.setItem(PROJECTS_KEY, JSON.stringify(DEFAULT_PROJECTS));
    }
    if (!localStorage.getItem(TASKS_KEY)) {
      localStorage.setItem(TASKS_KEY, JSON.stringify(DEFAULT_TASKS));
    }
    if (!localStorage.getItem(PROGRESS_LOGS_KEY)) {
      localStorage.setItem(PROGRESS_LOGS_KEY, JSON.stringify(DEFAULT_PROGRESS_LOGS));
    }
    if (!localStorage.getItem(INVOICES_KEY)) {
      localStorage.setItem(INVOICES_KEY, JSON.stringify(DEFAULT_INVOICES));
    }
    if (!localStorage.getItem(PAYMENTS_KEY)) {
      localStorage.setItem(PAYMENTS_KEY, JSON.stringify(DEFAULT_PAYMENTS));
    }
    if (!localStorage.getItem(AUDIT_LOGS_KEY)) {
      localStorage.setItem(AUDIT_LOGS_KEY, JSON.stringify(DEFAULT_AUDIT_LOGS));
    }
    if (!localStorage.getItem(NOTIFICATIONS_KEY)) {
      localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(DEFAULT_NOTIFICATIONS));
    }
  }

  constructor() {
    this.initStorage();
  }

  private saveSnapshot(key: string, records: unknown[]): void {
    const serialized = JSON.stringify(records);
    localStorage.setItem(key, serialized);
    persistCrmSnapshot(key, serialized);
  }

  private getUniqueRecords<T>(
    key: string,
    defaults: T[],
    identityKeys: (record: T) => string[]
  ): T[] {
    this.initStorage();
    try {
      const data = localStorage.getItem(key);
      const parsed: unknown = data ? JSON.parse(data) : defaults;
      const records = Array.isArray(parsed) ? parsed as T[] : defaults;
      const unique = uniqueRecords(records, identityKeys);
      if (unique.length !== records.length) {
        localStorage.setItem(key, JSON.stringify(unique));
      }
      return unique;
    } catch {
      return defaults;
    }
  }

  async initializeCloudDatabase(isAdmin: boolean, employeeId: string): Promise<void> {
    if (this.cloudInitialization) {
      return this.cloudInitialization;
    }

    const defaults: CrmSnapshot = {
      employees: this.getEmployees(),
      clients: this.getClients(),
      projects: this.getProjects(),
      tasks: this.getTasks(),
      progressLogs: this.getProgressLogs(),
      invoices: this.getInvoices(),
      payments: this.getPayments(),
      auditLogs: this.getAuditLogs(),
      notifications: this.getNotifications()
    };
    const keyByCollection: Record<keyof CrmSnapshot, string> = {
      employees: EMPLOYEES_KEY,
      clients: CLIENTS_KEY,
      projects: PROJECTS_KEY,
      tasks: TASKS_KEY,
      progressLogs: PROGRESS_LOGS_KEY,
      invoices: INVOICES_KEY,
      payments: PAYMENTS_KEY,
      auditLogs: AUDIT_LOGS_KEY,
      notifications: NOTIFICATIONS_KEY
    };

    this.cloudInitialization = initializeCrmDatabase(isAdmin, employeeId, defaults, (collection, records) => {
      localStorage.setItem(keyByCollection[collection], JSON.stringify(records));
    });
    try {
      await this.cloudInitialization;
    } finally {
      this.cloudInitialization = null;
    }
  }

  disableCloudPersistence(): void {
    disableCrmPersistence();
  }

  // --- EMPLOYEES ---
  getEmployees(): Employee[] {
    const defaultById = new Map(DEFAULT_EMPLOYEES.map(employee => [employee.id, employee]));
    return this.getUniqueRecords(EMPLOYEES_KEY, DEFAULT_EMPLOYEES, employee => [
      employee.id,
      employee.email?.trim().toLowerCase()
    ]).map(employee => ({
        ...employee,
        email: defaultById.get(employee.id)?.email || employee.email,
        avatar: employee.avatar?.trim() || defaultById.get(employee.id)?.avatar || ''
    }));
  }

  getEmployeeById(id: string): Employee | undefined {
    return this.getEmployees().find(e => e.id === id);
  }

  updateEmployee(updated: Employee): void {
    const list = this.getEmployees().map(e => e.id === updated.id ? updated : e);
    this.saveSnapshot(EMPLOYEES_KEY, list);
    this.addAuditLog({
      action: 'Employee Profile Updated',
      actor: 'Main Admin',
      actorRole: 'admin',
      entityType: 'Employee',
      entityId: updated.id,
      details: `Updated profile details for ${updated.name} (${updated.id})`
    });
  }

  // --- CLIENTS ---
  getClients(): Client[] {
    return this.getUniqueRecords(CLIENTS_KEY, DEFAULT_CLIENTS, client => [
      client.id,
      client.email?.trim().toLowerCase(),
      client.phone?.replace(/\D/g, ''),
      `${client.name?.trim().toLowerCase()}|${client.company?.trim().toLowerCase()}`
    ]).map(client => ({
        ...client,
        clientType: client.clientType === 'Student'
          || client.clientType === 'Professional'
          || client.clientType === 'Enterprise'
          ? client.clientType
          : 'Professional'
    }));
  }

  addClient(client: Omit<Client, 'id' | 'createdAt'>): Client {
    const clients = this.getClients();
    const existing = this.checkClientDuplicate(client.email, client.phone, client.name, client.company);
    if (existing) return existing;
    const id = `CLI-${1000 + clients.length + 1}`;
    const newClient: Client = {
      ...client,
      id,
      createdAt: new Date().toISOString()
    };
    const updated = [newClient, ...clients];
    this.saveSnapshot(CLIENTS_KEY, updated);
    this.addAuditLog({
      action: 'Client Created',
      actor: 'Main Admin',
      actorRole: 'admin',
      entityType: 'Client',
      entityId: id,
      details: `Created new client record for ${client.name} (${client.company})`
    });
    return newClient;
  }

  updateClient(client: Client): void {
    const list = this.getClients().map(c => c.id === client.id ? client : c);
    this.saveSnapshot(CLIENTS_KEY, list);
    this.addAuditLog({
      action: 'Client Updated',
      actor: 'Main Admin',
      actorRole: 'admin',
      entityType: 'Client',
      entityId: client.id,
      details: `Updated client ${client.name} details.`
    });
  }

  // Check potential duplicates
  checkClientDuplicate(email: string, phone: string, name = '', company = ''): Client | undefined {
    const clients = this.getClients();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone.replace(/\D/g, '');
    const cleanName = name.trim().toLowerCase();
    const cleanCompany = company.trim().toLowerCase();
    return clients.find(c => {
      const matchEmail = c.email.trim().toLowerCase() === cleanEmail;
      const matchPhone = cleanPhone && c.phone.replace(/\D/g, '') === cleanPhone;
      const matchNameAndCompany = cleanName && cleanCompany
        && c.name.trim().toLowerCase() === cleanName
        && c.company.trim().toLowerCase() === cleanCompany;
      return matchEmail || matchPhone || matchNameAndCompany;
    });
  }

  // --- PROJECTS ---
  getProjects(): Project[] {
    return this.getUniqueRecords(PROJECTS_KEY, DEFAULT_PROJECTS, project => [
      project.id,
      `${project.clientId}|${project.title?.trim().toLowerCase()}`
    ]);
  }

  getProjectsForEmployee(employeeId: string): Project[] {
    return this.getProjects().filter(p => p.assignedEmployeeIds.includes(employeeId));
  }

  addProject(projectData: Omit<Project, 'id' | 'createdAt' | 'completionPercentage'>): Project {
    const projects = this.getProjects();
    const id = `PRJ-${2000 + projects.length + 1}`;
    const newProject: Project = {
      ...projectData,
      id,
      completionPercentage: 0,
      createdAt: new Date().toISOString()
    };
    const updated = [newProject, ...projects];
    this.saveSnapshot(PROJECTS_KEY, updated);

    // Notify assigned employees
    projectData.assignedEmployeeIds.forEach(empId => {
      this.addNotification({
        recipientEmployeeId: empId,
        title: 'New Project Allocation',
        message: `You have been allocated to work on new project: "${newProject.title}" for client ${newProject.clientName}.`,
        type: 'assignment'
      });
    });

    this.addAuditLog({
      action: 'Project Created',
      actor: 'Main Admin',
      actorRole: 'admin',
      entityType: 'Project',
      entityId: id,
      details: `Created project "${newProject.title}" with ${newProject.assignedEmployeeIds.length} assigned employees.`
    });

    return newProject;
  }

  updateProject(project: Project): void {
    const list = this.getProjects().map(p => p.id === project.id ? project : p);
    this.saveSnapshot(PROJECTS_KEY, list);
    this.addAuditLog({
      action: 'Project Updated',
      actor: 'Main Admin',
      actorRole: 'admin',
      entityType: 'Project',
      entityId: project.id,
      details: `Updated project "${project.title}" details.`
    });
  }

  // --- TASKS ---
  getTasks(): Task[] {
    return this.getUniqueRecords(TASKS_KEY, DEFAULT_TASKS, task => [
      task.id,
      `${task.projectId}|${task.assignedEmployeeId}|${task.title?.trim().toLowerCase()}`
    ]);
  }

  getTasksForEmployee(employeeId: string): Task[] {
    return this.getTasks().filter(t => t.assignedEmployeeId === employeeId);
  }

  addTask(taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'history'>): Task {
    const tasks = this.getTasks();
    const id = `TSK-${3000 + tasks.length + 1}`;
    const now = new Date().toISOString();
    const newTask: Task = {
      ...taskData,
      id,
      history: [
        {
          timestamp: now,
          actor: 'Main Admin',
          action: `Created task and assigned to ${taskData.assignedEmployeeName}`
        }
      ],
      createdAt: now,
      updatedAt: now
    };

    const updated = [newTask, ...tasks];
    this.saveSnapshot(TASKS_KEY, updated);

    // Notify employee
    this.addNotification({
      recipientEmployeeId: newTask.assignedEmployeeId,
      title: 'New Task Assignment',
      message: `You were assigned task "${newTask.title}" for ${newTask.projectTitle}. Priority: ${newTask.priority}, Due: ${newTask.dueDate}`,
      type: 'assignment'
    });

    this.addAuditLog({
      action: 'Task Created',
      actor: 'Main Admin',
      actorRole: 'admin',
      entityType: 'Task',
      entityId: id,
      details: `Created task "${newTask.title}" assigned to ${newTask.assignedEmployeeName}`
    });

    this.recalculateProjectProgress(newTask.projectId);

    return newTask;
  }

  updateTask(task: Task, actor: string = 'Main Admin', role: 'admin' | 'employee' = 'admin'): void {
    const now = new Date().toISOString();
    const tasks = this.getTasks().map(t => {
      if (t.id === task.id) {
        return {
          ...task,
          updatedAt: now
        };
      }
      return t;
    });
    this.saveSnapshot(TASKS_KEY, tasks);

    this.addAuditLog({
      action: 'Task Updated',
      actor,
      actorRole: role,
      entityType: 'Task',
      entityId: task.id,
      details: `Updated task "${task.title}" status to ${task.status} (${task.completionPercentage}%).`
    });

    this.recalculateProjectProgress(task.projectId);
  }

  reassignTask(taskId: string, newEmployeeId: string, actor: string = 'Main Admin', notes?: string): Task | null {
    const tasks = this.getTasks();
    const task = tasks.find(t => t.id === taskId);
    const newEmp = this.getEmployeeById(newEmployeeId);
    if (!task || !newEmp) return null;

    const oldName = task.assignedEmployeeName;
    const oldId = task.assignedEmployeeId;
    const now = new Date().toISOString();

    const historyItem = {
      timestamp: now,
      actor,
      action: `Reassigned from ${oldName} to ${newEmp.name}`,
      from: oldName,
      to: newEmp.name,
      notes: notes || undefined
    };

    const updatedTask: Task = {
      ...task,
      assignedEmployeeId: newEmp.id,
      assignedEmployeeName: newEmp.name,
      history: [historyItem, ...(task.history || [])],
      updatedAt: now
    };

    const list = tasks.map(t => t.id === taskId ? updatedTask : t);
    this.saveSnapshot(TASKS_KEY, list);

    // Notify new employee
    this.addNotification({
      recipientEmployeeId: newEmp.id,
      title: 'Task Reassigned to You',
      message: `Task "${task.title}" for ${task.projectTitle} was reassigned to you. ${notes ? `Notes: ${notes}` : ''}`,
      type: 'assignment'
    });

    // Notify old employee
    this.addNotification({
      recipientEmployeeId: oldId,
      title: 'Task Reassigned',
      message: `Task "${task.title}" was reassigned to ${newEmp.name} by ${actor}.`,
      type: 'assignment'
    });

    this.addAuditLog({
      action: 'Task Reassigned',
      actor,
      actorRole: 'admin',
      entityType: 'Task',
      entityId: taskId,
      details: `Reassigned from ${oldName} to ${newEmp.name}. ${notes ? `Reason: ${notes}` : ''}`
    });

    return updatedTask;
  }

  // --- CONTINUOUS WORK PROGRESS TRACKING (CORE MODULE) ---
  submitProgressUpdate(update: {
    taskId: string;
    employeeId: string;
    employeeName: string;
    completionPercentage: number;
    workCompleted: string;
    workRemaining: string;
    timeSpentHours: number;
    status: TaskStatus;
    blockers?: string;
    nextPlannedActivity?: string;
    attachments?: string[];
  }): TaskProgressLog {
    const tasks = this.getTasks();
    const task = tasks.find(t => t.id === update.taskId);
    if (!task) throw new Error('Task not found');

    const now = new Date().toISOString();
    const logId = `LOG-${4000 + this.getProgressLogs().length + 1}`;

    const newLog: TaskProgressLog = {
      id: logId,
      taskId: task.id,
      taskTitle: task.title,
      projectId: task.projectId,
      projectTitle: task.projectTitle,
      employeeId: update.employeeId,
      employeeName: update.employeeName,
      completionPercentage: update.completionPercentage,
      workCompleted: update.workCompleted,
      workRemaining: update.workRemaining,
      timeSpentHours: update.timeSpentHours,
      status: update.status,
      blockers: update.blockers,
      nextPlannedActivity: update.nextPlannedActivity,
      attachments: update.attachments || [],
      timestamp: now
    };

    // Save to continuous progress logs (never overwrite!)
    const currentLogs = this.getProgressLogs();
    const updatedLogs = [newLog, ...currentLogs];
    this.saveSnapshot(PROGRESS_LOGS_KEY, updatedLogs);

    // Update active task record
    const updatedTask: Task = {
      ...task,
      completionPercentage: update.completionPercentage,
      status: update.status,
      actualHours: (task.actualHours || 0) + (update.timeSpentHours || 0),
      employeeUpdates: update.workCompleted,
      history: [
        {
          timestamp: now,
          actor: update.employeeName,
          action: `Progress updated to ${update.completionPercentage}% (${update.status})`,
          notes: update.workCompleted
        },
        ...(task.history || [])
      ],
      updatedAt: now
    };

    const taskList = tasks.map(t => t.id === task.id ? updatedTask : t);
    this.saveSnapshot(TASKS_KEY, taskList);

    // Recalculate overall project completion %
    this.recalculateProjectProgress(task.projectId);

    // Audit Log
    this.addAuditLog({
      action: 'Work Progress Submitted',
      actor: `${update.employeeName} (${update.employeeId})`,
      actorRole: 'employee',
      entityType: 'Progress',
      entityId: logId,
      details: `Task "${task.title}": ${update.completionPercentage}%, Status: ${update.status}. Time logged: ${update.timeSpentHours}h.`
    });

    // Notify Main Admin
    this.addNotification({
      title: `Progress Update: ${task.title}`,
      message: `${update.employeeName} logged ${update.completionPercentage}% progress (${update.status}). Completed: "${update.workCompleted.substring(0, 80)}..."`,
      type: 'progress'
    });

    return newLog;
  }

  getProgressLogs(taskId?: string, employeeId?: string, projectId?: string): TaskProgressLog[] {
    let logs = this.getUniqueRecords(PROGRESS_LOGS_KEY, DEFAULT_PROGRESS_LOGS, log => [log.id]);
    if (taskId) logs = logs.filter(l => l.taskId === taskId);
    if (employeeId) logs = logs.filter(l => l.employeeId === employeeId);
    if (projectId) logs = logs.filter(l => l.projectId === projectId);
    return logs;
  }

  // --- RECALCULATE PROGRESS ---
  recalculateProjectProgress(projectId: string): number {
    const tasks = this.getTasks().filter(t => t.projectId === projectId);
    if (tasks.length === 0) return 0;

    let totalWeight = 0;
    let weightedSum = 0;

    tasks.forEach(t => {
      const w = t.weight && t.weight > 0 ? t.weight : 1.0;
      totalWeight += w;
      weightedSum += (t.completionPercentage || 0) * w;
    });

    const calculatedProgress = Math.round((weightedSum / totalWeight) * 10) / 10;

    const projects = this.getProjects();
    const updated = projects.map(p => {
      if (p.id === projectId) {
        return {
          ...p,
          completionPercentage: calculatedProgress,
          updatedAt: new Date().toISOString()
        };
      }
      return p;
    });

    this.saveSnapshot(PROJECTS_KEY, updated);
    return calculatedProgress;
  }

  calculateEmployeeMetrics(employeeId: string) {
    const tasks = this.getTasksForEmployee(employeeId);
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'Completed').length;
    const inProgress = tasks.filter(t => t.status === 'In Progress').length;
    const underReview = tasks.filter(t => t.status === 'Under Review').length;
    const revisionReq = tasks.filter(t => t.status === 'Revision Required').length;
    const pending = tasks.filter(t => t.status === 'Not Started').length;
    
    const now = new Date();
    const overdue = tasks.filter(t => {
      if (t.status === 'Completed') return false;
      if (!t.dueDate) return false;
      return new Date(t.dueDate) < now;
    }).length;

    const avgProgress = total > 0 
      ? Math.round(tasks.reduce((sum, t) => sum + (t.completionPercentage || 0), 0) / total)
      : 0;

    const assignedProjects = this.getProjectsForEmployee(employeeId);
    const assignedClientIds = new Set(assignedProjects.map(p => p.clientId));

    const logs = this.getProgressLogs(undefined, employeeId);
    const lastUpdate = logs.length > 0 ? logs[0].timestamp : null;

    return {
      totalTasks: total,
      completedTasks: completed,
      inProgressTasks: inProgress,
      underReviewTasks: underReview,
      revisionRequiredTasks: revisionReq,
      pendingTasks: pending,
      overdueTasks: overdue,
      overallProgress: avgProgress,
      assignedProjectsCount: assignedProjects.length,
      assignedClientsCount: assignedClientIds.size,
      lastUpdate
    };
  }

  // --- INVOICES & PAYMENTS ---
  getInvoices(): Invoice[] {
    return this.getUniqueRecords(INVOICES_KEY, DEFAULT_INVOICES, invoice => [
      invoice.id,
      invoice.invoiceNumber?.trim().toLowerCase()
    ]);
  }

  addInvoice(invoiceData: Omit<Invoice, 'id' | 'createdAt'>): Invoice {
    const invoices = this.getInvoices();
    const id = `INV-${5000 + invoices.length + 1}`;
    const newInvoice: Invoice = {
      ...invoiceData,
      id,
      createdAt: new Date().toISOString()
    };
    const updated = [newInvoice, ...invoices];
    this.saveSnapshot(INVOICES_KEY, updated);

    this.addAuditLog({
      action: 'Invoice Created',
      actor: 'Main Admin',
      actorRole: 'admin',
      entityType: 'Invoice',
      entityId: id,
      details: `Generated invoice ${newInvoice.invoiceNumber} for ${newInvoice.clientName} (Total: ₹${newInvoice.totalAmount.toLocaleString('en-IN')})`
    });

    return newInvoice;
  }

  updateInvoice(invoice: Invoice): void {
    const list = this.getInvoices().map(inv => inv.id === invoice.id ? invoice : inv);
    this.saveSnapshot(INVOICES_KEY, list);
    this.addAuditLog({
      action: 'Invoice Updated',
      actor: 'Main Admin',
      actorRole: 'admin',
      entityType: 'Invoice',
      entityId: invoice.id,
      details: `Updated invoice ${invoice.invoiceNumber}. Status: ${invoice.status}, Outstanding: ₹${invoice.outstandingBalance}`
    });
  }

  getPayments(): Payment[] {
    return this.getUniqueRecords(PAYMENTS_KEY, DEFAULT_PAYMENTS, payment => [
      payment.id,
      payment.transactionReference?.trim().toLowerCase()
    ]);
  }

  recordPayment(paymentData: Omit<Payment, 'id' | 'createdAt'>): Payment {
    const payments = this.getPayments();
    const id = `PAY-${6000 + payments.length + 1}`;
    const newPayment: Payment = {
      ...paymentData,
      id,
      createdAt: new Date().toISOString()
    };

    const updatedPayments = [newPayment, ...payments];
    this.saveSnapshot(PAYMENTS_KEY, updatedPayments);

    // Update associated invoice balance
    const invoices = this.getInvoices();
    const targetInvoice = invoices.find(inv => inv.id === paymentData.invoiceId || inv.invoiceNumber === paymentData.invoiceNumber);

    if (targetInvoice) {
      const newPaid = Number(targetInvoice.paidAmount || 0) + Number(paymentData.amount);
      const newBalance = Math.max(0, Number(targetInvoice.totalAmount) - newPaid);
      let newStatus = targetInvoice.status;
      if (newBalance === 0) {
        newStatus = 'Paid';
      } else if (newPaid > 0) {
        newStatus = 'Partially Paid';
      }

      const updatedInvoice: Invoice = {
        ...targetInvoice,
        paidAmount: newPaid,
        outstandingBalance: newBalance,
        status: newStatus
      };

      const updatedInvoicesList = invoices.map(i => i.id === targetInvoice.id ? updatedInvoice : i);
      this.saveSnapshot(INVOICES_KEY, updatedInvoicesList);
    }

    this.addAuditLog({
      action: 'Payment Recorded',
      actor: paymentData.recordedBy || 'Main Admin',
      actorRole: 'admin',
      entityType: 'Payment',
      entityId: id,
      details: `Recorded ₹${paymentData.amount.toLocaleString('en-IN')} payment from ${paymentData.clientName} via ${paymentData.paymentMethod} (Ref: ${paymentData.transactionReference})`
    });

    return newPayment;
  }

  // --- AUDIT LOGS ---
  getAuditLogs(): AuditLog[] {
    return this.getUniqueRecords(AUDIT_LOGS_KEY, DEFAULT_AUDIT_LOGS, log => [log.id]);
  }

  addAuditLog(log: Omit<AuditLog, 'id' | 'timestamp'>): void {
    const logs = this.getAuditLogs();
    const newEntry: AuditLog = {
      ...log,
      id: `AUD-${7000 + logs.length + 1}`,
      timestamp: new Date().toISOString()
    };
    const updated = [newEntry, ...logs];
    this.saveSnapshot(AUDIT_LOGS_KEY, updated);
  }

  // --- NOTIFICATIONS ---
  getNotifications(employeeId?: string): NotificationItem[] {
    let list = this.getUniqueRecords(NOTIFICATIONS_KEY, DEFAULT_NOTIFICATIONS, notification => [
      notification.id
    ]);
    if (employeeId) {
      list = list.filter(n => !n.recipientEmployeeId || n.recipientEmployeeId === employeeId);
    }
    return list;
  }

  addNotification(notif: Omit<NotificationItem, 'id' | 'createdAt' | 'read'>): void {
    const list = this.getNotifications();
    const newNotif: NotificationItem = {
      ...notif,
      id: `NOTIF-${8000 + list.length + 1}`,
      read: false,
      createdAt: new Date().toISOString()
    };
    const updated = [newNotif, ...list];
    this.saveSnapshot(NOTIFICATIONS_KEY, updated);
  }

  markNotificationRead(id: string): void {
    const list = this.getNotifications().map(n => n.id === id ? { ...n, read: true } : n);
    this.saveSnapshot(NOTIFICATIONS_KEY, list);
  }

  // --- COMPREHENSIVE BUSINESS OVERVIEW STATS (FOR MAIN ADMIN DASHBOARD) ---
  getBusinessOverview() {
    const employees = this.getEmployees();
    const clients = this.getClients();
    const projects = this.getProjects();
    const tasks = this.getTasks();
    const invoices = this.getInvoices();
    const payments = this.getPayments();

    const activeClients = clients.filter(c => c.status === 'Active').length;
    const totalProjects = projects.length;
    const activeProjects = projects.filter(p => p.status === 'In Progress').length;
    const completedProjects = projects.filter(p => p.status === 'Completed').length;
    const pendingProjects = projects.filter(p => p.status === 'Planning' || p.status === 'On Hold').length;

    const now = new Date();
    const overdueTasks = tasks.filter(t => {
      if (t.status === 'Completed') return false;
      if (!t.dueDate) return false;
      return new Date(t.dueDate) < now;
    }).length;

    const totalRevenue = invoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);
    const paymentsReceived = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
    const outstandingPayments = Math.max(0, totalRevenue - paymentsReceived);

    const totalInvoices = invoices.length;
    const pendingInvoices = invoices.filter(inv => inv.status !== 'Paid' && inv.status !== 'Cancelled').length;

    const overallWorkCompletion = projects.length > 0
      ? Math.round(projects.reduce((sum, p) => sum + (p.completionPercentage || 0), 0) / projects.length)
      : 0;

    return {
      totalEmployees: employees.length,
      activeClients,
      totalProjects,
      activeProjects,
      completedProjects,
      pendingProjects,
      overdueTasks,
      totalRevenue,
      paymentsReceived,
      outstandingPayments,
      totalInvoices,
      pendingInvoices,
      overallWorkCompletion
    };
  }

  // --- WORK REPORT GENERATOR ---
  generateWorkReport(filter: WorkReportFilter) {
    const employee = filter.employeeId ? this.getEmployeeById(filter.employeeId) : undefined;
    let tasks = filter.employeeId ? this.getTasksForEmployee(filter.employeeId) : this.getTasks();
    let logs = filter.employeeId ? this.getProgressLogs(undefined, filter.employeeId) : this.getProgressLogs();

    if (filter.clientId) {
      tasks = tasks.filter(t => t.clientId === filter.clientId);
      logs = logs.filter(l => {
        const t = this.getTasks().find(task => task.id === l.taskId);
        return t && t.clientId === filter.clientId;
      });
    }

    if (filter.projectId) {
      tasks = tasks.filter(t => t.projectId === filter.projectId);
      logs = logs.filter(l => l.projectId === filter.projectId);
    }

    if (filter.status && filter.status !== 'All') {
      tasks = tasks.filter(t => t.status === filter.status);
    }

    // Date filtering
    if (filter.startDate) {
      const start = new Date(filter.startDate).getTime();
      tasks = tasks.filter(t => new Date(t.createdAt).getTime() >= start);
      logs = logs.filter(l => new Date(l.timestamp).getTime() >= start);
    }
    if (filter.endDate) {
      const end = new Date(filter.endDate).getTime();
      tasks = tasks.filter(t => new Date(t.createdAt).getTime() <= end);
      logs = logs.filter(l => new Date(l.timestamp).getTime() <= end);
    }

    // Distinguish completed during period vs overall completed
    const completedInPeriod = logs.filter(l => l.status === 'Completed').length;
    const completedOverall = tasks.filter(t => t.status === 'Completed').length;
    const inProgress = tasks.filter(t => t.status === 'In Progress').length;
    const pending = tasks.filter(t => t.status === 'Not Started').length;
    
    const now = new Date();
    const overdue = tasks.filter(t => {
      if (t.status === 'Completed') return false;
      if (!t.dueDate) return false;
      return new Date(t.dueDate) < now;
    }).length;

    const totalHoursSpent = logs.reduce((sum, l) => sum + (l.timeSpentHours || 0), 0);
    const avgProgress = tasks.length > 0 
      ? Math.round(tasks.reduce((sum, t) => sum + (t.completionPercentage || 0), 0) / tasks.length)
      : 0;

    const assignedProjects = filter.employeeId 
      ? this.getProjectsForEmployee(filter.employeeId)
      : this.getProjects();

    const clientIds = new Set(assignedProjects.map(p => p.clientId));
    const assignedClients = this.getClients().filter(c => clientIds.has(c.id));

    return {
      employee,
      reportingPeriod: filter.period || 'all',
      assignedClients,
      assignedProjects,
      tasks,
      progressLogs: logs,
      totalAssignedTasks: tasks.length,
      tasksCompletedInPeriod: completedInPeriod,
      tasksCompletedOverall: completedOverall,
      tasksInProgress: inProgress,
      tasksPending: pending,
      tasksOverdue: overdue,
      completionPercentage: avgProgress,
      totalHoursSpent,
      blockersEncountered: logs.filter(l => l.blockers && l.blockers.trim().length > 0).map(l => ({
        taskTitle: l.taskTitle,
        blocker: l.blockers,
        timestamp: l.timestamp
      }))
    };
  }
}

export const crmDb = new CrmDbService();
