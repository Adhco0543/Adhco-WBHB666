"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  defaultOnboardingData,
  formatLabel,
  INDUSTRIES,
  industrySpecificQuestions,
  OnboardingData,
  PAIN_POINTS,
  REVENUE_MODEL_OPTIONS,
  TEAM_SIZE_OPTIONS,
  TOOLS,
  WORK_MODE_OPTIONS
} from "@/lib/onboarding";

type Step = 0 | 1 | 2 | 3 | 4 | 5;

const STEPS: { title: string; description: string }[] = [
  { title: "Business basics", description: "Tell us what kind of business you run." },
  { title: "How you work", description: "Help us understand your daily operations." },
  { title: "Pain points", description: "Pick your biggest workflow bottlenecks." },
  { title: "Tools", description: "Select the tools you currently use." },
  { title: "Role-specific", description: "A few tailored questions for your industry." },
  { title: "Review setup", description: "Confirm and finish onboarding." }
];

const ONBOARDING_STORAGE_KEY = "onboarding_profile";
const ONBOARDING_STEP_KEY = "onboarding_step";

export function OnboardingForm() {
  const [step, setStep] = useState<Step>(0);
  const [data, setData] = useState<OnboardingData>(defaultOnboardingData);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const roleQuestions = useMemo(() => {
    if (!data.industry) {
      return [];
    }

    return industrySpecificQuestions[data.industry] ?? [];
  }, [data.industry]);

  useEffect(() => {
    const savedProfile = localStorage.getItem(ONBOARDING_STORAGE_KEY);
    const savedStep = localStorage.getItem(ONBOARDING_STEP_KEY);

    if (savedProfile) {
      try {
        const parsedProfile = JSON.parse(savedProfile) as OnboardingData;
        setData({ ...defaultOnboardingData, ...parsedProfile });
      } catch {
        localStorage.removeItem(ONBOARDING_STORAGE_KEY);
      }
    }

    if (savedStep) {
      const parsedStep = Number(savedStep);
      if (!Number.isNaN(parsedStep) && parsedStep >= 0 && parsedStep <= 5) {
        setStep(parsedStep as Step);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(ONBOARDING_STEP_KEY, String(step));
  }, [step]);

  const updateField = <K extends keyof OnboardingData>(key: K, value: OnboardingData[K]) => {
    setErrorMessage("");
    setData((prev) => ({ ...prev, [key]: value }));
  };

  const togglePainPoint = (value: string) => {
    setErrorMessage("");
    setData((prev) => {
      const hasValue = prev.painPoints.includes(value);

      if (hasValue) {
        return { ...prev, painPoints: prev.painPoints.filter((item) => item !== value) };
      }

      if (prev.painPoints.length >= 3) {
        setErrorMessage("Select up to 3 pain points.");
        return prev;
      }

      return { ...prev, painPoints: [...prev.painPoints, value] };
    });
  };

  const toggleTool = (value: string) => {
    setErrorMessage("");
    setData((prev) => {
      const hasValue = prev.tools.includes(value);

      if (hasValue) {
        return { ...prev, tools: prev.tools.filter((item) => item !== value) };
      }

      if (value === "none") {
        return { ...prev, tools: ["none"] };
      }

      const withoutNone = prev.tools.filter((item) => item !== "none");
      return { ...prev, tools: [...withoutNone, value] };
    });
  };

  const validateStep = () => {
    if (step === 0) {
      if (!data.businessName.trim()) {
        return "Business name is required.";
      }

      if (!data.industry) {
        return "Please select your industry.";
      }
    }

    if (step === 2) {
      if (data.painPoints.length === 0) {
        return "Choose at least 1 pain point.";
      }

      if (!data.timeSavingFocus.trim()) {
        return "Tell us what would save you time each week.";
      }
    }

    if (step === 3 && data.tools.length === 0) {
      return "Choose at least 1 tool or pick none.";
    }

    if (step === 4 && roleQuestions.length > 0) {
      const missingAnswer = roleQuestions.some((question) => !data.roleAnswers[question.key]);
      if (missingAnswer) {
        return "Please answer all role-specific questions.";
      }
    }

    return "";
  };

  const nextStep = () => {
    const validationError = validateStep();
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    setErrorMessage("");
    setStep((prev) => Math.min(prev + 1, 5) as Step);
  };

  const previousStep = () => {
    setErrorMessage("");
    setStep((prev) => Math.max(prev - 1, 0) as Step);
  };

  const resetOnboarding = () => {
    localStorage.removeItem(ONBOARDING_STORAGE_KEY);
    localStorage.removeItem(ONBOARDING_STEP_KEY);
    setData(defaultOnboardingData);
    setErrorMessage("");
    setStep(0);
    setSubmitted(false);
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const validationError = validateStep();

    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    localStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(data));
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="card">
        <h2>Setup complete</h2>
        <p>
          Your answers were saved locally as <code>{ONBOARDING_STORAGE_KEY}</code>. Next step: send this
          object to your backend <code>/setup/generate</code> endpoint.
        </p>
        <pre>{JSON.stringify(data, null, 2)}</pre>
        <button className="button ghost" onClick={resetOnboarding} type="button">
          Start over
        </button>
      </div>
    );
  }

  const progress = Math.round(((step + 1) / STEPS.length) * 100);

  return (
    <form className="card" onSubmit={handleSubmit}>
      <p className="eyebrow">Step {step + 1} of {STEPS.length}</p>
      <h2>{STEPS[step].title}</h2>
      <p>{STEPS[step].description}</p>
      <div aria-label="Onboarding progress" aria-valuemax={100} aria-valuemin={0} aria-valuenow={progress} className="progress" role="progressbar">
        <div style={{ width: `${progress}%` }} />
      </div>

      {errorMessage ? <p className="errorText">{errorMessage}</p> : null}

      {step === 0 && (
        <section className="fields">
          <label>
            Business name
            <input
              required
              value={data.businessName}
              onChange={(event) => updateField("businessName", event.target.value)}
            />
          </label>
          <label>
            Industry
            <select value={data.industry} onChange={(event) => updateField("industry", event.target.value as OnboardingData["industry"])} required>
              <option value="">Select industry</option>
              {INDUSTRIES.map((industry) => (
                <option key={industry} value={industry}>
                  {formatLabel(industry)}
                </option>
              ))}
            </select>
          </label>
          <label>
            Team size
            <select value={data.teamSize} onChange={(event) => updateField("teamSize", event.target.value as OnboardingData["teamSize"])}>
              {TEAM_SIZE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </section>
      )}

      {step === 1 && (
        <section className="fields">
          <label>
            Revenue model
            <select
              value={data.revenueModel}
              onChange={(event) => updateField("revenueModel", event.target.value as OnboardingData["revenueModel"])}
            >
              {REVENUE_MODEL_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            Work mode
            <select
              value={data.workMode}
              onChange={(event) => updateField("workMode", event.target.value as OnboardingData["workMode"])}
            >
              {WORK_MODE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </section>
      )}

      {step === 2 && (
        <section className="chipsSection">
          <p className="helperText">Select up to 3.</p>
          <div className="chips">
            {PAIN_POINTS.map((painPoint) => (
              <button
                className={data.painPoints.includes(painPoint) ? "chip active" : "chip"}
                key={painPoint}
                onClick={(event) => {
                  event.preventDefault();
                  togglePainPoint(painPoint);
                }}
                type="button"
              >
                {formatLabel(painPoint)}
              </button>
            ))}
          </div>
          <label>
            What would save you the most time each week?
            <textarea
              value={data.timeSavingFocus}
              onChange={(event) => updateField("timeSavingFocus", event.target.value)}
              placeholder="Example: Faster quote approvals and automatic invoice reminders"
            />
          </label>
        </section>
      )}

      {step === 3 && (
        <section className="chipsSection">
          <p className="helperText">Tip: choosing none will clear other selections.</p>
          <div className="chips">
            {TOOLS.map((tool) => (
              <button
                className={data.tools.includes(tool) ? "chip active" : "chip"}
                key={tool}
                onClick={(event) => {
                  event.preventDefault();
                  toggleTool(tool);
                }}
                type="button"
              >
                {formatLabel(tool)}
              </button>
            ))}
          </div>
        </section>
      )}

      {step === 4 && (
        <section className="fields">
          {roleQuestions.length === 0 ? (
            <p>No additional questions for this industry yet.</p>
          ) : (
            roleQuestions.map((question) => (
              <label key={question.key}>
                {question.label}
                <select
                  value={data.roleAnswers[question.key] ?? ""}
                  onChange={(event) =>
                    updateField("roleAnswers", { ...data.roleAnswers, [question.key]: event.target.value })
                  }
                >
                  <option value="">Select one</option>
                  {question.options.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
            ))
          )}
        </section>
      )}

      {step === 5 && (
        <section className="fields">
          <p>Review your onboarding profile before completing setup.</p>
          <pre>{JSON.stringify(data, null, 2)}</pre>
        </section>
      )}

      <div className="actions">
        <button type="button" className="button ghost" disabled={step === 0} onClick={previousStep}>
          Back
        </button>
        {step < 5 ? (
          <button type="button" className="button" onClick={nextStep}>
            Continue
          </button>
        ) : (
          <button type="submit" className="button">
            Complete setup
          </button>
        )}
      </div>
    </form>
  );
}
