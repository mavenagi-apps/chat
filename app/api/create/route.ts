/**
 * API Route Handler for Chat Creation and Message Processing
 *
 * This file handles:
 * - Creating new chat conversations
 * - Processing incoming chat messages
 * - Managing user authentication and session state
 * - Streaming responses back to the client
 *
 * Key features:
 * - Supports both anonymous and authenticated users
 * - Handles encrypted user data
 * - Implements server-sent events (SSE) for streaming responses
 */

import { type NextRequest, NextResponse } from "next/server";
import { type MavenAGIClient, MavenAGI, MavenAGIError } from "mavenagi";
import { nanoid } from "nanoid";
import { getMavenAGIClient } from "@/app";
import {
  decryptAndVerifySignedUserData,
  generateAuthToken,
  verifyAuthToken,
  withAppSettings,
} from "@/app/api/server/utils";
import {
  AUTHENTICATION_HEADER,
  type AuthJWTPayload,
} from "@/app/constants/authentication";
interface CreateOptions {
  orgFriendlyId: string;
  id: string;
  question: string;
  conversationId: string;
  initialize: boolean;
  signedUserData: string | null;
}

async function createOrUpdateUser(
  client: MavenAGIClient,
  conversationId: string,
  decryptedSignedUserData: any | null,
) {
  const { email, phoneNumber, id, ...rest } = decryptedSignedUserData || {};
  // Authenticated users must have an id
  // Authenticated users must also have one of email/phoneNumber
  const isAnonymous = !id || (!email && !phoneNumber);

  if (isAnonymous) {
    return client.users.createOrUpdate({
      userId: {
        referenceId: `chat-anonymous-user-${conversationId}`,
      },
      identifiers: [],
      data: {},
    });
  } else {
    const identifiers: MavenAGI.AppUserIdentifier[] = [];
    const data: Record<string, MavenAGI.UserData> = {};
    Object.entries(rest).forEach(([key, value]) => {
      data[key] = {
        value: value as string,
        visibility: MavenAGI.VisibilityType.Visible,
      };
    });

    [
      [email, "EMAIL"],
      [phoneNumber, "PHONE_NUMBER"],
    ].forEach(([value, type]) => {
      if (value) {
        identifiers.push({ value: value.toLowerCase(), type });
      }
    });

    return client.users.createOrUpdate({
      userId: {
        referenceId: id,
      },
      identifiers,
      data,
    });
  }
}

async function initializeConversation(
  client: MavenAGIClient,
  conversationId: string,
) {
  const conversationInitializationPayload: MavenAGI.ConversationRequest = {
    conversationId: { referenceId: conversationId },
    messages: [],
    responseConfig: {
      capabilities: [
        MavenAGI.Capability.Markdown,
        MavenAGI.Capability.Forms,
        MavenAGI.Capability.ChartsHighchartsTs,
      ],
      isCopilot: false,
      responseLength: MavenAGI.ResponseLength.Medium,
    },
    metadata: {
      escalation_action_enabled: "true",
    },
  };

  return client.conversation.initialize(conversationInitializationPayload);
}

const generateDecryptedSignedUserData = async (
  signedUserData: string | null,
  settings: ParsedAppSettings,
) => {
  if (!signedUserData) {
    return null;
  }

  try {
    return await decryptAndVerifySignedUserData(signedUserData, settings);
  } catch (error) {
    console.log("Failed to decrypt signed user data:", error);
    return null;
  }
};

const generateAuthData = async (
  headers: Headers,
): Promise<AuthJWTPayload | null> => {
  const authToken = headers.get(AUTHENTICATION_HEADER);
  if (!authToken) {
    return null;
  }
  return await verifyAuthToken(authToken);
};

export async function POST(req: NextRequest) {
  return withAppSettings(
    req,
    async (req, settings, organizationId, agentId) => {
      const { question, signedUserData } = (await req.json()) as CreateOptions;
      const client: MavenAGIClient = getMavenAGIClient(organizationId, agentId);
      const decryptedSignedUserData: any | null =
        await generateDecryptedSignedUserData(signedUserData, settings);
      let { userId, conversationId } =
        (await generateAuthData(req.headers)) || {};
      if (!userId || !conversationId) {
        conversationId = nanoid() as string;
        const userResponse = await createOrUpdateUser(
          client,
          conversationId,
          decryptedSignedUserData,
        );
        userId = userResponse.userId.referenceId;
        await initializeConversation(client, conversationId);
      }

      try {
        const response = await client.conversation.askStream(conversationId, {
          userId: {
            referenceId: userId,
          },
          conversationMessageId: {
            referenceId: nanoid(),
          },
          text: question,
        });

        if (!response) {
          return NextResponse.json("No response from server", { status: 500 });
        }
        let isControllerClosed = false;

        const stream = new ReadableStream({
          async start(controller) {
            try {
              for await (const chunk of response) {
                if (isControllerClosed) break;

                try {
                  const chunkString = JSON.stringify(chunk);
                  controller.enqueue(
                    new TextEncoder().encode(`data: ${chunkString}\n\n`),
                  );
                } catch (err) {
                  if (
                    err instanceof TypeError &&
                    err.message.includes("Invalid state")
                  ) {
                    break;
                  }
                  console.log("Error in stream:", err);
                  throw err;
                }
              }

              controller.close();
            } catch (err) {
              console.error("Stream error:", err);
              controller.error(err);
            }
          },

          cancel() {
            isControllerClosed = true;
          },
        });

        const refreshedAuthToken = await generateAuthToken(
          userId,
          conversationId,
        );

        return new Response(stream, {
          headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            Connection: "keep-alive",
            [AUTHENTICATION_HEADER]: refreshedAuthToken,
          },
        });
      } catch (error) {
        console.error(error);
        if (error instanceof MavenAGIError) {
          return NextResponse.json(
            { error: error.body },
            { status: error.statusCode },
          );
        }
        return NextResponse.json(
          { error: "Error fetching response" },
          { status: 500 },
        );
      }
    },
  );
}

export const maxDuration = 900;
