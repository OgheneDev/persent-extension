import { ChevronLeft } from "lucide-react";
import { T, css } from "../../constants/new-campaign";
import { useNewCampaign } from "../../hooks/useNewCampaign";
import { CampaignForm } from "../../components/new-campaign/CampaignForm";
import { WarningBanner } from "../../components/new-campaign/WarningBanner";

interface Props {
  onBack: () => void;
  onCreated: (id: string) => void;
  getAccessToken: () => string | null;
}

export default function NewCampaignView({
  onBack,
  onCreated,
  getAccessToken,
}: Props) {
  const {
    accounts,
    name,
    connectedAccountId,
    subjectTemplate,
    bodyTemplate,
    error,
    loading,
    noAccounts,
    isReady,
    setName,
    setConnectedAccountId,
    setSubjectTemplate,
    setBodyTemplate,
    createCampaign,
    insertTag,
  } = useNewCampaign(getAccessToken);

  const handleSubmit = () => createCampaign(onCreated);

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
          padding: "22px 12px 22px 0",
          overflowY: "auto",
          overflowX: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* No accounts warning */}
        {noAccounts && (
          <WarningBanner message="Connect an email account before creating a campaign." />
        )}

        <CampaignForm
          name={name}
          connectedAccountId={connectedAccountId}
          subjectTemplate={subjectTemplate}
          bodyTemplate={bodyTemplate}
          accounts={accounts}
          loading={loading}
          isReady={isReady}
          noAccounts={noAccounts}
          error={error}
          onNameChange={setName}
          onAccountChange={setConnectedAccountId}
          onSubjectChange={setSubjectTemplate}
          onBodyChange={setBodyTemplate}
          onInsertTag={insertTag}
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  );
}
