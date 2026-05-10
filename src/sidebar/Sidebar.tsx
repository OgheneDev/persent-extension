import React, { useState } from "react";
import { LogOut, X, LayoutGrid, Users, Loader2 } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import AuthView from "./views/AuthView";
import CampaignListView from "./views/CampaignListView";
import CampaignDetailView from "./views/CampaignDetailView";
import NewCampaignView from "./views/NewCampaignView";
import AccountsView from "./views/AccountsView";

export type SidebarView =
  | { name: "campaigns" }
  | { name: "new-campaign" }
  | { name: "campaign-detail"; campaignId: string }
  | { name: "accounts" };

interface SidebarProps {
  onClose: () => void;
}

const T = {
  bg: "#090e1a",
  surface: "#111827",
  border: "rgba(255, 255, 255, 0.08)",
  accent: "#10b981",
  accentSoft: "rgba(16, 185, 129, 0.1)",
  textPrimary: "#ffffff",
  textSecondary: "#94a3b8",
  danger: "#f87171",
};

export default function Sidebar({ onClose }: SidebarProps) {
  const { auth, loading, login, register, logout, getAccessToken } = useAuth();
  const [view, setView] = useState<SidebarView>({ name: "campaigns" });

  if (loading) {
    return (
      <div style={styles.centered}>
        <Loader2 size={24} color={T.accent} className="spin" />
      </div>
    );
  }

  if (!auth.user) {
    return <AuthView onLogin={login} onRegister={register} />;
  }

  return (
    <div style={styles.root}>
      {/* ── Global Sora Font Injection ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700&display=swap');
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      {/* ── Header ── */}
      <header style={styles.header}>
        <div style={styles.logoGroup}>
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
          <span style={styles.title}>Persent</span>
        </div>
        <button style={styles.closeBtn} onClick={onClose}>
          <X size={18} />
        </button>
      </header>

      {/* ── Navigation Tabs ── */}
      <nav style={styles.nav}>
        <button
          style={{
            ...styles.navItem,
            ...(view.name === "campaigns" ||
            view.name === "new-campaign" ||
            view.name === "campaign-detail"
              ? styles.navActive
              : {}),
          }}
          onClick={() => setView({ name: "campaigns" })}
        >
          <LayoutGrid size={16} />
          <span>Campaigns</span>
        </button>
        <button
          style={{
            ...styles.navItem,
            ...(view.name === "accounts" ? styles.navActive : {}),
          }}
          onClick={() => setView({ name: "accounts" })}
        >
          <Users size={16} />
          <span>Accounts</span>
        </button>
      </nav>

      {/* ── Content Body ── */}
      <main style={styles.body}>
        {view.name === "campaigns" && (
          <CampaignListView
            onSelect={(id) =>
              setView({ name: "campaign-detail", campaignId: id })
            }
            onNew={() => setView({ name: "new-campaign" })}
            getAccessToken={getAccessToken}
          />
        )}
        {view.name === "accounts" && (
          <AccountsView
            onBack={() => setView({ name: "campaigns" })}
            getAccessToken={getAccessToken}
          />
        )}
        {view.name === "new-campaign" && (
          <NewCampaignView
            onBack={() => setView({ name: "campaigns" })}
            onCreated={(id) =>
              setView({ name: "campaign-detail", campaignId: id })
            }
            getAccessToken={getAccessToken}
          />
        )}
        {view.name === "campaign-detail" && (
          <CampaignDetailView
            campaignId={view.campaignId}
            onBack={() => setView({ name: "campaigns" })}
            getAccessToken={getAccessToken}
          />
        )}
      </main>

      {/* ── Footer / Profile ── */}
      <footer style={styles.footer}>
        <div style={styles.userInfo}>
          <div style={styles.avatar}>
            {auth.user?.name?.[0]?.toUpperCase() || "U"}
          </div>
          <div style={styles.userText}>
            <span style={styles.userName}>{auth.user?.name || "User"}</span>
            <span style={styles.userRole}>
              {auth.user?.plan || "Pro Account"}
            </span>
          </div>
        </div>
        <button style={styles.logoutBtn} onClick={logout}>
          <LogOut size={16} />
        </button>
      </footer>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  root: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
    backgroundColor: T.bg,
    color: T.textPrimary,
    fontFamily: "'Sora', sans-serif", // Applied globally to the container
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "24px",
    borderBottom: `1px solid ${T.border}`,
  },
  logoGroup: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  title: {
    fontWeight: 700,
    fontSize: "20px",
    color: T.textPrimary,
    letterSpacing: "-0.5px",
  },
  closeBtn: {
    background: "transparent",
    border: "none",
    color: T.textSecondary,
    cursor: "pointer",
    padding: "4px",
    display: "flex",
  },
  nav: {
    display: "flex",
    padding: "12px 24px",
    gap: "12px",
    borderBottom: `1px solid ${T.border}`,
  },
  navItem: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    padding: "10px",
    fontSize: "13px",
    fontWeight: 600, // Medium weight for buttons
    color: T.textSecondary,
    background: "transparent",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    transition: "all 0.2s ease",
    fontFamily: "'Sora', sans-serif",
  },
  navActive: {
    color: T.accent,
    background: T.accentSoft,
  },
  body: {
    flex: 1,
    overflowY: "auto",
    padding: "0 24px",
  },
  footer: {
    padding: "16px 24px",
    borderTop: `1px solid ${T.border}`,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    background: "rgba(0, 0, 0, 0.1)",
  },
  userInfo: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  userText: {
    display: "flex",
    flexDirection: "column",
  },
  avatar: {
    width: "32px",
    height: "32px",
    borderRadius: "8px",
    background: T.accent,
    color: T.bg,
    fontSize: "12px",
    fontWeight: 700,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  userName: {
    fontSize: "13px",
    fontWeight: 600,
    color: T.textPrimary,
  },
  userRole: {
    fontSize: "10px",
    fontWeight: 500,
    color: T.textSecondary,
    textTransform: "uppercase",
  },
  logoutBtn: {
    background: "transparent",
    border: `1px solid ${T.border}`,
    color: T.textSecondary,
    cursor: "pointer",
    padding: "6px",
    borderRadius: "8px",
    display: "flex",
  },
  centered: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
    backgroundColor: T.bg,
    fontFamily: "'Sora', sans-serif",
  },
};
