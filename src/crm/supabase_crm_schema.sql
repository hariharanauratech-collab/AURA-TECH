-- ============================================================================
-- AURA TECH - COMPLETE CRM, WORKFLOW & INVOICE MANAGEMENT DATABASE SCHEMA
-- Compatible with PostgreSQL 14+, Supabase, and SQLite (dialect variations noted)
-- ============================================================================

-- 1. EMPLOYEES TABLE
CREATE TABLE IF NOT EXISTS crm_employees (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50) NOT NULL,
    designation VARCHAR(150) NOT NULL,
    department VARCHAR(100) NOT NULL,
    skills TEXT[] DEFAULT '{}',
    avatar TEXT,
    active BOOLEAN DEFAULT TRUE,
    joined_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. CLIENTS TABLE
CREATE TABLE IF NOT EXISTS crm_clients (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    company VARCHAR(150) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    address TEXT,
    gstin VARCHAR(50),
    client_type VARCHAR(50) DEFAULT 'Professional', -- 'Student', 'Professional', 'Enterprise'
    status VARCHAR(50) DEFAULT 'Active', -- 'Lead', 'Active', 'Completed', 'Archived'
    total_budget NUMERIC(12, 2) DEFAULT 0.00,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. PROJECTS TABLE
CREATE TABLE IF NOT EXISTS crm_projects (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    client_id VARCHAR(50) REFERENCES crm_clients(id) ON DELETE CASCADE,
    client_name VARCHAR(150) NOT NULL,
    project_type VARCHAR(100) NOT NULL,
    budget NUMERIC(12, 2) DEFAULT 0.00,
    status VARCHAR(50) DEFAULT 'In Progress', -- 'Planning', 'In Progress', 'Review', 'Completed', 'On Hold', 'Cancelled'
    start_date DATE DEFAULT CURRENT_DATE,
    due_date DATE,
    completion_percentage NUMERIC(5, 2) DEFAULT 0.00,
    assigned_employee_ids TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. PROJECT EMPLOYEE ASSIGNMENTS (Junction Table)
CREATE TABLE IF NOT EXISTS crm_project_assignments (
    id VARCHAR(50) PRIMARY KEY,
    project_id VARCHAR(50) REFERENCES crm_projects(id) ON DELETE CASCADE,
    employee_id VARCHAR(50) REFERENCES crm_employees(id) ON DELETE CASCADE,
    role VARCHAR(100),
    responsibility TEXT,
    assigned_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. TASKS TABLE
CREATE TABLE IF NOT EXISTS crm_tasks (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    project_id VARCHAR(50) REFERENCES crm_projects(id) ON DELETE CASCADE,
    project_title VARCHAR(200),
    client_id VARCHAR(50) REFERENCES crm_clients(id) ON DELETE CASCADE,
    client_name VARCHAR(150),
    assigned_employee_id VARCHAR(50) REFERENCES crm_employees(id) ON DELETE SET NULL,
    assigned_employee_name VARCHAR(150),
    priority VARCHAR(50) DEFAULT 'Medium', -- 'Urgent', 'High', 'Medium', 'Low'
    start_date DATE DEFAULT CURRENT_DATE,
    due_date DATE,
    estimated_hours NUMERIC(6, 2) DEFAULT 0.00,
    actual_hours NUMERIC(6, 2) DEFAULT 0.00,
    status VARCHAR(50) DEFAULT 'In Progress', -- 'Not Started', 'In Progress', 'Under Review', 'Revision Required', 'Completed', 'On Hold', 'Blocked'
    completion_percentage NUMERIC(5, 2) DEFAULT 0.00,
    admin_instructions TEXT,
    employee_updates TEXT,
    weight NUMERIC(5, 2) DEFAULT 1.00,
    history JSONB DEFAULT '[]'::jsonb,
    attachments TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. TASK PROGRESS LOGS TABLE (Persistent Continuous History - Never Overwritten)
CREATE TABLE IF NOT EXISTS crm_task_progress_logs (
    id VARCHAR(50) PRIMARY KEY,
    task_id VARCHAR(50) REFERENCES crm_tasks(id) ON DELETE CASCADE,
    task_title VARCHAR(200),
    project_id VARCHAR(50) REFERENCES crm_projects(id) ON DELETE CASCADE,
    project_title VARCHAR(200),
    employee_id VARCHAR(50) REFERENCES crm_employees(id) ON DELETE CASCADE,
    employee_name VARCHAR(150),
    completion_percentage NUMERIC(5, 2) NOT NULL,
    work_completed TEXT NOT NULL,
    work_remaining TEXT,
    time_spent_hours NUMERIC(6, 2) DEFAULT 0.00,
    status VARCHAR(50) NOT NULL,
    blockers TEXT,
    next_planned_activity TEXT,
    attachments TEXT[] DEFAULT '{}',
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- 7. INVOICES TABLE
CREATE TABLE IF NOT EXISTS crm_invoices (
    id VARCHAR(50) PRIMARY KEY,
    invoice_number VARCHAR(100) UNIQUE NOT NULL,
    invoice_date DATE DEFAULT CURRENT_DATE,
    due_date DATE,
    client_id VARCHAR(50) REFERENCES crm_clients(id) ON DELETE CASCADE,
    client_name VARCHAR(150) NOT NULL,
    client_company VARCHAR(150),
    client_email VARCHAR(255),
    client_phone VARCHAR(50),
    client_address TEXT,
    client_gstin VARCHAR(50),
    client_company_logo_url TEXT,
    project_id VARCHAR(50) REFERENCES crm_projects(id) ON DELETE SET NULL,
    project_title VARCHAR(200),
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    subtotal NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    discount_rate NUMERIC(5, 2) DEFAULT 0.00,
    discount_amount NUMERIC(12, 2) DEFAULT 0.00,
    gst_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    tax_rate NUMERIC(5, 2) DEFAULT 18.00,
    tax_amount NUMERIC(12, 2) DEFAULT 0.00,
    total_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    paid_amount NUMERIC(12, 2) DEFAULT 0.00,
    outstanding_balance NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    status VARCHAR(50) DEFAULT 'Draft', -- 'Draft', 'Sent', 'Partially Paid', 'Paid', 'Overdue', 'Cancelled'
    payment_instructions TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE crm_invoices
    ADD COLUMN IF NOT EXISTS client_company_logo_url TEXT,
    ADD COLUMN IF NOT EXISTS gst_enabled BOOLEAN NOT NULL DEFAULT TRUE;

-- 8. PAYMENTS TABLE
CREATE TABLE IF NOT EXISTS crm_payments (
    id VARCHAR(50) PRIMARY KEY,
    invoice_id VARCHAR(50) REFERENCES crm_invoices(id) ON DELETE CASCADE,
    invoice_number VARCHAR(100),
    client_id VARCHAR(50) REFERENCES crm_clients(id) ON DELETE CASCADE,
    client_name VARCHAR(150),
    project_id VARCHAR(50),
    amount NUMERIC(12, 2) NOT NULL,
    payment_date DATE DEFAULT CURRENT_DATE,
    payment_method VARCHAR(50) DEFAULT 'Bank Transfer', -- 'Bank Transfer', 'UPI', 'Card', 'Cash', 'Cheque'
    transaction_reference VARCHAR(150),
    notes TEXT,
    recorded_by VARCHAR(150) DEFAULT 'Main Admin',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS crm_audit_logs (
    id VARCHAR(50) PRIMARY KEY,
    action VARCHAR(150) NOT NULL,
    actor VARCHAR(150) NOT NULL,
    actor_role VARCHAR(50) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id VARCHAR(50) NOT NULL,
    details TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- 10. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS crm_notifications (
    id VARCHAR(50) PRIMARY KEY,
    recipient_employee_id VARCHAR(50), -- NULL for broadcast/admin
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'assignment',
    link TEXT,
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. PUBLIC WEBSITE PROJECT REQUESTS
CREATE TABLE IF NOT EXISTS crm_project_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_name VARCHAR(150) NOT NULL,
    client_email VARCHAR(255) NOT NULL,
    client_phone VARCHAR(50) NOT NULL,
    client_type VARCHAR(50) NOT NULL CHECK (client_type IN ('Student', 'Professional')),
    project_title VARCHAR(200) NOT NULL,
    project_type VARCHAR(100) NOT NULL,
    delivery_date DATE,
    description TEXT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'New'
        CHECK (status IN ('New', 'Reviewed', 'Contacted', 'Converted', 'Rejected')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- INDEXES FOR FAST FILTERING AND DASHBOARD AGGREGATIONS
CREATE INDEX IF NOT EXISTS idx_tasks_employee ON crm_tasks(assigned_employee_id);
CREATE INDEX IF NOT EXISTS idx_tasks_project ON crm_tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON crm_tasks(status);
CREATE INDEX IF NOT EXISTS idx_progress_task ON crm_task_progress_logs(task_id);
CREATE INDEX IF NOT EXISTS idx_progress_employee ON crm_task_progress_logs(employee_id);
CREATE INDEX IF NOT EXISTS idx_invoices_client ON crm_invoices(client_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON crm_invoices(status);
CREATE INDEX IF NOT EXISTS idx_payments_invoice ON crm_payments(invoice_id);
CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON crm_audit_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_project_requests_created_at ON crm_project_requests(created_at DESC);
