import { type NextRequest, NextResponse } from 'next/server';
import { type MavenAGIClient, MavenAGI, MavenAGIError } from 'mavenagi';
import { nanoid } from 'nanoid';
import { getMavenAGIClient } from '@/app';
import { decryptAndVerifySignedUserData } from '@/app/api/utils';
import { AUTHENTICATION_HEADER } from '@/app/constants/authentication';
interface CreateOptions {
  orgFriendlyId: string;
  id: string;
  question: string;
  conversationId: string;
  initialize: boolean;
  userData: Record<string, string> | null;
  signedUserData: string | null;
}

async function createOrUpdateUser(
  client: MavenAGIClient,
  conversationId: string,
  decryptedSignedUserData: any | null
) {
  const { email, phoneNumber, ...rest } = decryptedSignedUserData || {};
  const isAnonymous = !email && !phoneNumber;

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

    [[email, 'EMAIL'], [phoneNumber, 'PHONE_NUMBER']].forEach(([value, type]) => {
      if (value) {
        identifiers.push({ value: value.toLowerCase(), type });
      }
    });

    return client.users.createOrUpdate({
      userId: {
        referenceId: `chat-authenticated-user-${conversationId}`,
      },
      identifiers,
      data,
    });
  }
}

async function initializeConversation(
  client: MavenAGIClient,
  conversationId: string,
  userData: Record<string, string> | null
) {
  const conversationInitializationPayload = {
    conversationId: { referenceId: conversationId },
    messages: [],
    responseConfig: {
      capabilities: [MavenAGI.Capability.Markdown],
      isCopilot: false,
      responseLength: MavenAGI.ResponseLength.Medium,
    },
    metadata: {
      escalation_action_enabled: 'true',
    },
  } as MavenAGI.ConversationRequest;

  if (userData) {
    conversationInitializationPayload.messages.push({
      conversationMessageId: {
        referenceId: nanoid(),
      },
      userId: { referenceId: 'system' },
      text: Object.keys(userData).map(key => `${key}: ${userData[key]}`).join('\n'),
      userMessageType: 'EXTERNAL_SYSTEM',
    });
  }

  return client.conversation.initialize(conversationInitializationPayload);
}

export async function POST(req: NextRequest) {
  const {
    orgFriendlyId,
    id,
    initialize,
    question,
    conversationId,
    userData,
    signedUserData,
  } = (await req.json()) as CreateOptions;

  const client: MavenAGIClient = getMavenAGIClient(orgFriendlyId, id);
  let decryptedSignedUserData: any | null = null;
  try {
    if (signedUserData) {
      decryptedSignedUserData = await decryptAndVerifySignedUserData(signedUserData, orgFriendlyId, id);
    }
  } catch (error) {
    console.log('Failed to decrypt signed user data:', error);
  }

  let userId: string | null = null;

  if (initialize) {
    const { userId: { referenceId } } = await createOrUpdateUser(client, conversationId, decryptedSignedUserData);
    userId = referenceId;
    await initializeConversation(client, conversationId, userData);
  } else {
    // get user id from headers
    userId = req.headers.get(AUTHENTICATION_HEADER);
  }

  if (!userId) {
    return NextResponse.json('User ID not found', { status: 400 });
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
      return NextResponse.json('No response from server', { status: 500 });
    }

    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of response) {
            // Convert the chunk to a string (assuming it's an object)
            const chunkString = JSON.stringify(chunk);

            // Send the chunk to the client as a data event
            controller.enqueue(
              new TextEncoder().encode(`data: ${chunkString}\n\n`)
            );
          }

          // End the stream when done
          controller.close();
        } catch (err) {
          console.error('Stream error:', err);
          controller.error(err);
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
        [AUTHENTICATION_HEADER]: userId,
      },
    });
  } catch (error) {
    console.error(error);
    if (error instanceof MavenAGIError) {
      return NextResponse.json(error.body, { status: error.statusCode });
    }
    return NextResponse.json('Error fetching response', { status: 500 });
  }
}

export const maxDuration = 900;
