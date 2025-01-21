import {
  HANDOFF_AUTH_HEADER,
  ORGANIZATION_HEADER,
  AGENT_HEADER,
} from "@/app/constants/authentication";

export function generateHeaders(
  organizationId: string,
  agentId: string,
  handoffAuthToken: string | null,
): Record<string, string> {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    [ORGANIZATION_HEADER]: organizationId,
    [AGENT_HEADER]: agentId,
  };

  if (handoffAuthToken) {
    headers[HANDOFF_AUTH_HEADER] = handoffAuthToken;
  }

  return headers;
}
