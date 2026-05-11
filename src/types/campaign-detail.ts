export type Tab = "overview" | "preview" | "recipients";

/** Status values that mean the campaign is actively processing */
export const ACTIVE_STATUSES = new Set(["queued", "sending"]);

/** Polling interval while a campaign is active */
export const POLL_INTERVAL_MS = 5_000;

/** Throttle delay constants for email sending */
export const THROTTLE_DELAY_MIN_MS = 45_000;
export const THROTTLE_DELAY_MAX_MS = 90_000;
export const FLAT_DELAY_MS = 30_000;

export interface TabBtnProps {
  active: boolean;
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
}

export interface StatCardProps {
  label: string;
  value: number;
  color: string;
}

export interface SendingBannerProps {
  sent: number;
  total: number;
  progress: number;
  spreadMinutes: number;
  status: string;
}

export interface SpreadInfoBannerProps {
  total: number;
  spreadMinutes: number;
}
