import { ExtensionMessage, ApiRequestMessage } from "../types";

const API_BASE = "http://localhost:5000/api";

async function clearAuth(): Promise<void> {
  await chrome.storage.local.remove(["refreshToken", "user"]);
}

async function apiRequest(
  method: string,
  endpoint: string,
  body?: unknown,
  isFormData = false,
  accessToken?: string | null,
): Promise<{ ok: boolean; status: number; data: unknown }> {
  const headers: Record<string, string> = {};
  if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;
  if (!isFormData) headers["Content-Type"] = "application/json";

  const isAuthRoute = endpoint.startsWith("/auth/");
  const baseUrl = isAuthRoute ? "http://localhost:5000" : API_BASE;

  const res = await fetch(`${baseUrl}${endpoint}`, {
    method,
    headers,
    body: isFormData
      ? (body as FormData)
      : body
        ? JSON.stringify(body)
        : undefined,
  });

  let data: unknown;
  try {
    data = await res.json();
  } catch {
    data = null;
  }

  return { ok: res.ok, status: res.status, data };
}

chrome.runtime.onMessage.addListener(
  (message: ExtensionMessage, _sender, sendResponse) => {
    (async () => {
      switch (message.type) {
        case "CLEAR_AUTH": {
          await clearAuth();
          sendResponse({ ok: true });
          break;
        }

        case "API_REQUEST": {
          const { method, endpoint, body, isFormData, accessToken } = (
            message as ApiRequestMessage
          ).payload;
          const result = await apiRequest(
            method,
            endpoint,
            body,
            isFormData,
            accessToken,
          );
          sendResponse({ type: "API_RESPONSE", payload: result });
          break;
        }

        case "IDENTITY_AUTH": {
          const { authUrl } = message.payload as { authUrl: string };
          chrome.identity.launchWebAuthFlow(
            { url: authUrl, interactive: true },
            (redirectUrl) => {
              if (chrome.runtime.lastError || !redirectUrl) {
                sendResponse({
                  ok: false,
                  error:
                    chrome.runtime.lastError?.message || "Auth flow cancelled",
                });
              } else {
                sendResponse({ ok: true, redirectUrl });
              }
            },
          );
          return true;
        }

        default:
          sendResponse({ ok: false, error: "Unknown message type" });
      }
    })();

    return true;
  },
);

export {};
