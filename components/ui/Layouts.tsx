"use client";

import { colors, spacing } from "@/lib/designSystem";

export function Grid({
  columns = 3,
  gap = spacing[6],
  children,
}: {
  columns?: number;
  gap?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(auto-fit, minmax(280px, 1fr))`,
        gap: gap,
        width: "100%",
      }}
    >
      {children}
    </div>
  );
}

export function Section({
  title,
  subtitle,
  children,
  action,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: spacing[8] }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: spacing[4],
        }}
      >
        <div>
          <h2
            style={{
              margin: 0,
              fontSize: "1.5rem",
              fontWeight: 700,
              color: colors.neutral[900],
            }}
          >
            {title}
          </h2>
          {subtitle && (
            <p
              style={{
                margin: `${spacing[2]} 0 0 0`,
                fontSize: "0.95rem",
                color: colors.neutral[500],
              }}
            >
              {subtitle}
            </p>
          )}
        </div>
        {action && <div>{action}</div>}
      </div>
      <div>{children}</div>
    </div>
  );
}

export function TwoPanelLayout({
  left,
  right,
  leftWidth = "65%",
}: {
  left: React.ReactNode;
  right: React.ReactNode;
  leftWidth?: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        gap: spacing[6],
        width: "100%",
      }}
    >
      <div style={{ flex: "0 0 calc(" + leftWidth + " - " + spacing[3] + ")" }}>
        {left}
      </div>
      <div style={{ flex: 1 }}>
        {right}
      </div>
    </div>
  );
}

export function CompactCard({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string | number;
}) {
  return (
    <div
      style={{
        backgroundColor: colors.white,
        border: `1px solid ${colors.neutral[200]}`,
        borderRadius: "8px",
        padding: spacing[4],
        display: "flex",
        alignItems: "center",
        gap: spacing[3],
        transition: "all 150ms ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = "0 4px 6px -1px rgb(0 0 0 / 0.1)";
        e.currentTarget.style.transform = "translateY(-1px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = "none";
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      <div style={{ fontSize: "2rem" }}>{icon}</div>
      <div>
        <div style={{ fontSize: "0.85rem", color: colors.neutral[500] }}>{label}</div>
        <div
          style={{
            fontSize: "1.5rem",
            fontWeight: 700,
            color: colors.neutral[900],
          }}
        >
          {value}
        </div>
      </div>
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: string;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div
      style={{
        textAlign: "center",
        padding: spacing[12],
        backgroundColor: colors.neutral[50],
        borderRadius: "12px",
        border: `1px dashed ${colors.neutral[300]}`,
      }}
    >
      <div style={{ fontSize: "3rem", marginBottom: spacing[4] }}>{icon}</div>
      <h3
        style={{
          margin: 0,
          fontSize: "1.25rem",
          fontWeight: 600,
          color: colors.neutral[900],
          marginBottom: spacing[2],
        }}
      >
        {title}
      </h3>
      <p
        style={{
          margin: 0,
          fontSize: "0.95rem",
          color: colors.neutral[500],
          marginBottom: spacing[4],
        }}
      >
        {description}
      </p>
      {action && <div>{action}</div>}
    </div>
  );
}

export function Stat({
  label,
  value,
  icon,
  color = colors.primary[500],
}: {
  label: string;
  value: string | number;
  icon?: string;
  color?: string;
}) {
  return (
    <div style={{ marginBottom: spacing[4] }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: spacing[2],
          marginBottom: spacing[1],
        }}
      >
        {icon && <span style={{ fontSize: "1.25rem" }}>{icon}</span>}
        <span style={{ fontSize: "0.875rem", color: colors.neutral[600] }}>
          {label}
        </span>
      </div>
      <div
        style={{
          fontSize: "2rem",
          fontWeight: 700,
          color: color,
        }}
      >
        {value}
      </div>
    </div>
  );
}
