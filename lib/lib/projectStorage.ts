import { Project } from "./projectTypes";

const STORAGE_KEY = "assistant_projects";

export function getProjects(): Project[] {
  if (typeof window === "undefined") return [];

  const saved = localStorage.getItem(STORAGE_KEY);
  return saved ? JSON.parse(saved) : [];
}

export function saveProjects(projects: Project[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
}

export function createProject(project: Project) {
  const existing = getProjects();
  saveProjects([project, ...existing]);
}