"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  defaultOnboardingData,
  roleSpecificQuestions,
  OnboardingData,
  PAIN_POINTS_BY_ROLE,
  ROLE_OPTIONS,
  TOOLS,
  type UserRole,
  type TeamSize,
} from "@/lib/onboarding";

type Step = 0 | 1 | 2 | 3 | 4 | 5;

const STEPS = [
  { title: "What best describes you?", description: "Select your role" },
  { title: "Business basics", description: "Tell us about your business" },
  { title: "What slows you down?", description: "Select your pain points" },
  { title: "Which tools do you use?", description: "What are you already using?" },
  { title: "Role-specific questions", description: "A few quick questions" },
  { title: "All set!", description: "Ready to get started" }
];

export function OnboardingForm() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(0);
  const [data, setData] = useState<OnboardingData>(defaultOnboardingData);

  const roleQuestions = useMemo(() => {
    if (!data.role) return [];
    return roleSpecificQuestions[data.role as Exclude<UserRole, "">] ?? [];
  }, [data.role]);

  const painPoints = useMemo(() => {
    if (!data.role) return [];
    return PAIN_POINTS_BY_ROLE[data.role as Exclude<UserRole, "">] ?? [];
  }, [data.role]);

  const updateField = <K extends keyof OnboardingData>(
    key: K,
    value: OnboardingData[K]
  ) => {
    setData((prev) => ({ ...prev, [key]: value }));
  };

  const toggleInList = (field: "painPoints" | "tools", value: string) => {
    setData((prev) => {
      const has = prev[field].includes(value);
      const next = has
        ? prev[field].filter((i) => i !== value)
        : [...prev[field], value];
      return { ...prev, [field]: next };
    });
  };

  const updateRoleAnswer = (key: string, value: string) => {
    setData((prev) => ({
      ...prev,
      roleAnswers: { ...prev.roleAnswers, [key]: value }
    }));
  };

  const nextStep = () => setStep((s) => Math.min(s + 1, 5) as Step);
  const previousStep = () => setStep((s) => Math.max(s - 1, 0) as Step);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    localStorage.setItem("onboarding_profile", JSON.stringify(data));
    router.push("/dashboard");
  };

  const progress = Math.round(((step + 1) / STEPS.length) * 100);

  return (
    <form className="card" onSubmit={handleSubmit}>
      <p className="eyebrow">
        Step {step + 1} of {STEPS.length}
      </p>

      <h2>{STEPS[step].title}</h2>
      <p>{STEPS[step].description}</p>

      <div className="progress">
        <div style={{ width: `${progress}%` }} />
      </div>

      {/* STEP 0: Role Selection */}
      {step === 0 && (
        <section className="fields">
          <label htmlFor="role">
            What best describes you?
            <select
              id="role"
              value={data.role}
              onChange={(e) => updateField("role", e.target.value as UserRole)}
              required
            >
              <option value="">Select role</option>
              {ROLE_OPTIONS.map((role) => (
                <option key={role.value} value={role.value}>
                  {role.label}
                </option>
              ))}
            </select>
          </label>

          <label htmlFor="industry">
            Industry or focus
            <input
              id="industry"
              type="text"
              value={data.industry}
              onChange={(e) => updateField("industry", e.target.value)}
              placeholder="Example: carpentry, household, school, freelance design"
            />
          </label>
        </section>
      )}

      {/* STEP 1: Business Basics */}
      {step === 1 && (
        <section className="fields">
          <label htmlFor="businessName">
            Business name (or your name)
            <input
              id="businessName"
              type="text"
              required
              value={data.businessName}
              onChange={(e) => updateField("businessName", e.target.value)}
              placeholder="Your business or personal name"
            />
          </label>

          <label htmlFor="teamSize">
            Team size
            <select
              id="teamSize"
              value={data.teamSize}
              onChange={(e) => updateField("teamSize", e.target.value as TeamSize)}
              required
            >
              <option value="solo">Solo</option>
              <option value="2_5">2-5 people</option>
              <option value="6_15">6-15 people</option>
              <option value="16_plus">16+ people</option>
            </select>
          </label>
        </section>
      )}

      {/* STEP 2: Pain Points */}
      {step === 2 && (
        <section className="fields">
          <label>What slows you down? (Select all that apply)</label>
          <div className="chips">
            {painPoints.map((p) => (
              <button
                key={p}
                type="button"
                className={data.painPoints.includes(p) ? "chip active" : "chip"}
                onClick={() => toggleInList("painPoints", p)}
              >
                {p.replaceAll("_", " ")}
              </button>
            ))}
          </div>
        </section>
      )}

      {/* STEP 3: Tools */}
      {step === 3 && (
        <section className="fields">
          <label>What tools do you currently use? (Select all that apply)</label>
          <div className="chips">
            {TOOLS.map((t) => (
              <button
                key={t}
                type="button"
                className={data.tools.includes(t) ? "chip active" : "chip"}
                onClick={() => toggleInList("tools", t)}
              >
                {t.replaceAll("_", " ")}
              </button>
            ))}
          </div>
        </section>
      )}

      {/* STEP 4: Role-Specific Questions */}
      {step === 4 && (
        <section className="fields">
          {roleQuestions.length > 0 ? (
            roleQuestions.map((question) => (
              <div key={question.key} style={{ marginBottom: "1.5rem" }}>
                <label htmlFor={question.key}>{question.label}</label>
                <select
                  id={question.key}
                  value={data.roleAnswers[question.key] || ""}
                  onChange={(e) => updateRoleAnswer(question.key, e.target.value)}
                  required
                >
                  <option value="">Select an option</option>
                  {question.options.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt.replaceAll("_", " ")}
                    </option>
                  ))}
                </select>
              </div>
            ))
          ) : (
            <p>No additional questions for your role.</p>
          )}
        </section>
      )}

      {/* STEP 5: Confirmation */}
      {step === 5 && (
        <section className="fields">
          <div
            style={{
              background: "#f0f4ff",
              border: "2px solid #2196f3",
              borderRadius: "8px",
              padding: "1rem"
            }}
          >
            <strong>✓ You're all set!</strong>
            <p style={{ marginTop: "0.75rem", fontSize: "0.95rem" }}>
              <strong>{data.businessName}</strong> is ready to go. Your AI assistant understands your {data.role?.replaceAll("_", " ")} work and will help you with:
            </p>
            <ul style={{ fontSize: "0.9rem", margin: "0.75rem 0", paddingLeft: "1.5rem" }}>
              <li>Creating quotes and estimates</li>
              <li>Managing your schedule</li>
              <li>Tracking projects and tasks</li>
              <li>Communicating with clients</li>
            </ul>
            <p style={{ fontSize: "0.85rem", marginTop: "1rem", color: "#666" }}>
              You can customize your experience anytime from the dashboard.
            </p>
          </div>
        </section>
      )}

      <div className="actions">
        <button
          type="button"
          onClick={previousStep}
          disabled={step === 0}
          style={{ opacity: step === 0 ? 0.5 : 1 }}
        >
          Back
        </button>

        {step < 5 ? (
          <button
            type="button"
            onClick={nextStep}
            disabled={
              (step === 0 && (!data.role || !data.industry)) ||
              (step === 1 && !data.businessName)
            }
          >
            Continue
          </button>
        ) : (
          <button type="submit">Get Started</button>
        )}
      </div>
    </form>
  );
}