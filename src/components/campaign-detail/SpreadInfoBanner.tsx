import { ShieldCheck } from "lucide-react";
import { T } from "../../constants/campaign-detail";
import { SpreadInfoBannerProps } from "../../types/campaign-detail";
import { formatSpread } from "../../utils/campaign-helpers";

export function SpreadInfoBanner({
  total,
  spreadMinutes,
}: SpreadInfoBannerProps) {
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
