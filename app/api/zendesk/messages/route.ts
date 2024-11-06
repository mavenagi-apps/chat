import { type NextRequest, NextResponse } from 'next/server';
import { getSunshineConversationsClient, postMessagesToZendeskConversation } from '@/app/api/zendesk/utils';

export async function POST(request: NextRequest) {
  const { orgFriendlyId, agentId, conversationId, userId, message } =
    await request.json();

  const [SunshineConversationsClient, zendeskConversationsAppId] =
    await getSunshineConversationsClient(orgFriendlyId, agentId);

  await postMessagesToZendeskConversation(
    SunshineConversationsClient,
    conversationId,
    userId,
    zendeskConversationsAppId,
    [{
      author: {
        type: 'user',
      },
      content: {
        type: 'text',
        text: message,
      },
    }]
  );

  return NextResponse.json({ success: true });
}
