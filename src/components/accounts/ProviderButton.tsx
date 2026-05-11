import { Loader2 } from "lucide-react";
import { GoogleIcon, OutlookIcon } from "../../assets";
import { T } from "../../constants/accounts";

interface ProviderButtonProps {
  provider: "gmail" | "outlook";
  isConnecting: boolean;
  connectingProvider: "gmail" | "outlook" | null;
  onClick: () => void;
}

export function ProviderButton({
  provider,
  isConnecting,
  connectingProvider,
  onClick,
}: ProviderButtonProps) {
  const isActive = connectingProvider === provider;
  const accentColor = provider === "gmail" ? T.gmail : T.outlook;
  const Icon = provider === "gmail" ? GoogleIcon : OutlookIcon;
  const displayName = provider === "gmail" ? "Gmail" : "Outlook";
  const subtitle = provider === "gmail" ? "Google Workspace" : "Microsoft 365";

  return (
    <button
      className="acc-connect-btn"
      onClick={onClick}
      disabled={isConnecting}
      style={{
        background: T.surface,
        border: `1px solid ${isActive ? `${accentColor}66` : T.border}`,
        borderRadius: 14,
        padding: "16px 12px",
        color: T.textPrimary,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 8,
        cursor: "pointer",
        fontFamily: "'Sora', sans-serif",
      }}
    >
      {isActive ? (
        <Loader2 size={18} className="spin" color={accentColor} />
      ) : (
        <Icon />
      )}
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 13, fontWeight: 600 }}>{displayName}</div>
        <div style={{ fontSize: 10, color: T.textMuted, marginTop: 1 }}>
          {subtitle}
        </div>
      </div>
    </button>
  );
}
