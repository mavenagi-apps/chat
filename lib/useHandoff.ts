import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSettings } from "@/app/providers/SettingsProvider";
import { useParams } from "next/dist/client/components/navigation";
import { useAuth } from "@/app/providers/AuthProvider";
import { useCustomData } from "@/app/providers/CustomDataProvider";
import {
  HANDOFF_AUTH_HEADER,
  ORGANIZATION_HEADER,
  AGENT_HEADER,
} from "@/app/constants/authentication";
import type {
  Message,
  ZendeskWebhookMessage,
  ChatEstablishedMessage,
  UserChatMessage,
  ChatEndedMessage,
} from "@/types";
import type { Front } from "@/types/front";
import { HandoffStatus } from "@/app/constants/handoff";
import {
  HandoffStrategyFactory,
  type HandoffType,
} from "./handoff/HandoffStrategyFactory";
import type { HandoffStrategy } from "./handoff/HandoffStrategy";

const HANDOFF_RECONNECT_INTERVAL = 500;

type HandoffProps = {
  messages: Message[];
  mavenConversationId: string;
};

type Params = {
  orgFriendlyId: string;
  id: string;
};

export function useHandoff({ messages, mavenConversationId }: HandoffProps) {
  const { signedUserData, unsignedUserData } = useAuth();
  const { customData } = useCustomData();
  const { orgFriendlyId, id: agentId } = useParams<Params>();
  const { handoffConfiguration } = useSettings();
  const handoffTypeRef = useRef<HandoffType>(
    (handoffConfiguration?.type as HandoffType) ?? null,
  );
  const [handoffError, _setHandoffError] = useState<string | null>(null);
  const [handoffChatEvents, setHandoffChatEvents] = useState<
    (
      | ZendeskWebhookMessage
      | Front.WebhookMessage
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
  const strategyRef = useRef<HandoffStrategy | null>(null);

  useEffect(() => {
    strategyRef.current = HandoffStrategyFactory.createStrategy(
      handoffTypeRef.current,
    );
  }, []);

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

  const handleHandoffChatEvent = useCallback(
    (event: ZendeskWebhookMessage | Front.WebhookMessage) => {
      if (!strategyRef.current) return;

      const { agentName: newAgentName, formattedEvent } =
        strategyRef.current.handleChatEvent(event);

      if (formattedEvent) {
        if (newAgentName) {
          setAgentName(newAgentName);
        }
        setHandoffChatEvents((prev) => [...prev, formattedEvent]);
      }
    },
    [],
  );

  const streamResponse = useCallback(async function* (
    response: Response,
  ): AsyncGenerator<ZendeskWebhookMessage | Front.WebhookMessage> {
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
              const jsonData = JSON.parse(event.slice(6));
              if (jsonData.message.type !== "keep-alive") {
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
      if (!strategyRef.current) {
        throw new Error("Handoff strategy is not set");
      }

      const response = await fetch(
        strategyRef.current.getConversationsEndpoint,
        {
          method: "POST",
          body: JSON.stringify({
            messages: strategyRef.current.formatMessages(
              messages,
              mavenConversationId,
            ),
            signedUserData,
            unsignedUserData,
            userAgent: navigator.userAgent,
            screenResolution: `${window.screen.width}x${window.screen.height}`,
            language: navigator.language,
            customData,
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
    [
      messages,
      customData,
      signedUserData,
      unsignedUserData,
      generatedHeaders,
      mavenConversationId,
    ],
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

    if (!handoffAuthToken || !strategyRef.current) {
      return;
    }

    void fetch(`${strategyRef.current.getMessagesEndpoint}/passControl`, {
      method: "POST",
      headers: generatedHeaders,
      body: JSON.stringify({ signedUserData, unsignedUserData }),
    });
  }, [
    setHandoffStatus,
    setHandoffAuthToken,
    setAgentName,
    generatedHeaders,
    resetAbortController,
  ]);

  const getMessages = useCallback(async () => {
    if (!handoffAuthToken || !strategyRef.current) {
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
      const response = await fetch(strategyRef.current.getMessagesEndpoint, {
        method: "GET",
        headers: generatedHeaders,
        signal: newAbortController.signal,
      });

      for await (const event of streamResponse(response)) {
        if (newAbortController.signal.aborted) break;
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
      // Attempt to reconnect after interval
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
      if (!strategyRef.current) {
        console.error("Handoff strategy is not set");
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
    [getOrCreateUserAndConversation, handleEndHandoff],
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

      if (!handoffAuthToken || !strategyRef.current) {
        return;
      }

      const response = await fetch(strategyRef.current.getMessagesEndpoint, {
        method: "POST",
        body: JSON.stringify({
          message,
          signedUserData,
          unsignedUserData,
        }),
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
