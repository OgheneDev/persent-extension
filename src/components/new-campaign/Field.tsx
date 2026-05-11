import { FieldProps } from "../../types/new-campaign";

export function Field({ label, aside, children }: FieldProps) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 7,
        marginBottom: 18,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <label
          style={{
            fontSize: 10,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "1.1px",
            color: "#475569",
          }}
        >
          {label}
        </label>
        {aside && <div>{aside}</div>}
      </div>
      {children}
    </div>
  );
}
