/**
 * Job Management Actions
 * Handles CRUD operations and data persistence for jobs
 */

import type { Job, JobDetail, QuoteItem, TaskItem, MaterialItem, DocumentItem, ActivityEntry } from "./jobTypes";

const JOBS_STORAGE_KEY = "jobs_data";
const JOBS_ACTIVITY_KEY = "jobs_activity";

/**
 * Get all jobs for the current user
 */
export function getAllJobs(): Job[] {
  const data = localStorage.getItem(JOBS_STORAGE_KEY);
  if (!data) return [];

  try {
    return JSON.parse(data).map((job: any) => ({
      ...job,
      createdAt: new Date(job.createdAt),
      updatedAt: new Date(job.updatedAt),
      startDate: new Date(job.startDate),
      endDate: job.endDate ? new Date(job.endDate) : undefined,
      dueDate: job.dueDate ? new Date(job.dueDate) : undefined,
    }));
  } catch (e) {
    console.error("Failed to parse jobs", e);
    return [];
  }
}

/**
 * Get a specific job by ID
 */
export function getJobById(jobId: string): Job | null {
  const jobs = getAllJobs();
  return jobs.find((j) => j.id === jobId) || null;
}

/**
 * Create a new job
 */
export function createJob(job: Omit<Job, "id" | "createdAt" | "updatedAt">): Job {
  const newJob: Job = {
    ...job,
    id: generateJobId(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const jobs = getAllJobs();
  jobs.push(newJob);
  localStorage.setItem(JOBS_STORAGE_KEY, JSON.stringify(jobs));

  // Log activity
  addActivity(newJob.id, {
    type: "created",
    title: `Job created: ${newJob.title}`,
    description: `Created new job for ${newJob.clientName}`,
  });

  return newJob;
}

/**
 * Update an existing job
 */
export function updateJob(jobId: string, updates: Partial<Job>): Job | null {
  const jobs = getAllJobs();
  const idx = jobs.findIndex((j) => j.id === jobId);

  if (idx === -1) return null;

  const updated = {
    ...jobs[idx],
    ...updates,
    updatedAt: new Date(),
  };

  jobs[idx] = updated;
  localStorage.setItem(JOBS_STORAGE_KEY, JSON.stringify(jobs));

  return updated;
}

/**
 * Delete a job
 */
export function deleteJob(jobId: string): boolean {
  const jobs = getAllJobs();
  const filtered = jobs.filter((j) => j.id !== jobId);

  if (filtered.length === jobs.length) return false;

  localStorage.setItem(JOBS_STORAGE_KEY, JSON.stringify(filtered));
  return true;
}

/**
 * Archive a job
 */
export function archiveJob(jobId: string): Job | null {
  return updateJob(jobId, {
    status: "archived",
    archivedAt: new Date(),
  });
}

/**
 * Get jobs by status
 */
export function getJobsByStatus(status: string): Job[] {
  return getAllJobs().filter((j) => j.status === status);
}

/**
 * Search jobs by title or client name
 */
export function searchJobs(query: string): Job[] {
  const lower = query.toLowerCase();
  return getAllJobs().filter(
    (j) =>
      j.title.toLowerCase().includes(lower) || j.clientName.toLowerCase().includes(lower)
  );
}

/**
 * Activity feed management
 */

export function getJobActivity(jobId: string): ActivityEntry[] {
  const data = localStorage.getItem(JOBS_ACTIVITY_KEY);
  if (!data) return [];

  try {
    const all = JSON.parse(data);
    return all
      .filter((a: any) => a.jobId === jobId)
      .map((a: any) => ({
        ...a,
        createdAt: new Date(a.createdAt),
      }))
      .sort((a: any, b: any) => b.createdAt.getTime() - a.createdAt.getTime());
  } catch (e) {
    console.error("Failed to parse activity", e);
    return [];
  }
}

export function addActivity(
  jobId: string,
  activity: Omit<ActivityEntry, "id" | "jobId" | "createdAt">
): ActivityEntry {
  const newActivity: ActivityEntry = {
    ...activity,
    id: generateActivityId(),
    jobId,
    createdAt: new Date(),
  };

  const allActivity = getJobActivity(jobId);
  const allData = localStorage.getItem(JOBS_ACTIVITY_KEY);
  const all = allData ? JSON.parse(allData) : [];
  all.push(newActivity);
  localStorage.setItem(JOBS_ACTIVITY_KEY, JSON.stringify(all));

  return newActivity;
}

/**
 * Helper functions
 */

function generateJobId(): string {
  return "job_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
}

function generateActivityId(): string {
  return "activity_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
}

/**
 * Export all data for backup
 */
export function exportJobsData() {
  return {
    jobs: getAllJobs(),
    activity: localStorage.getItem(JOBS_ACTIVITY_KEY),
    exportedAt: new Date().toISOString(),
  };
}

/**
 * Import jobs data from backup
 */
export function importJobsData(data: any) {
  try {
    if (data.jobs) {
      localStorage.setItem(JOBS_STORAGE_KEY, JSON.stringify(data.jobs));
    }
    if (data.activity) {
      localStorage.setItem(JOBS_ACTIVITY_KEY, data.activity);
    }
    return true;
  } catch (e) {
    console.error("Failed to import data", e);
    return false;
  }
}
