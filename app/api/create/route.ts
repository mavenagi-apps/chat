import { type NextRequest, NextResponse } from "next/server";
import { type MavenAGIClient, MavenAGI, MavenAGIError } from "mavenagi";
import { nanoid } from "nanoid";
import { getMavenAGIClient } from "@/app";

interface CreateOptions {
  orgFriendlyId: string;
  id: string;
  question: string;
  conversationId: string;
  initialize: boolean;
  unverifiedUserInfo: Record<string, string>;
}

async function createOrUpdateUser(
  client: MavenAGIClient,
  conversationId: string,
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
  userData: Record<string, string>,
) {
  const conversationInitializationPayload = {
    conversationId: { referenceId: conversationId },
    messages: [],
    responseConfig: {
      capabilities: [MavenAGI.Capability.Markdown],
      isCopilot: false,
      responseLength: MavenAGI.ResponseLength.Medium,
    },
  } as MavenAGI.ConversationRequest;

  if (userData.firstName) {
    conversationInitializationPayload.messages.push({
      conversationMessageId: {
        referenceId: nanoid(),
      },
      userId: { referenceId: "system" },
      text: `Customer's Name: ${[userData.firstName, userData.lastName].join(" ")}, Customer's Email: ${userData.email}, Business Name: ${userData.businessName}, Customer's ID: ${userData.userId}`,
      userMessageType: "EXTERNAL_SYSTEM",
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
    unverifiedUserInfo,
  } = (await req.json()) as CreateOptions;

  const client: MavenAGIClient = getMavenAGIClient(orgFriendlyId, id);

  if (initialize) {
    await createOrUpdateUser(client, conversationId);
    await initializeConversation(client, conversationId, unverifiedUserInfo);
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
      return NextResponse.json("No response from server", { status: 500 });
    }

    console.log(response);
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of response) {
            // Convert the chunk to a string (assuming it's an object)
            const chunkString = JSON.stringify(chunk);

            // Send the chunk to the client as a data event
            controller.enqueue(
              new TextEncoder().encode(`data: ${chunkString}\n\n`),
            );

            // Log the chunk for debugging purposes
            console.log(chunk);
          }

          // End the stream when done
          controller.close();
        } catch (err) {
          console.error("Stream error:", err);
          controller.error(err);
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.log(error);
    if (error instanceof MavenAGIError) {
      return NextResponse.json(error.body, { status: error.statusCode });
    }
    return NextResponse.json("Error fetching response", { status: 500 });
  }
}

export const maxDuration = 900;
