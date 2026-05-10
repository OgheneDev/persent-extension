import { ApiResponseMessage, Campaign, User } from "../types";

async function request<T>(
  method: string,
  endpoint: string,
  body?: unknown,
  isFormData = false,
  accessToken?: string | null,
): Promise<T> {
  const response: ApiResponseMessage = await chrome.runtime.sendMessage({
    type: "API_REQUEST",
    payload: { method, endpoint, body, isFormData, accessToken },
  });

  const { ok, status, data } = response.payload;

  if (!ok) {
    const errorData = data as {
      error?: { message?: string; code?: string };
      message?: string;
      code?: string;
    };
    const message =
      errorData?.error?.message ||
      errorData?.message ||
      `Request failed with status ${status}`;

    const error = new Error(message);
    (error as any).statusCode = status;
    (error as any).code = errorData?.error?.code ?? errorData?.code;

    throw error;
  }

  return data as T;
}

// ─── Auth (no token needed) ────────────────────────────────────────────────

export const authApi = {
  register: (name: string, email: string, password: string) =>
    request<{ accessToken: string; refreshToken: string; user: unknown }>(
      "POST",
      "/auth/register",
      { name, email, password },
    ),

  login: (email: string, password: string) =>
    request<{ accessToken: string; refreshToken: string; user: unknown }>(
      "POST",
      "/auth/login",
      { email, password },
    ),

  refresh: (refreshToken: string) =>
    request<{ accessToken: string }>("POST", "/auth/refresh", { refreshToken }),

  logout: (refreshToken: string) =>
    request<void>("POST", "/auth/logout", { refreshToken }),

  me: (accessToken: string) =>
    request<User>("GET", "/auth/me", undefined, false, accessToken),
};

// ─── Accounts ─────────────────────────────────────────────────────────────

export const accountsApi = {
  list: (accessToken: string) =>
    request<unknown[]>("GET", "/accounts", undefined, false, accessToken),

  delete: (id: string, accessToken: string) =>
    request<unknown>(
      "DELETE",
      `/accounts/${id}`,
      undefined,
      false,
      accessToken,
    ),

  saveToken: (
    payload: {
      provider: string;
      email: string;
      accessToken: string;
      refreshToken: string;
      expiresAt: string;
    },
    accessToken: string,
  ) => request<unknown>("POST", "/accounts/token", payload, false, accessToken),
};

// ─── Campaigns ────────────────────────────────────────────────────────────

export const campaignsApi = {
  list: (accessToken: string, params?: { limit?: number; cursor?: string }) => {
    const query = new URLSearchParams();
    if (params?.limit) query.set("limit", String(params.limit));
    if (params?.cursor) query.set("cursor", params.cursor);
    return request<{
      data: Campaign[];
      nextCursor: string | null;
      hasMore: boolean;
    }>("GET", `/campaigns?${query}`, undefined, false, accessToken);
  },

  get: (id: string, accessToken: string) =>
    request<unknown>("GET", `/campaigns/${id}`, undefined, false, accessToken),

  create: (
    payload: {
      name: string;
      subjectTemplate: string;
      bodyTemplate: string;
      connectedAccountId: string;
    },
    accessToken: string,
  ) => request<unknown>("POST", "/campaigns", payload, false, accessToken),

  update: (
    id: string,
    payload: Partial<{
      name: string;
      subjectTemplate: string;
      bodyTemplate: string;
    }>,
    accessToken: string,
  ) =>
    request<unknown>("PATCH", `/campaigns/${id}`, payload, false, accessToken),

  delete: (id: string, accessToken: string) =>
    request<unknown>(
      "DELETE",
      `/campaigns/${id}`,
      undefined,
      false,
      accessToken,
    ),

  uploadRecipients: async (id: string, file: File, accessToken: string) => {
    const base64 = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve((reader.result as string).split(",")[1]);
      reader.readAsDataURL(file);
    });

    return request<unknown>(
      "POST",
      `/campaigns/${id}/recipients`,
      { base64, filename: file.name },
      false,
      accessToken,
    );
  },

  preview: (id: string, accessToken: string) =>
    request<unknown>(
      "GET",
      `/campaigns/${id}/preview`,
      undefined,
      false,
      accessToken,
    ),

  send: (id: string, accessToken: string) =>
    request<unknown>(
      "POST",
      `/campaigns/${id}/send`,
      undefined,
      false,
      accessToken,
    ),
};

// ─── Recipients ───────────────────────────────────────────────────────────

export const recipientsApi = {
  list: (campaignId: string, accessToken: string, page = 1) =>
    request<unknown>(
      "GET",
      `/campaigns/${campaignId}/recipients?page=${page}`,
      undefined,
      false,
      accessToken,
    ),

  stats: (campaignId: string, accessToken: string) =>
    request<unknown>(
      "GET",
      `/campaigns/${campaignId}/recipients/stats`,
      undefined,
      false,
      accessToken,
    ),
};
