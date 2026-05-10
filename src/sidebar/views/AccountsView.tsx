import { useEffect, useState } from "react";
import { ChevronLeft, Mail, Trash2, Loader2, AlertCircle } from "lucide-react";
import { ConnectedAccount } from "../../types";
import { accountsApi } from "../../services/api";
import { GoogleIcon, GoogleIconLarge, OutlookIcon } from "../../assets";
import { useAuth } from "../../hooks/useAuth";
import { planType } from "../../types";

interface Props {
  onBack: () => void;
  getAccessToken: () => string | null;
}

const T = {
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

const css = `
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

const PLAN_ACCOUNT_LIMITS: Record<planType, number> = {
  free: 1,
  pro: 1,
  growth: 10,
  founder: 5,
};

export default function AccountsView({ onBack, getAccessToken }: Props) {
  const [accounts, setAccounts] = useState<ConnectedAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState<"gmail" | "outlook" | null>(
    null,
  );
  const [error, setError] = useState("");
  const [removing, setRemoving] = useState<string | null>(null);
  const { auth } = useAuth();
  const planLimit = PLAN_ACCOUNT_LIMITS[auth.user?.plan ?? "free"];
  const canAddAccount = !loading && accounts.length < planLimit;

  async function load() {
    try {
      const token = getAccessToken();
      if (!token) throw new Error("Not authenticated");
      const data = await accountsApi.list(token);
      setAccounts(data as ConnectedAccount[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load accounts");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleConnect(provider: "gmail" | "outlook") {
    setConnecting(provider);
    setError("");
    try {
      const token = getAccessToken();
      if (!token) throw new Error("Not authenticated");

      const authUrl = await buildAuthUrl(provider, token);
      const redirectUrl = await launchWebAuthFlow(authUrl);
      const url = new URL(redirectUrl);
      const code = url.searchParams.get("code");
      if (!code) throw new Error("No auth code returned");

      const tokenData = await exchangeCode(provider, code, token);

      await accountsApi.saveToken(
        {
          provider,
          email: tokenData.email,
          accessToken: tokenData.access_token,
          refreshToken: tokenData.refresh_token,
          expiresAt: new Date(tokenData.expiry_date).toISOString(),
        },
        token,
      );

      await load();
    } catch (err) {
      const error = err as any;
      const message =
        error?.message ||
        error?.response?.data?.message ||
        `Failed to connect ${provider}`;
      setError(message);
      console.error("Connection error details:", err);
    } finally {
      setConnecting(null);
    }
  }

  async function disconnect(id: string) {
    setRemoving(id);
    try {
      const token = getAccessToken();
      if (!token) throw new Error("Not authenticated");
      await accountsApi.delete(id, token);
      setAccounts((prev) => prev.filter((a) => a._id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to disconnect");
    } finally {
      setRemoving(null);
    }
  }

  return (
    <div
      className="acc-root"
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        fontFamily: "'Sora', sans-serif",
        color: T.textPrimary,
        overflow: "hidden",
      }}
    >
      <style>{css}</style>

      {/* Header */}
      <div
        style={{
          padding: "20px 0 18px",
          borderBottom: `1px solid ${T.border}`,
          flexShrink: 0,
        }}
      >
        <button
          className="acc-back-btn"
          onClick={onBack}
          style={{
            background: "none",
            border: "none",
            color: T.textSecondary,
            display: "flex",
            alignItems: "center",
            gap: 5,
            cursor: "pointer",
            fontSize: 12,
            fontWeight: 500,
            fontFamily: "'Sora', sans-serif",
            padding: 0,
            marginBottom: 14,
            letterSpacing: "0.2px",
          }}
        >
          <span className="acc-back-icon">
            <ChevronLeft size={15} />
          </span>
          <span>Back</span>
        </button>

        <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
          <h3
            style={{
              fontSize: 20,
              fontWeight: 700,
              margin: 0,
              color: T.textPrimary,
              letterSpacing: "-0.6px",
              lineHeight: 1,
            }}
          >
            Accounts
          </h3>
          <span
            style={{ fontSize: 11, color: T.textSecondary, fontWeight: 500 }}
          >
            · Email providers
          </span>
        </div>
      </div>

      {/* Scrollable Content */}
      <div
        className="acc-scroll-container"
        style={{ flex: 1, padding: "22px 10px 22px 0", overflowY: "auto" }}
      >
        {error && (
          <div
            style={{
              background: "rgba(248,113,113,0.07)",
              border: `1px solid rgba(248,113,113,0.18)`,
              padding: "10px 14px",
              borderRadius: 10,
              color: T.danger,
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontSize: 12,
              fontWeight: 500,
              marginBottom: 20,
            }}
          >
            <AlertCircle
              size={14}
              strokeWidth={2.5}
              style={{ flexShrink: 0 }}
            />
            <span>{error}</span>
          </div>
        )}

        {!loading && (
          <>
            {canAddAccount ? (
              <>
                <label
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "1.2px",
                    color: "#475569",
                    display: "block",
                    marginBottom: 12,
                  }}
                >
                  Add Provider
                </label>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 10,
                  }}
                >
                  {/* Gmail */}
                  <button
                    className="acc-connect-btn"
                    onClick={() => handleConnect("gmail")}
                    disabled={connecting !== null}
                    style={{
                      background: T.surface,
                      border: `1px solid ${connecting === "gmail" ? "rgba(234,67,53,0.4)" : T.border}`,
                      borderRadius: 14,
                      padding: "16px 12px",
                      color: T.textPrimary,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 8,
                      cursor: "pointer",
                      fontFamily: "'Sora', sans-serif",
                    }}
                  >
                    {connecting === "gmail" ? (
                      <Loader2 size={18} className="spin" color={T.gmail} />
                    ) : (
                      <GoogleIcon />
                    )}
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>Gmail</div>
                      <div
                        style={{
                          fontSize: 10,
                          color: T.textMuted,
                          marginTop: 1,
                        }}
                      >
                        Google Workspace
                      </div>
                    </div>
                  </button>

                  {/* Outlook */}
                  <button
                    className="acc-connect-btn"
                    onClick={() => handleConnect("outlook")}
                    disabled={connecting !== null}
                    style={{
                      background: T.surface,
                      border: `1px solid ${connecting === "outlook" ? "rgba(0,120,212,0.4)" : T.border}`,
                      borderRadius: 14,
                      padding: "16px 12px",
                      color: T.textPrimary,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 8,
                      cursor: "pointer",
                      fontFamily: "'Sora', sans-serif",
                    }}
                  >
                    {connecting === "outlook" ? (
                      <Loader2 size={18} className="spin" color={T.outlook} />
                    ) : (
                      <OutlookIcon />
                    )}
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>
                        Outlook
                      </div>
                      <div
                        style={{
                          fontSize: 10,
                          color: T.textMuted,
                          marginTop: 1,
                        }}
                      >
                        Microsoft 365
                      </div>
                    </div>
                  </button>
                </div>
              </>
            ) : (
              <div
                style={{
                  background: "rgba(16,185,129,0.04)",
                  border: `1px solid rgba(16,185,129,0.12)`,
                  borderRadius: 12,
                  padding: "12px 16px",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <AlertCircle
                  size={14}
                  strokeWidth={2.5}
                  color="#10b981"
                  style={{ flexShrink: 0 }}
                />
                <div>
                  <p
                    style={{
                      margin: 0,
                      fontSize: 12,
                      fontWeight: 600,
                      color: "#10b981",
                    }}
                  >
                    Account limit reached
                  </p>
                  <p
                    style={{
                      margin: "2px 0 0",
                      fontSize: 11,
                      color: T.textMuted,
                    }}
                  >
                    Your{" "}
                    <span
                      style={{
                        color: T.textSecondary,
                        textTransform: "capitalize",
                      }}
                    >
                      {auth.user?.plan}
                    </span>{" "}
                    plan supports up to {planLimit} connected account
                    {planLimit === 1 ? "" : "s"}.
                  </p>
                </div>
              </div>
            )}

            <div className="acc-divider" />
          </>
        )}

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 16,
          }}
        >
          <label
            style={{
              fontSize: 10,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "1.2px",
              color: "#475569",
            }}
          >
            Connected Accounts
          </label>
          {!loading && accounts.length > 0 && (
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                padding: "2px 8px",
                borderRadius: 20,
                background: "rgba(16,185,129,0.1)",
                color: T.accent,
                border: "1px solid rgba(16,185,129,0.2)",
              }}
            >
              {accounts.length}
            </span>
          )}
        </div>

        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div className="acc-shimmer" />
            <div className="acc-shimmer" style={{ opacity: 0.5 }} />
          </div>
        ) : accounts.length === 0 ? (
          <div
            style={{
              padding: "40px 20px",
              textAlign: "center",
              border: `1px dashed ${T.border}`,
              borderRadius: 16,
            }}
          >
            <Mail
              size={24}
              color={T.textMuted}
              style={{ marginBottom: 12, opacity: 0.5 }}
            />
            <p
              style={{
                margin: 0,
                fontSize: 13,
                fontWeight: 600,
                color: T.textSecondary,
              }}
            >
              No accounts active
            </p>
            <p style={{ margin: "4px 0 0", fontSize: 11, color: T.textMuted }}>
              Connect a provider to start sending
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {accounts.map((a) => (
              <div
                key={a._id}
                className="acc-card"
                style={{
                  background: T.cardBg,
                  border: `1px solid ${T.border}`,
                  borderRadius: 16,
                  padding: "12px 16px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 12,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background:
                        a.provider === "gmail"
                          ? "rgba(234,67,53,0.08)"
                          : "rgba(0,120,212,0.08)",
                      border: `1px solid ${a.provider === "gmail" ? "rgba(234,67,53,0.1)" : "rgba(0,120,212,0.1)"}`,
                    }}
                  >
                    {a.provider === "gmail" ? (
                      <GoogleIconLarge />
                    ) : (
                      <OutlookIcon />
                    )}
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: T.textPrimary,
                        letterSpacing: "-0.2px",
                      }}
                    >
                      {a.email}
                    </div>
                    <div
                      className={`acc-provider-badge acc-badge-${a.provider}`}
                    >
                      {a.provider}
                    </div>
                  </div>
                </div>

                <button
                  className="acc-delete-btn"
                  onClick={() => disconnect(a._id)}
                  disabled={removing === a._id}
                  style={{
                    background: "none",
                    border: "none",
                    color: T.textMuted,
                    cursor: "pointer",
                    padding: "8px",
                  }}
                >
                  {removing === a._id ? (
                    <Loader2 size={16} className="spin" />
                  ) : (
                    <Trash2 size={16} strokeWidth={2} />
                  )}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── OAuth helpers (unchanged logic) ───────────────────────────────────────────

async function buildAuthUrl(
  provider: "gmail" | "outlook",
  accessToken: string,
): Promise<string> {
  const endpoint =
    provider === "gmail" ? "/accounts/google/url" : "/accounts/microsoft/url";
  const r = await chrome.runtime.sendMessage({
    type: "API_REQUEST",
    payload: { method: "GET", endpoint, accessToken },
  });
  if (!r?.payload?.ok)
    throw new Error(
      r?.payload?.data?.message || `Failed to get ${provider} auth URL`,
    );
  return r.payload.data.url;
}

async function launchWebAuthFlow(authUrl: string): Promise<string> {
  const r = await chrome.runtime.sendMessage({
    type: "IDENTITY_AUTH",
    payload: { authUrl },
  });
  if (!r?.ok) throw new Error(r?.error || "Auth flow failed");
  return r.redirectUrl;
}

async function exchangeCode(
  provider: "gmail" | "outlook",
  code: string,
  accessToken: string,
): Promise<{
  email: string;
  access_token: string;
  refresh_token: string;
  expiry_date: number;
}> {
  const endpoint =
    provider === "gmail"
      ? "/accounts/google/exchange"
      : "/accounts/microsoft/exchange";
  const r = await chrome.runtime.sendMessage({
    type: "API_REQUEST",
    payload: { method: "POST", endpoint, body: { code }, accessToken },
  });
  if (!r?.payload?.ok)
    throw new Error(
      r?.payload?.data?.message || `Failed to exchange ${provider} code`,
    );
  return r.payload.data;
}
