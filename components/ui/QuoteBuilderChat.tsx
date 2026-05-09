/**
 * Guided Quote Builder Chat Component
 * Integrates intelligent quote questioning into the chat interface
 */

"use client";

import React, { useState, useEffect } from "react";
import { colors, spacing } from "@/lib/designSystem";
import type {
  QuoteSession,
  QuoteQuestion,
  ProjectType,
} from "@/lib/quoteBuilder";
import {
  initializeQuoteSession,
  getCurrentQuestion,
  recordAnswer,
  generateItemizedQuote,
  generateMaterialsList,
} from "@/lib/quoteBuilder";

interface QuoteBuilderChatProps {
  onQuoteGenerated: (quote: any, materials: any) => void;
  onCancel: () => void;
}

export function QuoteBuilderChat({ onQuoteGenerated, onCancel }: QuoteBuilderChatProps) {
  const [phase, setPhase] = useState<"project-type" | "client-info" | "questions" | "complete">(
    "project-type"
  );
  const [projectType, setProjectType] = useState<ProjectType | null>(null);
  const [clientName, setClientName] = useState("");
  const [projectTitle, setProjectTitle] = useState("");
  const [session, setSession] = useState<QuoteSession | null>(null);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [conversationHistory, setConversationHistory] = useState<Array<{
    role: "assistant" | "user";
    content: string;
  }>>([
    {
      role: "assistant",
      content: "Let's build a detailed quote! I'll ask you some questions about your project to generate an accurate estimate.",
    },
  ]);

  const projectTypes: ProjectType[] = [
    "construction",
    "landscaping",
    "renovation",
    "roofing",
    "plumbing",
    "electrical",
    "hvac",
    "painting",
    "other",
  ];

  const handleProjectTypeSelect = (type: ProjectType) => {
    setProjectType(type);
    setConversationHistory((prev) => [
      ...prev,
      { role: "user", content: `I need a quote for a ${type} project` },
      {
        role: "assistant",
        content: "Great! Let me get some information about your project. What's the client's name?",
      },
    ]);
    setPhase("client-info");
  };

  const handleClientInfoSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!clientName.trim() || !projectTitle.trim()) {
      alert("Please fill in both fields");
      return;
    }

    const newSession = initializeQuoteSession(
      projectType!,
      clientName,
      projectTitle
    );
    setSession(newSession);

    setConversationHistory((prev) => [
      ...prev,
      { role: "user", content: `Client: ${clientName}, Project: ${projectTitle}` },
    ]);

    setPhase("questions");
    setCurrentAnswer("");
  };

  const handleQuestionAnswer = (e: React.FormEvent) => {
    e.preventDefault();

    if (!session || !currentAnswer.trim()) return;

    const current = getCurrentQuestion(session);
    if (!current) return;

    // Record the answer
    const updatedSession = { ...session };
    recordAnswer(updatedSession, parseAnswer(current, currentAnswer));

    setConversationHistory((prev) => [
      ...prev,
      { role: "user", content: currentAnswer },
    ]);

    setSession(updatedSession);

    if (updatedSession.status === "completed") {
      // Generate quote
      const quote = generateItemizedQuote(updatedSession);
      const materials = generateMaterialsList(updatedSession);

      setConversationHistory((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `Perfect! I've generated your detailed quote with ${updatedSession.lineItems.length} line items totaling $${updatedSession.totalCost.toLocaleString()}. I've also created a materials list with ${materials.items.length} items. Would you like me to attach these to a project?`,
        },
      ]);

      setPhase("complete");
      onQuoteGenerated(quote, materials);
    } else {
      const nextQuestion = getCurrentQuestion(updatedSession);
      if (nextQuestion) {
        setConversationHistory((prev) => [
          ...prev,
          { role: "assistant", content: nextQuestion.question },
        ]);
      }
    }

    setCurrentAnswer("");
  };

  const parseAnswer = (question: QuoteQuestion, answer: string): any => {
    if (question.type === "yes_no") {
      return answer.toLowerCase() === "yes";
    } else if (question.type === "number") {
      return parseInt(answer) || 0;
    } else if (question.type === "multiselect") {
      return answer.split(",").map((s) => s.trim());
    }
    return answer;
  };

  const currentQuestion = session ? getCurrentQuestion(session) : null;

  return (
    <div className="quote-builder" style={{ display: "flex", flexDirection: "column", height: "100%", gap: spacing[4] }}>
      {/* Conversation History */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: spacing[3],
          padding: spacing[4],
          backgroundColor: colors.neutral[50],
          borderRadius: "12px",
          border: `1px solid ${colors.neutral[200]}`,
        }}
      >
        {conversationHistory.map((msg, idx) => (
          <div
            key={idx}
            style={{
              display: "flex",
              justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
              gap: spacing[2],
            }}
          >
            <div
              className="quote-builder-bubble"
              style={{
                maxWidth: "70%",
                padding: spacing[3],
                borderRadius: "12px",
                backgroundColor:
                  msg.role === "user" ? colors.primary[500] : colors.neutral[200],
                color: msg.role === "user" ? colors.white : colors.neutral[900],
                fontSize: "0.95rem",
                lineHeight: "1.5",
              }}
            >
              {msg.content}
            </div>
          </div>
        ))}
      </div>

      {/* Input Area */}
      <div style={{ display: "flex", flexDirection: "column", gap: spacing[2] }}>
        {phase === "project-type" && (
          <div>
            <p style={{ marginBottom: spacing[3], fontWeight: 600, color: colors.neutral[700] }}>
              What type of project?
            </p>
            <div
              className="project-type-grid"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
                gap: spacing[2],
              }}
            >
              {projectTypes.map((type) => (
                <button
                  key={type}
                  onClick={() => handleProjectTypeSelect(type)}
                  style={{
                    padding: `${spacing[2]} ${spacing[3]}`,
                    backgroundColor: colors.primary[500],
                    color: colors.white,
                    border: "none",
                    borderRadius: "8px",
                    fontWeight: 500,
                    cursor: "pointer",
                    fontSize: "0.9rem",
                    textTransform: "capitalize",
                    transition: "all 0.2s",
                  }}
                  onMouseOver={(e) => {
                    (e.target as HTMLButtonElement).style.backgroundColor =
                      colors.primary[600];
                  }}
                  onMouseOut={(e) => {
                    (e.target as HTMLButtonElement).style.backgroundColor =
                      colors.primary[500];
                  }}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        )}

        {phase === "client-info" && (
          <form onSubmit={handleClientInfoSubmit}>
            <div style={{ display: "flex", flexDirection: "column", gap: spacing[2] }}>
              <input
                type="text"
                placeholder="Client name"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                style={{
                  padding: `${spacing[2]} ${spacing[3]}`,
                  border: `1px solid ${colors.neutral[300]}`,
                  borderRadius: "8px",
                  fontSize: "1rem",
                  fontFamily: "inherit",
                }}
              />
              <input
                type="text"
                placeholder="Project title"
                value={projectTitle}
                onChange={(e) => setProjectTitle(e.target.value)}
                style={{
                  padding: `${spacing[2]} ${spacing[3]}`,
                  border: `1px solid ${colors.neutral[300]}`,
                  borderRadius: "8px",
                  fontSize: "1rem",
                  fontFamily: "inherit",
                }}
              />
              <button
                type="submit"
                style={{
                  padding: `${spacing[2]} ${spacing[3]}`,
                  backgroundColor: colors.primary[500],
                  color: colors.white,
                  border: "none",
                  borderRadius: "8px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Continue
              </button>
            </div>
          </form>
        )}

        {phase === "questions" && currentQuestion && (
          <form onSubmit={handleQuestionAnswer}>
            <div className="quote-question-row" style={{ display: "flex", gap: spacing[2] }}>
              {currentQuestion.type === "yes_no" ? (
                <div style={{ display: "flex", gap: spacing[2], flex: 1 }}>
                  <button
                    type="button"
                    onClick={() => setCurrentAnswer("yes")}
                    style={{
                      flex: 1,
                      padding: `${spacing[2]} ${spacing[3]}`,
                      backgroundColor:
                        currentAnswer === "yes" ? colors.success : colors.neutral[300],
                      color: currentAnswer === "yes" ? colors.white : colors.neutral[900],
                      border: "none",
                      borderRadius: "8px",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    Yes
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentAnswer("no")}
                    style={{
                      flex: 1,
                      padding: `${spacing[2]} ${spacing[3]}`,
                      backgroundColor:
                        currentAnswer === "no" ? colors.error : colors.neutral[300],
                      color: currentAnswer === "no" ? colors.white : colors.neutral[900],
                      border: "none",
                      borderRadius: "8px",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    No
                  </button>
                </div>
              ) : currentQuestion.type === "select" ? (
                <select
                  value={currentAnswer}
                  onChange={(e) => setCurrentAnswer(e.target.value)}
                  style={{
                    flex: 1,
                    padding: `${spacing[2]} ${spacing[3]}`,
                    border: `1px solid ${colors.neutral[300]}`,
                    borderRadius: "8px",
                    fontSize: "1rem",
                    fontFamily: "inherit",
                  }}
                >
                  <option value="">Select an option...</option>
                  {currentQuestion.options?.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type={currentQuestion.type === "number" ? "number" : "text"}
                  placeholder={currentQuestion.placeholder || "Your answer..."}
                  value={currentAnswer}
                  onChange={(e) => setCurrentAnswer(e.target.value)}
                  style={{
                    flex: 1,
                    padding: `${spacing[2]} ${spacing[3]}`,
                    border: `1px solid ${colors.neutral[300]}`,
                    borderRadius: "8px",
                    fontSize: "1rem",
                    fontFamily: "inherit",
                  }}
                />
              )}
              <button
                type="submit"
                disabled={!currentAnswer}
                style={{
                  padding: `${spacing[2]} ${spacing[3]}`,
                  backgroundColor:
                    currentAnswer ? colors.primary[500] : colors.neutral[300],
                  color: colors.white,
                  border: "none",
                  borderRadius: "8px",
                  fontWeight: 600,
                  cursor: currentAnswer ? "pointer" : "not-allowed",
                }}
              >
                Next
              </button>
            </div>
            {currentQuestion.hint && (
              <p style={{ fontSize: "0.8rem", color: colors.neutral[500], marginTop: spacing[2] }}>
                💡 {currentQuestion.hint}
              </p>
            )}
          </form>
        )}

        {phase === "complete" && (
          <div className="quote-question-row" style={{ display: "flex", gap: spacing[2] }}>
            <button
              onClick={onCancel}
              style={{
                flex: 1,
                padding: `${spacing[2]} ${spacing[3]}`,
                backgroundColor: colors.neutral[300],
                color: colors.neutral[900],
                border: "none",
                borderRadius: "8px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Create Another Quote
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
