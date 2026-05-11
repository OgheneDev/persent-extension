import React from "react";

export const T = {
  bg: "#090e1a",
  surface: "#111827",
  cardBg: "rgba(255, 255, 255, 0.03)",
  border: "rgba(255, 255, 255, 0.08)",
  accent: "#10b981",
  accentDim: "rgba(16, 185, 129, 0.1)",
  textPrimary: "#ffffff",
  textSecondary: "#94a3b8",
  textMuted: "#4b5563",
  danger: "#f87171",
};

export const STATUS_MAP: Record<string, { color: string; bg: string }> = {
  draft: { color: "#94a3b8", bg: "rgba(148, 163, 184, 0.1)" },
  queued: { color: "#fbbf24", bg: "rgba(251, 191, 36, 0.1)" },
  sending: { color: "#38bdf8", bg: "rgba(56, 189, 248, 0.1)" },
  done: { color: "#10b981", bg: "rgba(16, 185, 129, 0.1)" },
  failed: { color: "#f87171", bg: "rgba(248, 113, 113, 0.1)" },
};

export const globalCss = `
    .campaign-card {
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .campaign-card:hover {
      background: rgba(255, 255, 255, 0.06) !important;
      border-color: ${T.accent}44 !important;
      transform: translateY(-1px);
    }
  `;

export const styles: Record<string, React.CSSProperties> = {
  container: { height: "100%", fontFamily: "'Sora', sans-serif" },
  topRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "24px 0",
    borderBottom: `1px solid ${T.border}`,
    marginBottom: 20,
  },
  heading: {
    margin: 0,
    fontSize: 18,
    fontWeight: 700,
    color: T.textPrimary,
    letterSpacing: "-0.5px",
  },
  newBtn: {
    background: T.accent,
    color: T.bg,
    border: "none",
    borderRadius: 10,
    padding: "8px 16px",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: 6,
    fontFamily: "'Sora', sans-serif",
  },
  list: { display: "flex", flexDirection: "column", gap: 12 },
  card: {
    background: T.cardBg,
    border: `1px solid ${T.border}`,
    borderRadius: 16,
    padding: "16px",
    cursor: "pointer",
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  cardTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
  },
  name: {
    fontWeight: 600,
    fontSize: 14,
    color: T.textPrimary,
    lineHeight: 1.4,
  },
  badge: {
    fontSize: 10,
    fontWeight: 700,
    textTransform: "uppercase" as const,
    padding: "4px 8px",
    borderRadius: 6,
    letterSpacing: "0.5px",
  },
  progressTrack: {
    width: "100%",
    height: 4,
    background: "rgba(255,255,255,0.05)",
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 2,
    transition: "width 0.5s ease-out",
  },
  cardBottom: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  metaItem: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    fontSize: 11,
    color: T.textSecondary,
    fontWeight: 500,
  },
  center: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "60px 0",
  },
  muted: { color: T.textSecondary, fontSize: 13 },
  emptyState: {
    padding: "40px 20px",
    textAlign: "center",
    border: `1px dashed ${T.border}`,
    borderRadius: 20,
    color: T.textSecondary,
    fontSize: 13,
  },
  inlineLink: {
    background: "none",
    border: "none",
    color: T.accent,
    fontWeight: 600,
    cursor: "pointer",
    marginTop: 8,
    fontFamily: "'Sora', sans-serif",
  },
  errorBox: {
    display: "flex",
    gap: 8,
    padding: 12,
    background: "rgba(248,113,113,0.1)",
    border: "1px solid rgba(248,113,113,0.2)",
    borderRadius: 12,
    color: T.danger,
    fontSize: 12,
    marginBottom: 16,
  },
  loadMoreBtn: {
    width: "100%",
    marginTop: 16,
    padding: "12px",
    background: "rgba(255,255,255,0.04)",
    border: `1px solid ${T.border}`,
    borderRadius: 12,
    color: T.textSecondary,
    fontSize: 13,
    fontWeight: 500,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    fontFamily: "'Sora', sans-serif",
  },
};
