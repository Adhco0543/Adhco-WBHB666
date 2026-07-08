import { supabase } from '../supabase/client';
import type { BudgetTracking } from '../types/database';

/**
 * Initialize budget for a project
 */
export async function initializeBudget(
  projectId: string,
  estimatedBudget: number,
  currency: string = 'USD'
): Promise<{ data: BudgetTracking | null; error: Error | null }> {
  const { data, error } = await supabase
    .from('budget_tracking')
    .insert({
      project_id: projectId,
      estimated_budget: estimatedBudget,
      spent_amount: 0,
      materials_cost: 0,
      labor_cost: 0,
      other_costs: 0,
      currency,
    })
    .select()
    .single();

  return { data, error };
}

/**
 * Get budget for a project
 */
export async function getBudgetByProject(projectId: string): Promise<{ data: BudgetTracking | null; error: Error | null }> {
  const { data, error } = await supabase
    .from('budget_tracking')
    .select('*')
    .eq('project_id', projectId)
    .single();

  return { data, error };
}

/**
 * Update budget costs
 */
export async function updateBudgetCosts(
  projectId: string,
  updates: {
    materialsCost?: number;
    laborCost?: number;
    otherCosts?: number;
  }
): Promise<{ data: BudgetTracking | null; error: Error | null }> {
  const budget = await getBudgetByProject(projectId);
  if (budget.error) {
    return { data: null, error: budget.error };
  }

  const newMaterials = updates.materialsCost ?? budget.data?.materials_cost ?? 0;
  const newLabor = updates.laborCost ?? budget.data?.labor_cost ?? 0;
  const newOther = updates.otherCosts ?? budget.data?.other_costs ?? 0;
  const totalSpent = newMaterials + newLabor + newOther;

  const { data, error } = await supabase
    .from('budget_tracking')
    .update({
      materials_cost: newMaterials,
      labor_cost: newLabor,
      other_costs: newOther,
      spent_amount: totalSpent,
    })
    .eq('project_id', projectId)
    .select()
    .single();

  return { data, error };
}

/**
 * Calculate budget metrics
 */
export function calculateBudgetMetrics(budget: BudgetTracking) {
  const totalBudget = budget.estimated_budget;
  const totalSpent = budget.spent_amount;
  const remaining = totalBudget - totalSpent;
  const percentUsed = (totalSpent / totalBudget) * 100;
  const isOverBudget = totalSpent > totalBudget;
  const overByAmount = isOverBudget ? totalSpent - totalBudget : 0;

  return {
    totalBudget,
    totalSpent,
    remaining,
    percentUsed: Math.round(percentUsed),
    isOverBudget,
    overByAmount,
    profitMargin: totalBudget > 0 ? (remaining / totalBudget) * 100 : 0,
  };
}

/**
 * Get budget warnings
 */
export function getBudgetWarnings(budget: BudgetTracking): string[] {
  const warnings: string[] = [];
  const metrics = calculateBudgetMetrics(budget);

  if (metrics.isOverBudget) {
    warnings.push(`⚠️ Project is over budget by $${metrics.overByAmount.toFixed(2)}`);
  }

  if (metrics.percentUsed > 90) {
    warnings.push(`⚠️ Budget is ${metrics.percentUsed}% used`);
  }

  if (metrics.percentUsed > 100) {
    warnings.push(`🔴 Project has exceeded estimated budget`);
  }

  return warnings;
}

/**
 * Add material cost to budget
 */
export async function addMaterialCost(projectId: string, cost: number): Promise<{ data: BudgetTracking | null; error: Error | null }> {
  const budget = await getBudgetByProject(projectId);
  if (budget.error) {
    return { data: null, error: budget.error };
  }

  return updateBudgetCosts(projectId, {
    materialsCost: (budget.data?.materials_cost ?? 0) + cost,
  });
}

/**
 * Add labor cost to budget
 */
export async function addLaborCost(projectId: string, hours: number, hourlyRate: number): Promise<{ data: BudgetTracking | null; error: Error | null }> {
  const cost = hours * hourlyRate;
  const budget = await getBudgetByProject(projectId);
  if (budget.error) {
    return { data: null, error: budget.error };
  }

  return updateBudgetCosts(projectId, {
    laborCost: (budget.data?.labor_cost ?? 0) + cost,
  });
}

/**
 * Get budget projection (for forecasting)
 */
export async function getBudgetProjection(projectId: string): Promise<{ estimated: number; projected: number; confidence: number }> {
  const budget = await getBudgetByProject(projectId);
  if (budget.error) {
    return { estimated: 0, projected: 0, confidence: 0 };
  }

  const b = budget.data;
  if (!b) {
    return { estimated: 0, projected: 0, confidence: 0 };
  }

  // Simple projection: assume current spend rate continues
  const metrics = calculateBudgetMetrics(b);
  const projectedTotal = b.spent_amount * 1.2; // Assume 20% more will be spent (simplified)

  return {
    estimated: b.estimated_budget,
    projected: Math.round(projectedTotal),
    confidence: metrics.percentUsed > 50 ? 85 : 60, // Higher confidence if >50% spent
  };
}
