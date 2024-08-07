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

  const client = new MavenAGIClient({
    organizationId: orgFriendlyId,
    agentId: id,
  });

  const response = await client.conversation.ask(conversationId, {
    conversationMessageId: {
      referenceId: nanoid(),
    },
    text: question,
  });

  console.log(response);

  return response;
}
