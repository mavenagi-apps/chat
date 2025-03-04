import { type JWTPayload } from "jose";

export const AUTHENTICATION_HEADER = "X-Maven-Auth-Token";
export interface AuthJWTPayload extends JWTPayload {
  userId?: string;
  conversationId?: string;
  sessionId?: string;
  sessionKey?: string;
  affinityToken?: string;
}

export const HANDOFF_AUTH_HEADER = "X-Handoff-Auth-Token";
export const ORGANIZATION_HEADER = "X-Organization-Id";
export const AGENT_HEADER = "X-Agent-Id";
