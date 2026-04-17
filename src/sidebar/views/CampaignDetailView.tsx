import React, { useEffect, useState, useRef } from "react";
import {
  ChevronLeft,
  FileUp,
  Send,
  Eye,
  Users,
  BarChart3,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Campaign, CampaignPreview, RecipientStats } from "../../types";
import { campaignsApi, recipientsApi } from "../../services/api";

interface Props {
  campaignId: string;
  onBack: () => void;
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
};

const css = `
  /* Custom Scrollbar Logic */
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

  .spin { animation: acc-spin 0.8s linear infinite; }
  @keyframes acc-spin { to { transform: rotate(360deg); } }

  .tab-btn { transition: all 0.2s ease; }
  .tab-btn:hover { background: rgba(16, 185, 129, 0.05) !important; }
  
  .action-btn { transition: transform 0.15s, opacity 0.2s; }
  .action-btn:hover:not(:disabled) { transform: translateY(-1px); opacity: 0.9; }
  .action-btn:active:not(:disabled) { transform: translateY(0); }
`;

export default function CampaignDetailView({ campaignId, onBack }: Props) {
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [stats, setStats] = useState<RecipientStats | null>(null);
  const [previews, setPreviews] = useState<CampaignPreview[]>([]);
  const [tab, setTab] = useState<Tab>("overview");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  async function load() {
    try {
      const [c, s] = await Promise.all([
        campaignsApi.get(campaignId),
        recipientsApi.stats(campaignId),
      ]);
      setCampaign(c as Campaign);
      setStats(s as RecipientStats);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [campaignId]);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      await campaignsApi.uploadRecipients(campaignId, file);
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
      const data = (await campaignsApi.preview(campaignId)) as {
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
      await campaignsApi.send(campaignId);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Send failed");
    } finally {
      setSending(false);
    }
  }

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

  const canSend =
    ["draft", "failed"].includes(campaign.status) && (stats?.total ?? 0) > 0;

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

      {/* Modern Tabs */}
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
              <StatCard
                label="Leads"
                value={stats?.total ?? 0}
                color={T.textPrimary}
              />
              <StatCard
                label="Sent"
                value={stats?.sent ?? 0}
                color={T.accent}
              />
              <StatCard
                label="Failed"
                value={stats?.failed ?? 0}
                color={T.danger}
              />
            </div>

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

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 12,
                marginTop: 12,
              }}
            >
              <input
                ref={fileRef}
                type="file"
                accept=".csv"
                style={{ display: "none" }}
                onChange={handleUpload}
              />
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
                  {stats?.total
                    ? "Update Lead List (.csv)"
                    : "Upload Lead List (.csv)"}
                </span>
              </button>

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
                      <span>Send to {stats?.total} Recipients</span>
                    </>
                  )}
                </button>
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
    background: T.cardBg,
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
    boxShadow: `0 8px 20px ${T.accentGlow}`,
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
    background: T.cardBg,
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
};
