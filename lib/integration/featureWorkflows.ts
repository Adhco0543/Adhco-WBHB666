/**
 * Feature Integration Utilities
 * Helper functions to integrate features into existing workflows
 */

import { supabase } from '@/lib/supabase/client';
import type { Project, Invoice, User } from '@/lib/types/database';

// ==================== PROJECT WORKFLOW INTEGRATION ====================

/**
 * Initialize all tracking for a new project
 * Creates budget, initializes expense tracking, sets up templates
 */
export async function initializeProjectFeatures(projectId: string, teamId: string, initialBudget: number) {
  try {
    // Create budget tracking
    const { data: budget, error: budgetError } = await supabase
      .from('budget_tracking')
      .insert({
        project_id: projectId,
        estimated_budget: initialBudget,
        spent_amount: 0,
        materials_cost: 0,
        labor_cost: 0,
        other_costs: 0,
      })
      .select()
      .single();

    if (budgetError) throw budgetError;

    // Initialize project profitability tracking
    const { data: profitability, error: profitError } = await supabase
      .from('project_profitability')
      .insert({
        project_id: projectId,
        team_id: teamId,
        quoted_price: initialBudget,
        actual_revenue: 0,
        material_costs: 0,
        labor_costs: 0,
        subcontractor_costs: 0,
        equipment_costs: 0,
        other_costs: 0,
        total_costs: 0,
        gross_profit: 0,
        profit_margin_percent: 0,
        status: 'in_progress',
      })
      .select()
      .single();

    if (profitError) throw profitError;

    return { budget, profitability };
  } catch (error) {
    console.error('Failed to initialize project features:', error);
    throw error;
  }
}

// ==================== INVOICE WORKFLOW INTEGRATION ====================

/**
 * Create invoice and trigger related automations
 * - Log activity
 * - Send notification email
 * - Trigger workflow if configured
 */
export async function createInvoiceWithWorkflow(
  teamId: string,
  invoiceData: any,
  userId: string
) {
  try {
    // Create invoice
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .insert(invoiceData)
      .select()
      .single();

    if (invoiceError) throw invoiceError;

    // Get active workflows for this team
    const { data: workflows } = await supabase
      .from('workflows')
      .select('*')
      .eq('team_id', teamId)
      .eq('is_active', true)
      .eq('trigger_event', 'invoice_sent');

    // Execute matching workflows
    if (workflows) {
      for (const workflow of workflows) {
        await supabase
          .from('workflow_executions')
          .insert({
            workflow_id: workflow.id,
            triggered_by: 'event',
            entity_type: 'invoice',
            entity_id: invoice.id,
            status: 'pending',
            executed_at: new Date().toISOString(),
          });
      }
    }

    return invoice;
  } catch (error) {
    console.error('Failed to create invoice with workflow:', error);
    throw error;
  }
}

// ==================== TIME ENTRY INTEGRATION ====================

/**
 * Log time entry and update project budget/profitability
 */
export async function logTimeAndUpdateBudget(
  projectId: string,
  timeEntry: any
) {
  try {
    // Insert time entry
    const { data: entry, error: entryError } = await supabase
      .from('time_entries')
      .insert(timeEntry)
      .select()
      .single();

    if (entryError) throw entryError;

    // Update budget tracking
    const { data: budget } = await supabase
      .from('budget_tracking')
      .select('labor_cost')
      .eq('project_id', projectId)
      .single();

    if (budget) {
      await supabase
        .from('budget_tracking')
        .update({
          labor_cost: (budget.labor_cost || 0) + (timeEntry.total_cost || 0),
          spent_amount: (budget.spent_amount || 0) + (timeEntry.total_cost || 0),
          updated_at: new Date().toISOString(),
        })
        .eq('project_id', projectId);
    }

    // Update profitability
    await updateProjectProfitability(projectId);

    return entry;
  } catch (error) {
    console.error('Failed to log time entry:', error);
    throw error;
  }
}

// ==================== EXPENSE TRACKING INTEGRATION ====================

/**
 * Log expense and update project budget/profitability
 */
export async function logExpenseAndUpdateBudget(
  projectId: string,
  expense: any
) {
  try {
    // Insert expense
    const { data: expenseData, error: expenseError } = await supabase
      .from('expenses')
      .insert(expense)
      .select()
      .single();

    if (expenseError) throw expenseError;

    // Update budget tracking
    const { data: budget } = await supabase
      .from('budget_tracking')
      .select('spent_amount')
      .eq('project_id', projectId)
      .single();

    if (budget) {
      await supabase
        .from('budget_tracking')
        .update({
          spent_amount: (budget.spent_amount || 0) + expense.amount,
          other_costs: (budget.other_costs || 0) + (expense.category === 'other' ? expense.amount : 0),
          updated_at: new Date().toISOString(),
        })
        .eq('project_id', projectId);
    }

    // Check budget warnings
    await checkBudgetWarnings(projectId);

    // Update profitability
    await updateProjectProfitability(projectId);

    return expenseData;
  } catch (error) {
    console.error('Failed to log expense:', error);
    throw error;
  }
}

// ==================== BUDGET MONITORING ====================

/**
 * Check if project is approaching or exceeding budget
 */
export async function checkBudgetWarnings(projectId: string) {
  try {
    const { data: budget } = await supabase
      .from('budget_tracking')
      .select('*')
      .eq('project_id', projectId)
      .single();

    if (!budget) return;

    const { data: project } = await supabase
      .from('projects')
      .select('team_id')
      .eq('id', projectId)
      .single();

    if (!project) return;

    const percentSpent = (budget.spent_amount / budget.estimated_budget) * 100;

    if (percentSpent >= 100) {
      // Budget exceeded - create high priority reminder
      await supabase
        .from('reminders')
        .insert({
          team_id: project.team_id,
          type: 'in_app',
          subject: `Budget Exceeded: ${percentSpent.toFixed(0)}% spent`,
          content: `Project has exceeded estimated budget of $${budget.estimated_budget}`,
          related_entity_type: 'project',
          related_entity_id: projectId,
          status: 'scheduled',
          scheduled_for: new Date().toISOString(),
        });
    } else if (percentSpent >= 80) {
      // Budget warning at 80%
      await supabase
        .from('reminders')
        .insert({
          team_id: project.team_id,
          type: 'email',
          subject: `Budget Warning: ${percentSpent.toFixed(0)}% spent`,
          content: `Project is ${percentSpent.toFixed(0)}% of estimated budget`,
          related_entity_type: 'project',
          related_entity_id: projectId,
          status: 'scheduled',
          scheduled_for: new Date().toISOString(),
        });
    }
  } catch (error) {
    console.error('Failed to check budget warnings:', error);
  }
}

// ==================== PROFITABILITY CALCULATION ====================

/**
 * Recalculate project profitability based on latest data
 */
export async function updateProjectProfitability(projectId: string) {
  try {
    // Get project data
    const { data: project } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single();

    if (!project) return;

    // Get budget data
    const { data: budget } = await supabase
      .from('budget_tracking')
      .select('*')
      .eq('project_id', projectId)
      .single();

    // Get time entries sum
    const { data: timeData } = await supabase
      .from('time_entries')
      .select('total_cost')
      .eq('project_id', projectId);

    const laborCosts = timeData?.reduce((sum, t) => sum + (t.total_cost || 0), 0) || 0;

    // Get expenses sum
    const { data: expenseData } = await supabase
      .from('expenses')
      .select('amount')
      .eq('project_id', projectId);

    const otherCosts = expenseData?.reduce((sum, e) => sum + e.amount, 0) || 0;

    // Get invoices/revenue
    const { data: invoiceData } = await supabase
      .from('invoices')
      .select('total_amount')
      .eq('project_id', projectId)
      .eq('status', 'paid');

    const actualRevenue = invoiceData?.reduce((sum, i) => sum + (i.total_amount || 0), 0) || 0;

    const totalCosts = (budget?.material_costs || 0) + laborCosts + (budget?.subcontractor_costs || 0) + (budget?.equipment_costs || 0) + otherCosts;
    const grossProfit = actualRevenue - totalCosts;
    const profitMargin = actualRevenue > 0 ? (grossProfit / actualRevenue) * 100 : 0;

    // Update profitability record
    await supabase
      .from('project_profitability')
      .update({
        actual_revenue: actualRevenue,
        labor_costs: laborCosts,
        material_costs: budget?.material_costs || 0,
        subcontractor_costs: budget?.subcontractor_costs || 0,
        equipment_costs: budget?.equipment_costs || 0,
        other_costs: otherCosts,
        total_costs: totalCosts,
        gross_profit: grossProfit,
        profit_margin_percent: profitMargin,
        calculated_at: new Date().toISOString(),
      })
      .eq('project_id', projectId);

    return { totalCosts, grossProfit, profitMargin };
  } catch (error) {
    console.error('Failed to update profitability:', error);
  }
}

// ==================== CHANGE ORDER INTEGRATION ====================

/**
 * Create change order and update project details
 */
export async function createChangeOrderWithImpact(
  projectId: string,
  teamId: string,
  changeOrder: any
) {
  try {
    // Create change order
    const { data: order, error: orderError } = await supabase
      .from('change_orders')
      .insert({
        ...changeOrder,
        project_id: projectId,
        team_id: teamId,
      })
      .select()
      .single();

    if (orderError) throw orderError;

    // Update budget if cost impact exists
    if (changeOrder.cost_impact) {
      const { data: budget } = await supabase
        .from('budget_tracking')
        .select('estimated_budget')
        .eq('project_id', projectId)
        .single();

      if (budget) {
        await supabase
          .from('budget_tracking')
          .update({
            estimated_budget: (budget.estimated_budget || 0) + changeOrder.cost_impact,
          })
          .eq('project_id', projectId);
      }
    }

    // Create approval workflow if configured
    const { data: workflows } = await supabase
      .from('workflows')
      .select('*')
      .eq('team_id', teamId)
      .eq('is_active', true)
      .eq('trigger_event', 'change_order_created');

    if (workflows?.length) {
      for (const workflow of workflows) {
        await supabase
          .from('workflow_executions')
          .insert({
            workflow_id: workflow.id,
            triggered_by: 'event',
            entity_type: 'change_order',
            entity_id: order.id,
            status: 'pending',
            executed_at: new Date().toISOString(),
          });
      }
    }

    return order;
  } catch (error) {
    console.error('Failed to create change order:', error);
    throw error;
  }
}

// ==================== APPROVAL WORKFLOW HELPER ====================

/**
 * Move approval to next step
 */
export async function approveEntity(
  approvalId: string,
  approverId: string,
  approved: boolean,
  notes?: string
) {
  try {
    const { data: approval } = await supabase
      .from('project_approvals')
      .select('*')
      .eq('id', approvalId)
      .single();

    if (!approval) throw new Error('Approval not found');

    // Update approver status
    const updatedApprovers = approval.approvers.map((step: any) =>
      step.approver_id === approverId
        ? { ...step, approved, approved_at: new Date().toISOString(), notes }
        : step
    );

    // Determine new status
    const allApproved = updatedApprovers.every((step: any) => step.approved);
    const newStatus = allApproved ? 'approved' : 'pending';

    const { data } = await supabase
      .from('project_approvals')
      .update({ approvers: updatedApprovers, status: newStatus })
      .eq('id', approvalId)
      .select()
      .single();

    return data;
  } catch (error) {
    console.error('Failed to approve entity:', error);
    throw error;
  }
}
