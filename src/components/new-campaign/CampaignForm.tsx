import { ChevronDown, Send, Loader2, Sparkles } from "lucide-react";
import { T } from "../../constants/new-campaign";
import { Field } from "./Field";
import { PersonalizationTags } from "./PersonalizationTags";
import { WarningBanner } from "./WarningBanner";

interface CampaignFormProps {
  name: string;
  connectedAccountId: string;
  subjectTemplate: string;
  bodyTemplate: string;
  accounts: Array<{ _id: string; email: string; provider: string }>;
  loading: boolean;
  isReady: boolean;
  noAccounts: boolean;
  error: string;
  onNameChange: (value: string) => void;
  onAccountChange: (value: string) => void;
  onSubjectChange: (value: string) => void;
  onBodyChange: (value: string) => void;
  onInsertTag: (tag: string, field: "subject" | "body") => void;
  onSubmit: () => void;
}

export function CampaignForm({
  name,
  connectedAccountId,
  subjectTemplate,
  bodyTemplate,
  accounts,
  loading,
  isReady,
  noAccounts,
  error,
  onNameChange,
  onAccountChange,
  onSubjectChange,
  onBodyChange,
  onInsertTag,
  onSubmit,
}: CampaignFormProps) {
  return (
    <>
      {/* Campaign Name */}
      <Field label="Campaign name">
        <input
          className="nc-input"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder="April Outreach – SaaS Leads"
        />
      </Field>

      {/* Send From */}
      <Field label="Send from">
        <div className="nc-select-wrap">
          <select
            className="nc-input nc-select"
            value={connectedAccountId}
            onChange={(e) => onAccountChange(e.target.value)}
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
          <PersonalizationTags field="subject" onInsertTag={onInsertTag} />
        }
      >
        <input
          className="nc-input"
          value={subjectTemplate}
          onChange={(e) => onSubjectChange(e.target.value)}
          placeholder="Quick question for {{first_name}}"
        />
      </Field>

      {/* Email Body */}
      <Field
        label="Email body"
        aside={<PersonalizationTags field="body" onInsertTag={onInsertTag} />}
      >
        <textarea
          className="nc-input nc-textarea"
          style={{ height: 148 }}
          value={bodyTemplate}
          onChange={(e) => onBodyChange(e.target.value)}
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
      {error && <WarningBanner message={error} type="error" />}

      {/* Submit */}
      <button
        className="nc-submit"
        onClick={onSubmit}
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
    </>
  );
}
