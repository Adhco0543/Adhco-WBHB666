"use client";

import { colors, spacing, shadows, borderRadius } from "@/lib/designSystem";

export function Card({
  children,
  variant = "default",
  hover = true,
}: {
  children: React.ReactNode;
  variant?: "default" | "elevated" | "outlined";
  hover?: boolean;
}) {
  const variants = {
    default: {
      backgroundColor: colors.white,
      border: `1px solid ${colors.neutral[200]}`,
      boxShadow: shadows.sm,
    },
    elevated: {
      backgroundColor: colors.white,
      border: "none",
      boxShadow: shadows.lg,
    },
    outlined: {
      backgroundColor: colors.neutral[50],
      border: `2px solid ${colors.neutral[200]}`,
      boxShadow: "none",
    },
  };

  return (
    <div
      style={{
        ...variants[variant],
        borderRadius: borderRadius.lg,
        padding: spacing[6],
        transition: "all 250ms ease",
        cursor: hover ? "pointer" : "default",
        ...(hover && {
          "&:hover": {
            boxShadow: shadows.lg,
            transform: "translateY(-2px)",
          },
        }),
      }}
      onMouseEnter={(e) => {
        if (hover) {
          e.currentTarget.style.boxShadow = shadows.lg;
          e.currentTarget.style.transform = "translateY(-2px)";
        }
      }}
      onMouseLeave={(e) => {
        if (hover) {
          e.currentTarget.style.boxShadow = variants[variant].boxShadow;
          e.currentTarget.style.transform = "translateY(0)";
        }
      }}
    >
      {children}
    </div>
  );
}

export function Widget({
  icon,
  title,
  value,
  subtitle,
  trend,
  onClick,
}: {
  icon: string;
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: { value: number; direction: "up" | "down" };
  onClick?: () => void;
}) {
  return (
    <Card hover={!!onClick} variant="default">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: spacing[4],
        }}
      >
        <div style={{ fontSize: "2rem" }}>{icon}</div>
        {trend && (
          <div
            style={{
              padding: `${spacing[1]} ${spacing[2]}`,
              backgroundColor:
                trend.direction === "up"
                  ? colors.accent.emerald + "20"
                  : colors.accent.rose + "20",
              color:
                trend.direction === "up"
                  ? colors.accent.emerald
                  : colors.accent.rose,
              borderRadius: borderRadius.md,
              fontSize: "0.75rem",
              fontWeight: 600,
            }}
          >
            {trend.direction === "up" ? "↑" : "↓"} {Math.abs(trend.value)}%
          </div>
        )}
      </div>
      <h3 style={{ margin: 0, color: colors.neutral[500], fontSize: "0.9rem" }}>
        {title}
      </h3>
      <p
        style={{
          margin: `${spacing[2]} 0 0 0`,
          fontSize: "1.75rem",
          fontWeight: 700,
          color: colors.neutral[900],
        }}
      >
        {value}
      </p>
      {subtitle && (
        <p style={{ margin: `${spacing[1]} 0 0 0`, fontSize: "0.85rem", color: colors.neutral[400] }}>
          {subtitle}
        </p>
      )}
    </Card>
  );
}

export function Button({
  children,
  variant = "primary",
  size = "md",
  onClick,
  href,
}: {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  onClick?: () => void;
  href?: string;
}) {
  const variants = {
    primary: {
      backgroundColor: colors.primary[500],
      color: colors.white,
      border: "none",
    },
    secondary: {
      backgroundColor: colors.neutral[100],
      color: colors.neutral[900],
      border: `1px solid ${colors.neutral[300]}`,
    },
    ghost: {
      backgroundColor: "transparent",
      color: colors.primary[600],
      border: `1px solid ${colors.primary[600]}`,
    },
    danger: {
      backgroundColor: colors.error,
      color: colors.white,
      border: "none",
    },
  };

  const sizes = {
    sm: { padding: `${spacing[2]} ${spacing[3]}`, fontSize: "0.875rem" },
    md: { padding: `${spacing[3]} ${spacing[4]}`, fontSize: "1rem" },
    lg: { padding: `${spacing[4]} ${spacing[6]}`, fontSize: "1.125rem" },
  };

  const baseStyles = {
    ...variants[variant],
    ...sizes[size],
    borderRadius: borderRadius.md,
    cursor: "pointer",
    transition: "all 150ms ease",
    fontWeight: 600,
  };

  if (href) {
    return (
      <a href={href} style={baseStyles as any}>
        {children}
      </a>
    );
  }

  return (
    <button
      onClick={onClick}
      style={baseStyles as any}
      onMouseEnter={(e) => {
        if (variant === "primary") {
          e.currentTarget.style.backgroundColor = colors.primary[600];
        }
      }}
      onMouseLeave={(e) => {
        if (variant === "primary") {
          e.currentTarget.style.backgroundColor = colors.primary[500];
        }
      }}
    >
      {children}
    </button>
  );
}

export function ActivityItem({
  timestamp,
  title,
  description,
  icon,
  status,
}: {
  timestamp: string;
  title: string;
  description: string;
  icon: string;
  status?: "success" | "pending" | "error";
}) {
  const statusColors = {
    success: colors.accent.emerald,
    pending: colors.primary[500],
    error: colors.error,
  };

  return (
    <div
      style={{
        display: "flex",
        gap: spacing[4],
        padding: spacing[4],
        borderBottom: `1px solid ${colors.neutral[200]}`,
        transition: "all 150ms ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = colors.neutral[50];
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = "transparent";
      }}
    >
      <div
        style={{
          fontSize: "1.5rem",
          minWidth: "40px",
          display: "flex",
          alignItems: "center",
        }}
      >
        {icon}
      </div>
      <div style={{ flex: 1 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <h4
            style={{
              margin: 0,
              fontSize: "0.95rem",
              fontWeight: 600,
              color: colors.neutral[900],
            }}
          >
            {title}
          </h4>
          {status && (
            <div
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                backgroundColor: statusColors[status],
              }}
            />
          )}
        </div>
        <p
          style={{
            margin: `${spacing[1]} 0 ${spacing[2]} 0`,
            fontSize: "0.875rem",
            color: colors.neutral[600],
          }}
        >
          {description}
        </p>
        <p
          style={{
            margin: 0,
            fontSize: "0.75rem",
            color: colors.neutral[400],
          }}
        >
          {timestamp}
        </p>
      </div>
    </div>
  );
}

export function Badge({
  children,
  variant = "default",
}: {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "error";
}) {
  const variants = {
    default: {
      backgroundColor: colors.primary[100],
      color: colors.primary[700],
    },
    success: {
      backgroundColor: colors.accent.emerald + "20",
      color: colors.accent.emerald,
    },
    warning: {
      backgroundColor: colors.warning + "20",
      color: colors.warning,
    },
    error: {
      backgroundColor: colors.error + "20",
      color: colors.error,
    },
  };

  return (
    <span
      style={{
        ...variants[variant],
        padding: `${spacing[1]} ${spacing[2]}`,
        borderRadius: borderRadius.full,
        fontSize: "0.75rem",
        fontWeight: 600,
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </span>
  );
}
