-- Authentication roles and employee profile data for the Aura Tech CRM.
-- Run this in the Supabase SQL Editor before enabling CRM access.
-- Keep this email allowlist in sync with crmAuthConfig.ts.

CREATE TABLE IF NOT EXISTS public.crm_user_roles (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'employee')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.crm_user_roles
    ADD COLUMN IF NOT EXISTS email TEXT;

UPDATE public.crm_user_roles AS roles
SET email = lower(users.email)
FROM auth.users AS users
WHERE roles.user_id = users.id
  AND roles.email IS NULL;

ALTER TABLE public.crm_user_roles
    ALTER COLUMN email SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_crm_user_roles_email
    ON public.crm_user_roles (email);

UPDATE public.crm_user_roles
SET email = lower(email);

DELETE FROM public.crm_user_roles
WHERE (role = 'admin' AND email <> 'auratech008@gmail.com')
   OR (role = 'employee' AND email NOT IN (
       'makizh.auratech@gmail.com',
       'dhanyadass.auratech@gmail.com',
       'niranjan.auratech@gmail.com',
       'priyanka.auratech@gmail.com',
       'praveenraja.auratech@gmail.com',
       'hariharan.auratech@gmail.com',
       'vengat.auratech@gmail.com'
   ));

CREATE UNIQUE INDEX IF NOT EXISTS idx_crm_user_roles_single_admin
    ON public.crm_user_roles (role)
    WHERE role = 'admin';

CREATE TABLE IF NOT EXISTS public.crm_employee_profiles (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    employee_id TEXT NOT NULL,
    phone TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.crm_employee_profiles
    ADD COLUMN IF NOT EXISTS employee_id TEXT;

DELETE FROM public.crm_employee_profiles AS profiles
WHERE NOT EXISTS (
    SELECT 1
    FROM public.crm_user_roles AS roles
    WHERE roles.user_id = profiles.user_id
      AND roles.role = 'employee'
);

UPDATE public.crm_employee_profiles AS profiles
SET employee_id = CASE roles.email
    WHEN 'makizh.auratech@gmail.com' THEN 'EMP002'
    WHEN 'dhanyadass.auratech@gmail.com' THEN 'EMP005'
    WHEN 'niranjan.auratech@gmail.com' THEN 'EMP001'
    WHEN 'priyanka.auratech@gmail.com' THEN 'EMP004'
    WHEN 'praveenraja.auratech@gmail.com' THEN 'EMP006'
    WHEN 'hariharan.auratech@gmail.com' THEN 'EMP003'
    WHEN 'vengat.auratech@gmail.com' THEN 'EMP007'
END
FROM public.crm_user_roles AS roles
WHERE profiles.user_id = roles.user_id
  AND roles.role = 'employee'
  AND profiles.employee_id IS NULL;

ALTER TABLE public.crm_employee_profiles
    ALTER COLUMN employee_id SET NOT NULL;

ALTER TABLE public.crm_user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_employee_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read their own CRM role" ON public.crm_user_roles;
CREATE POLICY "Users can read their own CRM role"
    ON public.crm_user_roles
    FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Employees can read their own profile" ON public.crm_employee_profiles;
CREATE POLICY "Employees can read their own profile"
    ON public.crm_employee_profiles
    FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

GRANT SELECT ON public.crm_user_roles TO authenticated;
GRANT SELECT ON public.crm_employee_profiles TO authenticated;

CREATE OR REPLACE FUNCTION public.create_crm_employee_account()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    authorized_employee_id TEXT;
BEGIN
    IF lower(NEW.email) = 'auratech008@gmail.com' THEN
        RETURN NEW;
    END IF;

    authorized_employee_id := CASE lower(NEW.email)
        WHEN 'makizh.auratech@gmail.com' THEN 'EMP002'
        WHEN 'dhanyadass.auratech@gmail.com' THEN 'EMP005'
        WHEN 'niranjan.auratech@gmail.com' THEN 'EMP001'
        WHEN 'priyanka.auratech@gmail.com' THEN 'EMP004'
        WHEN 'praveenraja.auratech@gmail.com' THEN 'EMP006'
        WHEN 'hariharan.auratech@gmail.com' THEN 'EMP003'
        WHEN 'vengat.auratech@gmail.com' THEN 'EMP007'
        ELSE NULL
    END;

    IF authorized_employee_id IS NULL THEN
        RAISE EXCEPTION 'This email is not authorized to create an Aura Tech employee account.';
    END IF;

    INSERT INTO public.crm_user_roles (user_id, email, role)
    VALUES (NEW.id, lower(NEW.email), 'employee')
    ON CONFLICT (user_id) DO UPDATE
        SET email = EXCLUDED.email, role = 'employee';

    INSERT INTO public.crm_employee_profiles (user_id, employee_id, phone)
    VALUES (
        NEW.id,
        authorized_employee_id,
        COALESCE(NEW.raw_user_meta_data ->> 'phone_number', '')
    )
    ON CONFLICT (user_id) DO UPDATE
        SET employee_id = EXCLUDED.employee_id,
            phone = EXCLUDED.phone,
            updated_at = NOW();

    RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.create_crm_employee_account() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS on_auth_user_created_for_crm ON auth.users;
CREATE TRIGGER on_auth_user_created_for_crm
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.create_crm_employee_account();

-- Backfill authorized employee accounts that existed before the trigger was installed.
WITH authorized_employees AS (
    SELECT
        users.id,
        lower(users.email) AS email,
        CASE lower(users.email)
            WHEN 'makizh.auratech@gmail.com' THEN 'EMP002'
            WHEN 'dhanyadass.auratech@gmail.com' THEN 'EMP005'
            WHEN 'niranjan.auratech@gmail.com' THEN 'EMP001'
            WHEN 'priyanka.auratech@gmail.com' THEN 'EMP004'
            WHEN 'praveenraja.auratech@gmail.com' THEN 'EMP006'
            WHEN 'hariharan.auratech@gmail.com' THEN 'EMP003'
            WHEN 'vengat.auratech@gmail.com' THEN 'EMP007'
        END AS employee_id,
        COALESCE(users.raw_user_meta_data ->> 'phone_number', '') AS phone
    FROM auth.users AS users
    WHERE lower(users.email) IN (
        'makizh.auratech@gmail.com',
        'dhanyadass.auratech@gmail.com',
        'niranjan.auratech@gmail.com',
        'priyanka.auratech@gmail.com',
        'praveenraja.auratech@gmail.com',
        'hariharan.auratech@gmail.com',
        'vengat.auratech@gmail.com'
    )
)
INSERT INTO public.crm_user_roles (user_id, email, role)
SELECT id, email, 'employee'
FROM authorized_employees
ON CONFLICT (user_id) DO UPDATE
SET email = EXCLUDED.email, role = 'employee';

WITH authorized_employees AS (
    SELECT
        users.id,
        CASE lower(users.email)
            WHEN 'makizh.auratech@gmail.com' THEN 'EMP002'
            WHEN 'dhanyadass.auratech@gmail.com' THEN 'EMP005'
            WHEN 'niranjan.auratech@gmail.com' THEN 'EMP001'
            WHEN 'priyanka.auratech@gmail.com' THEN 'EMP004'
            WHEN 'praveenraja.auratech@gmail.com' THEN 'EMP006'
            WHEN 'hariharan.auratech@gmail.com' THEN 'EMP003'
            WHEN 'vengat.auratech@gmail.com' THEN 'EMP007'
        END AS employee_id,
        COALESCE(users.raw_user_meta_data ->> 'phone_number', '') AS phone
    FROM auth.users AS users
    WHERE lower(users.email) IN (
        'makizh.auratech@gmail.com',
        'dhanyadass.auratech@gmail.com',
        'niranjan.auratech@gmail.com',
        'priyanka.auratech@gmail.com',
        'praveenraja.auratech@gmail.com',
        'hariharan.auratech@gmail.com',
        'vengat.auratech@gmail.com'
    )
)
INSERT INTO public.crm_employee_profiles (user_id, employee_id, phone)
SELECT id, employee_id, phone
FROM authorized_employees
ON CONFLICT (user_id) DO UPDATE
SET employee_id = EXCLUDED.employee_id,
    phone = EXCLUDED.phone,
    updated_at = NOW();

-- Create or update auratech008@gmail.com in Supabase Authentication → Users,
-- set its password there, and confirm the email before running this schema.
DO $$
DECLARE
    admin_user_id UUID;
    admin_email TEXT;
BEGIN
    SELECT id, lower(email)
    INTO admin_user_id, admin_email
    FROM auth.users
    WHERE lower(email) = 'auratech008@gmail.com'
      AND email_confirmed_at IS NOT NULL;

    IF admin_user_id IS NULL THEN
        RAISE EXCEPTION 'Confirm auratech008@gmail.com in Supabase Authentication → Users before running this schema.';
    END IF;

    INSERT INTO public.crm_user_roles (user_id, email, role)
    VALUES (admin_user_id, admin_email, 'admin')
    ON CONFLICT (user_id) DO UPDATE
    SET email = EXCLUDED.email, role = 'admin';
END;
$$;

-- Role helpers keep employee policy checks out of recursive RLS queries.
CREATE OR REPLACE FUNCTION public.crm_is_admin()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.crm_user_roles
        WHERE user_id = auth.uid()
          AND role = 'admin'
    );
$$;

CREATE OR REPLACE FUNCTION public.crm_current_employee_id()
RETURNS TEXT
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
    SELECT employee_id
    FROM public.crm_employee_profiles
    WHERE user_id = auth.uid()
    LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.crm_is_admin() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.crm_current_employee_id() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.crm_is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.crm_current_employee_id() TO authenticated;

ALTER TABLE public.crm_employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_project_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_task_progress_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_project_requests ENABLE ROW LEVEL SECURITY;

GRANT INSERT ON public.crm_project_requests TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON public.crm_project_requests TO authenticated;

DROP POLICY IF EXISTS "Public can submit project requests" ON public.crm_project_requests;
CREATE POLICY "Public can submit project requests"
    ON public.crm_project_requests FOR INSERT TO anon, authenticated
    WITH CHECK (
        length(trim(client_name)) BETWEEN 1 AND 150
        AND length(trim(client_email)) BETWEEN 3 AND 255
        AND length(trim(client_phone)) BETWEEN 3 AND 50
        AND length(trim(project_title)) BETWEEN 1 AND 200
        AND length(trim(project_type)) BETWEEN 1 AND 100
        AND length(trim(description)) BETWEEN 1 AND 10000
    );

DROP POLICY IF EXISTS "CRM admins manage all crm_project_requests" ON public.crm_project_requests;
CREATE POLICY "CRM admins manage all crm_project_requests"
    ON public.crm_project_requests FOR ALL TO authenticated
    USING (public.crm_is_admin())
    WITH CHECK (public.crm_is_admin());

DO $$
DECLARE
    table_name TEXT;
BEGIN
    FOREACH table_name IN ARRAY ARRAY[
        'crm_employees',
        'crm_clients',
        'crm_projects',
        'crm_project_assignments',
        'crm_tasks',
        'crm_task_progress_logs',
        'crm_invoices',
        'crm_payments',
        'crm_audit_logs',
        'crm_notifications'
    ]
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS "CRM admins manage all %1$s" ON public.%1$I', table_name);
        EXECUTE format(
            'CREATE POLICY "CRM admins manage all %1$s" ON public.%1$I FOR ALL TO authenticated USING (public.crm_is_admin()) WITH CHECK (public.crm_is_admin())',
            table_name
        );
    END LOOP;
END;
$$;

DROP POLICY IF EXISTS "Employees read assigned profiles" ON public.crm_employees;
CREATE POLICY "Employees read assigned profiles"
    ON public.crm_employees FOR SELECT TO authenticated
    USING (
        id = public.crm_current_employee_id()
        OR EXISTS (
            SELECT 1
            FROM public.crm_projects AS projects
            WHERE public.crm_current_employee_id() = ANY(projects.assigned_employee_ids)
              AND crm_employees.id = ANY(projects.assigned_employee_ids)
        )
    );

DROP POLICY IF EXISTS "Employees read assigned clients" ON public.crm_clients;
CREATE POLICY "Employees read assigned clients"
    ON public.crm_clients FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1
            FROM public.crm_projects AS projects
            WHERE projects.client_id = crm_clients.id
              AND public.crm_current_employee_id() = ANY(projects.assigned_employee_ids)
        )
    );

DROP POLICY IF EXISTS "Employees read assigned projects" ON public.crm_projects;
CREATE POLICY "Employees read assigned projects"
    ON public.crm_projects FOR SELECT TO authenticated
    USING (public.crm_current_employee_id() = ANY(assigned_employee_ids));

DROP POLICY IF EXISTS "Employees read assigned project allocations" ON public.crm_project_assignments;
CREATE POLICY "Employees read assigned project allocations"
    ON public.crm_project_assignments FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1
            FROM public.crm_projects AS projects
            WHERE projects.id = crm_project_assignments.project_id
              AND public.crm_current_employee_id() = ANY(projects.assigned_employee_ids)
        )
    );

DROP POLICY IF EXISTS "Employees read own tasks" ON public.crm_tasks;
CREATE POLICY "Employees read own tasks"
    ON public.crm_tasks FOR SELECT TO authenticated
    USING (assigned_employee_id = public.crm_current_employee_id());

DROP POLICY IF EXISTS "Employees update own tasks" ON public.crm_tasks;
CREATE POLICY "Employees update own tasks"
    ON public.crm_tasks FOR UPDATE TO authenticated
    USING (assigned_employee_id = public.crm_current_employee_id())
    WITH CHECK (assigned_employee_id = public.crm_current_employee_id());

DROP POLICY IF EXISTS "Employees read own progress logs" ON public.crm_task_progress_logs;
CREATE POLICY "Employees read own progress logs"
    ON public.crm_task_progress_logs FOR SELECT TO authenticated
    USING (employee_id = public.crm_current_employee_id());

DROP POLICY IF EXISTS "Employees insert own progress logs" ON public.crm_task_progress_logs;
CREATE POLICY "Employees insert own progress logs"
    ON public.crm_task_progress_logs FOR INSERT TO authenticated
    WITH CHECK (
        employee_id = public.crm_current_employee_id()
        AND EXISTS (
            SELECT 1
            FROM public.crm_tasks AS tasks
            WHERE tasks.id = task_id
              AND tasks.assigned_employee_id = public.crm_current_employee_id()
        )
    );

DROP POLICY IF EXISTS "Employees read own audit logs" ON public.crm_audit_logs;
CREATE POLICY "Employees read own audit logs"
    ON public.crm_audit_logs FOR SELECT TO authenticated
    USING (
        actor_role = 'employee'
        AND position(public.crm_current_employee_id() IN actor) > 0
    );

DROP POLICY IF EXISTS "Employees insert own audit logs" ON public.crm_audit_logs;
CREATE POLICY "Employees insert own audit logs"
    ON public.crm_audit_logs FOR INSERT TO authenticated
    WITH CHECK (
        actor_role = 'employee'
        AND position(public.crm_current_employee_id() IN actor) > 0
    );

DROP POLICY IF EXISTS "Employees read own notifications" ON public.crm_notifications;
CREATE POLICY "Employees read own notifications"
    ON public.crm_notifications FOR SELECT TO authenticated
    USING (
        recipient_employee_id IS NULL
        OR recipient_employee_id = public.crm_current_employee_id()
    );

DROP POLICY IF EXISTS "Employees update own notifications" ON public.crm_notifications;
CREATE POLICY "Employees update own notifications"
    ON public.crm_notifications FOR UPDATE TO authenticated
    USING (recipient_employee_id = public.crm_current_employee_id())
    WITH CHECK (recipient_employee_id = public.crm_current_employee_id());

GRANT SELECT, INSERT, UPDATE, DELETE ON
    public.crm_employees,
    public.crm_clients,
    public.crm_projects,
    public.crm_project_assignments,
    public.crm_tasks,
    public.crm_task_progress_logs,
    public.crm_invoices,
    public.crm_payments,
    public.crm_audit_logs,
    public.crm_notifications
TO authenticated;

CREATE OR REPLACE FUNCTION public.crm_recalculate_project_progress()
RETURNS TRIGGER
LANGUAGE PLPGSQL
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    UPDATE public.crm_projects AS projects
    SET completion_percentage = COALESCE((
        SELECT ROUND(
            SUM(tasks.completion_percentage * GREATEST(tasks.weight, 0))
            / NULLIF(SUM(GREATEST(tasks.weight, 0)), 0),
            1
        )
        FROM public.crm_tasks AS tasks
        WHERE tasks.project_id = NEW.project_id
    ), 0),
    updated_at = NOW()
    WHERE projects.id = NEW.project_id;

    RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.crm_recalculate_project_progress() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS crm_recalculate_project_progress ON public.crm_tasks;
CREATE TRIGGER crm_recalculate_project_progress
    AFTER INSERT OR UPDATE OF completion_percentage, status, weight ON public.crm_tasks
    FOR EACH ROW
    EXECUTE FUNCTION public.crm_recalculate_project_progress();

CREATE OR REPLACE FUNCTION public.crm_protect_employee_task_updates()
RETURNS TRIGGER
LANGUAGE PLPGSQL
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    IF NOT public.crm_is_admin() AND (
        NEW.title IS DISTINCT FROM OLD.title
        OR NEW.description IS DISTINCT FROM OLD.description
        OR NEW.project_id IS DISTINCT FROM OLD.project_id
        OR NEW.project_title IS DISTINCT FROM OLD.project_title
        OR NEW.client_id IS DISTINCT FROM OLD.client_id
        OR NEW.client_name IS DISTINCT FROM OLD.client_name
        OR NEW.assigned_employee_id IS DISTINCT FROM OLD.assigned_employee_id
        OR NEW.assigned_employee_name IS DISTINCT FROM OLD.assigned_employee_name
        OR NEW.priority IS DISTINCT FROM OLD.priority
        OR NEW.start_date IS DISTINCT FROM OLD.start_date
        OR NEW.due_date IS DISTINCT FROM OLD.due_date
        OR NEW.estimated_hours IS DISTINCT FROM OLD.estimated_hours
        OR NEW.admin_instructions IS DISTINCT FROM OLD.admin_instructions
        OR NEW.weight IS DISTINCT FROM OLD.weight
        OR NEW.attachments IS DISTINCT FROM OLD.attachments
    ) THEN
        RAISE EXCEPTION 'Employees may update progress only on their own tasks.';
    END IF;

    RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.crm_protect_employee_task_updates() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS crm_protect_employee_task_updates ON public.crm_tasks;
CREATE TRIGGER crm_protect_employee_task_updates
    BEFORE UPDATE ON public.crm_tasks
    FOR EACH ROW
    EXECUTE FUNCTION public.crm_protect_employee_task_updates();

CREATE OR REPLACE FUNCTION public.crm_update_invoice_balance(invoice_id_to_update TEXT)
RETURNS VOID
LANGUAGE PLPGSQL
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    total_paid NUMERIC;
BEGIN
    SELECT COALESCE(SUM(payments.amount), 0)
    INTO total_paid
    FROM public.crm_payments AS payments
    WHERE payments.invoice_id = invoice_id_to_update;

    UPDATE public.crm_invoices AS invoices
    SET paid_amount = total_paid,
        outstanding_balance = GREATEST(
            invoices.total_amount - total_paid,
            0
        ),
        status = CASE
            WHEN invoices.status = 'Cancelled' THEN invoices.status
            WHEN total_paid >= invoices.total_amount THEN 'Paid'
            WHEN total_paid > 0 THEN 'Partially Paid'
            ELSE invoices.status
        END
    WHERE invoices.id = invoice_id_to_update;
END;
$$;

CREATE OR REPLACE FUNCTION public.crm_recalculate_invoice_balance()
RETURNS TRIGGER
LANGUAGE PLPGSQL
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    IF TG_OP = 'DELETE' OR TG_OP = 'UPDATE' THEN
        PERFORM public.crm_update_invoice_balance(OLD.invoice_id);
    END IF;
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        IF TG_OP <> 'UPDATE' OR NEW.invoice_id IS DISTINCT FROM OLD.invoice_id THEN
            PERFORM public.crm_update_invoice_balance(NEW.invoice_id);
        END IF;
    END IF;

    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    END IF;
    RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.crm_update_invoice_balance(TEXT) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.crm_recalculate_invoice_balance() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS crm_recalculate_invoice_balance ON public.crm_payments;
CREATE TRIGGER crm_recalculate_invoice_balance
    AFTER INSERT OR UPDATE OR DELETE ON public.crm_payments
    FOR EACH ROW
    EXECUTE FUNCTION public.crm_recalculate_invoice_balance();
