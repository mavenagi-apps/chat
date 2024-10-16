import { NextApiRequest, NextApiResponse } from 'next';
import SunshineConversationsClient from 'sunshine-conversations-client';

const defaultClient = SunshineConversationsClient.ApiClient.instance;
const basicAuth = defaultClient.authentications['basicAuth'];
basicAuth.username = process.env.SUNSHINE_APP_ID!;
basicAuth.password = process.env.SUNSHINE_API_KEY!;

const appApi = new SunshineConversationsClient.AppsApi();
const conversationApi = new SunshineConversationsClient.ConversationsApi();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  switch (method) {
    case 'POST':
      try {
        const { userData, orgFriendlyId, agentId } = req.body;

        // Create or retrieve a user
        const user = await appApi.createUser(process.env.SUNSHINE_APP_ID!, {
          externalId: userData.email,
          profile: {
            givenName: userData.firstName,
            surname: userData.lastName,
            email: userData.email,
          },
        });

        // Create a new conversation
        const conversation = await conversationApi.createConversation(process.env.SUNSHINE_APP_ID!, {
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
          },
        });

        res.status(200).json({
          sessionId: conversation.conversation._id,
          userId: user.user._id,
        });
      } catch (error) {
        console.error('Error initializing Zendesk chat:', error);
        res.status(500).json({ error: 'Failed to initialize chat' });
      }
      break;

    case 'DELETE':
      try {
        const { sessionId } = req.headers;
        await conversationApi.deleteConversation(process.env.SUNSHINE_APP_ID!, sessionId as string);
        res.status(200).json({ message: 'Chat session ended successfully' });
      } catch (error) {
        console.error('Error ending Zendesk chat:', error);
        res.status(500).json({ error: 'Failed to end chat session' });
      }
      break;

    default:
      res.setHeader('Allow', ['POST', 'DELETE']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
