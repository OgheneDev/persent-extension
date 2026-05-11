export const T = {
  bg: "#090e1a",
  surface: "#111827",
  inputBg: "rgba(255, 255, 255, 0.03)",
  border: "rgba(255, 255, 255, 0.06)",
  accent: "#10b981",
  accentGlow: "rgba(16, 185, 129, 0.15)",
  textPrimary: "#ffffff",
  textSecondary: "#94a3b8",
  danger: "#f87171",
  dangerDim: "rgba(248,113,113,0.1)",
};

export const globalCss = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700&display=swap');
  
  .auth-root {
    font-family: 'Sora', sans-serif;
    height: 100vh;
    display: flex;
    flex-direction: column;
    background: ${T.bg};
    color: ${T.textPrimary};
  }
  
  .glass-input {
    width: 100%;
    padding: 12px 42px;
    background: ${T.inputBg};
    border: 1px solid ${T.border};
    border-radius: 14px;
    font-family: 'Sora', sans-serif;
    font-size: 14px;
    color: white;
    transition: all 0.3s ease;
  }

  .glass-input:focus {
    border-color: ${T.accent};
    background: rgba(255, 255, 255, 0.05);
    box-shadow: 0 0 20px ${T.accentGlow};
    outline: none;
  }

  .auth-btn {
    width: 100%;
    padding: 16px;
    border: none;
    background: ${T.accent};
    color: ${T.bg};
    font-family: 'Sora', sans-serif;
    font-weight: 600; /* Medium weight as requested */
    border-radius: 14px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    transition: all 0.2s ease;
  }

  .auth-btn:hover:not(:disabled) {
    transform: translateY(-1px);
    filter: brightness(1.1);
  }

  .spin { animation: spin 1s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }
`;
