export type UserRole =
  | ""
  | "business_owner"
  | "contractor"
  | "stay_at_home_parent"
  | "freelancer"
  | "student"
  | "other";

export type TeamSize = "solo" | "2_5" | "6_15" | "16_plus";
export type RevenueModel = "appointments" | "projects" | "products" | "subscription" | "mixed" | "none";
export type WorkMode = "on_site" | "client_site" | "hybrid" | "home" | "remote";

export type OnboardingData = {
  businessName: string;
  role: UserRole;
  industry: string;
  teamSize: TeamSize;
  revenueModel: RevenueModel;
  workMode: WorkMode;
  painPoints: string[];
  timeSavingFocus: string;
  tools: string[];
  roleAnswers: Record<string, string>;
};

export const defaultOnboardingData: OnboardingData = {
  businessName: "",
  role: "",
  industry: "",
  teamSize: "solo",
  revenueModel: "projects",
  workMode: "hybrid",
  painPoints: [],
  timeSavingFocus: "",
  tools: [],
  roleAnswers: {}
};

export const ROLE_OPTIONS: { value: UserRole; label: string }[] = [
  { value: "business_owner", label: "Business owner" },
  { value: "contractor", label: "Contractor / tradesperson" },
  { value: "stay_at_home_parent", label: "Stay-at-home parent" },
  { value: "freelancer", label: "Freelancer" },
  { value: "student", label: "Student" },
  { value: "other", label: "Other" }
];

export const PAIN_POINTS_BY_ROLE: Record<Exclude<UserRole, "">, string[]> = {
  business_owner: [
    "quotes",
    "scheduling",
    "client_communication",
    "followups",
    "reporting",
    "team_coordination"
  ],
  contractor: [
    "quotes",
    "materials",
    "client_communication",
    "inventory",
    "followups",
    "job_tracking"
  ],
  stay_at_home_parent: [
    "household_schedule",
    "meal_planning",
    "appointments",
    "family_tasks",
    "budgeting",
    "reminders"
  ],
  freelancer: [
    "client_communication",
    "invoicing",
    "deadlines",
    "project_tracking",
    "followups",
    "content_planning"
  ],
  student: [
    "study_schedule",
    "assignments",
    "deadlines",
    "notes",
    "exam_prep",
    "time_management"
  ],
  other: [
    "scheduling",
    "tasks",
    "followups",
    "planning",
    "notes",
    "organization"
  ]
};

export const TOOLS = [
  "google_calendar",
  "quickbooks",
  "stripe",
  "square",
  "sheets",
  "notes_app",
  "none"
] as const;

export type RoleQuestion = {
  key: string;
  label: string;
  options: string[];
};

export const roleSpecificQuestions: Partial<Record<Exclude<UserRole, "">, RoleQuestion[]>> = {
  business_owner: [
    { key: "needs_quotes", label: "Do you create quotes or estimates?", options: ["yes", "no"] },
    { key: "has_clients", label: "Do you communicate with clients often?", options: ["yes", "no"] },
    { key: "team_help", label: "Do you manage a team?", options: ["yes", "no"] }
  ],
  contractor: [
    { key: "estimates", label: "Do you create estimates before jobs?", options: ["yes", "no"] },
    { key: "material_changes", label: "How often do material costs change?", options: ["rarely", "sometimes", "often"] },
    { key: "job_stages", label: "Do your jobs happen in stages?", options: ["yes", "no"] }
  ],
  stay_at_home_parent: [
    { key: "family_schedule", label: "Do you manage a family schedule?", options: ["yes", "no"] },
    { key: "meal_planning", label: "Would meal planning help you?", options: ["yes", "no"] },
    { key: "budget_tracking", label: "Do you want help tracking household spending?", options: ["yes", "no"] }
  ],
  freelancer: [
    { key: "client_projects", label: "Do you manage multiple client projects?", options: ["yes", "no"] },
    { key: "invoice_help", label: "Do you need invoice or payment reminders?", options: ["yes", "no"] },
    { key: "deadline_tracking", label: "Do deadlines pile up?", options: ["yes", "no"] }
  ],
  student: [
    { key: "classes", label: "Are you managing multiple classes?", options: ["yes", "no"] },
    { key: "exam_prep", label: "Do you want study and exam prep help?", options: ["yes", "no"] },
    { key: "assignment_tracking", label: "Do you need assignment reminders?", options: ["yes", "no"] }
  ],
  other: [
    { key: "main_goal", label: "What kind of help do you want most?", options: ["planning", "tasks", "reminders", "organization"] }
  ]
};

export const formatLabel = (value: string) => value.replaceAll("_", " ");