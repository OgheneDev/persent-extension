import { T } from "../../constants/campaign-detail";
import { StatCardProps } from "../../types/campaign-detail";

export function StatCard({ label, value, color }: StatCardProps) {
  return (
    <div
      style={{
        background: T.cardBg,
        border: `1px solid ${T.border}`,
        borderRadius: 16,
        padding: "16px 8px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <span
        style={{
          fontSize: 20,
          fontWeight: 800,
          color,
        }}
      >
        {value}
      </span>
      <span
        style={{
          fontSize: 9,
          textTransform: "uppercase",
          fontWeight: 700,
          letterSpacing: "0.5px",
          marginTop: 4,
          color: T.textSecondary,
        }}
      >
        {label}
      </span>
    </div>
  );
}
