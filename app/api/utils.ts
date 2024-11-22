import { jwtDecrypt, base64url, jwtVerify, importSPKI, JWTPayload } from 'jose';
import { getMavenAGIClient } from '@/app';

export async function getAppSettings(
  orgFriendlyId: string,
  agentId: string
): Promise<AppSettings> {
  const client = getMavenAGIClient(orgFriendlyId, agentId);
  return (await client.appSettings.get()) as unknown as AppSettings;
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

    const { iat, exp, ...verifiedUserData } = verifiedPayload;

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