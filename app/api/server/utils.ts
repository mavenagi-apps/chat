'use server';

import { jwtDecrypt, base64url, jwtVerify, importSPKI, type JWTPayload, SignJWT, importPKCS8 } from 'jose';
import { getMavenAGIClient } from '@/app';
import type { AuthJWTPayload } from '@/app/constants/authentication';
const CONVERSATIONS_API_PRIVATE_KEY = process.env.CONVERSATIONS_API_PRIVATE_KEY;
const CONVERSATIONS_API_PUBLIC_KEY = process.env.CONVERSATIONS_API_PUBLIC_KEY;

export async function getAppSettings(
  orgFriendlyId: string,
  agentId: string
): Promise<AppSettings> {
  const client = getMavenAGIClient(orgFriendlyId, agentId);
  return (await client.appSettings.get()) as unknown as AppSettings;
}

/** @internal */
export async function verifyAuthToken(token: string): Promise<AuthJWTPayload> {
  if (!CONVERSATIONS_API_PUBLIC_KEY) {
    throw new Error('CONVERSATIONS_API_PUBLIC_KEY is not set');
  }

  const publicKey = await importSPKI(CONVERSATIONS_API_PUBLIC_KEY, 'ES256');
  const { payload } = await jwtVerify<AuthJWTPayload>(token, publicKey);
  return payload;
}

export async function generateAuthToken(userId: string, conversationId: string): Promise<string> {
  if (!CONVERSATIONS_API_PRIVATE_KEY) {
    throw new Error('CONVERSATIONS_API_PRIVATE_KEY is not set');
  }

  const payload = {
    userId,
    conversationId,
  };

  const privateKey = await importPKCS8(CONVERSATIONS_API_PRIVATE_KEY, 'ES256');

  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'ES256' })
    .setIssuedAt()
    .setExpirationTime('1d')
    .sign(privateKey);
  return token;
}

export async function decryptAndVerifySignedUserData(
  encryptedJWT: string,
  orgFriendlyId: string,
  agentId: string
): Promise<JWTPayload> {
  // 1. Get and validate settings
  const { encryptionSecret, jwtPublicKey } = await getAppSettings(
    orgFriendlyId,
    agentId
  );
  validateSettings(encryptionSecret, jwtPublicKey);

  try {
    // 2. Decrypt the JWT
    const { jwt: decryptedJWT } = await decryptJWT(
      encryptedJWT,
      encryptionSecret
    );

    // 3. Verify the JWT signature
    const verifiedPayload = await verifyJWTSignature(
      decryptedJWT as string,
      jwtPublicKey
    );

    const { iat: _iat, exp: _exp, ...verifiedUserData } = verifiedPayload;

    return verifiedUserData;
  } catch (error) {
    console.error('JWT processing failed:', error);
    throw new Error('Failed to process JWT: ' + (error as Error).message);
  }
}

function validateSettings(encryptionSecret?: string, jwtPublicKey?: string): void {
  if (!encryptionSecret) {
    throw new Error('Encryption secret not found');
  }
  if (!jwtPublicKey) {
    throw new Error('JWT public key not found');
  }
}

async function decryptJWT(
  encryptedJWT: string,
  encryptionSecret: string
): Promise<JWTPayload> {
  const secret = base64url.decode(encryptionSecret);
  const { payload } = await jwtDecrypt(encryptedJWT, secret);
  return payload;
}

async function verifyJWTSignature(jwt: string, publicKeyString: string): Promise<JWTPayload> {
  const publicKey = await importSPKI(publicKeyString, 'ES256');
  const { payload } = await jwtVerify(jwt, publicKey);
  return payload;
}