import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSettings } from "@/app/providers/SettingsProvider";
import { useParams } from "next/dist/client/components/navigation";
import { useAuth } from "@/app/providers/AuthProvider";
import {
  HANDOFF_AUTH_HEADER,
  ORGANIZATION_HEADER,
  AGENT_HEADER,
} from "@/app/constants/authentication";
import {
  // type ZendeskChatMessage,
  type Message,
  isBotMessage,
  isChatUserMessage,
  type ZendeskWebhookMessage,
  type ChatEstablishedMessage,
  type UserChatMessage,
  type ChatEndedMessage,
  type HandoffChatMessage,
} from "@/types";
import { HandoffStatus } from "@/app/constants/handoff";

const HANDOFF_RECONNECT_INTERVAL = 500;

type ChatEvent = {
  message: ZendeskWebhookMessage;
  channel: string;
};

type HandoffProps = {
  messages: Message[];
  mavenConversationId: string;
};

type Params = {
  orgFriendlyId: string;
  id: string;
};

export function useHandoff({ messages, mavenConversationId }: HandoffProps) {
  const { signedUserData } = useAuth();
  const { orgFriendlyId, id: agentId } = useParams<Params>();
  const { handoffConfiguration } = useSettings();
  const handoffTypeRef = useRef<HandoffConfiguration["type"] | null>(
    handoffConfiguration?.type ?? null,
  );
  const [handoffError, _setHandoffError] = useState<string | null>(null);
  const [handoffChatEvents, setHandoffChatEvents] = useState<
    (
      | ZendeskWebhookMessage
      | ChatEstablishedMessage
      | UserChatMessage
      | ChatEndedMessage
    )[]
  >([]);
  const [isConnected, setIsConnected] = useState(false);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const [handoffAuthToken, setHandoffAuthToken] = useState<string | null>(null);
  const [agentName, setAgentName] = useState<string | null>(null);

  const [handoffStatus, setHandoffStatus] = useState<HandoffStatus>(
    HandoffStatus.NOT_INITIALIZED,
  );
  const handoffStatusRef = useRef<HandoffStatus>(handoffStatus);

  const [abortController, setAbortController] = useState(new AbortController());

  const resetAbortController = useCallback(() => {
    abortController.abort();
    const newAbortController = new AbortController();
    setAbortController(newAbortController);
    return newAbortController;
  }, [abortController]);

  const generatedHeaders: HeadersInit = useMemo(() => {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      [ORGANIZATION_HEADER]: orgFriendlyId,
      [AGENT_HEADER]: agentId,
    };

    if (handoffAuthToken) {
      headers[HANDOFF_AUTH_HEADER] = handoffAuthToken;
    }

    return headers;
  }, [handoffAuthToken, orgFriendlyId, agentId]);

  const handoffMessages: HandoffChatMessage[] = useMemo(() => {
    switch (handoffTypeRef.current) {
      case "zendesk":
        return messages
          .filter((message) => ["USER", "bot"].includes(message.type))
          .map((message) => {
            return {
              author: {
                type: isChatUserMessage(message) ? "user" : "business",
              },
              content: {
                type: "text",
                text: isChatUserMessage(message)
                  ? message.text
                  : isBotMessage(message)
                    ? message.responses
                        .map((response: any) => response.text)
                        .join("")
                    : "",
              },
            };
          });
      case "front":
        return messages
          .filter((message) => ["USER", "bot"].includes(message.type))
          .map((message: any) => {
            return {
              author: {
                type: isChatUserMessage(message) ? "user" : "business",
              },
              content: {
                type: "text",
                text: isChatUserMessage(message)
                  ? message.text
                  : isBotMessage(message)
                    ? message.responses
                        .map((response: any) => response.text)
                        .join("")
                    : "",
              },
              timestamp: message.timestamp,
              mavenContext: {
                conversationId: mavenConversationId,
                conversationMessageId: {
                  referenceId: message?.conversationMessageId?.referenceId,
                },
              },
            };
          });
      case "salesforce":
      case null:
      default:
        return [];
    }
  }, [messages]);

  const handleHandoffChatEvent = useCallback(
    (event: ZendeskWebhookMessage) => {
      const author = event.payload?.message?.author;
      if (author?.type === "user") {
        return;
      }

      if (author?.type === "business" && author.displayName) {
        setAgentName(author.displayName);
      }

      const eventWithTimestamp = {
        ...event,
        type: "handoff-zendesk",
        timestamp: new Date(event.createdAt).getTime(),
      };
      setHandoffChatEvents((prev) => [...prev, eventWithTimestamp]);
    },
    [setHandoffChatEvents],
  );

  const streamResponse = useCallback(async function* (
    response: Response,
  ): AsyncGenerator<ZendeskWebhookMessage> {
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error("No reader");
    }

    const decoder = new TextDecoder();

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const events = chunk.split("\n\n");
        for (const event of events) {
          if (event.startsWith("data: ")) {
            try {
              const jsonData: ChatEvent = JSON.parse(event.slice(6));
              if (jsonData?.message?.type === "conversation:message") {
                yield jsonData.message;
              }
            } catch (error) {
              console.error("Error parsing JSON:", error);
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }, []);

  const getOrCreateUserAndConversation = useCallback(
    async (email?: string) => {
      if (!handoffTypeRef.current) {
        throw new Error("Handoff type is not set");
      }

      const response = await fetch(
        `/api/${handoffTypeRef.current}/conversations`,
        {
          method: "POST",
          body: JSON.stringify({
            messages: handoffMessages,
            signedUserData,
            email,
          }),
          headers: generatedHeaders,
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const handoffAuthToken = response.headers.get(HANDOFF_AUTH_HEADER);

      if (!handoffAuthToken) {
        throw new Error("Handoff auth token not found");
      }

      setHandoffAuthToken(handoffAuthToken);
    },
    [handoffMessages, signedUserData, generatedHeaders],
  );

  const handleEndHandoff = useCallback(async () => {
    resetAbortController();
    setHandoffAuthToken(null);
    setAgentName(null);
    setHandoffChatEvents((prev) => [
      ...prev,
      {
        type: "ChatEnded",
        timestamp: new Date().getTime(),
      } as ChatEndedMessage,
    ]);

    void setHandoffStatus(HandoffStatus.NOT_INITIALIZED);

    if (!handoffAuthToken || !handoffTypeRef.current) {
      return;
    }

    void fetch(`/api/${handoffTypeRef.current}/conversations/passControl`, {
      method: "POST",
      headers: generatedHeaders,
    });
  }, [
    setHandoffStatus,
    setHandoffAuthToken,
    setAgentName,
    generatedHeaders,
    resetAbortController,
  ]);

  const getMessages = useCallback(async () => {
    if (!handoffAuthToken || !handoffTypeRef.current) {
      return;
    }

    if (
      isConnected ||
      handoffStatusRef.current === HandoffStatus.NOT_INITIALIZED
    ) {
      return;
    }
    setIsConnected(true);

    const newAbortController = resetAbortController();

    try {
      const response = await fetch(`/api/${handoffTypeRef.current}/messages`, {
        method: "GET",
        headers: generatedHeaders,
        signal: newAbortController.signal,
      });

      for await (const event of streamResponse(response)) {
        if (newAbortController.signal.aborted) break;
        if (event.type === "keep-alive") continue; // Ignore keep-alive messages
        handleHandoffChatEvent(event);
      }
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        console.log("Fetch aborted");
      } else {
        console.error("Error streaming response:", error);
        void handleEndHandoff();
      }
    } finally {
      setIsConnected(false);
      // Attempt to reconnect after 5 seconds
      if (handoffStatusRef.current === HandoffStatus.INITIALIZED) {
        reconnectTimeoutRef.current = setTimeout(() => {
          void getMessages();
        }, HANDOFF_RECONNECT_INTERVAL);
      }
    }
  }, [
    handoffAuthToken,
    generatedHeaders,
    streamResponse,
    resetAbortController,
    handleEndHandoff,
  ]);

  const initializeHandoff = useCallback(
    async ({ email }: { email?: string }): Promise<void> => {
      if (!handoffTypeRef.current) {
        console.error("Handoff type is not set");
        return;
      }

      void setHandoffStatus(HandoffStatus.INITIALIZING);

      try {
        await getOrCreateUserAndConversation(email);
      } catch (error) {
        console.error("Error initializing handoff:", error);
        void handleEndHandoff();
      }
    },
    [getOrCreateUserAndConversation, signedUserData, handleEndHandoff],
  );

  useEffect(() => {
    handoffStatusRef.current = handoffStatus;
    if (handoffStatus === HandoffStatus.INITIALIZED) {
      setHandoffChatEvents((prev) => [
        ...prev,
        {
          type: "ChatEstablished",
          timestamp: new Date().getTime(),
        } as ChatEstablishedMessage,
      ]);
    }
  }, [handoffStatus]);

  useEffect(() => {
    if (handoffAuthToken && handoffStatus === HandoffStatus.INITIALIZING) {
      void getMessages();
      void setHandoffStatus(HandoffStatus.INITIALIZED);
    }
  }, [handoffAuthToken, getMessages]);

  const askHandoff = useCallback(
    async (message: string) => {
      setHandoffChatEvents((prev) => [
        ...prev,
        {
          text: message,
          timestamp: new Date().getTime(),
          type: "USER",
        } as UserChatMessage,
      ]);

      if (!handoffAuthToken || !handoffTypeRef.current) {
        return;
      }

      const response = await fetch(`/api/${handoffTypeRef.current}/messages`, {
        method: "POST",
        body: JSON.stringify({ message }),
        headers: generatedHeaders,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    },
    [generatedHeaders],
  );

  useEffect(() => {
    return () => {
      abortController?.abort();
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, []);

  return {
    initializeHandoff,
    handoffStatus,
    handoffError,
    handoffChatEvents,
    agentName,
    askHandoff,
    handleEndHandoff,
    isConnected,
  };
}
