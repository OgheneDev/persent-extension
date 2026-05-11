import { useState, useEffect } from "react";
import { ConnectedAccount, Campaign } from "../types";
import { campaignsApi, accountsApi } from "../services/api";

export function useNewCampaign(getAccessToken: () => string | null) {
  const [accounts, setAccounts] = useState<ConnectedAccount[]>([]);
  const [name, setName] = useState("");
  const [connectedAccountId, setConnectedAccountId] = useState("");
  const [subjectTemplate, setSubjectTemplate] = useState("");
  const [bodyTemplate, setBodyTemplate] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadAccounts() {
      try {
        const token = getAccessToken();
        if (!token) return;
        const data = await accountsApi.list(token);
        const accs = data as ConnectedAccount[];
        setAccounts(accs);
        if (accs.length > 0) setConnectedAccountId(accs[0]._id);
      } catch {
        // silently fail — the warning banner already tells the user
      }
    }
    loadAccounts();
  }, [getAccessToken]);

  const isReady = !!(
    name &&
    subjectTemplate &&
    bodyTemplate &&
    connectedAccountId
  );
  const noAccounts = accounts.length === 0;

  async function createCampaign(onCreated: (id: string) => void) {
    if (!isReady) {
      setError("All fields are required");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const token = getAccessToken();
      if (!token) throw new Error("Not authenticated");
      const campaign = await campaignsApi.create(
        {
          name,
          subjectTemplate,
          bodyTemplate,
          connectedAccountId,
        },
        token,
      );
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

  return {
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
  };
}
