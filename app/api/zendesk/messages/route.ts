import { type NextRequest, NextResponse } from 'next/server';
import {
  getSunshineConversationsClient,
  postMessagesToZendeskConversation,
} from '@/app/api/zendesk/utils';
import { withSettingsAndAuthentication } from '@/app/api/server/utils';
import redisClient from '@/app/api/server/lib/redis';

export async function POST(request: NextRequest) {
  return withSettingsAndAuthentication(request, async (req, settings, _orgId, _agentId, userId, conversationId) => {
    const { message } = await req.json();

    if (!settings.handoffConfiguration) {
      throw new Error('Handoff configuration not found');
    }

    const [SunshineConversationsClient, zendeskConversationsAppId] =
      await getSunshineConversationsClient(settings.handoffConfiguration);

    await postMessagesToZendeskConversation(
      SunshineConversationsClient,
      conversationId,
      userId,
      zendeskConversationsAppId,
      [
        {
          author: {
            type: 'user',
          },
          content: {
            type: 'text',
            text: message,
          },
        },
      ]
    );

    return NextResponse.json({ success: true });
  });
}

export async function GET(request: NextRequest) {
  return withSettingsAndAuthentication(
    request,
    async (_req, _settings, _organizationId, _agentId, _userId, conversationId) => {
      const encoder = new TextEncoder();
      const pattern = `zendesk:${conversationId}:*`;
      const stream = new ReadableStream({
        async start(controller) {
          try {
            if (!redisClient.isOpen) {
              await redisClient.connect();
            }

            await redisClient.pSubscribe(pattern, (message, channel) => {
              try {
                const parsedMessage = JSON.parse(message);
                controller.enqueue(
                  encoder.encode(
                    `data: ${JSON.stringify({ message: parsedMessage, channel })}\n\n`
                  )
                );
              } catch (error) {
                console.error('Error processing subscription message:', error);
              }
            });
          } catch (error) {
            console.error('Error streaming messages:', error);
            controller.error(error);
          }
        },
        cancel() {
          redisClient.pUnsubscribe(pattern).catch(console.error);
        },
      });

      return new Response(stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          Connection: 'keep-alive',
        },
      });
    }
  );
}

export const maxDuration = 900;