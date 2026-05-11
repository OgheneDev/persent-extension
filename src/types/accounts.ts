import { planType } from ".";

export const PLAN_ACCOUNT_LIMITS: Record<planType, number> = {
  free: 1,
  pro: 1,
  growth: 10,
  founder: 5,
};

export interface TokenExchangeResponse {
  email: string;
  access_token: string;
  refresh_token: string;
  expiry_date: number;
}
