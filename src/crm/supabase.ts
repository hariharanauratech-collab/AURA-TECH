import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ProjectData, User } from './types';
import { ProjectRequest, ProjectRequestStatus } from './crmTypes';
import { ADMIN_EMAIL, EMPLOYEE_EMAIL_TO_ID } from './crmAuthConfig';

/**
 * AURA TECH - Supabase Backend & Database Service
 * 
 * Manages cloud and local persistence for:
 * 1. Project Requests & Client Inquiries
 * 2. User & Employee Roles
 * 3. Health & Authentication Verification
 * 
 * Built with full zero-crash offline fallback and resilience.
 */

// Default Aura Tech production credentials
const DEFAULT_URL = 'https://qbapgyleffnwspwdmqrj.supabase.co';
const DEFAULT_KEY = 'sb_publishable_hb5vBJRtn2pwJ7XMXdnzFw_BwZCdFVj';

// Environment variable resolution with safe URL fallback
const rawUrl = (
  import.meta.env?.VITE_SUPABASE_URL ||
  (typeof process !== 'undefined' && process.env?.SUPABASE_URL) ||
  DEFAULT_URL
).trim();

const rawKey = (
  import.meta.env?.VITE_SUPABASE_ANON_KEY ||
  (typeof process !== 'undefined' && process.env?.SUPABASE_ANON_KEY) ||
  DEFAULT_KEY
).trim();

// Ensure URL is valid protocol to prevent client initialization crashes
const supabaseUrl = rawUrl.startsWith('http://') || rawUrl.startsWith('https://') 
  ? rawUrl 
  : DEFAULT_URL;

const supabaseAnonKey = rawKey.length > 10 ? rawKey : DEFAULT_KEY;

// Initialize Supabase Client with persistent session handling
export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: typeof window !== 'undefined' ? window.localStorage : undefined
  }
});

/**
 * Validates whether a string is a standard RFC4122 UUID
 */
export function isUUID(value: string): boolean {
  if (!value || typeof value !== 'string') return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value.trim());
}

/**
 * Normalizes client types to strictly match Postgres CHECK constraint: ('Student', 'Professional')
 */
export function normalizeClientType(rawType?: string): 'Student' | 'Professional' {
  if (!rawType) return 'Professional';
  const clean = rawType.trim().toLowerCase();
  if (clean.includes('student')) return 'Student';
  return 'Professional';
}

/**
 * Safely parses delivery timelines into valid PostgreSQL DATE strings (YYYY-MM-DD).
 * Text descriptions like "1 - 2 Weeks" are converted into realistic target dates
 * and preserved in description notes to avoid SQL 22007 invalid date syntax errors.
 */
export function normalizeDeliveryDate(rawDate?: string): { dateStr: string | null; extraNote: string } {
  if (!rawDate || !rawDate.trim()) {
    return { dateStr: null, extraNote: '' };
  }

  const clean = rawDate.trim();

  // If already in ISO date format: YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(clean)) {
    return { dateStr: clean, extraNote: '' };
  }

  // Handle standard slash formats: DD/MM/YYYY or YYYY/MM/DD
  if (clean.includes('/')) {
    const parts = clean.split('/');
    if (parts.length === 3) {
      if (parts[0].length === 4) {
        // YYYY/MM/DD
        const y = parts[0];
        const m = parts[1].padStart(2, '0');
        const d = parts[2].padStart(2, '0');
        return { dateStr: `${y}-${m}-${d}`, extraNote: '' };
      } else {
        // DD/MM/YYYY
        const d = parts[0].padStart(2, '0');
        const m = parts[1].padStart(2, '0');
        const y = parts[2];
        return { dateStr: `${y}-${m}-${d}`, extraNote: '' };
      }
    }
  }

  // Handle prose timeframes (e.g. from website booking options)
  const lower = clean.toLowerCase();
  let daysToAdd = 14;

  if (lower.includes('1 week') || lower.includes('urgent')) {
    daysToAdd = 7;
  } else if (lower.includes('1 - 2 week') || lower.includes('2 week')) {
    daysToAdd = 14;
  } else if (lower.includes('2 - 4 week') || lower.includes('month') || lower.includes('standard')) {
    daysToAdd = 30;
  } else if (lower.includes('enterprise') || lower.includes('2 month')) {
    daysToAdd = 60;
  } else if (lower.includes('flexible') || lower.includes('no rush')) {
    return { dateStr: null, extraNote: `Expected Timeline: ${clean}` };
  }

  const targetDate = new Date(Date.now() + daysToAdd * 24 * 60 * 60 * 1000);
  const dateStr = targetDate.toISOString().split('T')[0];
  return { dateStr, extraNote: `Expected Timeline: ${clean}` };
}

/**
 * Verifies CRM authorization and retrieves the user's role ('admin' | 'employee' | null).
 * Works reliably with both Supabase user roles table and direct corporate email identity.
 */
export async function getCrmRole(userId: string, email: string): Promise<'admin' | 'employee' | null> {
  if (!email) return null;
  const normalized = email.trim().toLowerCase();

  // 1. Authoritative Company Email Direct Checks
  if (normalized === ADMIN_EMAIL.toLowerCase()) return 'admin';
  if (EMPLOYEE_EMAIL_TO_ID[normalized]) return 'employee';

  // 2. Supabase crm_user_roles table query
  try {
    const { data, error } = await supabase
      .from('crm_user_roles')
      .select('role')
      .eq('user_id', userId)
      .eq('email', normalized)
      .maybeSingle();

    if (!error && data?.role && (data.role === 'admin' || data.role === 'employee')) {
      return data.role;
    }
  } catch (err) {
    console.warn('[AURA CRM] Role query notice (falling back to authorized directory):', err);
  }

  // 3. Fallback verification
  if (normalized === ADMIN_EMAIL.toLowerCase()) return 'admin';
  if (EMPLOYEE_EMAIL_TO_ID[normalized]) return 'employee';
  return null;
}

/**
 * Comprehensive Backend Supabase Service for Aura Tech
 */
export const supabaseService = {
  /**
   * Submits a new project request.
   * Polymorphic: Supports both (user, project) AND single booking object signatures.
   */
  async submitProjectRequest(
    userOrBooking: User | Record<string, any>,
    maybeProject?: ProjectData
  ): Promise<{ success: boolean; id: string }> {
    let clientName = '';
    let clientEmail = '';
    let clientPhone = '';
    let clientTypeRaw = 'Professional';
    let projectTitle = '';
    let projectType = 'Website';
    let rawDeliveryDate = '';
    let description = '';

    if (maybeProject) {
      // Signature: (user: User, project: ProjectData)
      const user = userOrBooking as User;
      clientName = user.name || '';
      clientEmail = user.email || '';
      clientPhone = user.phone || '';
      clientTypeRaw = user.userType || 'Professional';
      projectTitle = maybeProject.title || '';
      projectType = maybeProject.type || 'Website';
      rawDeliveryDate = maybeProject.deliveryDate || '';
      description = maybeProject.description || '';
    } else {
      // Signature: single booking object
      const b = userOrBooking as Record<string, any>;
      clientName = b.client_name || b.fullName || b.name || '';
      clientEmail = b.client_email || b.email || '';
      clientPhone = b.client_phone || b.phone || '';
      clientTypeRaw = b.client_type || b.userType || 'Professional';
      projectTitle = b.project_title || b.projectTitle || b.title || '';
      projectType = b.project_type || b.projectType || b.type || 'Website';
      rawDeliveryDate = b.deliveryDate || b.delivery_date || b.expected_time || b.expectedTime || '';
      description = b.description || '';
    }

    // Normalizations
    const clientType = normalizeClientType(clientTypeRaw);
    const { dateStr, extraNote } = normalizeDeliveryDate(rawDeliveryDate);
    const fullDescription = extraNote 
      ? (description ? `${description}\n\n[${extraNote}]` : extraNote)
      : description;

    let assignedId = `REQ-${Date.now()}`;
    const newRequest: ProjectRequest = {
      id: assignedId,
      clientName: clientName.trim(),
      clientEmail: clientEmail.trim().toLowerCase(),
      clientPhone: clientPhone.trim(),
      clientType,
      projectTitle: projectTitle.trim(),
      projectType,
      deliveryDate: rawDeliveryDate || dateStr || '',
      description: fullDescription.trim(),
      status: 'New',
      createdAt: new Date().toISOString()
    };

    // 1. Instantly save to local storage for zero-delay offline resilience
    try {
      const existing = JSON.parse(localStorage.getItem('aura_crm_project_requests') || '[]');
      localStorage.setItem('aura_crm_project_requests', JSON.stringify([newRequest, ...existing]));
    } catch (e) {
      console.warn('[AURA CRM] Local request cache save note:', e);
    }

    // 2. Submit to Supabase Cloud
    try {
      const payload: Record<string, any> = {
        client_name: newRequest.clientName,
        client_email: newRequest.clientEmail,
        client_phone: newRequest.clientPhone,
        client_type: newRequest.clientType,
        project_title: newRequest.projectTitle,
        project_type: newRequest.projectType,
        delivery_date: dateStr,
        description: newRequest.description,
        status: 'New'
      };

      const { data, error } = await supabase
        .from('crm_project_requests')
        .insert(payload)
        .select('id')
        .maybeSingle();

      if (error) {
        if (error.code === '42P01' || error.code === 'PGRST205') {
          console.warn('[AURA CRM] crm_project_requests table not created yet in Supabase (saved locally).');
        } else {
          console.warn('[AURA CRM] Supabase project request sync note (saved locally):', error.message);
        }
      } else if (data?.id) {
        // Upgrade local ID to cloud UUID for exact relational consistency
        assignedId = data.id;
        try {
          const stored = JSON.parse(localStorage.getItem('aura_crm_project_requests') || '[]');
          const updated = stored.map((item: ProjectRequest) => 
            item.id === newRequest.id ? { ...item, id: data.id } : item
          );
          localStorage.setItem('aura_crm_project_requests', JSON.stringify(updated));
        } catch {
          // Ignore
        }
      }
    } catch (err) {
      console.warn('[AURA CRM] Supabase network notice (data preserved safely in local storage):', err);
    }

    return { success: true, id: assignedId };
  },

  /**
   * Retrieves all project requests from Supabase and merges them with local requests.
   * Guarantees that inquiries are never lost, even if offline or before database migrations.
   */
  async getProjectRequests(): Promise<ProjectRequest[]> {
    let cloudRequests: ProjectRequest[] = [];
    let cloudLoadedSuccessfully = false;

    // 1. Fetch from Supabase
    try {
      const { data, error } = await supabase
        .from('crm_project_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && Array.isArray(data)) {
        cloudLoadedSuccessfully = true;
        cloudRequests = data.map(row => ({
          id: row.id,
          clientName: row.client_name || 'Anonymous Client',
          clientEmail: row.client_email || '',
          clientPhone: row.client_phone || '',
          clientType: normalizeClientType(row.client_type),
          projectTitle: row.project_title || 'Untitled Project',
          projectType: row.project_type || 'Website',
          deliveryDate: row.delivery_date ? String(row.delivery_date) : '',
          description: row.description || '',
          status: (row.status || 'New') as ProjectRequestStatus,
          createdAt: row.created_at || new Date().toISOString()
        }));
      } else if (error) {
        console.warn('[AURA CRM] Cloud request load note (using local cache):', error.message);
      }
    } catch (err) {
      console.warn('[AURA CRM] Cloud request load exception (using local cache):', err);
    }

    // 2. Load Local Storage Requests
    let localRequests: ProjectRequest[] = [];
    try {
      localRequests = JSON.parse(localStorage.getItem('aura_crm_project_requests') || '[]');
    } catch {
      localRequests = [];
    }

    // 3. Import from Website aura_submissions
    let submissionRequests: ProjectRequest[] = [];
    try {
      const submissions = JSON.parse(localStorage.getItem('aura_submissions') || '[]');
      if (Array.isArray(submissions)) {
        submissionRequests = submissions.map((sub: any) => ({
          id: String(sub.id || `SUB-${Date.now()}`),
          clientName: sub.client_name || sub.fullName || 'Anonymous Client',
          clientEmail: (sub.client_email || sub.email || '').toLowerCase().trim(),
          clientPhone: sub.client_phone || sub.phone || '',
          clientType: normalizeClientType(sub.client_type || sub.userType),
          projectTitle: sub.project_title || sub.projectTitle || 'Project Inquiry',
          projectType: sub.project_type || sub.projectType || 'Website',
          deliveryDate: sub.expected_time || sub.expectedTime || '',
          description: sub.description || '',
          status: (
            sub.status === 'completed' ? 'Converted' :
            sub.status === 'in_progress' ? 'Reviewed' :
            sub.status === 'rejected' ? 'Rejected' : 'New'
          ) as ProjectRequestStatus,
          createdAt: sub.created_at || new Date().toISOString()
        }));
      }
    } catch {
      submissionRequests = [];
    }

    // 4. Intelligent Deduplication & Merging
    // Unique identity: UUID if present, or (email + projectTitle + datePrefix)
    const seenIdentities = new Set<string>();
    const merged: ProjectRequest[] = [];

    // Prioritize cloud requests if loaded, else local
    const primaryList = cloudLoadedSuccessfully 
      ? [...cloudRequests, ...localRequests, ...submissionRequests]
      : [...localRequests, ...submissionRequests, ...cloudRequests];

    for (const req of primaryList) {
      const email = (req.clientEmail || '').trim().toLowerCase();
      const title = (req.projectTitle || '').trim().toLowerCase();
      const createdDay = (req.createdAt || '').slice(0, 10);
      
      const identityKey = isUUID(req.id) 
        ? req.id 
        : `${email}::${title}::${createdDay}`;

      if (!seenIdentities.has(identityKey)) {
        seenIdentities.add(identityKey);
        merged.push(req);
      }
    }

    // Sort newest first
    merged.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return merged;
  },

  /**
   * Updates the workflow status of a project request across local and cloud databases.
   */
  async updateProjectRequestStatus(id: string, status: ProjectRequestStatus): Promise<void> {
    // 1. Update in local storage immediately
    try {
      const local = JSON.parse(localStorage.getItem('aura_crm_project_requests') || '[]');
      const updated = local.map((req: ProjectRequest) => 
        req.id === id ? { ...req, status } : req
      );
      localStorage.setItem('aura_crm_project_requests', JSON.stringify(updated));

      // Also sync back to aura_submissions
      const submissions = JSON.parse(localStorage.getItem('aura_submissions') || '[]');
      const mappedSubStatus = status === 'Converted' ? 'completed' : status === 'Reviewed' ? 'in_progress' : 'pending';
      const subUpdated = submissions.map((sub: any) => 
        String(sub.id) === String(id) ? { ...sub, status: mappedSubStatus } : sub
      );
      localStorage.setItem('aura_submissions', JSON.stringify(subUpdated));
    } catch (e) {
      console.warn('[AURA CRM] Local request status update note:', e);
    }

    // 2. Update in Supabase
    try {
      if (isUUID(id)) {
        const { error } = await supabase
          .from('crm_project_requests')
          .update({ status })
          .eq('id', id);

        if (error) {
          console.warn('[AURA CRM] Supabase status update note:', error.message);
        }
      } else {
        // If non-UUID local ID, attempt to locate by matching client name and project title
        const local = JSON.parse(localStorage.getItem('aura_crm_project_requests') || '[]');
        const target = local.find((r: ProjectRequest) => r.id === id);
        if (target && target.clientEmail) {
          await supabase
            .from('crm_project_requests')
            .update({ status })
            .eq('client_email', target.clientEmail.toLowerCase())
            .eq('project_title', target.projectTitle);
        }
      }
    } catch (err) {
      console.warn('[AURA CRM] Supabase updateProjectRequestStatus exception:', err);
    }
  },

  /**
   * Deletes a project request from local cache and Supabase cloud.
   */
  async deleteProjectRequest(id: string): Promise<void> {
    // 1. Remove from local storage
    try {
      const local = JSON.parse(localStorage.getItem('aura_crm_project_requests') || '[]');
      const filtered = local.filter((r: ProjectRequest) => r.id !== id);
      localStorage.setItem('aura_crm_project_requests', JSON.stringify(filtered));

      const submissions = JSON.parse(localStorage.getItem('aura_submissions') || '[]');
      const subFiltered = submissions.filter((s: any) => String(s.id) !== String(id));
      localStorage.setItem('aura_submissions', JSON.stringify(subFiltered));
    } catch (e) {
      console.warn('[AURA CRM] Local request deletion note:', e);
    }

    // 2. Remove from Supabase if valid UUID
    try {
      if (isUUID(id)) {
        await supabase
          .from('crm_project_requests')
          .delete()
          .eq('id', id);
      }
    } catch (err) {
      console.warn('[AURA CRM] Supabase deleteProjectRequest exception:', err);
    }
  },

  /**
   * Diagnostic test to check whether Supabase is reachable and responsive.
   */
  async checkConnection(): Promise<{ connected: boolean; latencyMs: number; message: string }> {
    const start = performance.now();
    try {
      const { error } = await supabase.from('crm_project_requests').select('id').limit(1);
      const latencyMs = Math.round(performance.now() - start);

      if (!error) {
        return { connected: true, latencyMs, message: `Connected to Supabase (${latencyMs}ms)` };
      }

      if (error.code === '42P01' || error.code === 'PGRST205') {
        return {
          connected: true,
          latencyMs,
          message: 'Supabase reachable, but crm_project_requests table is pending SQL migration.'
        };
      }

      return { connected: false, latencyMs, message: error.message };
    } catch (err) {
      const latencyMs = Math.round(performance.now() - start);
      return {
        connected: false,
        latencyMs,
        message: err instanceof Error ? err.message : 'Connection failed'
      };
    }
  }
};
