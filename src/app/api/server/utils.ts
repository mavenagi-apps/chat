"use server";

import {
  jwtDecrypt,
  base64url,
  jwtVerify,
  importSPKI,
  type JWTPayload,
  SignJWT,
  importPKCS8,
} from "jose";
import { getMavenAGIClient } from "@/src/app";
import type { AuthJWTPayload } from "@/src/app/constants/authentication";
import type { NextRequest } from "next/server";
import {
  ORGANIZATION_HEADER,
  AGENT_HEADER,
  HANDOFF_AUTH_HEADER,
} from "@/src/app/constants/authentication";
import { adaptLegacySettings } from "@/src/lib/settings";

const CONVERSATIONS_API_PRIVATE_KEY = process.env.CONVERSATIONS_API_PRIVATE_KEY;
const CONVERSATIONS_API_PUBLIC_KEY = process.env.CONVERSATIONS_API_PUBLIC_KEY;

export async function getAppSettings(
  organizationId: string,
  agentId: string,
): Promise<ParsedAppSettings> {
  const client = getMavenAGIClient(organizationId, agentId);
  const legacySettings =
    (await client.appSettings.get()) as unknown as InterimAppSettings;
  const settings = adaptLegacySettings(legacySettings);

  if (settings.misc?.handoffConfiguration) {
    try {
      settings.misc.handoffConfiguration = JSON.parse(
        settings.misc.handoffConfiguration,
      );
    } catch (error) {
      console.error("Failed to parse handoff configuration:", error);
      settings.misc.handoffConfiguration = undefined;
    }
  }

  const handoffConfiguration = settings.misc
    ?.handoffConfiguration as unknown as HandoffConfiguration;
  if (handoffConfiguration?.type === "front") {
    handoffConfiguration.channelName ??= `${organizationId}-${agentId}`;
  }

  return settings as ParsedAppSettings;
}

/** @internal */
export async function verifyAuthToken(token: string): Promise<AuthJWTPayload> {
  if (!CONVERSATIONS_API_PUBLIC_KEY) {
    throw new Error("CONVERSATIONS_API_PUBLIC_KEY is not set");
  }

  const publicKey = await importSPKI(CONVERSATIONS_API_PUBLIC_KEY, "ES256");
  const { payload } = await jwtVerify<AuthJWTPayload>(token, publicKey);
  return payload;
}

export async function generateAuthToken(
  userId: string,
  conversationId: string,
): Promise<string> {
  if (!CONVERSATIONS_API_PRIVATE_KEY) {
    throw new Error("CONVERSATIONS_API_PRIVATE_KEY is not set");
  }

  const payload = {
    userId,
    conversationId,
  };

  const privateKey = await importPKCS8(CONVERSATIONS_API_PRIVATE_KEY, "ES256");

  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: "ES256" })
    .setIssuedAt()
    .setExpirationTime("1d")
    .sign(privateKey);
  return token;
}

export async function decryptAndVerifySignedUserData(
  encryptedJWT: string,
  settings: ParsedAppSettings,
): Promise<JWTPayload> {
  // 1. Get and validate settings
  const { security } = settings;
  validateSettings(security?.encryptionSecret, security?.jwtPublicKey);

  try {
    // 2. Decrypt the JWT
    const { jwt: decryptedJWT } = await decryptJWT(
      encryptedJWT,
      security.encryptionSecret!,
    );

    // 3. Verify the JWT signature
    const verifiedPayload = await verifyJWTSignature(
      decryptedJWT as string,
      security.jwtPublicKey!,
    );

    const { iat: _iat, exp: _exp, ...verifiedUserData } = verifiedPayload;

    return verifiedUserData;
  } catch (error) {
    console.error("JWT processing failed:", error);
    throw new Error("Failed to process JWT: " + (error as Error).message);
  }
}

function validateSettings(
  encryptionSecret?: string,
  jwtPublicKey?: string,
): void {
  if (!encryptionSecret) {
    throw new Error("Encryption secret not found");
  }
  if (!jwtPublicKey) {
    throw new Error("JWT public key not found");
  }
}

async function decryptJWT(
  encryptedJWT: string,
  encryptionSecret: string,
): Promise<JWTPayload> {
  const secret = base64url.decode(encryptionSecret);
  const { payload } = await jwtDecrypt(encryptedJWT, secret);
  return payload;
}

async function verifyJWTSignature(
  jwt: string,
  publicKeyString: string,
): Promise<JWTPayload> {
  const publicKey = await importSPKI(publicKeyString, "ES256");
  const { payload } = await jwtVerify(jwt, publicKey);
  return payload;
}

export type RouteHandlerWithSettings<T> = (
  req: NextRequest,
  settings: ParsedAppSettings,
  organizationId: string,
  agentId: string,
) => Promise<T>;

export async function withAppSettings<T>(
  req: NextRequest,
  handler: RouteHandlerWithSettings<T>,
): Promise<T> {
  const organizationId = req.headers.get(ORGANIZATION_HEADER);
  const agentId = req.headers.get(AGENT_HEADER);

  if (!organizationId || !agentId) {
    throw new Error(
      "Missing required headers: X-Organization-Id or X-Agent-Id",
    );
  }

  const settings = await getAppSettings(organizationId, agentId);

  if (!settings) {
    throw new Error("Could not retrieve app settings");
  }

  return handler(req, settings, organizationId, agentId);
}

export type RouteHandlerWithAuth<T> = (
  req: NextRequest,
  settings: ParsedAppSettings,
  organizationId: string,
  agentId: string,
  userId: string,
  conversationId: string,
  authPayload: AuthJWTPayload,
) => Promise<T>;

export async function withApiAuthentication<T>(
  req: NextRequest,
  settings: ParsedAppSettings,
  organizationId: string,
  agentId: string,
  handler: RouteHandlerWithAuth<T>,
): Promise<T> {
  const apiToken = req.headers.get(HANDOFF_AUTH_HEADER);

  if (!apiToken) {
    throw new Error("Missing API token");
  }

  if (!settings?.misc.handoffConfiguration?.apiSecret) {
    throw new Error("API secret not configured");
  }

  let userId: string;
  let conversationId: string;
  let authPayload: AuthJWTPayload;
  try {
    const encoder = new TextEncoder();
    const secret = encoder.encode(settings.misc.handoffConfiguration.apiSecret);
    const { payload } = await jwtVerify(apiToken, secret);
    userId = payload.userId as string;
    conversationId = payload.conversationId as string;
    authPayload = payload;
  } catch (error) {
    throw new Error("Invalid API token", { cause: error });
  }

  return handler(
    req,
    settings,
    organizationId,
    agentId,
    userId,
    conversationId,
    authPayload,
  );
}

export type RouteHandlerWithSettingsAndAuth<T> = (
  req: NextRequest,
  settings: ParsedAppSettings,
  organizationId: string,
  agentId: string,
  userId: string,
  conversationId: string,
  authPayload: AuthJWTPayload,
) => Promise<T>;

export async function withSettingsAndAuthentication<T>(
  req: NextRequest,
  handler: RouteHandlerWithSettingsAndAuth<T>,
): Promise<T> {
  return withAppSettings(
    req,
    async (req, settings, organizationId, agentId) => {
      return withApiAuthentication(
        req,
        settings,
        organizationId,
        agentId,
        async (
          req,
          settings,
          organizationId,
          agentId,
          userId,
          conversationId,
          authPayload,
        ) => {
          return handler(
            req,
            settings,
            organizationId,
            agentId,
            userId,
            conversationId,
            authPayload,
          );
        },
      );
    },
  );
}
