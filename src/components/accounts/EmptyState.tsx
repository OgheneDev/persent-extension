import { Mail } from "lucide-react";
import { T } from "../../constants/accounts";

export function EmptyState() {
  return (
    <div
      style={{
        padding: "40px 20px",
        textAlign: "center",
        border: `1px dashed ${T.border}`,
        borderRadius: 16,
      }}
    >
      <Mail
        size={24}
        color={T.textMuted}
        style={{ marginBottom: 12, opacity: 0.5 }}
      />
      <p
        style={{
          margin: 0,
          fontSize: 13,
          fontWeight: 600,
          color: T.textSecondary,
        }}
      >
        No accounts active
      </p>
      <p style={{ margin: "4px 0 0", fontSize: 11, color: T.textMuted }}>
        Connect a provider to start sending
      </p>
    </div>
  );
}
