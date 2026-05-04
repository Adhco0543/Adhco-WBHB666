export type TeamSize = "solo" | "2_5" | "6_15" | "16_plus";
export type RevenueModel = "appointments" | "projects" | "products" | "subscription" | "mixed";
export type WorkMode = "on_site" | "client_site" | "hybrid";

<<<<<<< HEAD
export type OnboardingData = {
  businessName: string;
  industry: string;
=======
export const INDUSTRIES = [
  "carpentry",
  "salon",
  "auto_repair",
  "restaurant",
  "retail",
  "other"
] as const;

export type Industry = (typeof INDUSTRIES)[number];

export type OnboardingData = {
  businessName: string;
  industry: Industry | "";
>>>>>>> f1ee28d4de6942316101091dbedc9f25d2af4638
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
  industry: "",
  teamSize: "solo",
  revenueModel: "projects",
  workMode: "hybrid",
  painPoints: [],
  timeSavingFocus: "",
  tools: [],
  roleAnswers: {}
};

<<<<<<< HEAD
=======
export const TEAM_SIZE_OPTIONS: { value: TeamSize; label: string }[] = [
  { value: "solo", label: "Just me" },
  { value: "2_5", label: "2-5" },
  { value: "6_15", label: "6-15" },
  { value: "16_plus", label: "16+" }
];

export const REVENUE_MODEL_OPTIONS: { value: RevenueModel; label: string }[] = [
  { value: "appointments", label: "Appointments" },
  { value: "projects", label: "Projects/jobs" },
  { value: "products", label: "Product sales" },
  { value: "subscription", label: "Subscription" },
  { value: "mixed", label: "Mixed" }
];

export const WORK_MODE_OPTIONS: { value: WorkMode; label: string }[] = [
  { value: "on_site", label: "At a location/shop" },
  { value: "client_site", label: "At client sites" },
  { value: "hybrid", label: "Both" }
];

>>>>>>> f1ee28d4de6942316101091dbedc9f25d2af4638
export const PAIN_POINTS = [
  "scheduling",
  "quotes",
  "invoicing",
  "client_communication",
  "team_coordination",
  "inventory",
  "followups",
  "reporting"
] as const;

export const TOOLS = ["google_calendar", "quickbooks", "stripe", "square", "sheets", "none"] as const;

<<<<<<< HEAD
export const industrySpecificQuestions: Record<string, { key: string; label: string; options: string[] }[]> = {
=======
export type RoleQuestion = {
  key: string;
  label: string;
  options: string[];
};

export const industrySpecificQuestions: Partial<Record<Industry, RoleQuestion[]>> = {
>>>>>>> f1ee28d4de6942316101091dbedc9f25d2af4638
  carpentry: [
    { key: "estimates", label: "Do you create estimates before jobs?", options: ["yes", "no"] },
    {
      key: "material_changes",
      label: "How often do material costs change?",
      options: ["rarely", "sometimes", "often"]
    },
    { key: "job_stages", label: "Do your jobs happen in stages?", options: ["yes", "no"] }
  ],
  salon: [
    { key: "appointments", label: "Do you rely on appointments?", options: ["yes", "no"] },
    { key: "no_show_reminders", label: "Do you need no-show reminders?", options: ["yes", "no"] },
    { key: "product_sales", label: "Do you sell add-on products?", options: ["yes", "no"] }
  ]
};
<<<<<<< HEAD
=======

export const formatLabel = (value: string) => value.replaceAll("_", " ");
>>>>>>> f1ee28d4de6942316101091dbedc9f25d2af4638
