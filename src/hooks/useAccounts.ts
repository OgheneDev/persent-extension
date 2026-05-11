import { useState, useEffect } from "react";
import { ConnectedAccount } from "../types";
import { accountsApi } from "../services/api";
import { OAuthService } from "../services/oauth.service";

export function useAccounts(getAccessToken: () => string | null) {
  const [accounts, setAccounts] = useState<ConnectedAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState<"gmail" | "outlook" | null>(
    null,
  );
  const [error, setError] = useState("");
  const [removing, setRemoving] = useState<string | null>(null);

  async function load() {
    try {
      const token = getAccessToken();
      if (!token) throw new Error("Not authenticated");
      const data = await accountsApi.list(token);
      setAccounts(data as ConnectedAccount[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load accounts");
    } finally {
      setLoading(false);
    }
  }

  async function handleConnect(provider: "gmail" | "outlook") {
    setConnecting(provider);
    setError("");
    try {
      const token = getAccessToken();
      if (!token) throw new Error("Not authenticated");

      const authUrl = await OAuthService.buildAuthUrl(provider, token);
      const redirectUrl = await OAuthService.launchWebAuthFlow(authUrl);
      const url = new URL(redirectUrl);
      const code = url.searchParams.get("code");
      if (!code) throw new Error("No auth code returned");

      const tokenData = await OAuthService.exchangeCode(provider, code, token);

      await accountsApi.saveToken(
        {
          provider,
          email: tokenData.email,
          accessToken: tokenData.access_token,
          refreshToken: tokenData.refresh_token,
          expiresAt: new Date(tokenData.expiry_date).toISOString(),
        },
        token,
      );

      await load();
    } catch (err) {
      const error = err as any;
      const message =
        error?.message ||
        error?.response?.data?.message ||
        `Failed to connect ${provider}`;
      setError(message);
      console.error("Connection error details:", err);
    } finally {
      setConnecting(null);
    }
  }

  async function disconnect(id: string) {
    setRemoving(id);
    try {
      const token = getAccessToken();
      if (!token) throw new Error("Not authenticated");
      await accountsApi.delete(id, token);
      setAccounts((prev) => prev.filter((a) => a._id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to disconnect");
    } finally {
      setRemoving(null);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return {
    accounts,
    loading,
    connecting,
    error,
    removing,
    handleConnect,
    disconnect,
  };
}
