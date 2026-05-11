import { AlertCircle } from "lucide-react";
import { T } from "../../constants/new-campaign";

interface WarningBannerProps {
  message: string;
  type?: "warning" | "error";
}

export function WarningBanner({
  message,
  type = "warning",
}: WarningBannerProps) {
  const isError = type === "error";
  const backgroundColor = isError ? T.dangerDim : T.warningDim;
  const borderColor = isError
    ? "rgba(248,113,113,0.18)"
    : "rgba(251,191,36,0.18)";
  const textColor = isError ? T.danger : T.warning;

  return (
    <div
      style={{
        background: backgroundColor,
        border: `1px solid ${borderColor}`,
        padding: "10px 14px",
        borderRadius: 10,
        color: textColor,
        display: "flex",
        alignItems: "center",
        gap: 8,
        fontSize: 12,
        fontWeight: 500,
        marginBottom: 20,
      }}
    >
      <AlertCircle size={14} strokeWidth={2.5} style={{ flexShrink: 0 }} />
      <span>{message}</span>
    </div>
  );
}
