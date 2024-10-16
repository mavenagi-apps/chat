import type { NextRequest } from 'next/server';
import SunshineConversationsClient from 'sunshine-conversations-client';
import { getAppSettings } from '@/app/api/zendesk/utils';

const defaultClient = SunshineConversationsClient.ApiClient.instance;
const basicAuth = defaultClient.authentications['basicAuth'];
basicAuth.username = process.env.SUNSHINE_APP_ID!;
basicAuth.password = process.env.SUNSHINE_API_KEY!;

const conversationApi = new SunshineConversationsClient.ConversationsApi();

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const [ack, orgFriendlyId, agentId] = [
    searchParams.get('ack') || '',
    searchParams.get('orgFriendlyId') as string,
    searchParams.get('agentId') as string,
  ];

  const sessionId = req.headers.get('X-ZENDESK-SESSION-ID');

  if (!sessionId) {
    return Response.json('Missing session ID', { status: 401 });
  }

  const { zendeskAppId } = await getAppSettings(orgFriendlyId, agentId) as AppSettings;

  try {
    const messages = await conversationApi.listMessages(zendeskAppId, sessionId, { after: ack });

    const formattedMessages = messages.messages.map((message: any) => ({
      id: message._id,
      type: message.type,
      text: message.text,
      author: {
        type: message.author.type,
        userId: message.author.userId,
      },
      createdAt: message.createdAt,
    }));

    return Response.json({
      messages: formattedMessages,
      sequence: messages.meta.afterCursor,
    });
  } catch (error) {
    console.error('Error fetching Zendesk messages:', error);
    return Response.json('Failed to fetch messages', { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const { text, userId, orgFriendlyId, agentId } = await req.json();
  const { zendeskAppId } = await getAppSettings(orgFriendlyId, agentId) as AppSettings;
  const sessionId = req.headers.get('X-ZENDESK-SESSION-ID');

  if (!sessionId) {
    return Response.json('Missing session ID', { status: 401 });
  }

  try {
    await conversationApi.postMessage(zendeskAppId, sessionId, {
      author: { type: 'user', userId },
      type: 'text',
      text,
    });
    return Response.json({ message: 'Message sent successfully' });
  } catch (error) {
    console.error('Error sending Zendesk message:', error);
    return Response.json('Failed to send message', { status: 500 });
  }
}

export const maxDuration = 300;
