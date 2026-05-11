import { CampaignPreview as CampaignPreviewType } from "../../types";
import { T } from "../../constants/campaign-detail";

interface CampaignPreviewProps {
  previews: CampaignPreviewType[];
}

export function CampaignPreview({ previews }: CampaignPreviewProps) {
  if (previews.length === 0) {
    return (
      <div
        style={{ display: "flex", justifyContent: "center", padding: "40px 0" }}
      >
        <div
          className="spin"
          style={{
            width: 24,
            height: 24,
            border: `2px solid ${T.accent}`,
            borderTopColor: "transparent",
            borderRadius: "50%",
          }}
        />
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {previews.map((p, i) => (
        <div
          key={i}
          style={{
            background: "rgba(255, 255, 255, 0.03)",
            border: `1px solid ${T.border}`,
            borderRadius: 16,
            padding: "16px",
            marginBottom: 12,
          }}
        >
          <div
            style={{
              borderBottom: `1px solid ${T.border}`,
              paddingBottom: 12,
              marginBottom: 12,
              display: "flex",
              flexDirection: "column",
              gap: 4,
            }}
          >
            <div style={{ fontSize: 12, color: T.textSecondary }}>
              <span>To:</span> {p.to}
            </div>
            <div style={{ fontSize: 12, color: T.textSecondary }}>
              <span>Subject:</span> {p.subject}
            </div>
          </div>
          <div
            style={{ fontSize: 13, color: T.textPrimary, lineHeight: 1.6 }}
            dangerouslySetInnerHTML={{ __html: p.html }}
          />
        </div>
      ))}
    </div>
  );
}
