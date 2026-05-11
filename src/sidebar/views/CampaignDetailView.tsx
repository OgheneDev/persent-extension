import React, { useState } from "react";
import {
  ChevronLeft,
  BarChart3,
  Eye,
  Users,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { useCampaignDetail } from "../../hooks/useCampaignDetail";
import { T, CAMPAIGN_STYLES } from "../../constants/campaign-detail";
import { ACTIVE_STATUSES, Tab } from "../../types/campaign-detail";
import { TabButton } from "../../components/campaign-detail/TabButton";
import { CampaignOverview } from "../../components/campaign-detail/CampaignOverview";
import { CampaignPreview } from "../../components/campaign-detail/CampaignPreview";
import { CampaignRecipients } from "../../components/campaign-detail/CampaignReceipients";

interface Props {
  campaignId: string;
  onBack: () => void;
  getAccessToken: () => string | null;
}

export default function CampaignDetailView({
  campaignId,
  onBack,
  getAccessToken,
}: Props) {
  const [tab, setTab] = useState<Tab>("overview");
  const { auth } = useAuth();
  const {
    campaign,
    stats,
    previews,
    loading,
    sending,
    uploading,
    error,
    cloning,
    cloneSuccess,
    handleUpload,
    handlePreview,
    handleSend,
    handleClone,
    setError,
    setPreviews,
  } = useCampaignDetail(campaignId, getAccessToken);

  const isActive = campaign ? ACTIVE_STATUSES.has(campaign.status) : false;
  const canClone =
    auth.user?.plan === "growth" || auth.user?.plan === "founder";

  const onPreviewClick = async () => {
    setTab("preview");
    await handlePreview();
  };

  if (loading) {
    return (
      <div
        style={{ display: "flex", justifyContent: "center", padding: "40px 0" }}
      >
        <Loader2 className="spin" color={T.accent} size={32} />
      </div>
    );
  }

  if (!campaign) {
    return (
      <div
        style={{
          display: "flex",
          gap: 8,
          padding: 12,
          background: "rgba(248,113,113,0.1)",
          border: `1px solid rgba(248,113,113,0.2)`,
          borderRadius: 12,
          color: T.danger,
          fontSize: 12,
        }}
      >
        <AlertCircle size={14} />
        Campaign not found
      </div>
    );
  }

  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        fontFamily: "'Sora', sans-serif",
      }}
    >
      <style>{CAMPAIGN_STYLES}</style>

      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          padding: "24px 0",
          borderBottom: `1px solid ${T.border}`,
        }}
      >
        <button
          style={{
            background: "none",
            border: "none",
            color: T.textSecondary,
            display: "flex",
            alignItems: "center",
            gap: 4,
            cursor: "pointer",
            fontSize: 13,
            fontWeight: 500,
            fontFamily: "'Sora', sans-serif",
          }}
          onClick={onBack}
        >
          <ChevronLeft size={18} />
          <span>Back</span>
        </button>
        <h3
          style={{
            fontSize: 18,
            fontWeight: 700,
            margin: 0,
            color: T.textPrimary,
            letterSpacing: "-0.5px",
          }}
        >
          {campaign.name}
        </h3>
      </div>

      {/* Tabs */}
      <div
        style={{
          display: "flex",
          gap: 4,
          padding: "12px 0",
          borderBottom: `1px solid ${T.border}`,
        }}
      >
        <TabButton
          active={tab === "overview"}
          label="Overview"
          icon={<BarChart3 size={14} />}
          onClick={() => setTab("overview")}
        />
        <TabButton
          active={tab === "preview"}
          label="Preview"
          icon={<Eye size={14} />}
          onClick={onPreviewClick}
        />
        <TabButton
          active={tab === "recipients"}
          label="Leads"
          icon={<Users size={14} />}
          onClick={() => setTab("recipients")}
        />
      </div>

      <div
        className="acc-scroll-container"
        style={{ flex: 1, padding: "20px 10px 20px 0", overflowY: "auto" }}
      >
        {error && (
          <div
            style={{
              display: "flex",
              gap: 8,
              padding: 12,
              background: "rgba(248,113,113,0.1)",
              border: `1px solid rgba(248,113,113,0.2)`,
              borderRadius: 12,
              color: T.danger,
              fontSize: 12,
              marginBottom: 16,
            }}
          >
            <AlertCircle size={14} />
            {error}
          </div>
        )}

        {tab === "overview" && (
          <CampaignOverview
            campaign={campaign}
            stats={stats}
            isActive={isActive}
            sending={sending}
            uploading={uploading}
            cloning={cloning}
            cloneSuccess={cloneSuccess}
            canClone={canClone}
            onUpload={handleUpload}
            onSend={handleSend}
            onClone={handleClone}
          />
        )}

        {tab === "preview" && <CampaignPreview previews={previews} />}

        {tab === "recipients" && <CampaignRecipients stats={stats} />}
      </div>
    </div>
  );
}
