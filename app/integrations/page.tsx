"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  getConnectedIntegrations,
  getIntegrationConfig,
  saveIntegrationConfig,
  removeIntegrationConfig,
  type IntegrationName,
  type IntegrationConfig
} from "@/lib/integrations";

type IntegrationInfo = {
  name: IntegrationName;
  label: string;
  icon: string;
  description: string;
  docs: string;
};

const integrations: IntegrationInfo[] = [
  {
    name: "google_calendar",
    label: "Google Calendar",
    icon: "📅",
    description: "Sync tasks to your Google Calendar as events with due dates and priorities",
    docs: "https://developers.google.com/calendar/api"
  },
  {
    name: "slack",
    label: "Slack",
    icon: "💬",
    description: "Get task reminders and updates in your Slack workspace, mark tasks complete from chat",
    docs: "https://api.slack.com"
  },
  {
    name: "quickbooks",
    label: "QuickBooks",
    icon: "💰",
    description: "Sync invoices, estimates, and expenses to QuickBooks for accounting and reporting",
    docs: "https://developer.intuit.com/app/developer/qbo/docs/api"
  },
  {
    name: "stripe",
    label: "Stripe",
    icon: "💳",
    description: "Create payment links and track payments directly from your tasks",
    docs: "https://stripe.com/docs/api"
  },
  {
    name: "sheets",
    label: "Google Sheets",
    icon: "📊",
    description: "Export tasks and reports to Google Sheets for analysis and sharing",
    docs: "https://developers.google.com/sheets/api"
  }
];

export default function IntegrationsPage() {
  const [connectedIntegrations, setConnectedIntegrations] = useState<IntegrationName[]>([]);
  const [selectedIntegration, setSelectedIntegration] = useState<IntegrationName | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [config, setConfig] = useState<Record<string, any>>({});
  const [message, setMessage] = useState("");

  useEffect(() => {
    const connected = getConnectedIntegrations();
    setConnectedIntegrations(connected);
  }, []);

  const handleConnect = async (name: IntegrationName) => {
    setSelectedIntegration(name);
    setIsConnecting(true);
    setMessage("");

    // In a real app, redirect to OAuth flow
    // For now, show a demo connection
    setTimeout(() => {
      const newConfig: IntegrationConfig = {
        name,
        status: "connected",
        credentials: {
          accessToken: "demo-token-" + Math.random().toString(36).slice(2)
        },
        connectedAt: new Date().toISOString()
      };

      saveIntegrationConfig(newConfig);
      setConnectedIntegrations([...connectedIntegrations, name]);
      setMessage(`✅ ${integrations.find(i => i.name === name)?.label} connected!`);
      setIsConnecting(false);
      setSelectedIntegration(null);
      setConfig({});
    }, 1500);
  };

  const handleDisconnect = (name: IntegrationName) => {
    removeIntegrationConfig(name);
    setConnectedIntegrations(connectedIntegrations.filter(i => i !== name));
    setMessage(`❌ ${integrations.find(i => i.name === name)?.label} disconnected`);
  };

  const isConnected = (name: IntegrationName) => connectedIntegrations.includes(name);

  return (
    <main className="page">
      <div className="stack">
        <Link className="back" href="/dashboard">
          ← Dashboard
        </Link>

        <section className="card">
          <p className="eyebrow">Integrations</p>
          <h1>Connect Your Tools</h1>
          <p>
            Sync tasks, data, and workflows across your favorite business tools. All integrations
            are optional and can be connected anytime.
          </p>
        </section>

        {message && (
          <section className="card" style={{ background: "#f1f8e9", border: "1px solid #558b2f" }}>
            <p>{message}</p>
          </section>
        )}

        <section>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1rem" }}>
            {integrations.map((integration) => (
              <div
                key={integration.name}
                className="card"
                style={{
                  borderLeft: isConnected(integration.name) ? "4px solid #4caf50" : "4px solid #e0e0e0"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                  <div>
                    <h3 style={{ marginTop: 0 }}>
                      {integration.icon} {integration.label}
                    </h3>
                    <p style={{ fontSize: "0.9rem", color: "#666", marginTop: 0 }}>
                      {integration.description}
                    </p>
                  </div>
                  <span
                    style={{
                      fontSize: "0.8rem",
                      padding: "0.5rem 1rem",
                      borderRadius: "4px",
                      background: isConnected(integration.name) ? "#e8f5e9" : "#f5f5f5",
                      color: isConnected(integration.name) ? "#2e7d32" : "#999",
                      whiteSpace: "nowrap"
                    }}
                  >
                    {isConnected(integration.name) ? "✓ Connected" : "Not connected"}
                  </span>
                </div>

                <div className="actions" style={{ marginTop: "1rem", gap: "0.5rem" }}>
                  {isConnected(integration.name) ? (
                    <>
                      <button
                        type="button"
                        className="button ghost"
                        onClick={() => handleDisconnect(integration.name)}
                      >
                        Disconnect
                      </button>
                      <a
                        href={integration.docs}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="button ghost"
                        style={{ textDecoration: "none", textAlign: "center" }}
                      >
                        Docs
                      </a>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        className="button"
                        onClick={() => handleConnect(integration.name)}
                        disabled={isConnecting && selectedIntegration === integration.name}
                      >
                        {isConnecting && selectedIntegration === integration.name
                          ? "Connecting..."
                          : "Connect"}
                      </button>
                      <a
                        href={integration.docs}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="button ghost"
                        style={{ textDecoration: "none", textAlign: "center" }}
                      >
                        Learn More
                      </a>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="card">
          <h2>Need a different integration?</h2>
          <p>
            We support connecting to any service. Contact us to request a new integration or to
            build a custom connector for your workflow.
          </p>
          <a href="mailto:support@example.com" className="button ghost">
            Request Integration
          </a>
        </section>
      </div>

      <style jsx>{`
        .stack {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .card {
          background: white;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          padding: 1.5rem;
        }

        .actions {
          display: flex;
          gap: 0.75rem;
          margin-top: 1rem;
        }

        .button {
          padding: 0.75rem 1.5rem;
          background: #2196f3;
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-size: 1rem;
          transition: background 0.2s;
          flex: 1;
          text-align: center;
        }

        .button:hover {
          background: #1976d2;
        }

        .button:disabled {
          background: #ccc;
          cursor: not-allowed;
        }

        .button.ghost {
          background: transparent;
          color: #2196f3;
          border: 1px solid #2196f3;
          flex: 1;
        }

        .button.ghost:hover {
          background: #f1f5ff;
        }

        .back {
          color: #2196f3;
          text-decoration: none;
          margin-bottom: 1rem;
        }

        .back:hover {
          text-decoration: underline;
        }

        h1 {
          font-size: 2rem;
          margin: 1rem 0 0.5rem;
        }

        h3 {
          font-size: 1.25rem;
          margin: 0 0 0.5rem;
        }

        p {
          margin: 0.5rem 0;
          line-height: 1.6;
        }
      `}</style>
    </main>
  );
}
