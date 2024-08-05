'use server'

import { MavenAGIClient } from "mavenagi";

export async function create() {
  "use server";

  const client = new MavenAGIClient({
    organizationId: "maveninternal",
    agentId: "help",
  });

  const sessionId = '123'
  const messageId = '123'
  const content = 'Hello, World!'

  const response = await client.conversation.ask(
    sessionId,
    {
      conversationMessageId: {
        referenceId: messageId,
      },
      text: content,
    }
  );

  console.log(response)

  return response;
}