import { ApiResponseMessage, Campaign } from "../types";

async function request<T>(
  method: string,
  endpoint: string,
  body?: unknown,
  isFormData = false,
): Promise<T> {
  const response: ApiResponseMessage = await chrome.runtime.sendMessage({
    type: "API_REQUEST",
    payload: { method, endpoint, body, isFormData },
  });

  const { ok, status, data } = response.payload;

  if (!ok) {
    const message =
      (data as { message?: string })?.message ??
      `Request failed with status ${status}`;
    throw new Error(message);
  }

  return data as T;
}

// ─── Auth ──────────────────────────────────────────────────────────────────

export const authApi = {
  register: (name: string, email: string, password: string) =>
    request<{ accessToken: string; user: unknown }>("POST", "/auth/register", {
      name,
      email,
      password,
    }),

  login: (email: string, password: string) =>
    request<{ accessToken: string; user: unknown }>("POST", "/auth/login", {
      email,
      password,
    }),

  // Sends the refresh token in the body since httpOnly cookies
  // don't work reliably in extension service workers
  refresh: (refreshToken: string) =>
    request<{ accessToken: string }>("POST", "/auth/refresh", {
      refreshToken,
    }),

  logout: (refreshToken: string) =>
    request<void>("POST", "/auth/logout", { refreshToken }),

  me: () => request<unknown>("GET", "/auth/me"),
};

// ─── Accounts ─────────────────────────────────────────────────────────────

export const accountsApi = {
  list: () => request<unknown[]>("GET", "/accounts"),
  delete: (id: string) => request<unknown>("DELETE", `/accounts/${id}`),
  saveToken: (payload: {
    provider: string;
    email: string;
    accessToken: string;
    refreshToken: string;
    expiresAt: string;
  }) => request<unknown>("POST", "/accounts/token", payload),
};

// ─── Campaigns ────────────────────────────────────────────────────────────

export const campaignsApi = {
  list: (params?: { limit?: number; cursor?: string }) => {
    const query = new URLSearchParams();
    if (params?.limit) query.set("limit", String(params.limit));
    if (params?.cursor) query.set("cursor", params.cursor);
    return request<{
      data: Campaign[];
      nextCursor: string | null;
      hasMore: boolean;
    }>("GET", `/campaigns?${query}`);
  },

  get: (id: string) => request<unknown>("GET", `/campaigns/${id}`),

  create: (payload: {
    name: string;
    subjectTemplate: string;
    bodyTemplate: string;
    connectedAccountId: string;
  }) => request<unknown>("POST", "/campaigns", payload),

  update: (
    id: string,
    payload: Partial<{
      name: string;
      subjectTemplate: string;
      bodyTemplate: string;
    }>,
  ) => request<unknown>("PATCH", `/campaigns/${id}`, payload),

  delete: (id: string) => request<unknown>("DELETE", `/campaigns/${id}`),

  uploadRecipients: async (id: string, file: File) => {
    const base64 = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve((reader.result as string).split(",")[1]);
      reader.readAsDataURL(file);
    });

    return request<unknown>(
      "POST",
      `/campaigns/${id}/recipients`,
      { base64, filename: file.name },
      false, // not formData
    );
  },

  preview: (id: string) => request<unknown>("GET", `/campaigns/${id}/preview`),

  send: (id: string) => request<unknown>("POST", `/campaigns/${id}/send`),
};

// ─── Recipients ───────────────────────────────────────────────────────────

export const recipientsApi = {
  list: (campaignId: string, page = 1) =>
    request<unknown>("GET", `/campaigns/${campaignId}/recipients?page=${page}`),

  stats: (campaignId: string) =>
    request<unknown>("GET", `/campaigns/${campaignId}/recipients/stats`),
};
