import { getMavenAGIClient } from "@/app";

export const SALESFORCE_ALLOWED_MESSAGE_TYPES = [
  // 'ChatRequestSuccess',
  // 'ChatEstablished',
  // 'TransferToButtonInitiated',
  // 'ChatEstablished',
  "ChatTransferred",
  "QueueUpdate",
  "AgentTyping",
  "AgentNotTyping",
  "ChatMessage",
  "ChatEnded",
];
export const SALESFORCE_API_BASE_HEADERS = {
  "X-LIVEAGENT-API-VERSION": "34",
  "Access-Control-Allow-Origin": "*",
};

export async function sendChatMessage(
  text: string,
  affinityToken: string,
  sessionKey: string,
  url: string,
) {
  const body = JSON.stringify({
    text,
  });

  try {
    const response = await fetch(url + "/chat/rest/Chasitor/ChatMessage", {
      method: "POST",
      headers: {
        ...SALESFORCE_API_BASE_HEADERS,
        "X-LIVEAGENT-AFFINITY": affinityToken,
        "X-LIVEAGENT-SESSION-KEY": sessionKey,
        "Content-Type": "application/json",
      },
      body,
    });

    if (!response.ok) {
      throw new Error("Failed to send chat message");
    }

    return response;
  } catch (error) {
    console.error("Failed to send chat message:", error);
    throw error;
  }
}

export async function getAppSettings(
  orgFriendlyId: string,
  agentId: string,
): Promise<AppSettings> {
  const client = getMavenAGIClient(orgFriendlyId, agentId);
  return (await client.appSettings.get()) as unknown as AppSettings;
}
