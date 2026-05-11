import {
  THROTTLE_DELAY_MIN_MS,
  THROTTLE_DELAY_MAX_MS,
  FLAT_DELAY_MS,
} from "../types/campaign-detail";

/**
 * Estimate total spread time in minutes given a recipient count.
 *
 * Mirrors the queue service logic:
 *  - < 10 recipients  → flat 30 s gap between sends
 *  - ≥ 10 recipients  → randomised delay; we use the midpoint of the
 *    Pro plan range (45–90 s) as a reasonable approximation.
 */
export function estimateSpreadMinutes(totalRecipients: number): number {
  if (totalRecipients <= 1) return 0;
  const gaps = totalRecipients - 1;
  const delayMs =
    totalRecipients < 10
      ? FLAT_DELAY_MS
      : (THROTTLE_DELAY_MIN_MS + THROTTLE_DELAY_MAX_MS) / 2;
  return Math.round((gaps * delayMs) / 60_000);
}

export function formatSpread(minutes: number): string {
  if (minutes < 1) return "under a minute";
  if (minutes < 60) return `~${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `~${h}h` : `~${h}h ${m}m`;
}
