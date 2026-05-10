import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  ChevronLeft,
  FileUp,
  Send,
  Eye,
  Users,
  BarChart3,
  Loader2,
  AlertCircle,
  Clock,
  ShieldCheck,
  Copy,
} from "lucide-react";
import { Campaign, CampaignPreview, RecipientStats } from "../../types";
import { campaignsApi, recipientsApi } from "../../services/api";
import { useAuth } from "../../hooks/useAuth";

interface Props {
  campaignId: string;
  onBack: () => void;
  getAccessToken: () => string | null;
}

type Tab = "overview" | "preview" | "recipients";

const T = {
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

/** Status values that mean the campaign is actively processing */
const ACTIVE_STATUSES = new Set(["queued", "sending"]);

/** Polling interval while a campaign is active */
const POLL_INTERVAL_MS = 5_000;

/**
 * Estimate total spread time in minutes given a recipient count.
 *
 * Mirrors the queue service logic:
 *  - < 10 recipients  → flat 30 s gap between sends
 *  - ≥ 10 recipients  → randomised delay; we use the midpoint of the
 *    Pro plan range (45–90 s) as a reasonable approximation.
 *    Adjust MIN/MAX here if the plan limits in config/plans change.
 */
const THROTTLE_DELAY_MIN_MS = 45_000;
const THROTTLE_DELAY_MAX_MS = 90_000;
const FLAT_DELAY_MS = 30_000;

function estimateSpreadMinutes(totalRecipients: number): number {
  if (totalRecipients <= 1) return 0;
  const gaps = totalRecipients - 1;
  const delayMs =
    totalRecipients < 10
      ? FLAT_DELAY_MS
      : (THROTTLE_DELAY_MIN_MS + THROTTLE_DELAY_MAX_MS) / 2;
  return Math.round((gaps * delayMs) / 60_000);
}

function formatSpread(minutes: number): string {
  if (minutes < 1) return "under a minute";
  if (minutes < 60) return `~${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `~${h}h` : `~${h}h ${m}m`;
}

const css = `
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

export default function CampaignDetailView({
  campaignId,
  onBack,
  getAccessToken,
}: Props) {
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [stats, setStats] = useState<RecipientStats | null>(null);
  const [previews, setPreviews] = useState<CampaignPreview[]>([]);
  const [tab, setTab] = useState<Tab>("overview");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const { auth } = useAuth();
  const [cloning, setCloning] = useState(false);
  const [cloneSuccess, setCloneSuccess] = useState("");

  // ── Data fetching ──────────────────────────────────────────────────────────

  const load = useCallback(
    async (silent = false) => {
      try {
        const token = getAccessToken();
        if (!token) throw new Error("Not authenticated");
        const [c, s] = await Promise.all([
          campaignsApi.get(campaignId, token),
          recipientsApi.stats(campaignId, token),
        ]);
        setCampaign(c as Campaign);
        setStats(s as RecipientStats);
      } catch (err) {
        if (!silent)
          setError(err instanceof Error ? err.message : "Failed to load");
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [campaignId, getAccessToken],
  );

  // Initial load
  useEffect(() => {
    load();
  }, [load]);

  // ── Live polling while campaign is active ──────────────────────────────────

  useEffect(() => {
    if (!campaign) return;

    if (ACTIVE_STATUSES.has(campaign.status)) {
      // Start polling
      if (!pollRef.current) {
        pollRef.current = setInterval(() => load(true), POLL_INTERVAL_MS);
      }
    } else {
      // Campaign finished — stop polling
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    }

    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };
  }, [campaign?.status, load]);

  // ── Handlers ───────────────────────────────────────────────────────────────

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const token = getAccessToken();
      if (!token) throw new Error("Not authenticated");
      await campaignsApi.uploadRecipients(campaignId, file, token);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function handlePreview() {
    setTab("preview");
    if (previews.length > 0) return;
    try {
      const token = getAccessToken();
      if (!token) throw new Error("Not authenticated");
      const data = (await campaignsApi.preview(campaignId, token)) as {
        previews: CampaignPreview[];
      };
      setPreviews(data.previews);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Preview failed");
    }
  }

  async function handleSend() {
    if (!confirm("Confirm: Launch this campaign?")) return;
    setSending(true);
    setError("");
    try {
      const token = getAccessToken();
      if (!token) throw new Error("Not authenticated");
      await campaignsApi.send(campaignId, token);
      // Reload immediately so polling kicks in as soon as status flips
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Send failed");
    } finally {
      setSending(false);
    }
  }

  async function handleClone() {
    if (!confirm("Clone this campaign to all your connected accounts?")) return;
    setCloning(true);
    setCloneSuccess("");
    setError("");
    try {
      const token = getAccessToken();
      if (!token) throw new Error("Not authenticated");
      const result = (await campaignsApi.clone(campaignId, token)) as {
        cloned: number;
      };
      setCloneSuccess(
        `Cloned to ${result.cloned} account${result.cloned !== 1 ? "s" : ""} — check your campaigns list.`,
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Clone failed");
    } finally {
      setCloning(false);
    }
  }

  // ── Derived values ─────────────────────────────────────────────────────────

  const isActive = campaign ? ACTIVE_STATUSES.has(campaign.status) : false;
  const total = stats?.total ?? 0;
  const sent = stats?.sent ?? 0;
  const progress = total > 0 ? (sent / total) * 100 : 0;
  const spreadMinutes = estimateSpreadMinutes(total);
  const canSend =
    campaign && ["draft", "failed"].includes(campaign.status) && total > 0;
  const canClone =
    auth.user?.plan === "growth" || auth.user?.plan === "founder";

  // ── Render ─────────────────────────────────────────────────────────────────

  if (loading)
    return (
      <div style={styles.center}>
        <Loader2 className="spin" color={T.accent} />
      </div>
    );

  if (!campaign)
    return (
      <div style={styles.errorBox}>
        <AlertCircle /> Campaign not found
      </div>
    );

  return (
    <div style={styles.container}>
      <style>{css}</style>

      {/* Header */}
      <div style={styles.header}>
        <button style={styles.backBtn} onClick={onBack}>
          <ChevronLeft size={18} />
          <span>Back</span>
        </button>
        <h3 style={styles.title}>{campaign.name}</h3>
      </div>

      {/* Tabs */}
      <div style={styles.tabTrack}>
        <TabBtn
          active={tab === "overview"}
          label="Overview"
          icon={<BarChart3 size={14} />}
          onClick={() => setTab("overview")}
        />
        <TabBtn
          active={tab === "preview"}
          label="Preview"
          icon={<Eye size={14} />}
          onClick={handlePreview}
        />
        <TabBtn
          active={tab === "recipients"}
          label="Leads"
          icon={<Users size={14} />}
          onClick={() => setTab("recipients")}
        />
      </div>

      <div className="acc-scroll-container" style={styles.scrollArea}>
        {error && (
          <div style={styles.errorBox}>
            <AlertCircle size={14} />
            {error}
          </div>
        )}

        {tab === "overview" && (
          <div style={styles.section}>
            <div style={styles.statsGrid}>
              <StatCard label="Leads" value={total} color={T.textPrimary} />
              <StatCard label="Sent" value={sent} color={T.accent} />
              <StatCard
                label="Failed"
                value={stats?.failed ?? 0}
                color={T.danger}
              />
            </div>

            {/* ── Live sending banner ───────────────────────────────────── */}
            {isActive && (
              <SendingBanner
                sent={sent}
                total={total}
                progress={progress}
                spreadMinutes={spreadMinutes}
                status={campaign.status}
              />
            )}

            {/* ── Pre-send info banner (shown before sending) ───────────── */}
            {canSend && total > 0 && (
              <SpreadInfoBanner total={total} spreadMinutes={spreadMinutes} />
            )}

            <div style={styles.glassCard}>
              <div style={styles.field}>
                <span style={styles.fieldLabel}>Subject Line</span>
                <span style={styles.fieldValue}>
                  {campaign.subjectTemplate}
                </span>
              </div>
              <div style={styles.field}>
                <span style={styles.fieldLabel}>Outgoing Account</span>
                <span style={styles.fieldValue}>
                  {(campaign.connectedAccountId as any)?.email ?? "—"}
                </span>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <input
                ref={fileRef}
                type="file"
                accept=".csv"
                style={{ display: "none" }}
                onChange={handleUpload}
              />
              {!isActive && (
                <button
                  className="action-btn"
                  style={styles.secondaryBtn}
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                >
                  {uploading ? (
                    <Loader2 size={16} className="spin" />
                  ) : (
                    <FileUp size={16} />
                  )}
                  <span>
                    {total
                      ? "Update Lead List (.csv)"
                      : "Upload Lead List (.csv)"}
                  </span>
                </button>
              )}

              {canSend && (
                <button
                  className="action-btn"
                  style={styles.sendBtn}
                  onClick={handleSend}
                  disabled={sending}
                >
                  {sending ? (
                    <>
                      <Loader2 size={18} className="spin" />
                      <span>Launching...</span>
                    </>
                  ) : (
                    <>
                      <Send size={18} />
                      <span>Send to {total} Recipients</span>
                    </>
                  )}
                </button>
              )}

              {canClone && campaign.status === "done" && (
                <button
                  className="action-btn"
                  style={styles.cloneBtn}
                  onClick={handleClone}
                  disabled={cloning}
                >
                  {cloning ? (
                    <>
                      <Loader2 size={16} className="spin" />
                      <span>Cloning...</span>
                    </>
                  ) : (
                    <>
                      <Copy size={16} />
                      <span>Clone to All Accounts</span>
                    </>
                  )}
                </button>
              )}

              {cloneSuccess && (
                <div style={styles.successBox}>{cloneSuccess}</div>
              )}
            </div>
          </div>
        )}

        {tab === "preview" && (
          <div style={styles.section}>
            {previews.length === 0 ? (
              <div style={styles.center}>
                <Loader2 size={24} className="spin" color={T.accent} />
              </div>
            ) : (
              previews.map((p, i) => (
                <div key={i} style={styles.previewCard}>
                  <div style={styles.previewHeader}>
                    <div style={styles.previewMeta}>
                      <span>To:</span> {p.to}
                    </div>
                    <div style={styles.previewMeta}>
                      <span>Subject:</span> {p.subject}
                    </div>
                  </div>
                  <div
                    style={styles.previewBody}
                    dangerouslySetInnerHTML={{ __html: p.html }}
                  />
                </div>
              ))
            )}
          </div>
        )}

        {tab === "recipients" && (
          <div style={styles.section}>
            <div style={styles.glassCard}>
              <div style={styles.field}>
                <span style={styles.fieldLabel}>Pending</span>
                <span style={styles.fieldValue}>{stats?.pending}</span>
              </div>
              <div style={styles.field}>
                <span style={styles.fieldLabel}>Sent successfully</span>
                <span style={styles.fieldValue}>{stats?.sent}</span>
              </div>
              <div style={styles.field}>
                <span style={styles.fieldLabel}>Failed attempts</span>
                <span style={styles.fieldValue}>{stats?.failed}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────

/**
 * Shown while the campaign is queued or sending.
 * Updates automatically as the parent polls.
 */
function SendingBanner({
  sent,
  total,
  progress,
  spreadMinutes,
  status,
}: {
  sent: number;
  total: number;
  progress: number;
  spreadMinutes: number;
  status: string;
}) {
  return (
    <div style={bannerStyles.wrapper}>
      {/* Status row */}
      <div style={bannerStyles.row}>
        <div style={bannerStyles.dotRow}>
          <span className="pulse-dot" style={bannerStyles.dot} />
          <span style={bannerStyles.statusLabel}>
            {status === "queued" ? "Queued" : "Sending"}
          </span>
        </div>
        <span style={bannerStyles.fraction}>
          {sent} / {total}
        </span>
      </div>

      {/* Progress bar */}
      <div style={bannerStyles.track}>
        <div
          className={progress < 100 ? "progress-shimmer" : ""}
          style={{
            ...bannerStyles.fill,
            width: `${Math.max(progress, 2)}%`,
            background: progress >= 100 ? T.accent : undefined,
          }}
        />
      </div>

      {/* Estimated time remaining */}
      {spreadMinutes > 0 && progress < 100 && (
        <div style={bannerStyles.eta}>
          <Clock size={12} />
          <span>
            Estimated spread:{" "}
            <strong style={{ color: T.textPrimary }}>
              {formatSpread(spreadMinutes)}
            </strong>{" "}
            total
          </span>
        </div>
      )}

      {/* Protection note */}
      <div style={bannerStyles.protectionNote}>
        <ShieldCheck size={13} style={{ flexShrink: 0 }} />
        <span>
          Emails are staggered over time to protect your sender reputation and
          keep you out of spam folders.
        </span>
      </div>
    </div>
  );
}

/**
 * Informational banner shown before the user hits Send,
 * so they know upfront how long the spread will take.
 */
function SpreadInfoBanner({
  total,
  spreadMinutes,
}: {
  total: number;
  spreadMinutes: number;
}) {
  if (spreadMinutes < 1) return null;
  return (
    <div style={infoStyles.wrapper}>
      <div style={infoStyles.row}>
        <ShieldCheck size={14} style={{ color: T.accent, flexShrink: 0 }} />
        <span style={infoStyles.text}>
          Sending to <strong style={{ color: T.textPrimary }}>{total}</strong>{" "}
          recipients will be spread over{" "}
          <strong style={{ color: T.textPrimary }}>
            {formatSpread(spreadMinutes)}
          </strong>
          . Emails are staggered — not blasted at once — to protect your sender
          reputation and land in inboxes, not spam.
        </span>
      </div>
    </div>
  );
}

function TabBtn({ active, label, icon, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className="tab-btn"
      style={{
        ...styles.tab,
        color: active ? T.accent : T.textSecondary,
        background: active ? "rgba(16, 185, 129, 0.08)" : "transparent",
        borderBottom: `2px solid ${active ? T.accent : "transparent"}`,
      }}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

function StatCard({ label, value, color }: any) {
  return (
    <div style={styles.statTile}>
      <span style={{ ...styles.statValue, color }}>{value}</span>
      <span style={styles.statLabel}>{label}</span>
    </div>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────

const bannerStyles: Record<string, React.CSSProperties> = {
  wrapper: {
    background: T.infoBg,
    border: `1px solid ${T.infoBorder}`,
    borderRadius: 16,
    padding: "16px",
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  row: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dotRow: { display: "flex", alignItems: "center", gap: 8 },
  dot: {
    width: 8,
    height: 8,
    borderRadius: "50%",
    background: T.accent,
    display: "inline-block",
  },
  statusLabel: {
    fontSize: 12,
    fontWeight: 700,
    color: T.accent,
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  fraction: { fontSize: 12, color: T.textSecondary, fontWeight: 600 },
  track: {
    width: "100%",
    height: 6,
    background: "rgba(255,255,255,0.06)",
    borderRadius: 4,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    borderRadius: 4,
    transition: "width 0.8s ease-out",
  },
  eta: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    fontSize: 12,
    color: T.textSecondary,
  },
  protectionNote: {
    display: "flex",
    alignItems: "flex-start",
    gap: 8,
    fontSize: 11,
    color: T.textMuted,
    lineHeight: 1.5,
    borderTop: `1px solid ${T.infoBorder}`,
    paddingTop: 10,
  },
};

const infoStyles: Record<string, React.CSSProperties> = {
  wrapper: {
    background: T.warningBg,
    border: `1px solid ${T.warningBorder}`,
    borderRadius: 14,
    padding: "14px",
  },
  row: {
    display: "flex",
    alignItems: "flex-start",
    gap: 10,
  },
  text: {
    fontSize: 12,
    color: T.textSecondary,
    lineHeight: 1.6,
  },
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    height: "100%",
    display: "flex",
    flexDirection: "column",
    fontFamily: "'Sora', sans-serif",
  },
  header: {
    display: "flex",
    alignItems: "center",
    gap: 16,
    padding: "24px 0",
    borderBottom: `1px solid ${T.border}`,
  },
  backBtn: {
    background: "none",
    border: "none",
    color: T.textSecondary,
    display: "flex",
    alignItems: "center",
    gap: 4,
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 500,
    fontFamily: "'Sora', sans-serif",
  },
  title: {
    fontSize: 18,
    fontWeight: 700,
    margin: 0,
    color: T.textPrimary,
    letterSpacing: "-0.5px",
  },
  tabTrack: {
    display: "flex",
    gap: 4,
    padding: "12px 0",
    borderBottom: `1px solid ${T.border}`,
  },
  tab: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: "10px 0",
    border: "none",
    cursor: "pointer",
    fontFamily: "'Sora', sans-serif",
    fontSize: 12,
    fontWeight: 600,
  },
  scrollArea: { flex: 1, padding: "20px 10px 20px 0", overflowY: "auto" },
  section: { display: "flex", flexDirection: "column", gap: 16 },
  statsGrid: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 },
  statTile: {
    background: T.cardBg,
    border: `1px solid ${T.border}`,
    borderRadius: 16,
    padding: "16px 8px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  statValue: { fontSize: 20, fontWeight: 800 },
  statLabel: {
    fontSize: 9,
    textTransform: "uppercase",
    fontWeight: 700,
    letterSpacing: "0.5px",
    marginTop: 4,
    color: T.textSecondary,
  },
  glassCard: {
    background: "rgba(255, 255, 255, 0.03)",
    border: `1px solid ${T.border}`,
    borderRadius: 16,
    padding: "16px",
    display: "flex",
    flexDirection: "column",
    gap: 16,
    backdropFilter: "blur(10px)",
  },
  field: { display: "flex", flexDirection: "column", gap: 4 },
  fieldLabel: {
    fontSize: 10,
    fontWeight: 700,
    textTransform: "uppercase",
    color: T.textSecondary,
  },
  fieldValue: {
    fontSize: 13,
    color: T.textPrimary,
    fontWeight: 500,
    lineHeight: 1.5,
  },
  secondaryBtn: {
    padding: "12px",
    background: T.surface,
    color: T.textPrimary,
    border: `1px solid ${T.border}`,
    borderRadius: 12,
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    fontFamily: "'Sora', sans-serif",
  },
  sendBtn: {
    padding: "16px",
    background: T.accent,
    color: T.bg,
    border: "none",
    borderRadius: 14,
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    fontFamily: "'Sora', sans-serif",
    boxShadow: `0 8px 20px rgba(16, 185, 129, 0.15)`,
  },
  errorBox: {
    display: "flex",
    gap: 8,
    padding: 12,
    background: "rgba(248,113,113,0.1)",
    border: `1px solid rgba(248,113,113,0.2)`,
    borderRadius: 12,
    color: T.danger,
    fontSize: 12,
  },
  previewCard: {
    background: "rgba(255, 255, 255, 0.03)",
    border: `1px solid ${T.border}`,
    borderRadius: 16,
    padding: "16px",
    marginBottom: 12,
  },
  previewHeader: {
    borderBottom: `1px solid ${T.border}`,
    paddingBottom: 12,
    marginBottom: 12,
    display: "flex",
    flexDirection: "column",
    gap: 4,
  },
  previewMeta: { fontSize: 12, color: T.textSecondary },
  previewBody: { fontSize: 13, color: T.textPrimary, lineHeight: 1.6 },
  center: { display: "flex", justifyContent: "center", padding: "40px 0" },
  cloneBtn: {
    padding: "12px",
    background: "transparent",
    color: T.accent,
    border: `1px solid ${T.accent}`,
    borderRadius: 12,
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    fontFamily: "'Sora', sans-serif",
  },
  successBox: {
    padding: "12px 16px",
    background: T.infoBg,
    border: `1px solid ${T.infoBorder}`,
    borderRadius: 12,
    color: T.accent,
    fontSize: 12,
    fontWeight: 500,
  },
};
