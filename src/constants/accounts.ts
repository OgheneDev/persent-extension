export const T = {
  bg: "#090e1a",
  surface: "#0f1623",
  surfaceHover: "#151e2e",
  cardBg: "rgba(255,255,255,0.03)",
  border: "rgba(255,255,255,0.07)",
  borderHover: "rgba(255,255,255,0.14)",
  accent: "#10b981",
  textPrimary: "#f1f5f9",
  textSecondary: "#64748b",
  textMuted: "#334155",
  gmail: "#ea4335",
  outlook: "#0078d4",
  danger: "#f87171",
};

export const ACCOUNT_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700&display=swap');

  .acc-root * { box-sizing: border-box; }

  /* Custom Scrollbar */
  .acc-scroll-container::-webkit-scrollbar {
    width: 6px;
  }
  .acc-scroll-container::-webkit-scrollbar-track {
    background: transparent;
  }
  .acc-scroll-container::-webkit-scrollbar-thumb {
    background: ${T.border};
    border-radius: 10px;
  }
  .acc-scroll-container::-webkit-scrollbar-thumb:hover {
    background: ${T.textMuted};
  }

  .acc-back-btn:hover { color: ${T.textPrimary} !important; }
  .acc-back-btn:hover .acc-back-icon { transform: translateX(-2px); }
  .acc-back-icon { transition: transform 0.18s ease; display: flex; }

  .acc-connect-btn { transition: border-color 0.2s, background 0.2s, transform 0.15s, box-shadow 0.2s; }
  .acc-connect-btn:hover:not(:disabled) {
    background: ${T.surfaceHover} !important;
    border-color: rgba(255,255,255,0.18) !important;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
  }
  .acc-connect-btn:active:not(:disabled) { transform: translateY(0); }
  .acc-connect-btn:disabled { opacity: 0.5; cursor: not-allowed; }

  .acc-card {
    transition: border-color 0.2s, background 0.2s, transform 0.2s;
    animation: acc-slideIn 0.3s ease forwards;
  }
  .acc-card:hover { 
    border-color: rgba(255,255,255,0.12) !important;
    background: rgba(255,255,255,0.05) !important;
  }

  .acc-delete-btn { transition: color 0.2s, background 0.2s, transform 0.15s; border-radius: 8px; }
  .acc-delete-btn:hover { color: ${T.danger} !important; background: rgba(248,113,113,0.08) !important; transform: scale(1.08); }
  .acc-delete-btn:active { transform: scale(0.92); }

  .spin { animation: acc-spin 0.8s linear infinite; }
  @keyframes acc-spin { to { transform: rotate(360deg); } }

  @keyframes acc-slideIn {
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .acc-shimmer {
    background: linear-gradient(90deg, ${T.surface} 25%, ${T.surfaceHover} 50%, ${T.surface} 75%);
    background-size: 200% 100%;
    animation: acc-shimmer 1.4s infinite;
    border-radius: 14px;
    height: 64px;
  }
  @keyframes acc-shimmer { to { background-position: -200% 0; } }

  .acc-provider-badge {
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 0.8px;
    text-transform: uppercase;
    padding: 2px 7px;
    border-radius: 5px;
    margin-top: 4px;
    width: fit-content;
  }
  .acc-badge-gmail  { background: rgba(234,67,53,0.1);  color: #f87171; border: 1px solid rgba(234,67,53,0.1); }
  .acc-badge-outlook { background: rgba(0,120,212,0.1); color: #60a5fa; border: 1px solid rgba(0,120,212,0.1); }

  .acc-divider {
    height: 1px;
    background: linear-gradient(to right, transparent, ${T.border}, transparent);
    margin: 24px 0;
  }
`;
