'use server'

import { MavenAGIClient } from "mavenagi";
import { nanoid } from "nanoid";

export async function create({
  orgFriendlyId,
  id,
  question,
  ticketId,
}:{
  orgFriendlyId: string,
  id: string,
  question: string,
  ticketId: string,
}) {
  "use server";

  const client = new MavenAGIClient({
    organizationId: orgFriendlyId,
    agentId: id,
  });

  const response = await client.conversation.ask(ticketId, {
    conversationMessageId: {
      referenceId: nanoid(),
    },
    text: question,
  });

  console.log(response)

  return response;
}
