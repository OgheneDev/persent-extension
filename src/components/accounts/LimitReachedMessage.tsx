import { AlertCircle } from "lucide-react";
import { T } from "../../constants/accounts";

interface LimitReachedMessageProps {
  plan: string;
  limit: number;
}

export function LimitReachedMessage({ plan, limit }: LimitReachedMessageProps) {
  return (
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
            {plan}
          </span>{" "}
          plan supports up to {limit} connected account
          {limit === 1 ? "" : "s"}.
        </p>
      </div>
    </div>
  );
}
