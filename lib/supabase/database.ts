import { supabase } from './client';
import type { Invoice, Team, TeamMember, ProjectTemplate, BudgetTracking, Reminder } from '../types/database';

// ==================== TEAMS ====================

export async function createTeam(userId: string, name: string, description?: string) {
  const { data, error } = await supabase
    .from('teams')
    .insert({
      owner_id: userId,
      name,
      description,
    })
    .select()
    .single();

  return { data, error };
}

export async function getUserTeams(userId: string) {
  const { data, error } = await supabase
    .from('team_members')
    .select('team_id, role, teams(id, owner_id, name, description, logo_url)')
    .eq('user_id', userId);

  return { data, error };
}

export async function inviteTeamMember(teamId: string, email: string, role: 'admin' | 'editor' | 'viewer', invitedBy: string) {
  // First find user by email
  const { data: userData } = await supabase
    .from('users')
    .select('id')
    .eq('email', email)
    .single();

  if (!userData) {
    return { data: null, error: new Error('User not found') };
  }

  const { data, error } = await supabase
    .from('team_members')
    .insert({
      team_id: teamId,
      user_id: userData.id,
      role,
      invited_by: invitedBy,
    })
    .select()
    .single();

  return { data, error };
}

export async function getTeamMembers(teamId: string) {
  const { data, error } = await supabase
    .from('team_members')
    .select('*, users(id, email, name, avatar_url)')
    .eq('team_id', teamId);

  return { data, error };
}

// ==================== INVOICES ====================

export async function createInvoice(invoice: Omit<Invoice, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('invoices')
    .insert(invoice)
    .select()
    .single();

  return { data, error };
}

export async function getInvoices(teamId: string, filters?: { status?: string; clientId?: string; dateRange?: [string, string] }) {
  let query = supabase
    .from('invoices')
    .select('*, projects(title), clients(name)')
    .eq('team_id', teamId);

  if (filters?.status) {
    query = query.eq('status', filters.status);
  }

  if (filters?.clientId) {
    query = query.eq('client_id', filters.clientId);
  }

  if (filters?.dateRange) {
    query = query
      .gte('issue_date', filters.dateRange[0])
      .lte('issue_date', filters.dateRange[1]);
  }

  const { data, error } = await query.order('issue_date', { ascending: false });
  return { data, error };
}

export async function getInvoice(invoiceId: string) {
  const { data, error } = await supabase
    .from('invoices')
    .select('*')
    .eq('id', invoiceId)
    .single();

  return { data, error };
}

export async function updateInvoice(invoiceId: string, updates: Partial<Invoice>) {
  const { data, error } = await supabase
    .from('invoices')
    .update(updates)
    .eq('id', invoiceId)
    .select()
    .single();

  return { data, error };
}

// ==================== PAYMENTS ====================

export async function recordPayment(invoiceId: string, paymentData: { stripeChargeId: string; amount: number; paymentMethod: string }) {
  const { data, error } = await supabase
    .from('payments')
    .insert({
      invoice_id: invoiceId,
      stripe_charge_id: paymentData.stripeChargeId,
      amount: paymentData.amount,
      status: 'completed',
      payment_method: paymentData.paymentMethod,
    })
    .select()
    .single();

  if (!error) {
    // Update invoice status to paid
    await updateInvoice(invoiceId, { status: 'paid', paid_date: new Date().toISOString() });
  }

  return { data, error };
}

export async function getPayments(invoiceId: string) {
  const { data, error } = await supabase
    .from('payments')
    .select('*')
    .eq('invoice_id', invoiceId)
    .order('created_at', { ascending: false });

  return { data, error };
}

// ==================== TEMPLATES ====================

export async function createProjectTemplate(template: Omit<ProjectTemplate, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('project_templates')
    .insert(template)
    .select()
    .single();

  return { data, error };
}

export async function getProjectTemplates(teamId: string) {
  const { data, error } = await supabase
    .from('project_templates')
    .select('*')
    .eq('team_id', teamId)
    .order('created_at', { ascending: false });

  return { data, error };
}

export async function useProjectTemplate(teamId: string, templateId: string, projectData: any) {
  // Get template
  const { data: template } = await supabase
    .from('project_templates')
    .select('*')
    .eq('id', templateId)
    .single();

  if (!template) {
    return { data: null, error: new Error('Template not found') };
  }

  // Create project with template data
  const projectToCreate = {
    ...projectData,
    tasks: template.tasks || [],
    materials: template.materials || [],
  };

  // This would call into your existing project creation logic
  return { data: projectToCreate, error: null };
}

// ==================== BUDGET TRACKING ====================

export async function createBudget(budget: Omit<BudgetTracking, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('budget_tracking')
    .insert(budget)
    .select()
    .single();

  return { data, error };
}

export async function getBudget(projectId: string) {
  const { data, error } = await supabase
    .from('budget_tracking')
    .select('*')
    .eq('project_id', projectId)
    .single();

  return { data, error };
}

export async function updateBudget(projectId: string, updates: Partial<BudgetTracking>) {
  const { data, error } = await supabase
    .from('budget_tracking')
    .update(updates)
    .eq('project_id', projectId)
    .select()
    .single();

  return { data, error };
}

// ==================== REMINDERS ====================

export async function createReminder(reminder: Omit<Reminder, 'id' | 'created_at'>) {
  const { data, error } = await supabase
    .from('reminders')
    .insert(reminder)
    .select()
    .single();

  return { data, error };
}

export async function getReminders(teamId: string, userId?: string) {
  let query = supabase
    .from('reminders')
    .select('*')
    .eq('team_id', teamId)
    .eq('status', 'scheduled');

  if (userId) {
    query = query.eq('user_id', userId);
  }

  const { data, error } = await query.order('scheduled_for', { ascending: true });
  return { data, error };
}

export async function markReminderSent(reminderId: string) {
  const { error } = await supabase
    .from('reminders')
    .update({ status: 'sent', sent_at: new Date().toISOString() })
    .eq('id', reminderId);

  return { error };
}

// ==================== SEARCH ====================

export async function searchProjects(teamId: string, query: string) {
  const { data, error } = await supabase
    .from('search_index')
    .select('entity_id, entity_type, title, content')
    .eq('team_id', teamId)
    .ilike('title', `%${query}%`)
    .or(`content.ilike.%${query}%`);

  return { data, error };
}

// ==================== ANALYTICS ====================

export async function getAnalyticsData(teamId: string, startDate: string, endDate: string) {
  const { data, error } = await supabase
    .from('analytics_data')
    .select('*')
    .eq('team_id', teamId)
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: true });

  return { data, error };
}

// ==================== 18 NEW FEATURES ====================

// 1. DOCUMENT MANAGEMENT
export async function uploadDocument(doc: any) {
  const { data, error } = await supabase
    .from('documents')
    .insert(doc)
    .select()
    .single();
  return { data, error };
}

export async function getProjectDocuments(projectId: string) {
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false });
  return { data, error };
}

// 2. TIME TRACKING
export async function createTimeEntry(entry: any) {
  const { data, error } = await supabase
    .from('time_entries')
    .insert(entry)
    .select()
    .single();
  return { data, error };
}

export async function getTimeEntries(projectId: string, startDate?: string, endDate?: string) {
  let query = supabase
    .from('time_entries')
    .select('*')
    .eq('project_id', projectId);

  if (startDate && endDate) {
    query = query
      .gte('start_time', startDate)
      .lte('start_time', endDate);
  }

  const { data, error } = await query.order('start_time', { ascending: false });
  return { data, error };
}

export async function calculateProjectLaborCost(projectId: string) {
  const { data, error } = await supabase
    .from('time_entries')
    .select('total_cost')
    .eq('project_id', projectId);

  const totalCost = data?.reduce((sum: number, entry: any) => sum + entry.total_cost, 0) || 0;
  return { data: totalCost, error };
}

// 3. EXPENSE TRACKING
export async function createExpense(expense: any) {
  const { data, error } = await supabase
    .from('expenses')
    .insert(expense)
    .select()
    .single();
  return { data, error };
}

export async function getProjectExpenses(projectId: string) {
  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .eq('project_id', projectId)
    .order('expense_date', { ascending: false });
  return { data, error };
}

export async function calculateTotalExpenses(projectId: string) {
  const { data, error } = await supabase
    .from('expenses')
    .select('amount')
    .eq('project_id', projectId);

  const totalExpenses = data?.reduce((sum: number, expense: any) => sum + expense.amount, 0) || 0;
  return { data: totalExpenses, error };
}

// 4. PHOTO GALLERY
export async function uploadProjectPhoto(photo: any) {
  const { data, error } = await supabase
    .from('project_photos')
    .insert(photo)
    .select()
    .single();
  return { data, error };
}

export async function getProjectPhotos(projectId: string, phase?: string) {
  let query = supabase
    .from('project_photos')
    .select('*')
    .eq('project_id', projectId);

  if (phase) {
    query = query.eq('phase', phase);
  }

  const { data, error } = await query.order('taken_at', { ascending: false });
  return { data, error };
}

export async function createBeforeAfterComparison(comparison: any) {
  const { data, error } = await supabase
    .from('before_after_comparisons')
    .insert(comparison)
    .select()
    .single();
  return { data, error };
}

// 5. CLIENT PORTAL
export async function createClientPortalUser(client: any) {
  const { data, error } = await supabase
    .from('client_portal_users')
    .insert(client)
    .select()
    .single();
  return { data, error };
}

export async function getClientPortalUsers(teamId: string) {
  const { data, error } = await supabase
    .from('client_portal_users')
    .select('*')
    .eq('team_id', teamId);
  return { data, error };
}

// 6. PROJECT APPROVALS
export async function createProjectApproval(approval: any) {
  const { data, error } = await supabase
    .from('project_approvals')
    .insert(approval)
    .select()
    .single();
  return { data, error };
}

export async function getProjectApprovals(projectId: string) {
  const { data, error } = await supabase
    .from('project_approvals')
    .select('*')
    .eq('project_id', projectId);
  return { data, error };
}

export async function updateApprovalStatus(approvalId: string, approverId: string, approved: boolean, notes?: string) {
  const { data: approval } = await supabase
    .from('project_approvals')
    .select('approvers')
    .eq('id', approvalId)
    .single();

  if (!approval) return { data: null, error: new Error('Approval not found') };

  const updatedApprovers = approval.approvers.map((step: any) =>
    step.approver_id === approverId ? { ...step, approved, approved_at: new Date().toISOString(), notes } : step
  );

  const { data, error } = await supabase
    .from('project_approvals')
    .update({ approvers: updatedApprovers, status: updatedApprovers.some((s: any) => !s.approved) ? 'pending' : 'approved' })
    .eq('id', approvalId)
    .select()
    .single();

  return { data, error };
}

// 7. CHANGE ORDERS
export async function createChangeOrder(order: any) {
  const { data, error } = await supabase
    .from('change_orders')
    .insert(order)
    .select()
    .single();
  return { data, error };
}

export async function getProjectChangeOrders(projectId: string) {
  const { data, error } = await supabase
    .from('change_orders')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false });
  return { data, error };
}

// 8. SUBCONTRACTORS
export async function createSubcontractor(sub: any) {
  const { data, error } = await supabase
    .from('subcontractors')
    .insert(sub)
    .select()
    .single();
  return { data, error };
}

export async function getTeamSubcontractors(teamId: string) {
  const { data, error } = await supabase
    .from('subcontractors')
    .select('*')
    .eq('team_id', teamId)
    .order('name');
  return { data, error };
}

export async function requestSubcontractorQuote(quote: any) {
  const { data, error } = await supabase
    .from('subcontractor_quotes')
    .insert(quote)
    .select()
    .single();
  return { data, error };
}

export async function scheduleSubcontractorPayment(payment: any) {
  const { data, error } = await supabase
    .from('subcontractor_payments')
    .insert(payment)
    .select()
    .single();
  return { data, error };
}

// 9. EQUIPMENT TRACKING
export async function createEquipment(equipment: any) {
  const { data, error } = await supabase
    .from('equipment')
    .insert(equipment)
    .select()
    .single();
  return { data, error };
}

export async function getTeamEquipment(teamId: string) {
  const { data, error } = await supabase
    .from('equipment')
    .select('*')
    .eq('team_id', teamId);
  return { data, error };
}

export async function logEquipmentMaintenance(maintenance: any) {
  const { data, error } = await supabase
    .from('equipment_maintenance')
    .insert(maintenance)
    .select()
    .single();
  return { data, error };
}

// 10. MATERIAL INVENTORY
export async function updateMaterialInventory(inventory: any) {
  const { data, error } = await supabase
    .from('material_inventory')
    .upsert(inventory)
    .select()
    .single();
  return { data, error };
}

export async function getMaterialsNeedingReorder(teamId: string) {
  const { data, error } = await supabase
    .from('material_inventory')
    .select('*, materials(*)')
    .eq('team_id', teamId)
    .filter('current_stock', 'lt', 'reorder_point');
  return { data, error };
}

export async function createMaterialSupplier(supplier: any) {
  const { data, error } = await supabase
    .from('material_suppliers')
    .insert(supplier)
    .select()
    .single();
  return { data, error };
}

// 11. PROJECT PROFITABILITY
export async function calculateProjectProfitability(projectId: string) {
  const { data: profitData } = await supabase
    .from('project_profitability')
    .select('*')
    .eq('project_id', projectId)
    .single();

  return { data: profitData, error: null };
}

export async function getTeamProfitabilityReport(teamId: string) {
  const { data, error } = await supabase
    .from('project_profitability')
    .select('*')
    .eq('team_id', teamId)
    .order('profit_margin_percent', { ascending: false });
  return { data, error };
}

// 12. AUTOMATED WORKFLOWS
export async function createWorkflow(workflow: any) {
  const { data, error } = await supabase
    .from('workflows')
    .insert(workflow)
    .select()
    .single();
  return { data, error };
}

export async function getTeamWorkflows(teamId: string) {
  const { data, error } = await supabase
    .from('workflows')
    .select('*')
    .eq('team_id', teamId)
    .eq('is_active', true);
  return { data, error };
}

export async function executeWorkflow(workflowId: string, entityType: string, entityId: string) {
  const { data: execution, error } = await supabase
    .from('workflow_executions')
    .insert({
      workflow_id: workflowId,
      triggered_by: 'event',
      entity_type: entityType,
      entity_id: entityId,
      status: 'pending',
      executed_at: new Date().toISOString(),
    })
    .select()
    .single();

  return { data: execution, error };
}

// 13. SAFETY & COMPLIANCE
export async function logSafetyIncident(log: any) {
  const { data, error } = await supabase
    .from('safety_logs')
    .insert(log)
    .select()
    .single();
  return { data, error };
}

export async function getProjectSafetyLogs(projectId: string) {
  const { data, error } = await supabase
    .from('safety_logs')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false });
  return { data, error };
}

export async function createSafetyChecklist(checklist: any) {
  const { data, error } = await supabase
    .from('safety_checklists')
    .insert(checklist)
    .select()
    .single();
  return { data, error };
}

export async function checkComplianceAlerts(teamId: string) {
  const { data, error } = await supabase
    .from('compliance_alerts')
    .select('*')
    .eq('team_id', teamId)
    .eq('dismissed', false)
    .lte('alert_at', new Date().toISOString());
  return { data, error };
}

// 14. WARRANTY TRACKING
export async function createWarranty(warranty: any) {
  const { data, error } = await supabase
    .from('warranties')
    .insert(warranty)
    .select()
    .single();
  return { data, error };
}

export async function getProjectWarranties(projectId: string) {
  const { data, error } = await supabase
    .from('warranties')
    .select('*')
    .eq('project_id', projectId);
  return { data, error };
}

export async function createWarrantyClaim(claim: any) {
  const { data, error } = await supabase
    .from('warranty_claims')
    .insert(claim)
    .select()
    .single();
  return { data, error };
}

// 15. CLIENT COMMUNICATION HUB
export async function createClientMessage(message: any) {
  const { data, error } = await supabase
    .from('client_messages')
    .insert(message)
    .select()
    .single();
  return { data, error };
}

export async function getProjectMessages(projectId: string) {
  const { data, error } = await supabase
    .from('client_messages')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false });
  return { data, error };
}

export async function createClientRequest(request: any) {
  const { data, error } = await supabase
    .from('client_requests')
    .insert(request)
    .select()
    .single();
  return { data, error };
}

export async function updateRequestStatus(requestId: string, status: string, response?: string) {
  const { data, error } = await supabase
    .from('client_requests')
    .update({
      status,
      response,
      responded_at: response ? new Date().toISOString() : null,
    })
    .eq('id', requestId)
    .select()
    .single();
  return { data, error };
}

// 16. PREDICTIVE ANALYTICS
export async function getPredictions(teamId: string, modelType?: string) {
  let query = supabase
    .from('predictions')
    .select('*')
    .eq('team_id', teamId);

  if (modelType) {
    query = query.eq('model_type', modelType);
  }

  const { data, error } = await query.order('created_at', { ascending: false });
  return { data, error };
}

// INTEGRATION FUNCTIONS
export async function saveIntegrationConfig(config: any) {
  const { data, error } = await supabase
    .from('integration_configs')
    .upsert(config)
    .select()
    .single();
  return { data, error };
}

export async function getTeamIntegrations(teamId: string) {
  const { data, error } = await supabase
    .from('integration_configs')
    .select('*')
    .eq('team_id', teamId);
  return { data, error };
}
