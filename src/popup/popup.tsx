import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  LogOut,
  User,
  Inbox,
  Loader2,
  AlertCircle,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { accountsApi } from "../services/api";
import { ConnectedAccount } from "../types";

/* ─── Midnight Stealth Tokens (Popup Edition) ──────────────────────── */
const T = {
  bg: "#090e1a", // Match Sidebar
  surface: "#111827", // Match Sidebar Cards
  border: "rgba(255, 255, 255, 0.08)",
  accent: "#10b981",
  accentSoft: "rgba(16, 185, 129, 0.1)",
  textPrimary: "#ffffff",
  textSecondary: "#94a3b8",
  textMuted: "#4b5563",
  danger: "#f87171",
};

const globalCss = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    background: ${T.bg};
    font-family: 'Sora', sans-serif;
    color: ${T.textPrimary};
    min-width: 320px;
    max-width: 350px;
    -webkit-font-smoothing: antialiased;
    overflow-x: hidden;
  }

  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes slideIn {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .spin { animation: spin 0.8s linear infinite; }
  .slide-in { animation: slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) both; }

  button {
    font-family: 'Sora', sans-serif;
    cursor: pointer;
    border: none;
    outline: none;
    transition: all 0.2s ease;
  }
  button:active { transform: scale(0.96); }

  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: ${T.border}; border-radius: 10px; }
`;

function Logo() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 2L4.5 20.29C4.21 21 4.7 21.75 5.45 21.75H12V2Z"
        fill={T.accent}
      />
      <path
        d="M12 2L19.5 20.29C19.79 21 19.3 21.75 18.55 21.75H12V2Z"
        fill={T.accent}
        fillOpacity="0.4"
      />
    </svg>
  );
}

function AccountRow({ account }: { account: ConnectedAccount }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "12px",
        borderRadius: 14,
        background: "rgba(255,255,255,0.03)",
        border: `1px solid ${T.border}`,
      }}
    >
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 8,
          background: T.bg,
          border: `1px solid ${T.border}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <User size={14} color={T.textSecondary} />
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: T.textPrimary,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {account.email}
        </p>
        <p
          style={{
            fontSize: 9,
            color: T.textSecondary,
            textTransform: "uppercase",
            fontWeight: 700,
            letterSpacing: "0.5px",
          }}
        >
          {account.provider}
        </p>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 4,
          background: "rgba(16, 185, 129, 0.15)",
          borderRadius: 6,
          padding: "2px 8px",
        }}
      >
        <div
          style={{
            width: 5,
            height: 5,
            borderRadius: "50%",
            background: T.accent,
          }}
        />
        <span
          style={{
            fontSize: 9,
            color: T.accent,
            fontWeight: 800,
            textTransform: "uppercase",
          }}
        >
          Live
        </span>
      </div>
    </div>
  );
}

function Popup() {
  const { auth, loading, logout } = useAuth();
  const [accounts, setAccounts] = useState<ConnectedAccount[]>([]);

  useEffect(() => {
    if (auth.token) {
      accountsApi
        .list()
        .then((data) => setAccounts(data as ConnectedAccount[]));
    }
  }, [auth.token]);

  async function openSidebar() {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    if (tab.id) {
      chrome.tabs.sendMessage(tab.id, { type: "TOGGLE_SIDEBAR" });
      window.close();
    }
  }

  return (
    <>
      <style>{globalCss}</style>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          minHeight: 200,
          backgroundColor: T.bg,
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "20px",
            borderBottom: `1px solid ${T.border}`,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Logo />
            <div>
              <p
                style={{
                  fontSize: 16,
                  fontWeight: 800,
                  color: T.textPrimary,
                  letterSpacing: "-0.5px",
                }}
              >
                Persent
              </p>
              <p
                style={{
                  fontSize: 10,
                  color: T.textSecondary,
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.8px",
                }}
              >
                Outreach
              </p>
            </div>
          </div>
          {auth.token && (
            <button
              onClick={logout}
              style={{
                padding: "8px",
                borderRadius: 10,
                color: T.textSecondary,
                background: "rgba(255,255,255,0.05)",
              }}
            >
              <LogOut size={16} />
            </button>
          )}
        </div>

        {/* Body */}
        <div style={{ padding: "20px" }}>
          {loading ? (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                padding: "20px",
              }}
            >
              <Loader2 size={24} color={T.accent} className="spin" />
            </div>
          ) : !auth.token ? (
            <div
              className="slide-in"
              style={{ display: "flex", flexDirection: "column", gap: 16 }}
            >
              <div
                style={{
                  padding: "20px",
                  borderRadius: 16,
                  background: T.surface,
                  border: `1px solid ${T.border}`,
                  textAlign: "center",
                }}
              >
                <AlertCircle
                  size={24}
                  color={T.textSecondary}
                  style={{ marginBottom: 12 }}
                />
                <p
                  style={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: T.textPrimary,
                  }}
                >
                  Sign in Required
                </p>
                <p
                  style={{
                    fontSize: 12,
                    color: T.textSecondary,
                    marginTop: 6,
                    lineHeight: 1.5,
                  }}
                >
                  Launch Gmail to access your Persent dashboard.
                </p>
              </div>
              <button
                onClick={openSidebar}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  padding: "14px",
                  background: T.textPrimary,
                  color: T.bg,
                  borderRadius: 12,
                  fontSize: 14,
                  fontWeight: 700,
                }}
              >
                <Inbox size={18} /> Open Gmail
              </button>
            </div>
          ) : (
            <div
              className="slide-in"
              style={{ display: "flex", flexDirection: "column", gap: 20 }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    background: "linear-gradient(135deg, #10b981, #059669)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: `0 4px 12px rgba(16, 185, 129, 0.2)`,
                  }}
                >
                  <span style={{ color: T.bg, fontWeight: 800, fontSize: 16 }}>
                    {auth.user?.name?.[0] || "U"}
                  </span>
                </div>
                <div style={{ flex: 1 }}>
                  <p
                    style={{
                      fontSize: 15,
                      fontWeight: 700,
                      color: T.textPrimary,
                    }}
                  >
                    {auth.user?.name ?? "User"}
                  </p>
                  <p
                    style={{
                      fontSize: 11,
                      color: T.textSecondary,
                      fontWeight: 500,
                    }}
                  >
                    Pro Member
                  </p>
                </div>
              </div>

              <div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 10,
                    padding: "0 4px",
                  }}
                >
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 800,
                      color: T.textSecondary,
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                    }}
                  >
                    Accounts
                  </span>
                  <span
                    style={{ fontSize: 10, color: T.accent, fontWeight: 800 }}
                  >
                    {accounts.length} ONLINE
                  </span>
                </div>
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 8 }}
                >
                  {accounts.length === 0 ? (
                    <div
                      style={{
                        padding: "20px",
                        borderRadius: 14,
                        background: "rgba(255,255,255,0.02)",
                        border: `1px dashed ${T.border}`,
                        textAlign: "center",
                      }}
                    >
                      <span style={{ fontSize: 12, color: T.textSecondary }}>
                        No accounts active
                      </span>
                    </div>
                  ) : (
                    accounts.map((a) => <AccountRow key={a._id} account={a} />)
                  )}
                </div>
              </div>

              <button
                onClick={openSidebar}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  padding: "14px",
                  background: T.accent,
                  color: T.bg,
                  borderRadius: 14,
                  fontSize: 14,
                  fontWeight: 700,
                  boxShadow: `0 8px 20px rgba(16, 185, 129, 0.15)`,
                }}
              >
                Go to Dashboard <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

const root = createRoot(document.getElementById("popup-root")!);
root.render(
  <React.StrictMode>
    <Popup />
  </React.StrictMode>,
);
