import React, { useEffect, useState } from "react";
import {
  ChevronLeft,
  Send,
  Sparkles,
  Loader2,
  AlertCircle,
  ChevronDown,
} from "lucide-react";
import { ConnectedAccount, Campaign } from "../../types";
import { campaignsApi, accountsApi } from "../../services/api";

interface Props {
  onBack: () => void;
  onCreated: (id: string) => void;
}

const T = {
  bg: "#090e1a",
  surface: "#0f1623",
  surfaceHover: "#151e2e",
  inputBg: "rgba(255,255,255,0.03)",
  inputBgFocus: "rgba(255,255,255,0.05)",
  border: "rgba(255,255,255,0.07)",
  borderFocus: "#10b981",
  accent: "#10b981",
  accentDim: "rgba(16,185,129,0.12)",
  accentGlow: "rgba(16,185,129,0.18)",
  textPrimary: "#f1f5f9",
  textSecondary: "#64748b",
  textMuted: "#334155",
  danger: "#f87171",
  dangerDim: "rgba(248,113,113,0.08)",
  warning: "#fbbf24",
  warningDim: "rgba(251,191,36,0.08)",
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700&display=swap');

  .nc-root * { box-sizing: border-box; }

  /* Custom Scrollbar Styling */
  .nc-scroll-container::-webkit-scrollbar {
    width: 6px;
  }
  .nc-scroll-container::-webkit-scrollbar-track {
    background: transparent;
  }
  .nc-scroll-container::-webkit-scrollbar-thumb {
    background: ${T.border};
    border-radius: 10px;
  }
  .nc-scroll-container::-webkit-scrollbar-thumb:hover {
    background: ${T.textMuted};
  }
  .nc-scroll-container {
    scrollbar-width: thin;
    scrollbar-color: ${T.border} transparent;
  }

  .nc-back-btn { transition: color 0.15s; }
  .nc-back-btn:hover { color: ${T.textPrimary} !important; }
  .nc-back-btn:hover .nc-back-icon { transform: translateX(-2px); }
  .nc-back-icon { transition: transform 0.18s ease; display: flex; }

  .nc-input {
    width: 100%;
    padding: 11px 14px;
    background: ${T.inputBg};
    border: 1px solid ${T.border};
    border-radius: 11px;
    font-family: 'Sora', sans-serif;
    font-size: 13px;
    color: ${T.textPrimary};
    outline: none;
    transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
    display: block;
  }
  .nc-input:focus {
    border-color: ${T.borderFocus};
    background: ${T.inputBgFocus};
    box-shadow: 0 0 0 3px ${T.accentGlow};
  }
  .nc-input::placeholder { color: ${T.textMuted}; }

  .nc-select-wrap { position: relative; }
  .nc-select {
    appearance: none;
    cursor: pointer;
    padding-right: 38px;
  }
  .nc-select-icon {
    position: absolute;
    right: 12px;
    top: 50%;
    transform: translateY(-50%);
    pointer-events: none;
    color: ${T.textSecondary};
  }

  .nc-textarea { resize: none; line-height: 1.65; }

  .nc-submit {
    transition: opacity 0.2s, transform 0.15s, box-shadow 0.2s;
  }
  .nc-submit:hover:not(:disabled) {
    opacity: 0.9;
    transform: translateY(-1px);
    box-shadow: 0 8px 24px rgba(16,185,129,0.3);
  }
  .nc-submit:active:not(:disabled) { transform: translateY(0); }
  .nc-submit:disabled { opacity: 0.45; cursor: not-allowed; }

  .spin { animation: nc-spin 0.8s linear infinite; }
  @keyframes nc-spin { to { transform: rotate(360deg); } }

  .nc-char-count {
    font-size: 10px;
    font-variant-numeric: tabular-nums;
    transition: color 0.2s;
  }

  .nc-tag {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: 10px;
    font-weight: 600;
    font-family: 'Sora', monospace;
    padding: 2px 7px;
    border-radius: 5px;
    background: ${T.accentDim};
    color: ${T.accent};
    border: 1px solid rgba(16,185,129,0.18);
    cursor: pointer;
    letter-spacing: 0.2px;
    transition: background 0.15s;
  }
  .nc-tag:hover { background: rgba(16,185,129,0.2); }
`;

export default function NewCampaignView({ onBack, onCreated }: Props) {
  const [accounts, setAccounts] = useState<ConnectedAccount[]>([]);
  const [name, setName] = useState("");
  const [connectedAccountId, setConnectedAccountId] = useState("");
  const [subjectTemplate, setSubjectTemplate] = useState("");
  const [bodyTemplate, setBodyTemplate] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const noAccounts = accounts.length === 0;
  const isReady = name && subjectTemplate && bodyTemplate && connectedAccountId;

  useEffect(() => {
    accountsApi.list().then((data) => {
      const accs = data as ConnectedAccount[];
      setAccounts(accs);
      if (accs.length > 0) setConnectedAccountId(accs[0]._id);
    });
  }, []);

  async function handleCreate() {
    if (!isReady) {
      setError("All fields are required");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const campaign = await campaignsApi.create({
        name,
        subjectTemplate,
        bodyTemplate,
        connectedAccountId,
      });
      onCreated((campaign as Campaign)._id);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create campaign",
      );
    } finally {
      setLoading(false);
    }
  }

  function insertTag(tag: string, field: "subject" | "body") {
    if (field === "subject") setSubjectTemplate((v) => v + tag);
    else setBodyTemplate((v) => v + tag);
  }

  return (
    <div
      className="nc-root"
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        fontFamily: "'Sora', sans-serif",
        color: T.textPrimary,
        overflow: "hidden",
      }}
    >
      <style>{css}</style>

      {/* Header */}
      <div
        style={{
          padding: "20px 0 18px",
          borderBottom: `1px solid ${T.border}`,
          flexShrink: 0,
        }}
      >
        <button
          className="nc-back-btn"
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
          <span className="nc-back-icon">
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
            New Campaign
          </h3>
          <span
            style={{ fontSize: 11, color: T.textSecondary, fontWeight: 500 }}
          >
            · Email outreach
          </span>
        </div>
      </div>

      {/* Scroll area */}
      <div
        className="nc-scroll-container"
        style={{
          flex: 1,
          padding: "22px 12px 22px 0", // Right padding creates space for the scroller
          overflowY: "auto",
          overflowX: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* No accounts warning */}
        {noAccounts && (
          <div
            style={{
              background: T.warningDim,
              border: `1px solid rgba(251,191,36,0.18)`,
              padding: "10px 14px",
              borderRadius: 10,
              color: T.warning,
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontSize: 12,
              fontWeight: 500,
              marginBottom: 20,
            }}
          >
            <AlertCircle
              size={14}
              strokeWidth={2.5}
              style={{ flexShrink: 0 }}
            />
            <span>Connect an email account before creating a campaign.</span>
          </div>
        )}

        {/* Campaign Name */}
        <Field label="Campaign name">
          <input
            className="nc-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="April Outreach – SaaS Leads"
          />
        </Field>

        {/* Send From */}
        <Field label="Send from">
          <div className="nc-select-wrap">
            <select
              className="nc-input nc-select"
              value={connectedAccountId}
              onChange={(e) => setConnectedAccountId(e.target.value)}
            >
              {accounts.length === 0 ? (
                <option>No accounts connected</option>
              ) : (
                accounts.map((a) => (
                  <option
                    key={a._id}
                    value={a._id}
                    style={{ background: T.surface }}
                  >
                    {a.email} · {a.provider}
                  </option>
                ))
              )}
            </select>
            <span className="nc-select-icon">
              <ChevronDown size={14} />
            </span>
          </div>
        </Field>

        {/* Subject Line */}
        <Field
          label="Subject line"
          aside={
            <div style={{ display: "flex", gap: 6 }}>
              {["{{first_name}}", "{{company}}"].map((tag) => (
                <button
                  key={tag}
                  className="nc-tag"
                  onClick={() => insertTag(tag, "subject")}
                >
                  {tag}
                </button>
              ))}
            </div>
          }
        >
          <input
            className="nc-input"
            value={subjectTemplate}
            onChange={(e) => setSubjectTemplate(e.target.value)}
            placeholder="Quick question for {{first_name}}"
          />
        </Field>

        {/* Email Body */}
        <Field
          label="Email body"
          aside={
            <div style={{ display: "flex", gap: 6 }}>
              {["{{first_name}}", "{{company}}", "{{role}}"].map((tag) => (
                <button
                  key={tag}
                  className="nc-tag"
                  onClick={() => insertTag(tag, "body")}
                >
                  {tag}
                </button>
              ))}
            </div>
          }
        >
          <textarea
            className="nc-input nc-textarea"
            style={{ height: 148 }}
            value={bodyTemplate}
            onChange={(e) => setBodyTemplate(e.target.value)}
            placeholder={`Hi {{first_name}},\n\nI noticed your work at {{company}}...`}
          />
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginTop: 7,
              padding: "0 2px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 5,
                color: T.textMuted,
                fontSize: 10,
              }}
            >
              <Sparkles size={11} />
              <span>HTML &amp; personalization enabled</span>
            </div>
            <span
              className="nc-char-count"
              style={{
                color: bodyTemplate.length > 800 ? T.warning : T.textMuted,
              }}
            >
              {bodyTemplate.length} chars
            </span>
          </div>
        </Field>

        {/* Error */}
        {error && (
          <div
            style={{
              background: T.dangerDim,
              border: `1px solid rgba(248,113,113,0.18)`,
              padding: "10px 14px",
              borderRadius: 10,
              color: T.danger,
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontSize: 12,
              fontWeight: 500,
              marginBottom: 4,
            }}
          >
            <AlertCircle
              size={14}
              strokeWidth={2.5}
              style={{ flexShrink: 0 }}
            />
            <span>{error}</span>
          </div>
        )}

        {/* Submit */}
        <button
          className="nc-submit"
          onClick={handleCreate}
          disabled={loading || noAccounts}
          style={{
            width: "100%",
            padding: "14px",
            background:
              isReady && !loading
                ? `linear-gradient(135deg, #10b981, #059669)`
                : T.surface,
            color: isReady && !loading ? T.bg : T.textSecondary,
            border: `1px solid ${isReady && !loading ? "transparent" : T.border}`,
            borderRadius: 12,
            fontSize: 13,
            fontWeight: 700,
            cursor: "pointer",
            marginTop: 16,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            fontFamily: "'Sora', sans-serif",
            letterSpacing: "-0.2px",
            flexShrink: 0,
          }}
        >
          {loading ? (
            <>
              <Loader2 size={15} className="spin" />
              <span>Creating campaign…</span>
            </>
          ) : (
            <>
              <span>Create Campaign</span>
              <Send size={14} />
            </>
          )}
        </button>
      </div>
    </div>
  );
}

// ─── Field wrapper ─────────────────────────────────────────────────────────────

function Field({
  label,
  aside,
  children,
}: {
  label: string;
  aside?: React.ReactNode;
  children: React.ReactNode;
}) {
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
