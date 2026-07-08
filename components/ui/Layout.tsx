"use client";

import Link from "next/link";
import { colors, spacing } from "@/lib/designSystem";

interface SidebarItem {
  href: string;
  label: string;
  icon: string;
  active?: boolean;
}

interface SidebarProps {
  items: SidebarItem[];
  userRole?: string;
}

export function Sidebar({ items, userRole = "Dashboard" }: SidebarProps) {
  return (
    <aside
      style={{
        width: "260px",
        height: "100vh",
        position: "fixed",
        left: 0,
        top: 0,
        backgroundColor: colors.neutral[900],
        borderRight: `1px solid ${colors.neutral[800]}`,
        display: "flex",
        flexDirection: "column",
        zIndex: 100,
      }}
    >
      {/* Logo/Brand */}
      <div
        style={{
          padding: spacing[6],
          borderBottom: `1px solid ${colors.neutral[800]}`,
        }}
      >
        <div
          style={{
            fontSize: "1.5rem",
            fontWeight: 700,
            color: colors.white,
            display: "flex",
            alignItems: "center",
            gap: spacing[2],
          }}
        >
          <span style={{ fontSize: "1.75rem" }}>🤖</span>
          <div>
            <div>JobSite</div>
            <div style={{ fontSize: "0.7rem", color: colors.neutral[400] }}>
              Assistant
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav
        style={{
          flex: 1,
          overflow: "auto",
          padding: spacing[4],
          display: "flex",
          flexDirection: "column",
          gap: spacing[2],
        }}
      >
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            style={{
              padding: `${spacing[3]} ${spacing[4]}`,
              borderRadius: "8px",
              textDecoration: "none",
              color: item.active ? colors.primary[400] : colors.neutral[300],
              backgroundColor: item.active ? colors.neutral[800] : "transparent",
              transition: "all 150ms ease",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: spacing[3],
              fontSize: "0.95rem",
              fontWeight: item.active ? 600 : 500,
              border: item.active
                ? `1px solid ${colors.primary[500]}`
                : "1px solid transparent",
            }}
            onMouseEnter={(e) => {
              if (!item.active) {
                e.currentTarget.style.backgroundColor = colors.neutral[800];
              }
            }}
            onMouseLeave={(e) => {
              if (!item.active) {
                e.currentTarget.style.backgroundColor = "transparent";
              }
            }}
          >
            <span style={{ fontSize: "1.25rem" }}>{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* User Info / Settings */}
      <div
        style={{
          padding: spacing[4],
          borderTop: `1px solid ${colors.neutral[800]}`,
          display: "flex",
          flexDirection: "column",
          gap: spacing[3],
        }}
      >
        <Link
          href="/settings"
          style={{
            padding: `${spacing[3]} ${spacing[4]}`,
            borderRadius: "8px",
            textDecoration: "none",
            color: colors.neutral[300],
            fontSize: "0.9rem",
            display: "flex",
            alignItems: "center",
            gap: spacing[2],
            transition: "all 150ms ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = colors.neutral[800];
            e.currentTarget.style.color = colors.primary[400];
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
            e.currentTarget.style.color = colors.neutral[300];
          }}
        >
          <span>⚙️</span>
          <span>Settings</span>
        </Link>
      </div>
    </aside>
  );
}

export function TopBar({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}) {
  const handleMinimize = () => {
    // Collapse sidebar or minimize view
    const sidebar = document.querySelector('aside[role="navigation"]') as HTMLElement;
    if (sidebar) {
      sidebar.style.display = sidebar.style.display === 'none' ? 'block' : 'none';
    }
  };

  const handleMaximize = () => {
    // Expand to fullscreen
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.log('Fullscreen request failed:', err);
      });
    } else {
      document.exitFullscreen();
    }
  };

  const handleExit = () => {
    // Navigate back home
    if (window.confirm("Exit dashboard? You'll be taken back to the home page.")) {
      window.location.href = '/';
    }
  };

  return (
    <header
      style={{
        marginLeft: "260px",
        backgroundColor: colors.white,
        borderBottom: `1px solid ${colors.neutral[200]}`,
        padding: `${spacing[4]} ${spacing[6]}`,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        position: "sticky",
        top: 0,
        zIndex: 50,
      }}
    >
      <div>
        <h1
          style={{
            margin: 0,
            fontSize: "1.75rem",
            fontWeight: 700,
            color: colors.neutral[900],
          }}
        >
          {title}
        </h1>
        {subtitle && (
          <p
            style={{
              margin: spacing[2] + " 0 0 0",
              fontSize: "0.9rem",
              color: colors.neutral[500],
            }}
          >
            {subtitle}
          </p>
        )}
      </div>
      <div style={{ display: "flex", gap: spacing[3], alignItems: "center" }}>
        {actions && <div style={{ display: "flex", gap: spacing[3] }}>{actions}</div>}
        
        {/* Window Control Buttons */}
        <div style={{ display: "flex", gap: spacing[2], marginLeft: spacing[4] }}>
          <button
            onClick={handleMinimize}
            title="Minimize"
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "4px",
              border: `1px solid ${colors.neutral[300]}`,
              backgroundColor: colors.neutral[50],
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "16px",
              transition: "all 150ms ease",
              color: colors.neutral[700],
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = colors.neutral[200];
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = colors.neutral[50];
            }}
          >
            −
          </button>
          <button
            onClick={handleMaximize}
            title="Maximize/Fullscreen"
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "4px",
              border: `1px solid ${colors.neutral[300]}`,
              backgroundColor: colors.neutral[50],
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "16px",
              transition: "all 150ms ease",
              color: colors.neutral[700],
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = colors.neutral[200];
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = colors.neutral[50];
            }}
          >
            □
          </button>
          <button
            onClick={handleExit}
            title="Exit Dashboard"
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "4px",
              border: `1px solid ${colors.error || '#ef4444'}`,
              backgroundColor: "#fef2f2",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "16px",
              transition: "all 150ms ease",
              color: colors.error || '#ef4444',
              fontWeight: "bold",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#fee2e2";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#fef2f2";
            }}
          >
            ✕
          </button>
        </div>
      </div>
    </header>
  );
}

export function MainLayout({
  children,
  sidebar,
  header,
}: {
  children: React.ReactNode;
  sidebar: React.ReactNode;
  header: React.ReactNode;
}) {
  return (
    <div style={{ display: "flex" }}>
      {sidebar}
      <div style={{ flex: 1, width: "100%" }}>
        {header}
        <main
          style={{
            marginLeft: "260px",
            padding: spacing[6],
            backgroundColor: colors.neutral[50],
            minHeight: "calc(100vh - 80px)",
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
