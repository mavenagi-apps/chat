'use server';

import { base64url, SignJWT, EncryptJWT, importPKCS8 } from 'jose';
import { getAppSettings } from '@/app/api/server/utils';

// This envar and this entire action is only used for the demo page
// to demonstrate how the customer would sign and encrypt the user data
// before sending it to Maven.
const DEMO_SIGNING_PRIVATE_KEY = process.env.DEMO_SIGNING_PRIVATE_KEY;

async function importPrivateKey(privateKeyString: string) {
  try {
    return await importPKCS8(privateKeyString, 'ES256');
  } catch (error) {
    console.error('Error importing private key:', error);
    throw new Error('Failed to import private key');
  }
}

export async function generateSignedUserData(payload: any, orgFriendlyId: string, agentFriendlyId: string): Promise<string | null> {
  if (!DEMO_SIGNING_PRIVATE_KEY) {
    return null;
  }

  const privateKey = await importPrivateKey(DEMO_SIGNING_PRIVATE_KEY);

  const { encryptionSecret } = await getAppSettings(orgFriendlyId, agentFriendlyId);

  // Generate a secret for encryption
  const decodedEncryptionSecret = base64url.decode(
    encryptionSecret
  );

  // First, create and sign the JWT
  const signedJWT = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'ES256' })
    .setIssuedAt()
    .setExpirationTime('1d')
    .sign(privateKey);

  // Then, encrypt the signed JWT
  const encryptedJWT = await new EncryptJWT({ jwt: signedJWT })
    .setProtectedHeader({ alg: 'dir', enc: 'A128CBC-HS256' })
    .encrypt(decodedEncryptionSecret);

  return encryptedJWT;
}
