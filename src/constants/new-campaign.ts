export const T = {
  bg: "#090e1a",
  surface: "#0f1623",
  surfaceHover: "#151e2e",
  inputBg: "rgba(255,255,255,0.03)",
  inputBgFocus: "rgba(255,255,255,0.05)",
  border: "rgba(255,255,255,0.07)",
  borderFocus: "#10b981",
  accent: "#10b981",
  accentDim: "rgba(16,185,129,0.12)",
  accentGlow: "rgba(16,185,129,0.18)",
  textPrimary: "#f1f5f9",
  textSecondary: "#64748b",
  textMuted: "#334155",
  danger: "#f87171",
  dangerDim: "rgba(248,113,113,0.08)",
  warning: "#fbbf24",
  warningDim: "rgba(251,191,36,0.08)",
};

export const css = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700&display=swap');

  .nc-root * { box-sizing: border-box; }

  /* Custom Scrollbar Styling */
  .nc-scroll-container::-webkit-scrollbar {
    width: 6px;
  }
  .nc-scroll-container::-webkit-scrollbar-track {
    background: transparent;
  }
  .nc-scroll-container::-webkit-scrollbar-thumb {
    background: ${T.border};
    border-radius: 10px;
  }
  .nc-scroll-container::-webkit-scrollbar-thumb:hover {
    background: ${T.textMuted};
  }
  .nc-scroll-container {
    scrollbar-width: thin;
    scrollbar-color: ${T.border} transparent;
  }

  .nc-back-btn { transition: color 0.15s; }
  .nc-back-btn:hover { color: ${T.textPrimary} !important; }
  .nc-back-btn:hover .nc-back-icon { transform: translateX(-2px); }
  .nc-back-icon { transition: transform 0.18s ease; display: flex; }

  .nc-input {
    width: 100%;
    padding: 11px 14px;
    background: ${T.inputBg};
    border: 1px solid ${T.border};
    border-radius: 11px;
    font-family: 'Sora', sans-serif;
    font-size: 13px;
    color: ${T.textPrimary};
    outline: none;
    transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
    display: block;
  }
  .nc-input:focus {
    border-color: ${T.borderFocus};
    background: ${T.inputBgFocus};
    box-shadow: 0 0 0 3px ${T.accentGlow};
  }
  .nc-input::placeholder { color: ${T.textMuted}; }

  .nc-select-wrap { position: relative; }
  .nc-select {
    appearance: none;
    cursor: pointer;
    padding-right: 38px;
  }
  .nc-select-icon {
    position: absolute;
    right: 12px;
    top: 50%;
    transform: translateY(-50%);
    pointer-events: none;
    color: ${T.textSecondary};
  }

  .nc-textarea { resize: none; line-height: 1.65; }

  .nc-submit {
    transition: opacity 0.2s, transform 0.15s, box-shadow 0.2s;
  }
  .nc-submit:hover:not(:disabled) {
    opacity: 0.9;
    transform: translateY(-1px);
    box-shadow: 0 8px 24px rgba(16,185,129,0.3);
  }
  .nc-submit:active:not(:disabled) { transform: translateY(0); }
  .nc-submit:disabled { opacity: 0.45; cursor: not-allowed; }

  .spin { animation: nc-spin 0.8s linear infinite; }
  @keyframes nc-spin { to { transform: rotate(360deg); } }

  .nc-char-count {
    font-size: 10px;
    font-variant-numeric: tabular-nums;
    transition: color 0.2s;
  }

  .nc-tag {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: 10px;
    font-weight: 600;
    font-family: 'Sora', monospace;
    padding: 2px 7px;
    border-radius: 5px;
    background: ${T.accentDim};
    color: ${T.accent};
    border: 1px solid rgba(16,185,129,0.18);
    cursor: pointer;
    letter-spacing: 0.2px;
    transition: background 0.15s;
  }
  .nc-tag:hover { background: rgba(16,185,129,0.2); }
`;
