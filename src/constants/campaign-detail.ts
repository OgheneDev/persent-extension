export const T = {
  bg: "#090e1a",
  surface: "#111827",
  cardBg: "rgba(255, 255, 255, 0.03)",
  border: "rgba(255, 255, 255, 0.08)",
  accent: "#10b981",
  accentGlow: "rgba(16, 185, 129, 0.15)",
  textPrimary: "#ffffff",
  textSecondary: "#94a3b8",
  textMuted: "#4b5563",
  danger: "#f87171",
  warning: "#fbbf24",
  warningBg: "rgba(251, 191, 36, 0.08)",
  warningBorder: "rgba(251, 191, 36, 0.2)",
  infoBg: "rgba(16, 185, 129, 0.06)",
  infoBorder: "rgba(16, 185, 129, 0.18)",
};

export const CAMPAIGN_STYLES = `
  .acc-scroll-container::-webkit-scrollbar { width: 6px; }
  .acc-scroll-container::-webkit-scrollbar-track { background: transparent; }
  .acc-scroll-container::-webkit-scrollbar-thumb {
    background: ${T.border};
    border-radius: 10px;
  }
  .acc-scroll-container::-webkit-scrollbar-thumb:hover { background: ${T.textMuted}; }

  .spin { animation: acc-spin 0.8s linear infinite; }
  @keyframes acc-spin { to { transform: rotate(360deg); } }

  .tab-btn { transition: all 0.2s ease; }
  .tab-btn:hover { background: rgba(16, 185, 129, 0.05) !important; }

  .action-btn { transition: transform 0.15s, opacity 0.2s; }
  .action-btn:hover:not(:disabled) { transform: translateY(-1px); opacity: 0.9; }
  .action-btn:active:not(:disabled) { transform: translateY(0); }

  @keyframes progress-shimmer {
    0%   { background-position: -200% center; }
    100% { background-position:  200% center; }
  }
  .progress-shimmer {
    background: linear-gradient(
      90deg,
      ${T.accent} 0%,
      rgba(16,185,129,0.6) 40%,
      ${T.accent} 60%,
      rgba(16,185,129,0.6) 100%
    );
    background-size: 200% auto;
    animation: progress-shimmer 2s linear infinite;
  }

  @keyframes pulse-dot {
    0%, 100% { opacity: 1; transform: scale(1); }
    50%       { opacity: 0.5; transform: scale(0.75); }
  }
  .pulse-dot { animation: pulse-dot 1.4s ease-in-out infinite; }
`;
