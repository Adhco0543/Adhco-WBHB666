"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getCustomization, saveCustomization } from "@/lib/assistantActions";
import type { OutputCustomization } from "@/lib/assistantTypes";

interface Tool {
  id: string;
  name: string;
  icon: string;
  description: string;
  fields: Array<{ key: string; label: string; type: "text" | "password"; placeholder: string }>;
  docs?: string;
  configured: boolean;
}

export default function RealWorldToolsPage() {
  const [tools, setTools] = useState<Tool[]>([]);
  const [customization, setCustomization] = useState<OutputCustomization | null>(null);
  const [editingTool, setEditingTool] = useState<string | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [feedback, setFeedback] = useState("");
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});

  const TOOLS: Tool[] = [
    {
      id: "email",
      name: "📧 Email Service",
      icon: "📧",
      description: "Send emails via SMTP or email API",
      fields: [
        { key: "provider", label: "Provider", type: "text", placeholder: "gmail, sendgrid, mailgun" },
        { key: "api_key", label: "API Key / Password", type: "password", placeholder: "Your API key or app password" },
        { key: "from_email", label: "From Email", type: "text", placeholder: "sender@example.com" },
      ],
      configured: false,
    },
    {
      id: "calendar",
      name: "📅 Calendar Integration",
      icon: "📅",
      description: "Create calendar events and meetings",
      fields: [
        { key: "provider", label: "Calendar", type: "text", placeholder: "google, microsoft, calendly" },
        { key: "api_key", label: "API Key", type: "password", placeholder: "Your calendar API key" },
        { key: "calendar_id", label: "Calendar ID", type: "text", placeholder: "Optional calendar ID" },
      ],
      configured: false,
    },
    {
      id: "slack",
      name: "💬 Slack Integration",
      icon: "💬",
      description: "Send notifications and messages to Slack",
      fields: [
        { key: "webhook_url", label: "Webhook URL", type: "password", placeholder: "https://hooks.slack.com/services/..." },
        { key: "channel", label: "Default Channel", type: "text", placeholder: "#notifications" },
      ],
      configured: false,
    },
    {
      id: "quickbooks",
      name: "💳 QuickBooks",
      icon: "💳",
      description: "Sync invoices and financial data",
      fields: [
        { key: "realm_id", label: "Realm ID", type: "text", placeholder: "Your QuickBooks Realm ID" },
        { key: "access_token", label: "Access Token", type: "password", placeholder: "OAuth 2.0 Access Token" },
        { key: "refresh_token", label: "Refresh Token", type: "password", placeholder: "OAuth 2.0 Refresh Token" },
      ],
      configured: false,
    },
    {
      id: "stripe",
      name: "💰 Stripe Payments",
      icon: "💰",
      description: "Create payment links and process payments",
      fields: [
        { key: "api_key", label: "Secret API Key", type: "password", placeholder: "sk_test_... or sk_live_..." },
        { key: "publishable_key", label: "Publishable Key", type: "text", placeholder: "pk_test_... or pk_live_..." },
      ],
      configured: false,
    },
  ];

  useEffect(() => {
    const cust = getCustomization();
    setCustomization(cust);
    
    // Load existing tool configs
    const toolsWithConfig = TOOLS.map((tool) => ({
      ...tool,
      configured: !!(cust.toolConfigs && cust.toolConfigs[tool.id]),
    }));
    setTools(toolsWithConfig);
  }, []);

  const handleEditTool = (toolId: string) => {
    const tool = tools.find((t) => t.id === toolId);
    if (tool && customization?.toolConfigs?.[toolId]) {
      setFormData(customization.toolConfigs[toolId]);
    } else {
      setFormData({});
    }
    setEditingTool(toolId);
  };

  const handleSaveTool = (toolId: string) => {
    if (!customization) return;

    const updated: OutputCustomization = {
      ...customization,
      toolConfigs: {
        ...customization.toolConfigs,
        [toolId]: { ...formData, savedAt: new Date().toISOString() },
      },
    };

    saveCustomization(updated);
    setCustomization(updated);
    setTools(
      tools.map((t) => ({
        ...t,
        configured: !!(updated.toolConfigs && updated.toolConfigs[t.id]),
      }))
    );
    setEditingTool(null);
    setFormData({});
    setFeedback(`✅ ${toolId} saved`);
    setTimeout(() => setFeedback(""), 2000);
  };

  const handleRemoveTool = (toolId: string) => {
    if (!window.confirm(`Remove ${toolId} configuration?`)) return;

    if (!customization) return;

    const { [toolId]: _, ...remaining } = customization.toolConfigs || {};

    const updated: OutputCustomization = {
      ...customization,
      toolConfigs: remaining,
    };

    saveCustomization(updated);
    setCustomization(updated);
    setTools(
      tools.map((t) => ({
        ...t,
        configured: !!(updated.toolConfigs && updated.toolConfigs[t.id]),
      }))
    );
    setFeedback(`✅ ${toolId} removed`);
    setTimeout(() => setFeedback(""), 2000);
  };

  return (
    <main style={{ maxWidth: "1000px", margin: "0 auto", padding: "1.5rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <Link href="/dashboard" style={{ color: "#6b7280", textDecoration: "none", fontWeight: "500" }}>
          ← Dashboard
        </Link>
        <h1 style={{ margin: 0, fontSize: "1.875rem" }}>🔧 Real-World Tools</h1>
        <div />
      </div>

      {feedback && (
        <div style={{ padding: "0.75rem 1rem", background: "#d1fae5", color: "#065f46", borderRadius: "6px", marginBottom: "1rem", fontSize: "0.9rem" }}>
          {feedback}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1.5rem" }}>
        {tools.map((tool) => (
          <div key={tool.id} style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: "12px", padding: "1.5rem" }}>
            <div style={{ display: "flex", alignItems: "start", justifyContent: "space-between", marginBottom: "1rem" }}>
              <div>
                <h2 style={{ margin: 0, fontSize: "1.25rem" }}>{tool.name}</h2>
                <p style={{ margin: "0.5rem 0 0 0", fontSize: "0.9rem", color: "#6b7280" }}>{tool.description}</p>
              </div>
              {tool.configured && <span style={{ fontSize: "1.5rem" }}>✅</span>}
            </div>

            {editingTool === tool.id ? (
              <div style={{ marginTop: "1rem" }}>
                {tool.fields.map((field) => (
                  <div key={field.key} style={{ marginBottom: "1rem" }}>
                    <label style={{ display: "block", fontSize: "0.875rem", fontWeight: "600", marginBottom: "0.5rem", color: "#374151" }}>
                      {field.label}
                    </label>
                    <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                      <input
                        type={field.type === "password" && !showSecrets[field.key] ? "password" : "text"}
                        value={formData[field.key] || ""}
                        onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                        placeholder={field.placeholder}
                        style={{
                          flex: 1,
                          padding: "0.75rem",
                          border: "1px solid #d1d5db",
                          borderRadius: "6px",
                          fontSize: "1rem",
                        }}
                      />
                      {field.type === "password" && (
                        <button
                          onClick={() => setShowSecrets({ ...showSecrets, [field.key]: !showSecrets[field.key] })}
                          style={{
                            padding: "0.75rem",
                            background: "#e5e7eb",
                            border: "none",
                            borderRadius: "6px",
                            cursor: "pointer",
                            fontSize: "0.9rem",
                          }}
                        >
                          {showSecrets[field.key] ? "👁️" : "🔒"}
                        </button>
                      )}
                    </div>
                  </div>
                ))}

                <div style={{ display: "flex", gap: "0.5rem", marginTop: "1.5rem" }}>
                  <button
                    onClick={() => handleSaveTool(tool.id)}
                    style={{
                      flex: 1,
                      padding: "0.75rem",
                      background: "#2563eb",
                      color: "white",
                      border: "none",
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontWeight: "500",
                    }}
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditingTool(null)}
                    style={{
                      flex: 1,
                      padding: "0.75rem",
                      background: "#e5e7eb",
                      color: "#374151",
                      border: "none",
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontWeight: "500",
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}>
                <button
                  onClick={() => handleEditTool(tool.id)}
                  style={{
                    flex: 1,
                    padding: "0.75rem",
                    background: tool.configured ? "#10b981" : "#6366f1",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontWeight: "500",
                    fontSize: "0.9rem",
                  }}
                >
                  {tool.configured ? "🔄 Reconfigure" : "⚙️ Configure"}
                </button>
                {tool.configured && (
                  <button
                    onClick={() => handleRemoveTool(tool.id)}
                    style={{
                      padding: "0.75rem 1rem",
                      background: "#ef4444",
                      color: "white",
                      border: "none",
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontWeight: "500",
                      fontSize: "0.9rem",
                    }}
                  >
                    🗑️
                  </button>
                )}
              </div>
            )}

            {tool.docs && (
              <a
                href={tool.docs}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-block",
                  marginTop: "1rem",
                  fontSize: "0.8rem",
                  color: "#3b82f6",
                  textDecoration: "none",
                  borderBottom: "1px solid #3b82f6",
                }}
              >
                📖 Learn more
              </a>
            )}
          </div>
        ))}
      </div>

      <section style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: "12px", padding: "1.5rem", marginTop: "2rem" }}>
        <h2 style={{ margin: "0 0 1rem 0", fontSize: "1.125rem" }}>💡 Integration Tips</h2>
        <ul style={{ margin: 0, paddingLeft: "1.5rem", color: "#6b7280", lineHeight: "1.8" }}>
          <li><strong>Email:</strong> Use app passwords instead of main passwords for security</li>
          <li><strong>Calendar:</strong> Most services provide API keys in their developer dashboard</li>
          <li><strong>Slack:</strong> Create an Incoming Webhook in your Slack workspace settings</li>
          <li><strong>QuickBooks:</strong> OAuth tokens expire - we'll handle automatic refresh</li>
          <li><strong>Stripe:</strong> Always use Secret Key for server-side operations, never client-side</li>
        </ul>
      </section>

      <style jsx>{`
        main {
          min-height: 100vh;
          background: #ffffff;
        }
      `}</style>
    </main>
  );
}
