-- Comprehensive Supabase Migration Script
-- Run this SQL in your Supabase SQL Editor to set up all 35 features

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For full-text search

-- ==================== CORE TABLES ====================

-- Users (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  avatar_url TEXT,
  role TEXT CHECK (role IN ('owner', 'admin', 'editor', 'viewer')) DEFAULT 'viewer',
  subscription_tier TEXT CHECK (subscription_tier IN ('free', 'pro', 'enterprise')) DEFAULT 'free',
  preferences JSONB DEFAULT '{"businessType":"","primaryFocus":[],"teamSize":"","painPoints":[],"integrations":[]}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Teams
CREATE TABLE IF NOT EXISTS public.teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  logo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Team Members
CREATE TABLE IF NOT EXISTS public.team_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  role TEXT CHECK (role IN ('owner', 'admin', 'editor', 'viewer')) DEFAULT 'editor',
  invited_by UUID REFERENCES public.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Projects
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  client_id UUID,
  status TEXT DEFAULT 'active',
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Clients
CREATE TABLE IF NOT EXISTS public.clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  company TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==================== INVOICING & PAYMENTS ====================

CREATE TABLE IF NOT EXISTS public.invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  project_id UUID REFERENCES public.projects(id),
  client_id UUID REFERENCES public.clients(id),
  invoice_number TEXT NOT NULL UNIQUE,
  status TEXT CHECK (status IN ('draft', 'sent', 'paid', 'overdue', 'cancelled')) DEFAULT 'draft',
  amount DECIMAL(12, 2),
  tax_amount DECIMAL(12, 2) DEFAULT 0,
  total_amount DECIMAL(12, 2),
  currency TEXT DEFAULT 'USD',
  issue_date DATE,
  due_date DATE,
  paid_date DATE,
  payment_method TEXT,
  stripe_payment_id TEXT,
  notes TEXT,
  terms TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
  stripe_charge_id TEXT,
  amount DECIMAL(12, 2),
  currency TEXT DEFAULT 'USD',
  status TEXT CHECK (status IN ('pending', 'completed', 'failed', 'refunded')) DEFAULT 'pending',
  payment_method TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==================== ORIGINAL 15 FEATURES ====================

CREATE TABLE IF NOT EXISTS public.project_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  tasks JSONB DEFAULT '[]',
  materials JSONB DEFAULT '[]',
  default_quote_template UUID,
  created_by UUID REFERENCES public.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.quote_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  title TEXT,
  description TEXT,
  terms TEXT,
  notes TEXT,
  footer TEXT,
  is_default BOOLEAN DEFAULT FALSE,
  created_by UUID REFERENCES public.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.task_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  tasks JSONB DEFAULT '[]',
  created_by UUID REFERENCES public.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.budget_tracking (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  estimated_budget DECIMAL(12, 2),
  spent_amount DECIMAL(12, 2) DEFAULT 0,
  materials_cost DECIMAL(12, 2) DEFAULT 0,
  labor_cost DECIMAL(12, 2) DEFAULT 0,
  other_costs DECIMAL(12, 2) DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.reminders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id),
  type TEXT CHECK (type IN ('email', 'sms', 'push', 'in_app')) DEFAULT 'email',
  subject TEXT,
  content TEXT,
  related_entity_type TEXT,
  related_entity_id TEXT,
  scheduled_for TIMESTAMP WITH TIME ZONE,
  sent_at TIMESTAMP WITH TIME ZONE,
  status TEXT CHECK (status IN ('scheduled', 'sent', 'failed')) DEFAULT 'scheduled',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.search_index (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  entity_type TEXT,
  entity_id TEXT,
  title TEXT,
  content TEXT,
  indexed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.analytics_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  date DATE,
  revenue DECIMAL(12, 2),
  expenses DECIMAL(12, 2),
  quotes_created INTEGER,
  invoices_created INTEGER,
  invoices_paid INTEGER,
  projects_completed INTEGER,
  new_clients INTEGER,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.theme_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE UNIQUE,
  theme TEXT CHECK (theme IN ('light', 'dark', 'system')) DEFAULT 'system',
  accent_color TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.saved_filters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id),
  name TEXT,
  entity_type TEXT,
  filters JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==================== 18 NEW FEATURES ====================

-- 1. DOCUMENT MANAGEMENT
CREATE TABLE IF NOT EXISTS public.documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  project_id UUID REFERENCES public.projects(id),
  title TEXT NOT NULL,
  description TEXT,
  file_url TEXT NOT NULL,
  file_type TEXT CHECK (file_type IN ('blueprint', 'contract', 'spec', 'permit', 'warranty', 'other')),
  file_size INTEGER,
  uploaded_by UUID REFERENCES public.users(id),
  version INTEGER DEFAULT 1,
  expires_at DATE,
  is_searchable BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. TIME TRACKING
CREATE TABLE IF NOT EXISTS public.time_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id),
  project_id UUID NOT NULL REFERENCES public.projects(id),
  task_id UUID,
  start_time TIMESTAMP WITH TIME ZONE,
  end_time TIMESTAMP WITH TIME ZONE,
  duration_minutes INTEGER,
  billable BOOLEAN DEFAULT TRUE,
  hourly_rate DECIMAL(10, 2),
  total_cost DECIMAL(12, 2),
  notes TEXT,
  break_minutes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. EXPENSE TRACKING
CREATE TABLE IF NOT EXISTS public.expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES public.projects(id),
  user_id UUID NOT NULL REFERENCES public.users(id),
  category TEXT CHECK (category IN ('materials', 'fuel', 'equipment', 'subcontractor', 'other')),
  amount DECIMAL(12, 2),
  currency TEXT DEFAULT 'USD',
  description TEXT,
  receipt_url TEXT,
  receipt_date DATE,
  expense_date DATE,
  billable BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. PHOTO GALLERY
CREATE TABLE IF NOT EXISTS public.project_photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES public.projects(id),
  title TEXT,
  description TEXT,
  image_url TEXT NOT NULL,
  thumbnail_url TEXT,
  phase TEXT CHECK (phase IN ('before', 'during', 'after')),
  taken_at TIMESTAMP WITH TIME ZONE,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  uploaded_by UUID REFERENCES public.users(id),
  "order" INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.before_after_comparisons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES public.projects(id),
  title TEXT,
  before_photo_id UUID REFERENCES public.project_photos(id),
  after_photo_id UUID REFERENCES public.project_photos(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. CLIENT PORTAL
CREATE TABLE IF NOT EXISTS public.client_portal_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT,
  company TEXT,
  phone TEXT,
  projects TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. PROJECT APPROVALS
CREATE TABLE IF NOT EXISTS public.project_approvals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES public.projects(id),
  entity_type TEXT CHECK (entity_type IN ('quote', 'change_order', 'invoice', 'proposal')),
  entity_id TEXT,
  status TEXT CHECK (status IN ('pending', 'approved', 'rejected', 'needs_revision')) DEFAULT 'pending',
  approvers JSONB DEFAULT '[]',
  reason_for_rejection TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. CHANGE ORDERS
CREATE TABLE IF NOT EXISTS public.change_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES public.projects(id),
  quote_id UUID,
  invoice_id UUID,
  change_order_number TEXT NOT NULL UNIQUE,
  title TEXT,
  description TEXT,
  status TEXT CHECK (status IN ('draft', 'pending_approval', 'approved', 'rejected', 'billed')) DEFAULT 'draft',
  cost_impact DECIMAL(12, 2),
  timeline_impact_days INTEGER,
  reason TEXT,
  client_approved_at TIMESTAMP WITH TIME ZONE,
  team_approved_at TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES public.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. SUBCONTRACTORS
CREATE TABLE IF NOT EXISTS public.subcontractors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  specialty TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  hourly_rate DECIMAL(10, 2),
  flat_rate DECIMAL(12, 2),
  insurance_expiry DATE,
  license_number TEXT,
  license_expiry DATE,
  rating DECIMAL(3, 1),
  total_jobs INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.subcontractor_quotes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES public.projects(id),
  subcontractor_id UUID NOT NULL REFERENCES public.subcontractors(id),
  description TEXT,
  amount DECIMAL(12, 2),
  status TEXT CHECK (status IN ('pending', 'accepted', 'rejected', 'completed')) DEFAULT 'pending',
  requested_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  responded_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.subcontractor_payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  subcontractor_id UUID NOT NULL REFERENCES public.subcontractors(id),
  project_id UUID,
  amount DECIMAL(12, 2),
  currency TEXT DEFAULT 'USD',
  status TEXT CHECK (status IN ('pending', 'paid', 'failed')) DEFAULT 'pending',
  scheduled_for TIMESTAMP WITH TIME ZONE,
  paid_at TIMESTAMP WITH TIME ZONE,
  payment_method TEXT CHECK (payment_method IN ('stripe', 'bank_transfer', 'check', 'cash')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. EQUIPMENT TRACKING
CREATE TABLE IF NOT EXISTS public.equipment (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT,
  acquisition_type TEXT CHECK (acquisition_type IN ('owned', 'leased', 'rented')),
  cost DECIMAL(12, 2),
  acquisition_date DATE,
  useful_life_years INTEGER,
  current_location TEXT,
  status TEXT CHECK (status IN ('available', 'in_use', 'maintenance', 'retired')) DEFAULT 'available',
  assigned_to UUID REFERENCES public.users(id),
  assigned_to_project UUID REFERENCES public.projects(id),
  maintenance_schedule TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.equipment_maintenance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  equipment_id UUID NOT NULL REFERENCES public.equipment(id) ON DELETE CASCADE,
  maintenance_type TEXT CHECK (maintenance_type IN ('preventive', 'corrective', 'emergency')),
  performed_by UUID REFERENCES public.users(id),
  performed_at TIMESTAMP WITH TIME ZONE,
  cost DECIMAL(12, 2),
  description TEXT,
  next_maintenance DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. MATERIAL INVENTORY
CREATE TABLE IF NOT EXISTS public.material_inventory (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  material_id TEXT,
  current_stock INTEGER,
  reorder_point INTEGER,
  reorder_quantity INTEGER,
  supplier_id UUID,
  supplier_price DECIMAL(10, 2),
  lead_time_days INTEGER,
  location TEXT,
  last_updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.material_suppliers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  contact_email TEXT,
  phone TEXT,
  address TEXT,
  lead_time_days INTEGER,
  payment_terms TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 11. PROJECT PROFITABILITY
CREATE TABLE IF NOT EXISTS public.project_profitability (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES public.projects(id) UNIQUE,
  quoted_price DECIMAL(12, 2),
  actual_revenue DECIMAL(12, 2),
  material_costs DECIMAL(12, 2) DEFAULT 0,
  labor_costs DECIMAL(12, 2) DEFAULT 0,
  subcontractor_costs DECIMAL(12, 2) DEFAULT 0,
  equipment_costs DECIMAL(12, 2) DEFAULT 0,
  other_costs DECIMAL(12, 2) DEFAULT 0,
  total_costs DECIMAL(12, 2),
  gross_profit DECIMAL(12, 2),
  profit_margin_percent DECIMAL(5, 2),
  status TEXT CHECK (status IN ('in_progress', 'completed', 'cancelled')),
  calculated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 12. WORKFLOWS
CREATE TABLE IF NOT EXISTS public.workflows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  trigger_type TEXT CHECK (trigger_type IN ('event', 'schedule', 'manual')),
  trigger_event TEXT,
  trigger_schedule TEXT,
  actions JSONB DEFAULT '[]',
  created_by UUID REFERENCES public.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.workflow_executions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workflow_id UUID NOT NULL REFERENCES public.workflows(id) ON DELETE CASCADE,
  triggered_by TEXT CHECK (triggered_by IN ('event', 'schedule', 'manual')),
  entity_type TEXT,
  entity_id TEXT,
  status TEXT CHECK (status IN ('pending', 'running', 'completed', 'failed')) DEFAULT 'pending',
  executed_actions INTEGER,
  error_message TEXT,
  executed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 13. SAFETY & COMPLIANCE
CREATE TABLE IF NOT EXISTS public.safety_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES public.projects(id),
  user_id UUID NOT NULL REFERENCES public.users(id),
  log_type TEXT CHECK (log_type IN ('daily_briefing', 'incident', 'near_miss', 'hazard_identified', 'inspection')),
  title TEXT,
  description TEXT,
  severity TEXT CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  location TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.safety_checklists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  name TEXT,
  items JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.compliance_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  alert_type TEXT CHECK (alert_type IN ('permit_expiring', 'license_expiring', 'insurance_expiring', 'inspection_due')),
  related_entity_type TEXT,
  related_entity_id TEXT,
  expires_at DATE,
  alert_at TIMESTAMP WITH TIME ZONE,
  dismissed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 14. WARRANTY TRACKING
CREATE TABLE IF NOT EXISTS public.warranties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES public.projects(id),
  item_description TEXT,
  warranty_type TEXT CHECK (warranty_type IN ('labor', 'material', 'combined')),
  coverage_description TEXT,
  start_date DATE,
  end_date DATE,
  coverage_period_months INTEGER,
  supplier_info TEXT,
  supplier_contact TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.warranty_claims (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  warranty_id UUID NOT NULL REFERENCES public.warranties(id) ON DELETE CASCADE,
  claim_number TEXT UNIQUE,
  issue_description TEXT,
  reported_by UUID REFERENCES public.users(id),
  reported_date DATE,
  claim_amount DECIMAL(12, 2),
  status TEXT CHECK (status IN ('pending', 'approved', 'rejected', 'completed', 'disputed')) DEFAULT 'pending',
  resolution TEXT,
  resolved_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 15. CLIENT COMMUNICATIONS
CREATE TABLE IF NOT EXISTS public.client_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES public.projects(id),
  sender_id UUID NOT NULL REFERENCES public.users(id),
  message_type TEXT CHECK (message_type IN ('message', 'request', 'update', 'question')),
  title TEXT,
  content TEXT,
  attachments TEXT[] DEFAULT '{}',
  priority TEXT CHECK (priority IN ('low', 'normal', 'high')),
  status TEXT CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')) DEFAULT 'open',
  assigned_to UUID REFERENCES public.users(id),
  resolved_by UUID REFERENCES public.users(id),
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.client_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES public.projects(id),
  request_type TEXT CHECK (request_type IN ('change', 'clarification', 'information', 'support')),
  title TEXT,
  description TEXT,
  requested_by UUID NOT NULL REFERENCES public.users(id),
  status TEXT CHECK (status IN ('pending', 'acknowledged', 'in_progress', 'completed')) DEFAULT 'pending',
  response TEXT,
  responded_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 16. PREDICTIVE ANALYTICS
CREATE TABLE IF NOT EXISTS public.prediction_models (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  model_type TEXT CHECK (model_type IN ('estimate_accuracy', 'timeline_risk', 'crew_productivity', 'material_cost', 'churn_risk')),
  accuracy_percent DECIMAL(5, 2),
  last_trained TIMESTAMP WITH TIME ZONE,
  predictions_count INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS public.predictions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  model_id UUID REFERENCES public.prediction_models(id),
  entity_type TEXT,
  entity_id TEXT,
  prediction_type TEXT,
  predicted_value TEXT,
  confidence_percent DECIMAL(5, 2),
  recommendation TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 17. INTEGRATIONS
CREATE TABLE IF NOT EXISTS public.integration_configs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE UNIQUE,
  integration_type TEXT CHECK (integration_type IN ('quickbooks', 'google_calendar', 'slack', 'twilio', 'zapier')),
  is_active BOOLEAN DEFAULT FALSE,
  auth_token TEXT,
  auth_secret TEXT,
  webhook_url TEXT,
  config JSONB,
  last_synced_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.sync_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  integration_type TEXT,
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  sync_type TEXT CHECK (sync_type IN ('push', 'pull')),
  status TEXT CHECK (status IN ('pending', 'in_progress', 'completed', 'failed')) DEFAULT 'pending',
  records_synced INTEGER,
  error_message TEXT,
  synced_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==================== INDEXES FOR PERFORMANCE ====================

CREATE INDEX IF NOT EXISTS idx_users_team ON public.team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_projects_team ON public.projects(team_id);
CREATE INDEX IF NOT EXISTS idx_invoices_team ON public.invoices(team_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON public.invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_project ON public.invoices(project_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_project ON public.time_entries(project_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_user ON public.time_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_expenses_project ON public.expenses(project_id);
CREATE INDEX IF NOT EXISTS idx_documents_project ON public.documents(project_id);
CREATE INDEX IF NOT EXISTS idx_documents_search ON public.documents USING GIN(to_tsvector('english', title || ' ' || COALESCE(description, '')));
CREATE INDEX IF NOT EXISTS idx_photos_project ON public.project_photos(project_id);
CREATE INDEX IF NOT EXISTS idx_safety_logs_project ON public.safety_logs(project_id);
CREATE INDEX IF NOT EXISTS idx_budget_project ON public.budget_tracking(project_id);
CREATE INDEX IF NOT EXISTS idx_change_orders_project ON public.change_orders(project_id);
CREATE INDEX IF NOT EXISTS idx_warranties_project ON public.warranties(project_id);

-- ==================== ROW LEVEL SECURITY ====================

ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_entries ENABLE ROW LEVEL SECURITY;

-- Team access policy
DROP POLICY IF EXISTS team_access ON public.teams;
CREATE POLICY team_access ON public.teams
  FOR SELECT USING (
    id IN (
      SELECT team_id FROM public.team_members WHERE user_id = auth.uid()
    )
    OR owner_id = auth.uid()
  );

-- Project access policy
DROP POLICY IF EXISTS project_access ON public.projects;
CREATE POLICY project_access ON public.projects
  FOR SELECT USING (
    team_id IN (
      SELECT team_id FROM public.team_members WHERE user_id = auth.uid()
    )
  );

-- Invoice access policy
DROP POLICY IF EXISTS invoice_access ON public.invoices;
CREATE POLICY invoice_access ON public.invoices
  FOR SELECT USING (
    team_id IN (
      SELECT team_id FROM public.team_members WHERE user_id = auth.uid()
    )
  );

-- Document access policy
DROP POLICY IF EXISTS document_access ON public.documents;
CREATE POLICY document_access ON public.documents
  FOR SELECT USING (
    team_id IN (
      SELECT team_id FROM public.team_members WHERE user_id = auth.uid()
    )
  );

-- Time entry access policy
DROP POLICY IF EXISTS time_entry_access ON public.time_entries;
CREATE POLICY time_entry_access ON public.time_entries
  FOR SELECT USING (
    team_id IN (
      SELECT team_id FROM public.team_members WHERE user_id = auth.uid()
    )
    OR user_id = auth.uid()
  );

-- ==================== AUDIT LOGGING ====================

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id),
  action TEXT CHECK (action IN ('CREATE', 'READ', 'UPDATE', 'DELETE', 'EXPORT', 'IMPORT', 'SEND', 'APPROVE', 'REJECT', 'ARCHIVE', 'RESTORE', 'LOGIN', 'LOGOUT', 'ACCESS_DENIED', 'BULK_DELETE', 'BULK_UPDATE', 'BULK_EXPORT')),
  entity_type TEXT,
  entity_id TEXT,
  changes JSONB DEFAULT '{}',
  ip_address TEXT,
  user_agent TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_team ON public.audit_logs(team_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON public.audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON public.audit_logs(timestamp);

-- ==================== SAVED VIEWS ====================

CREATE TABLE IF NOT EXISTS public.saved_views (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id),
  name TEXT NOT NULL,
  description TEXT,
  entity_type TEXT NOT NULL,
  filters JSONB DEFAULT '[]',
  sort JSONB,
  columns TEXT[] DEFAULT '{}'::text[],
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_saved_views_team ON public.saved_views(team_id);
CREATE INDEX IF NOT EXISTS idx_saved_views_entity_type ON public.saved_views(entity_type);
CREATE INDEX IF NOT EXISTS idx_saved_views_is_default ON public.saved_views(is_default);

-- ==================== TEAM COLLABORATION ====================

CREATE TABLE IF NOT EXISTS public.comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id),
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  content TEXT NOT NULL,
  mentions UUID[] DEFAULT '{}'::uuid[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_comments_team ON public.comments(team_id);
CREATE INDEX IF NOT EXISTS idx_comments_entity ON public.comments(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_comments_user ON public.comments(user_id);

CREATE TABLE IF NOT EXISTS public.mentions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  mentioned_user_id UUID NOT NULL REFERENCES public.users(id),
  user_id UUID NOT NULL REFERENCES public.users(id),
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_mentions_team ON public.mentions(team_id);
CREATE INDEX IF NOT EXISTS idx_mentions_user ON public.mentions(mentioned_user_id);
CREATE INDEX IF NOT EXISTS idx_mentions_is_read ON public.mentions(is_read);

CREATE TABLE IF NOT EXISTS public.activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  entity_title TEXT,
  description TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_activity_logs_team ON public.activity_logs(team_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user ON public.activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_entity ON public.activity_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_timestamp ON public.activity_logs(created_at);
