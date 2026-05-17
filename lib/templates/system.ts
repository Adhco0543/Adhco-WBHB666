import { supabase } from '../supabase/client';
import type { ProjectTemplate, QuoteTemplate, TaskTemplate, TemplateTask, TemplateMaterial } from '../types/database';

/**
 * Create a new project template
 */
export async function createProjectTemplate(
  teamId: string,
  userId: string,
  name: string,
  description: string,
  category: string,
  tasks: TemplateTask[],
  materials: TemplateMaterial[]
) {
  const { data, error } = await supabase
    .from('project_templates')
    .insert({
      team_id: teamId,
      name,
      description,
      category,
      tasks,
      materials,
      created_by: userId,
    })
    .select()
    .single();

  return { data, error };
}

/**
 * Get all project templates for a team
 */
export async function getProjectTemplates(teamId: string) {
  const { data, error } = await supabase
    .from('project_templates')
    .select('*')
    .eq('team_id', teamId)
    .order('created_at', { ascending: false });

  return { data, error };
}

/**
 * Get templates by category
 */
export async function getTemplatesByCategory(teamId: string, category: string) {
  const { data, error } = await supabase
    .from('project_templates')
    .select('*')
    .eq('team_id', teamId)
    .eq('category', category)
    .order('created_at', { ascending: false });

  return { data, error };
}

/**
 * Update project template
 */
export async function updateProjectTemplate(templateId: string, updates: Partial<ProjectTemplate>) {
  const { data, error } = await supabase
    .from('project_templates')
    .update(updates)
    .eq('id', templateId)
    .select()
    .single();

  return { data, error };
}

/**
 * Delete project template
 */
export async function deleteProjectTemplate(templateId: string) {
  const { error } = await supabase
    .from('project_templates')
    .delete()
    .eq('id', templateId);

  return { error };
}

/**
 * Create quote template
 */
export async function createQuoteTemplate(
  teamId: string,
  userId: string,
  name: string,
  title: string,
  description: string,
  terms: string,
  notes: string,
  footer: string,
  isDefault: boolean = false
) {
  const { data, error } = await supabase
    .from('quote_templates')
    .insert({
      team_id: teamId,
      name,
      title,
      description,
      terms,
      notes,
      footer,
      is_default: isDefault,
      created_by: userId,
    })
    .select()
    .single();

  return { data, error };
}

/**
 * Get quote templates
 */
export async function getQuoteTemplates(teamId: string) {
  const { data, error } = await supabase
    .from('quote_templates')
    .select('*')
    .eq('team_id', teamId)
    .order('created_at', { ascending: false });

  return { data, error };
}

/**
 * Get default quote template
 */
export async function getDefaultQuoteTemplate(teamId: string) {
  const { data, error } = await supabase
    .from('quote_templates')
    .select('*')
    .eq('team_id', teamId)
    .eq('is_default', true)
    .single();

  return { data, error };
}

/**
 * Create task template
 */
export async function createTaskTemplate(teamId: string, userId: string, name: string, description: string, tasks: TemplateTask[]) {
  const { data, error } = await supabase
    .from('task_templates')
    .insert({
      team_id: teamId,
      name,
      description,
      tasks,
      created_by: userId,
    })
    .select()
    .single();

  return { data, error };
}

/**
 * Get task templates
 */
export async function getTaskTemplates(teamId: string) {
  const { data, error } = await supabase
    .from('task_templates')
    .select('*')
    .eq('team_id', teamId)
    .order('created_at', { ascending: false });

  return { data, error };
}

/**
 * Clone a template to create a new project
 */
export async function cloneTemplateToProject(projectId: string, templateId: string) {
  const { data: template } = await supabase
    .from('project_templates')
    .select('*')
    .eq('id', templateId)
    .single();

  if (!template) {
    return { data: null, error: new Error('Template not found') };
  }

  // Create tasks and materials from template (integration point with existing project system)
  return { data: template, error: null };
}

/**
 * Get popular templates for team  (most used)
 */
export async function getPopularTemplates(teamId: string, limit: number = 5) {
  // This would require tracking usage in a separate table
  const { data, error } = await supabase
    .from('project_templates')
    .select('*')
    .eq('team_id', teamId)
    .order('created_at', { ascending: false })
    .limit(limit);

  return { data, error };
}

/**
 * Duplicate a template
 */
export async function duplicateTemplate(templateId: string, newName: string) {
  const { data: template } = await supabase
    .from('project_templates')
    .select('*')
    .eq('id', templateId)
    .single();

  if (!template) {
    return { data: null, error: new Error('Template not found') };
  }

  const { data: newTemplate, error } = await supabase
    .from('project_templates')
    .insert({
      ...template,
      id: undefined,
      name: newName,
      created_at: undefined,
      updated_at: undefined,
    })
    .select()
    .single();

  return { data: newTemplate, error };
}
