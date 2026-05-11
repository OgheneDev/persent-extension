import { Loader2, Trash2 } from "lucide-react";
import { ConnectedAccount } from "../../types";
import { GoogleIconLarge, OutlookIcon } from "../../assets";
import { T } from "../../constants/accounts";

interface AccountCardProps {
  account: ConnectedAccount;
  isRemoving: boolean;
  onDisconnect: (id: string) => void;
}

export function AccountCard({
  account,
  isRemoving,
  onDisconnect,
}: AccountCardProps) {
  const Icon = account.provider === "gmail" ? GoogleIconLarge : OutlookIcon;
  const iconBgColor =
    account.provider === "gmail"
      ? "rgba(234,67,53,0.08)"
      : "rgba(0,120,212,0.08)";
  const iconBorderColor =
    account.provider === "gmail"
      ? "rgba(234,67,53,0.1)"
      : "rgba(0,120,212,0.1)";

  return (
    <div
      className="acc-card"
      style={{
        background: T.cardBg,
        border: `1px solid ${T.border}`,
        borderRadius: 16,
        padding: "12px 16px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: iconBgColor,
            border: `1px solid ${iconBorderColor}`,
          }}
        >
          <Icon />
        </div>
        <div>
          <div
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: T.textPrimary,
              letterSpacing: "-0.2px",
            }}
          >
            {account.email}
          </div>
          <div className={`acc-provider-badge acc-badge-${account.provider}`}>
            {account.provider}
          </div>
        </div>
      </div>

      <button
        className="acc-delete-btn"
        onClick={() => onDisconnect(account._id)}
        disabled={isRemoving}
        style={{
          background: "none",
          border: "none",
          color: T.textMuted,
          cursor: "pointer",
          padding: "8px",
        }}
      >
        {isRemoving ? (
          <Loader2 size={16} className="spin" />
        ) : (
          <Trash2 size={16} strokeWidth={2} />
        )}
      </button>
    </div>
  );
}
