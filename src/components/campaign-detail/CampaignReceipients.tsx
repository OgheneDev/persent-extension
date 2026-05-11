import { RecipientStats } from "../../types";
import { T } from "../../constants/campaign-detail";

interface CampaignRecipientsProps {
  stats: RecipientStats | null;
}

export function CampaignRecipients({ stats }: CampaignRecipientsProps) {
  return (
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
          Pending
        </span>
        <span
          style={{
            fontSize: 13,
            color: T.textPrimary,
            fontWeight: 500,
            lineHeight: 1.5,
          }}
        >
          {stats?.pending ?? 0}
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
          Sent successfully
        </span>
        <span
          style={{
            fontSize: 13,
            color: T.textPrimary,
            fontWeight: 500,
            lineHeight: 1.5,
          }}
        >
          {stats?.sent ?? 0}
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
          Failed attempts
        </span>
        <span
          style={{
            fontSize: 13,
            color: T.textPrimary,
            fontWeight: 500,
            lineHeight: 1.5,
          }}
        >
          {stats?.failed ?? 0}
        </span>
      </div>
    </div>
  );
}
