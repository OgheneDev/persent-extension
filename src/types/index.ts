// ─── Auth ──────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface AuthState {
  token: string | null;
  user: User | null;
}

// ─── Accounts ─────────────────────────────────────────────────────────────

export type Provider = "gmail" | "outlook";

export interface ConnectedAccount {
  _id: string;
  email: string;
  provider: Provider;
  createdAt: string;
}

// ─── Campaigns ────────────────────────────────────────────────────────────

export type CampaignStatus = "draft" | "queued" | "sending" | "done" | "failed";

export interface Campaign {
  _id: string;
  name: string;
  subjectTemplate: string;
  bodyTemplate: string;
  status: CampaignStatus;
  totalRecipients: number;
  sentCount: number;
  failedCount: number;
  connectedAccountId: ConnectedAccount;
  createdAt: string;
}

export interface CampaignPreview {
  to: string;
  subject: string;
  html: string;
}

// ─── Recipients ───────────────────────────────────────────────────────────

export type RecipientStatus = "pending" | "sent" | "failed";

export interface Recipient {
  _id: string;
  email: string;
  status: RecipientStatus;
  error?: string;
  sentAt?: string;
}

export interface RecipientStats {
  total: number;
  pending: number;
  sent: number;
  failed: number;
}

// ─── Messaging ────────────────────────────────────────────────────────────

export type MessageType =
  | "API_REQUEST"
  | "API_RESPONSE"
  | "GET_AUTH"
  | "SET_AUTH"
  | "CLEAR_AUTH"
  | "TOGGLE_SIDEBAR"
  | "IDENTITY_AUTH"
  | "OPEN_TAB"
  | "SIDEBAR_READY";

export interface ExtensionMessage {
  type: MessageType;
  payload?: unknown;
}

export interface ApiRequestMessage extends ExtensionMessage {
  type: "API_REQUEST";
  payload: {
    method: string;
    endpoint: string;
    body?: unknown;
    isFormData?: boolean;
  };
}

export interface IdentityAuthMessage extends ExtensionMessage {
  type: "IDENTITY_AUTH";
  payload: { authUrl: string };
}

export interface ApiResponseMessage extends ExtensionMessage {
  type: "API_RESPONSE";
  payload: {
    ok: boolean;
    status: number;
    data: unknown;
  };
}
