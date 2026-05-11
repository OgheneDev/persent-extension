import { T } from "../../constants/campaign-detail";
import { TabBtnProps } from "../../types/campaign-detail";

export function TabButton({ active, label, icon, onClick }: TabBtnProps) {
  return (
    <button
      onClick={onClick}
      className="tab-btn"
      style={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        padding: "10px 0",
        border: "none",
        cursor: "pointer",
        fontFamily: "'Sora', sans-serif",
        fontSize: 12,
        fontWeight: 600,
        color: active ? T.accent : T.textSecondary,
        background: active ? "rgba(16, 185, 129, 0.08)" : "transparent",
        borderBottom: `2px solid ${active ? T.accent : "transparent"}`,
      }}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}
