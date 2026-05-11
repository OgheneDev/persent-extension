import { useState, useEffect, useCallback, useRef } from "react";
import { Campaign, CampaignPreview, RecipientStats } from "../types/index";
import { campaignsApi, recipientsApi } from "../services/api";
import { ACTIVE_STATUSES, POLL_INTERVAL_MS } from "../types/campaign-detail";

export function useCampaignDetail(
  campaignId: string,
  getAccessToken: () => string | null,
) {
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [stats, setStats] = useState<RecipientStats | null>(null);
  const [previews, setPreviews] = useState<CampaignPreview[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [cloning, setCloning] = useState(false);
  const [cloneSuccess, setCloneSuccess] = useState("");
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const load = useCallback(
    async (silent = false) => {
      try {
        const token = getAccessToken();
        if (!token) throw new Error("Not authenticated");
        const [c, s] = await Promise.all([
          campaignsApi.get(campaignId, token),
          recipientsApi.stats(campaignId, token),
        ]);
        setCampaign(c as Campaign);
        setStats(s as RecipientStats);
      } catch (err) {
        if (!silent)
          setError(err instanceof Error ? err.message : "Failed to load");
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [campaignId, getAccessToken],
  );

  // Initial load
  useEffect(() => {
    load();
  }, [load]);

  // Live polling while campaign is active
  useEffect(() => {
    if (!campaign) return;

    if (ACTIVE_STATUSES.has(campaign.status)) {
      if (!pollRef.current) {
        pollRef.current = setInterval(() => load(true), POLL_INTERVAL_MS);
      }
    } else {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    }

    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };
  }, [campaign?.status, load]);

  async function handleUpload(file: File) {
    setUploading(true);
    setError("");
    try {
      const token = getAccessToken();
      if (!token) throw new Error("Not authenticated");
      await campaignsApi.uploadRecipients(campaignId, file, token);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function handlePreview() {
    if (previews.length > 0) return;
    try {
      const token = getAccessToken();
      if (!token) throw new Error("Not authenticated");
      const data = (await campaignsApi.preview(campaignId, token)) as {
        previews: CampaignPreview[];
      };
      setPreviews(data.previews);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Preview failed");
    }
  }

  async function handleSend() {
    if (!confirm("Confirm: Launch this campaign?")) return;
    setSending(true);
    setError("");
    try {
      const token = getAccessToken();
      if (!token) throw new Error("Not authenticated");
      await campaignsApi.send(campaignId, token);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Send failed");
    } finally {
      setSending(false);
    }
  }

  async function handleClone() {
    if (!confirm("Clone this campaign to all your connected accounts?")) return;
    setCloning(true);
    setCloneSuccess("");
    setError("");
    try {
      const token = getAccessToken();
      if (!token) throw new Error("Not authenticated");
      const result = (await campaignsApi.clone(campaignId, token)) as {
        cloned: number;
      };
      setCloneSuccess(
        `Cloned to ${result.cloned} account${result.cloned !== 1 ? "s" : ""} — check your campaigns list.`,
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Clone failed");
    } finally {
      setCloning(false);
    }
  }

  return {
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
    setTab: (tab: any) => {},
  };
}
