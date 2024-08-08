'use server';

import { MavenAGIClient } from 'mavenagi';
import { nanoid } from 'nanoid';
import {getMavenAGIClient} from "@/app/index";



// Function to fetch user data using the userToken
async function fetchUserData(userToken: string) {
  // Replace with actual API call
  return {
    user_email: {
      data: {
        email: 'someemail@gmail.com',
      },
    },
    user_profile_information: {
      data: {
        legal_first_name: 'John',
        preferred_name: 'Johnny',
      },
    },
  };
}

export async function create({
  orgFriendlyId,
  id,
  question,
  conversationId,
  initialize
}: {
  orgFriendlyId: string;
  id: string;
  question: string;
  conversationId: string;
  initialize: boolean;
}) {
  'use server';

  const client: MavenAGIClient = getMavenAGIClient(orgFriendlyId, id);

  // Replace with real Tripadvisor user data
  const userId = 'tripadvisor-user-123';
  const userToken = 'triptoken123';
  const userData = await fetchUserData(userToken);

  if (initialize) {
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
    }

  return await client.conversation.ask(conversationId, {
    conversationMessageId: {
      referenceId: nanoid(),
    },
    text: question,
  });

}
