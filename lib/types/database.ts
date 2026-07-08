// Database type definitions for all features

export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  role: 'owner' | 'admin' | 'editor' | 'viewer';
  subscription_tier: 'free' | 'pro' | 'enterprise';
  created_at: string;
  updated_at: string;
}

export interface Team {
  id: string;
  owner_id: string;
  name: string;
  description?: string;
  logo_url?: string;
  created_at: string;
  updated_at: string;
}

export interface TeamMember {
  id: string;
  team_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'editor' | 'viewer';
  invited_by: string;
  created_at: string;
}

export interface Invoice {
  id: string;
  team_id: string;
  project_id: string;
  client_id: string;
  invoice_number: string;
  quote_id?: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  amount: number;
  tax_amount: number;
  total_amount: number;
  currency: string;
  issue_date: string;
  due_date: string;
  paid_date?: string;
  payment_method?: string;
  stripe_payment_id?: string;
  notes?: string;
  terms?: string;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: string;
  invoice_id: string;
  stripe_charge_id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  payment_method: string;
  created_at: string;
  updated_at: string;
}

export interface ProjectTemplate {
  id: string;
  team_id: string;
  name: string;
  description: string;
  category: string;
  tasks: TemplateTask[];
  materials: TemplateMaterial[];
  default_quote_template?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface TemplateTask {
  id: string;
  title: string;
  description?: string;
  estimated_duration_hours?: number;
  priority?: 'low' | 'medium' | 'high';
  order: number;
}

export interface TemplateMaterial {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  unit_cost: number;
  order: number;
}

export interface QuoteTemplate {
  id: string;
  team_id: string;
  name: string;
  title: string;
  description: string;
  terms: string;
  notes: string;
  footer: string;
  is_default: boolean;
  created_by: string;
  created_at: string;
}

export interface TaskTemplate {
  id: string;
  team_id: string;
  name: string;
  description: string;
  tasks: TemplateTask[];
  created_by: string;
  created_at: string;
}

export interface BudgetTracking {
  id: string;
  project_id: string;
  estimated_budget: number;
  spent_amount: number;
  materials_cost: number;
  labor_cost: number;
  other_costs: number;
  currency: string;
  created_at: string;
  updated_at: string;
}

export interface Reminder {
  id: string;
  team_id: string;
  user_id: string;
  type: 'email' | 'sms' | 'push' | 'in_app';
  subject: string;
  content: string;
  related_entity_type: 'quote' | 'invoice' | 'task' | 'project';
  related_entity_id: string;
  scheduled_for: string;
  sent_at?: string;
  status: 'scheduled' | 'sent' | 'failed';
  created_at: string;
}

export interface ClientComment {
  id: string;
  project_id: string;
  user_id: string;
  content: string;
  mentioned_users?: string[];
  created_at: string;
  updated_at: string;
}

export interface ProjectPermission {
  id: string;
  project_id: string;
  user_id: string;
  team_id: string;
  permission: 'owner' | 'editor' | 'viewer' | 'client';
  created_at: string;
}

export interface ClientPortalToken {
  id: string;
  project_id: string;
  client_id: string;
  token: string;
  expires_at: string;
  created_at: string;
}

export interface SearchIndex {
  id: string;
  team_id: string;
  entity_type: 'quote' | 'invoice' | 'task' | 'project' | 'client' | 'material' | 'note';
  entity_id: string;
  title: string;
  content: string;
  indexed_at: string;
}

export interface AnalyticsData {
  id: string;
  team_id: string;
  date: string;
  revenue: number;
  expenses: number;
  quotes_created: number;
  invoices_created: number;
  invoices_paid: number;
  projects_completed: number;
  new_clients: number;
  updated_at: string;
}

export interface ThemePreference {
  id: string;
  user_id: string;
  theme: 'light' | 'dark' | 'system';
  accent_color?: string;
  created_at: string;
  updated_at: string;
}

export interface SavedFilter {
  id: string;
  team_id: string;
  user_id: string;
  name: string;
  entity_type: string;
  filters: Record<string, any>;
  created_at: string;
}

// ========== NEW 18 FEATURES ==========

// 1. DOCUMENT MANAGEMENT
export interface Document {
  id: string;
  team_id: string;
  project_id?: string;
  title: string;
  description?: string;
  file_url: string;
  file_type: 'blueprint' | 'contract' | 'spec' | 'permit' | 'warranty' | 'other';
  file_size: number;
  uploaded_by: string;
  version: number;
  expires_at?: string;
  is_searchable: boolean;
  created_at: string;
  updated_at: string;
}

// 2. TIME TRACKING
export interface TimeEntry {
  id: string;
  team_id: string;
  user_id: string;
  project_id: string;
  task_id?: string;
  start_time: string;
  end_time?: string;
  duration_minutes: number;
  billable: boolean;
  hourly_rate: number;
  total_cost: number;
  notes?: string;
  break_minutes?: number;
  created_at: string;
  updated_at: string;
}

// 3. EXPENSE TRACKING
export interface Expense {
  id: string;
  team_id: string;
  project_id: string;
  user_id: string;
  category: 'materials' | 'fuel' | 'equipment' | 'subcontractor' | 'other';
  amount: number;
  currency: string;
  description: string;
  receipt_url?: string;
  receipt_date: string;
  expense_date: string;
  billable: boolean;
  created_at: string;
  updated_at: string;
}

// 4. PHOTO GALLERY & BEFORE/AFTER
export interface ProjectPhoto {
  id: string;
  team_id: string;
  project_id: string;
  title: string;
  description?: string;
  image_url: string;
  thumbnail_url: string;
  phase: 'before' | 'during' | 'after';
  taken_at: string;
  latitude?: number;
  longitude?: number;
  uploaded_by: string;
  order: number;
  created_at: string;
}

export interface BeforeAfterComparison {
  id: string;
  team_id: string;
  project_id: string;
  title: string;
  before_photo_id: string;
  after_photo_id: string;
  created_at: string;
}

// 5. CLIENT PORTAL
export interface ClientPortalUser {
  id: string;
  team_id: string;
  email: string;
  name: string;
  company?: string;
  phone?: string;
  projects: string[]; // project IDs visible to this client
  created_at: string;
  updated_at: string;
}

// 6. PROJECT APPROVALS WORKFLOW
export interface ProjectApproval {
  id: string;
  team_id: string;
  project_id: string;
  entity_type: 'quote' | 'change_order' | 'invoice' | 'proposal';
  entity_id: string;
  status: 'pending' | 'approved' | 'rejected' | 'needs_revision';
  approvers: ApprovalStep[];
  reason_for_rejection?: string;
  created_at: string;
  updated_at: string;
}

export interface ApprovalStep {
  approver_id: string;
  approved_at?: string;
  approved: boolean;
  notes?: string;
  order: number;
}

// 7. CHANGE ORDER MANAGEMENT
export interface ChangeOrder {
  id: string;
  team_id: string;
  project_id: string;
  quote_id?: string;
  invoice_id?: string;
  change_order_number: string;
  title: string;
  description: string;
  status: 'draft' | 'pending_approval' | 'approved' | 'rejected' | 'billed';
  cost_impact: number; // positive or negative
  timeline_impact_days: number;
  reason: string;
  client_approved_at?: string;
  team_approved_at?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

// 8. SUBCONTRACTOR MANAGEMENT
export interface Subcontractor {
  id: string;
  team_id: string;
  name: string;
  email: string;
  phone: string;
  specialty: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  hourly_rate?: number;
  flat_rate?: number;
  insurance_expiry?: string;
  license_number?: string;
  license_expiry?: string;
  rating: number; // 1-5 stars
  total_jobs: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface SubcontractorQuote {
  id: string;
  team_id: string;
  project_id: string;
  subcontractor_id: string;
  description: string;
  amount: number;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  requested_at: string;
  responded_at?: string;
  created_at: string;
}

export interface SubcontractorPayment {
  id: string;
  team_id: string;
  subcontractor_id: string;
  project_id?: string;
  amount: number;
  currency: string;
  status: 'pending' | 'paid' | 'failed';
  scheduled_for: string;
  paid_at?: string;
  payment_method: 'stripe' | 'bank_transfer' | 'check' | 'cash';
  created_at: string;
}

// 9. EQUIPMENT/TOOL TRACKING
export interface Equipment {
  id: string;
  team_id: string;
  name: string;
  category: string;
  acquisition_type: 'owned' | 'leased' | 'rented';
  cost: number;
  acquisition_date: string;
  useful_life_years?: number;
  current_location?: string;
  status: 'available' | 'in_use' | 'maintenance' | 'retired';
  assigned_to?: string;
  assigned_to_project?: string;
  maintenance_schedule?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface EquipmentMaintenance {
  id: string;
  equipment_id: string;
  maintenance_type: 'preventive' | 'corrective' | 'emergency';
  performed_by: string;
  performed_at: string;
  cost: number;
  description: string;
  next_maintenance?: string;
  created_at: string;
}

// 10. MATERIAL INVENTORY
export interface MaterialInventory {
  id: string;
  team_id: string;
  material_id: string;
  current_stock: number;
  reorder_point: number;
  reorder_quantity: number;
  supplier_id?: string;
  supplier_price: number;
  lead_time_days: number;
  location: string;
  last_updated_at: string;
}

export interface MaterialSupplier {
  id: string;
  team_id: string;
  name: string;
  contact_email: string;
  phone: string;
  address?: string;
  lead_time_days: number;
  payment_terms?: string;
  notes?: string;
  created_at: string;
}

// 11. PROJECT PROFITABILITY (extends AnalyticsData)
export interface ProjectProfitability {
  id: string;
  team_id: string;
  project_id: string;
  quoted_price: number;
  actual_revenue: number;
  material_costs: number;
  labor_costs: number;
  subcontractor_costs: number;
  equipment_costs: number;
  other_costs: number;
  total_costs: number;
  gross_profit: number;
  profit_margin_percent: number;
  status: 'in_progress' | 'completed' | 'cancelled';
  calculated_at: string;
}

// 12. AUTOMATED WORKFLOW ENGINE
export interface Workflow {
  id: string;
  team_id: string;
  name: string;
  description?: string;
  is_active: boolean;
  trigger_type: 'event' | 'schedule' | 'manual';
  trigger_event?: 'project_created' | 'quote_accepted' | 'invoice_sent' | 'project_completed';
  trigger_schedule?: string; // cron format
  actions: WorkflowAction[];
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface WorkflowAction {
  id: string;
  action_type: 'send_email' | 'send_sms' | 'create_task' | 'create_invoice' | 'post_to_slack' | 'call_webhook';
  config: Record<string, any>; // Template variables and action-specific config
  order: number;
}

export interface WorkflowExecution {
  id: string;
  workflow_id: string;
  triggered_by: 'event' | 'schedule' | 'manual';
  entity_type?: string;
  entity_id?: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  executed_actions: number;
  error_message?: string;
  executed_at: string;
}

// 13. COMPLIANCE & SAFETY
export interface SafetyLog {
  id: string;
  team_id: string;
  project_id: string;
  user_id: string;
  log_type: 'daily_briefing' | 'incident' | 'near_miss' | 'hazard_identified' | 'inspection';
  title: string;
  description: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  location: string;
  created_at: string;
  updated_at: string;
}

export interface SafetyChecklist {
  id: string;
  team_id: string;
  name: string;
  items: SafetyChecklistItem[];
  created_at: string;
}

export interface SafetyChecklistItem {
  id: string;
  text: string;
  completed: boolean;
  completed_by?: string;
  completed_at?: string;
}

export interface ComplianceAlert {
  id: string;
  team_id: string;
  alert_type: 'permit_expiring' | 'license_expiring' | 'insurance_expiring' | 'inspection_due';
  related_entity_type: string;
  related_entity_id: string;
  expires_at: string;
  alert_at: string;
  dismissed: boolean;
  created_at: string;
}

// 14. WARRANTY TRACKING
export interface Warranty {
  id: string;
  team_id: string;
  project_id: string;
  item_description: string;
  warranty_type: 'labor' | 'material' | 'combined';
  coverage_description: string;
  start_date: string;
  end_date: string;
  coverage_period_months: number;
  supplier_info?: string;
  supplier_contact?: string;
  notes?: string;
  created_at: string;
}

export interface WarrantyClaim {
  id: string;
  warranty_id: string;
  claim_number: string;
  issue_description: string;
  reported_by: string;
  reported_date: string;
  claim_amount: number;
  status: 'pending' | 'approved' | 'rejected' | 'completed' | 'disputed';
  resolution?: string;
  resolved_date?: string;
  created_at: string;
}

// 15. CLIENT COMMUNICATION HUB
export interface ClientMessage {
  id: string;
  team_id: string;
  project_id: string;
  sender_id: string;
  message_type: 'message' | 'request' | 'update' | 'question';
  title?: string;
  content: string;
  attachments?: string[]; // file URLs
  priority?: 'low' | 'normal' | 'high';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  assigned_to?: string;
  resolved_by?: string;
  resolved_at?: string;
  created_at: string;
  updated_at: string;
}

export interface ClientRequest {
  id: string;
  team_id: string;
  project_id: string;
  request_type: 'change' | 'clarification' | 'information' | 'support';
  title: string;
  description: string;
  requested_by: string;
  status: 'pending' | 'acknowledged' | 'in_progress' | 'completed';
  response?: string;
  responded_at?: string;
  created_at: string;
}

// 16. PREDICTIVE ANALYTICS
export interface PredictionModel {
  id: string;
  team_id: string;
  model_type: 'estimate_accuracy' | 'timeline_risk' | 'crew_productivity' | 'material_cost' | 'churn_risk';
  accuracy_percent: number;
  last_trained: string;
  predictions_count: number;
}

export interface Prediction {
  id: string;
  team_id: string;
  model_id: string;
  entity_type: string;
  entity_id: string;
  prediction_type: string;
  predicted_value: number | string;
  confidence_percent: number;
  recommendation?: string;
  created_at: string;
}

// ========== INTEGRATION MODELS ==========

export interface IntegrationConfig {
  id: string;
  team_id: string;
  integration_type: 'quickbooks' | 'google_calendar' | 'slack' | 'twilio' | 'zapier';
  is_active: boolean;
  auth_token?: string;
  auth_secret?: string;
  webhook_url?: string;
  config: Record<string, any>;
  last_synced_at?: string;
  created_at: string;
  updated_at: string;
}

export interface SyncLog {
  id: string;
  integration_type: string;
  team_id: string;
  sync_type: 'push' | 'pull';
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  records_synced: number;
  error_message?: string;
  synced_at: string;
}
