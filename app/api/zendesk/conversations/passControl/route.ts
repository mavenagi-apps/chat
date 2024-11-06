import { type NextRequest, NextResponse } from 'next/server';
import { getSunshineConversationsClient } from '@/app/api/zendesk/utils';
import type SunshineConversationsClientModule from 'sunshine-conversations-client';

const passControlToAgent = async (
  SunshineConversationsClient: typeof SunshineConversationsClientModule,
  conversationId: string,
  appId: string
) => {
  const apiInstance = new SunshineConversationsClient.SwitchboardActionsApi();
  await apiInstance.passControl(appId, conversationId, {
    switchboardIntegration: 'next',
  });
};

export async function POST(request: NextRequest) {
  const { orgFriendlyId, agentId, conversationId } = await request.json();
  const [SunshineConversationsClient, zendeskConversationsAppId] =
    await getSunshineConversationsClient(orgFriendlyId, agentId);
  await passControlToAgent(SunshineConversationsClient, conversationId, zendeskConversationsAppId);

  return NextResponse.json({ success: true });
}
