export type UserRole = 'admin' | 'employee';

export interface Employee {
  id: string; // EMP001, etc.
  name: string;
  email: string;
  phone: string;
  designation: string;
  department: string;
  skills: string[];
  avatar: string;
  active: boolean;
  joinedDate: string;
}

export interface Client {
  id: string; // CLI-1001
  name: string;
  company: string;
  email: string;
  phone: string;
  address: string;
  gstin?: string;
  clientType: 'Student' | 'Professional' | 'Enterprise';
  status: 'Lead' | 'Active' | 'Completed' | 'Archived';
  totalBudget: number;
  createdAt: string;
  notes?: string;
}

export interface ProjectEmployeeAllocation {
  employeeId: string;
  employeeName: string;
  role: string;
  responsibility: string;
}

export interface Project {
  id: string; // PRJ-2001
  title: string;
  description: string;
  clientId: string;
  clientName: string;
  projectType: string;
  budget: number;
  status: 'Planning' | 'In Progress' | 'Review' | 'Completed' | 'On Hold' | 'Cancelled';
  startDate: string;
  dueDate: string;
  completionPercentage: number;
  assignedEmployeeIds: string[];
  assignedEmployees: ProjectEmployeeAllocation[];
  createdAt: string;
  updatedAt?: string;
}

export type ProjectRequestStatus = 'New' | 'Reviewed' | 'Contacted' | 'Converted' | 'Rejected';

export interface ProjectRequest {
  id: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  clientType: 'Student' | 'Professional';
  projectTitle: string;
  projectType: string;
  deliveryDate?: string;
  description: string;
  status: ProjectRequestStatus;
  createdAt: string;
}

export type TaskStatus = 
  | 'Not Started' 
  | 'In Progress' 
  | 'Under Review' 
  | 'Revision Required' 
  | 'Completed' 
  | 'On Hold' 
  | 'Blocked';

export type TaskPriority = 'Urgent' | 'High' | 'Medium' | 'Low';

export interface TaskHistoryItem {
  timestamp: string;
  actor: string;
  action: string;
  from?: string;
  to?: string;
  notes?: string;
}

export interface Task {
  id: string; // TSK-3001
  title: string;
  description: string;
  projectId: string;
  projectTitle: string;
  clientId: string;
  clientName: string;
  assignedEmployeeId: string;
  assignedEmployeeName: string;
  priority: TaskPriority;
  startDate: string;
  dueDate: string;
  estimatedHours: number;
  actualHours: number;
  status: TaskStatus;
  completionPercentage: number;
  adminInstructions?: string;
  employeeUpdates?: string;
  weight: number; // for weighted project progress, default 1
  history: TaskHistoryItem[];
  attachments?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface TaskProgressLog {
  id: string;
  taskId: string;
  taskTitle: string;
  projectId: string;
  projectTitle: string;
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
  timestamp: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  discountPercent?: number;
  amount: number;
}

export type InvoiceStatus = 'Draft' | 'Sent' | 'Partially Paid' | 'Paid' | 'Overdue' | 'Cancelled';

export interface Invoice {
  id: string;
  invoiceNumber: string; // e.g. AT-INV-2026-001
  invoiceDate: string;
  dueDate: string;
  clientId: string;
  clientName: string;
  clientCompany: string;
  clientEmail: string;
  clientPhone: string;
  clientAddress: string;
  clientGstin?: string;
  clientCompanyLogoUrl?: string;
  projectId: string;
  projectTitle: string;
  items: InvoiceItem[];
  subtotal: number;
  discountRate: number; // percent
  discountAmount: number;
  gstEnabled?: boolean;
  taxRate: number; // GST %
  taxAmount: number;
  totalAmount: number;
  paidAmount: number;
  outstandingBalance: number;
  status: InvoiceStatus;
  paymentInstructions?: string;
  notes?: string;
  createdAt: string;
}

export interface Payment {
  id: string;
  invoiceId: string;
  invoiceNumber: string;
  clientId: string;
  clientName: string;
  projectId?: string;
  amount: number;
  paymentDate: string;
  paymentMethod: 'Bank Transfer' | 'UPI' | 'Card' | 'Cash' | 'Cheque';
  transactionReference: string;
  notes?: string;
  recordedBy: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  action: string;
  actor: string;
  actorRole: UserRole;
  entityType: 'Task' | 'Client' | 'Project' | 'Invoice' | 'Payment' | 'Employee' | 'Progress';
  entityId: string;
  details: string;
  timestamp: string;
}

export interface WorkReportFilter {
  employeeId?: string;
  clientId?: string;
  projectId?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  period?: 'daily' | 'weekly' | 'monthly' | 'custom' | 'all';
}

export interface NotificationItem {
  id: string;
  recipientEmployeeId?: string; // undefined for admin/broadcast
  title: string;
  message: string;
  type: 'assignment' | 'deadline' | 'revision' | 'progress' | 'payment' | 'announcement';
  link?: string;
  read: boolean;
  createdAt: string;
}
