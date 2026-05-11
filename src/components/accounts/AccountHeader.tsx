import { ChevronLeft } from "lucide-react";
import { T } from "../../constants/accounts";

interface AccountHeaderProps {
  onBack: () => void;
}

export function AccountHeader({ onBack }: AccountHeaderProps) {
  return (
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
        <span style={{ fontSize: 11, color: T.textSecondary, fontWeight: 500 }}>
          · Email providers
        </span>
      </div>
    </div>
  );
}
