import { NextApiRequest, NextApiResponse } from 'next';
import SunshineConversationsClient from 'sunshine-conversations-client';

const defaultClient = SunshineConversationsClient.ApiClient.instance;
const basicAuth = defaultClient.authentications['basicAuth'];
basicAuth.username = process.env.SUNSHINE_APP_ID!;
basicAuth.password = process.env.SUNSHINE_API_KEY!;

const conversationApi = new SunshineConversationsClient.ConversationsApi();
const messageApi = new SunshineConversationsClient.MessagesApi();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  switch (method) {
    case 'GET':
      try {
        const { sessionId } = req.headers;
        const { ack } = req.query;

        const messages = await messageApi.listMessages(
          process.env.SUNSHINE_APP_ID!,
          sessionId as string,
          { after: ack as string }
        );

        res.status(200).json({
          messages: messages.messages.map((message: any) => ({
            id: message._id,
            type: message.type,
            text: message.text,
            author: {
              type: message.author.type,
              userId: message.author.userId,
            },
            createdAt: message.createdAt,
          })),
          sequence: messages.meta.afterCursor,
        });
      } catch (error) {
        console.error('Error fetching Zendesk messages:', error);
        res.status(500).json({ error: 'Failed to fetch messages' });
      }
      break;

    case 'POST':
      try {
        const { sessionId } = req.headers;
        const { text, userId } = req.body;

        await messageApi.postMessage(process.env.SUNSHINE_APP_ID!, sessionId as string, {
          author: { type: 'user', userId },
          type: 'text',
          text,
        });

        res.status(200).json({ message: 'Message sent successfully' });
      } catch (error) {
        console.error('Error sending Zendesk message:', error);
        res.status(500).json({ error: 'Failed to send message' });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
