import { type NextRequest, NextResponse } from 'next/server';
import SunshineConversationsClient from 'sunshine-conversations-client';
import { getAppSettings } from '@/app/api/zendesk/utils';

const defaultClient = SunshineConversationsClient.ApiClient.instance;
const basicAuth = defaultClient.authentications['basicAuth'];
basicAuth.username = process.env.SUNSHINE_APP_ID!;
basicAuth.password = process.env.SUNSHINE_API_KEY!;

const appApi = new SunshineConversationsClient.AppsApi();
const conversationApi = new SunshineConversationsClient.ConversationsApi();

type ZendeskChatUserData = {
  email: string;
  firstName: string;
  lastName: string;
  userAgent: string;
  screenResolution: string;
  subject: string;
};

type ZendeskRequest = {
  userData: ZendeskChatUserData;
  messages: any[];
  orgFriendlyId: string;
  agentId: string;
};

export async function POST(req: NextRequest) {
  const { userData, messages, orgFriendlyId, agentId } = await req.json() as ZendeskRequest;
  const { zendeskAppId } = await getAppSettings(orgFriendlyId, agentId) as AppSettings;

  try {
    // Create or retrieve a user
    const user = await appApi.createUser(zendeskAppId, {
      externalId: userData.email,
      profile: {
        givenName: userData.firstName,
        surname: userData.lastName,
        email: userData.email,
      },
    });

    // Create a new conversation
    const conversation = await conversationApi.createConversation(zendeskAppId, {
      type: 'personal',
      participants: [
        {
          userId: user.user._id,
          subscribeToEvents: true,
        },
      ],
      metadata: {
        orgFriendlyId,
        agentId,
        userAgent: userData.userAgent,
        screenResolution: userData.screenResolution,
        subject: userData.subject,
      },
    });

    // Send initial message if there's a subject
    if (userData.subject) {
      await conversationApi.postMessage(zendeskAppId, conversation.conversation._id, {
        author: { type: 'user', userId: user.user._id },
        type: 'text',
        text: userData.subject,
      });
    }

    return NextResponse.json({
      sessionId: conversation.conversation._id,
      userId: user.user._id,
    });
  } catch (error) {
    console.error('Error initializing Zendesk chat:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const sessionId = req.headers.get('X-ZENDESK-SESSION-ID');
  const orgFriendlyId = req.headers.get('X-ORGANIZATION-ID') as string;
  const agentId = req.headers.get('X-AGENT-ID') as string;
  const { zendeskAppId } = await getAppSettings(orgFriendlyId, agentId) as AppSettings;

  try {
    if (!sessionId) {
      return NextResponse.json('Missing session ID', { status: 401 });
    }

    await conversationApi.deleteConversation(zendeskAppId, sessionId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error ending Zendesk chat:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
