export interface FieldProps {
  label: string;
  aside?: React.ReactNode;
  children: React.ReactNode;
}

export interface CampaignFormData {
  name: string;
  connectedAccountId: string;
  subjectTemplate: string;
  bodyTemplate: string;
}

export const PERSONALIZATION_TAGS = {
  subject: ["{{first_name}}", "{{company}}"],
  body: ["{{first_name}}", "{{company}}", "{{role}}"],
} as const;
