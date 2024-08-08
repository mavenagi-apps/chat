'use server';

import { MavenAGIClient } from 'mavenagi';
import { nanoid } from 'nanoid';

export async function create({
  orgFriendlyId,
  id,
  question,
  conversationId,
}: {
  orgFriendlyId: string;
  id: string;
  question: string;
  conversationId: string;
}) {
  'use server';

  const client = new MavenAGIClient({organizationId: orgFriendlyId, agentId: id});

  // Replace with real Tripadvisor user data
  const userId = 'tripadvisor-user-123';
    const userToken = 'triptoken123';
    const userData = {
      user_email: {
        data: {
          email: 'someemail@gmail.com',
        },
      },
      user_profile_information: {
        data: {
          legal_first_name: 'John',
          preferred_name: 'Johnny',
        }
      }
    };

  const init = await client.conversation.initialize({
    conversationId: {
      referenceId: conversationId,
    },
    messages: [
      {
        conversationMessageId: {
          referenceId: crypto.randomUUID(),
        },
        text: `Today's date ${new Date().toLocaleDateString()}`,
        userMessageType: 'EXTERNAL_SYSTEM',
      },
    ],
    context: {
      metadata: {
        userId,
        userToken,
      },
      createdBy: {
        email: userData.user_email.data.email,
        name:
            userData.user_profile_information.data.preferred_name ||
            userData.user_profile_information.data.legal_first_name,
      },
    },
    responseConfig: {
      responseLength: 'SHORT',
    },
  });

  return await client.conversation.ask(conversationId, {
    conversationMessageId: {
      referenceId: nanoid(),
    },
    text: question,
  });

}
