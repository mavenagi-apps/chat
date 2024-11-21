import { type NextRequest, NextResponse } from 'next/server';
import { type MavenAGIClient, MavenAGI, MavenAGIError } from 'mavenagi';
import { nanoid } from 'nanoid';
import { getMavenAGIClient } from '@/app';

interface CreateOptions {
  orgFriendlyId: string;
  id: string;
  question: string;
  conversationId: string;
  initialize: boolean;
  userData: Record<string, string> | null;
}

async function createOrUpdateUser(
  client: MavenAGIClient,
  conversationId: string
) {
  return client.users.createOrUpdate({
    userId: {
      referenceId: `chat-anonymous-user-${conversationId}`,
    },
    identifiers: [],
    data: {},
  });
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
  } = (await req.json()) as CreateOptions;

  const client: MavenAGIClient = getMavenAGIClient(orgFriendlyId, id);

  if (initialize) {
    await createOrUpdateUser(client, conversationId);
    await initializeConversation(client, conversationId, userData);
  }

  try {
    const response = await client.conversation.askStream(conversationId, {
      userId: {
        referenceId: `chat-anonymous-user-${conversationId}`,
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
