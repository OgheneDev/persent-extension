import { TokenExchangeResponse } from "../types/accounts";

export class OAuthService {
  static async buildAuthUrl(
    provider: "gmail" | "outlook",
    accessToken: string,
  ): Promise<string> {
    const endpoint =
      provider === "gmail" ? "/accounts/google/url" : "/accounts/microsoft/url";
    const r = await chrome.runtime.sendMessage({
      type: "API_REQUEST",
      payload: { method: "GET", endpoint, accessToken },
    });
    if (!r?.payload?.ok)
      throw new Error(
        r?.payload?.data?.message || `Failed to get ${provider} auth URL`,
      );
    return r.payload.data.url;
  }

  static async launchWebAuthFlow(authUrl: string): Promise<string> {
    const r = await chrome.runtime.sendMessage({
      type: "IDENTITY_AUTH",
      payload: { authUrl },
    });
    if (!r?.ok) throw new Error(r?.error || "Auth flow failed");
    return r.redirectUrl;
  }

  static async exchangeCode(
    provider: "gmail" | "outlook",
    code: string,
    accessToken: string,
  ): Promise<TokenExchangeResponse> {
    const endpoint =
      provider === "gmail"
        ? "/accounts/google/exchange"
        : "/accounts/microsoft/exchange";
    const r = await chrome.runtime.sendMessage({
      type: "API_REQUEST",
      payload: { method: "POST", endpoint, body: { code }, accessToken },
    });
    if (!r?.payload?.ok)
      throw new Error(
        r?.payload?.data?.message || `Failed to exchange ${provider} code`,
      );
    return r.payload.data;
  }
}
