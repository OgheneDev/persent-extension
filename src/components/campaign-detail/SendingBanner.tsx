import { Clock, ShieldCheck } from "lucide-react";
import { T } from "../../constants/campaign-detail";
import { SendingBannerProps } from "../../types/campaign-detail";
import { formatSpread } from "../../utils/campaign-helpers";

export function SendingBanner({
  sent,
  total,
  progress,
  spreadMinutes,
  status,
}: SendingBannerProps) {
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
