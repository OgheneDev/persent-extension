import { ExtensionMessage, ApiRequestMessage } from "../types";

const API_BASE = "http://localhost:5000/api";

// ─── Storage helpers ───────────────────────────────────────────────────────

async function getToken(): Promise<string | null> {
  const result = await chrome.storage.local.get("token");
  return (result.token as string | undefined) ?? null;
}

async function setAuth(token: string, user: unknown): Promise<void> {
  await chrome.storage.local.set({ token, user });
}

async function clearAuth(): Promise<void> {
  await chrome.storage.local.remove(["token", "user"]);
}

// ─── API fetch (runs in background, bypasses CORS restriction) ─────────────

async function apiRequest(
  method: string,
  endpoint: string,
  body?: unknown,
  isFormData = false,
): Promise<{ ok: boolean; status: number; data: unknown }> {
  const token = await getToken();

  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;
  if (!isFormData) headers["Content-Type"] = "application/json";

  const res = await fetch(`${API_BASE}${endpoint}`, {
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

// ─── Message listener ──────────────────────────────────────────────────────

chrome.runtime.onMessage.addListener(
  (message: ExtensionMessage, _sender, sendResponse) => {
    (async () => {
      switch (message.type) {
        case "GET_AUTH": {
          const result = await chrome.storage.local.get(["token", "user"]);
          sendResponse({
            token: result.token ?? null,
            user: result.user ?? null,
          });
          break;
        }

        case "SET_AUTH": {
          const { token, user } = message.payload as {
            token: string;
            user: unknown;
          };
          await setAuth(token, user);
          sendResponse({ ok: true });
          break;
        }

        case "CLEAR_AUTH": {
          await clearAuth();
          sendResponse({ ok: true });
          break;
        }

        case "API_REQUEST": {
          const { method, endpoint, body, isFormData } = (
            message as ApiRequestMessage
          ).payload;
          const result = await apiRequest(method, endpoint, body, isFormData);
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
