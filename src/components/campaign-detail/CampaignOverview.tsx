import React, { useRef } from "react";
import { FileUp, Send, Copy, Loader2 } from "lucide-react";
import { Campaign, RecipientStats } from "../../types";
import { T } from "../../constants/campaign-detail";
import { estimateSpreadMinutes } from "../../utils/campaign-helpers";
import { SendingBanner } from "./SendingBanner";
import { SpreadInfoBanner } from "./SpreadInfoBanner";
import { StatCard } from "./StatCard";

interface CampaignOverviewProps {
  campaign: Campaign;
  stats: RecipientStats | null;
  isActive: boolean;
  sending: boolean;
  uploading: boolean;
  cloning: boolean;
  cloneSuccess: string;
  canClone: boolean;
  onUpload: (file: File) => void;
  onSend: () => void;
  onClone: () => void;
}

export function CampaignOverview({
  campaign,
  stats,
  isActive,
  sending,
  uploading,
  cloning,
  cloneSuccess,
  canClone,
  onUpload,
  onSend,
  onClone,
}: CampaignOverviewProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const total = stats?.total ?? 0;
  const sent = stats?.sent ?? 0;
  const progress = total > 0 ? (sent / total) * 100 : 0;
  const spreadMinutes = estimateSpreadMinutes(total);
  const canSend = ["draft", "failed"].includes(campaign.status) && total > 0;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onUpload(file);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: 12,
        }}
      >
        <StatCard label="Leads" value={total} color={T.textPrimary} />
        <StatCard label="Sent" value={sent} color={T.accent} />
        <StatCard label="Failed" value={stats?.failed ?? 0} color={T.danger} />
      </div>

      {isActive && (
        <SendingBanner
          sent={sent}
          total={total}
          progress={progress}
          spreadMinutes={spreadMinutes}
          status={campaign.status}
        />
      )}

      {canSend && total > 0 && (
        <SpreadInfoBanner total={total} spreadMinutes={spreadMinutes} />
      )}

      <div
        style={{
          background: "rgba(255, 255, 255, 0.03)",
          border: `1px solid ${T.border}`,
          borderRadius: 16,
          padding: "16px",
          display: "flex",
          flexDirection: "column",
          gap: 16,
          backdropFilter: "blur(10px)",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              textTransform: "uppercase",
              color: T.textSecondary,
            }}
          >
            Subject Line
          </span>
          <span
            style={{
              fontSize: 13,
              color: T.textPrimary,
              fontWeight: 500,
              lineHeight: 1.5,
            }}
          >
            {campaign.subjectTemplate}
          </span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              textTransform: "uppercase",
              color: T.textSecondary,
            }}
          >
            Outgoing Account
          </span>
          <span
            style={{
              fontSize: 13,
              color: T.textPrimary,
              fontWeight: 500,
              lineHeight: 1.5,
            }}
          >
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
          onChange={handleFileChange}
        />
        {!isActive && (
          <button
            className="action-btn"
            style={{
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
            }}
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? (
              <Loader2 size={16} className="spin" />
            ) : (
              <FileUp size={16} />
            )}
            <span>
              {total ? "Update Lead List (.csv)" : "Upload Lead List (.csv)"}
            </span>
          </button>
        )}

        {canSend && (
          <button
            className="action-btn"
            style={{
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
            }}
            onClick={onSend}
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
            style={{
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
            }}
            onClick={onClone}
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
          <div
            style={{
              padding: "12px 16px",
              background: T.infoBg,
              border: `1px solid ${T.infoBorder}`,
              borderRadius: 12,
              color: T.accent,
              fontSize: 12,
              fontWeight: 500,
            }}
          >
            {cloneSuccess}
          </div>
        )}
      </div>
    </div>
  );
}
