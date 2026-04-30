"use client";

import { FormEvent, useMemo, useState } from "react";
import {
  defaultOnboardingData,
  industrySpecificQuestions,
  OnboardingData,
  PAIN_POINTS,
  TOOLS
} from "@/lib/onboarding";

type Step = 0 | 1 | 2 | 3 | 4 | 5;

const STEPS = [
  { title: "Business basics", description: "Tell us what kind of business you run." },
  { title: "How you work", description: "Help us understand your daily operations." },
  { title: "Pain points", description: "Pick your biggest workflow bottlenecks." },
  { title: "Tools", description: "Select the tools you currently use." },
  { title: "Role-specific", description: "A few tailored questions for your industry." },
  { title: "Review setup", description: "Confirm and finish onboarding." }
];

export function OnboardingForm() {
  const [step, setStep] = useState<Step>(0);
  const [data, setData] = useState<OnboardingData>(defaultOnboardingData);
  const [submitted, setSubmitted] = useState(false);

  const roleQuestions = useMemo(
    () => (data.industry ? industrySpecificQuestions[data.industry] : undefined) ?? [],
    [data.industry]
  );

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

  const nextStep = () => setStep((s) => Math.min(s + 1, 5) as Step);
  const previousStep = () => setStep((s) => Math.max(s - 1, 0) as Step);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    localStorage.setItem("onboarding_profile", JSON.stringify(data));
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="card">
        <h2>Setup complete</h2>
        <p>
          Your answers were saved locally as <code>onboarding_profile</code>.
        </p>
        <pre>{JSON.stringify(data, null, 2)}</pre>
      </div>
    );
  }

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

      {/* STEP 0 */}
      {step === 0 && (
        <section className="fields">
          <label>
            Business name
            <input
              required
              value={data.businessName}
              onChange={(e) => updateField("businessName", e.target.value)}
            />
          </label>

          <label>
            Industry
            <select
              value={data.industry}
              onChange={(e) => updateField("industry", e.target.value as OnboardingData["industry"])}
              required
            >
              <option value="">Select industry</option>
              <option value="carpentry">Carpentry</option>
              <option value="salon">Salon</option>
              <option value="auto_repair">Auto Repair</option>
              <option value="restaurant">Restaurant</option>
              <option value="retail">Retail</option>
              <option value="other">Other</option>
            </select>
          </label>

          <label>
            Team size
            <select
              value={data.teamSize}
              onChange={(e) =>
                updateField(
                  "teamSize",
                  e.target.value as OnboardingData["teamSize"]
                )
              }
            >
              <option value="solo">Just me</option>
              <option value="2_5">2-5</option>
              <option value="6_15">6-15</option>
              <option value="16_plus">16+</option>
            </select>
          </label>
        </section>
      )}

      {/* STEP 1 */}
      {step === 1 && (
        <section className="fields">
          <label>
            Revenue model
            <select
              value={data.revenueModel}
              onChange={(e) =>
                updateField(
                  "revenueModel",
                  e.target.value as OnboardingData["revenueModel"]
                )
              }
            >
              <option value="appointments">Appointments</option>
              <option value="projects">Projects</option>
              <option value="products">Products</option>
              <option value="subscription">Subscription</option>
              <option value="mixed">Mixed</option>
            </select>
          </label>

          <label>
            Work mode
            <select
              value={data.workMode}
              onChange={(e) =>
                updateField(
                  "workMode",
                  e.target.value as OnboardingData["workMode"]
                )
              }
            >
              <option value="on_site">On-site</option>
              <option value="client_site">Client site</option>
              <option value="hybrid">Hybrid</option>
            </select>
          </label>
        </section>
      )}

      {/* STEP 2 */}
      {step === 2 && (
        <section className="chips">
          {PAIN_POINTS.map((p) => (
            <button
              key={p}
              type="button"
              className={
                data.painPoints.includes(p) ? "chip active" : "chip"
              }
              onClick={() => toggleInList("painPoints", p)}
            >
              {p.replaceAll("_", " ")}
            </button>
          ))}

          <label>
            What would save you time?
            <textarea
              value={data.timeSavingFocus}
              onChange={(e) =>
                updateField("timeSavingFocus", e.target.value)
              }
            />
          </label>
        </section>
      )}

      {/* STEP 3 */}
      {step === 3 && (
        <section className="chips">
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
        </section>
      )}

      {/* STEP 4 */}
      {step === 4 && (
        <section className="fields">
          {roleQuestions.length === 0 ? (
            <p>No extra questions</p>
          ) : (
            roleQuestions.map((q) => (
              <label key={q.key}>
                {q.label}
                <select
                  value={data.roleAnswers[q.key] ?? ""}
                  onChange={(e) =>
                    updateField("roleAnswers", {
                      ...data.roleAnswers,
                      [q.key]: e.target.value
                    })
                  }
                >
                  <option value="">Select</option>
                  {q.options.map((opt) => (
                    <option key={opt}>{opt}</option>
                  ))}
                </select>
              </label>
            ))
          )}
        </section>
      )}

      {/* STEP 5 */}
      {step === 5 && (
        <section>
          <pre>{JSON.stringify(data, null, 2)}</pre>
        </section>
      )}

      <div className="actions">
        <button
          type="button"
          onClick={previousStep}
          disabled={step === 0}
        >
          Back
        </button>

        {step < 5 ? (
          <button type="button" onClick={nextStep}>
            Continue
          </button>
        ) : (
          <button type="submit">Finish</button>
        )}
      </div>
    </form>
  );
}