import { type JWTPayload } from 'jose';

export const AUTHENTICATION_HEADER = 'X-Maven-Auth-Token';
export interface AuthJWTPayload extends JWTPayload {
  userId: string;
  conversationId: string;
}
