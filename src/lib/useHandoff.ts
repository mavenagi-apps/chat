import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSettings } from "@/src/app/providers/SettingsProvider";
import { useParams } from "next/dist/client/components/navigation";
import { useAuth } from "@/src/app/providers/AuthProvider";
import { useCustomData } from "@/src/app/providers/CustomDataProvider";
import { HANDOFF_AUTH_HEADER } from "@/src/app/constants/authentication";
import {
  type ChatEndedMessage,
  type IncomingHandoffConnectionEvent,
  type IncomingHandoffEvent,
  isChatUserMessage,
  type UserChatMessage,
} from "@/src/types";
import { HandoffStatus } from "@/src/app/constants/handoff";
import { HandoffStrategyFactory } from "./handoff/HandoffStrategyFactory";
import { streamResponse } from "./handoff/streamUtils";
import type {
  HandoffProps,
  HandoffState,
  HandoffHookReturn,
  Params,
} from "./handoff/types";
import { generateHeaders } from "./handoff/headerUtils";

const HANDOFF_RECONNECT_INTERVAL = 500;

const initialState: HandoffState = {
  handoffError: null,
  handoffChatEvents: [],
  isConnected: false,
  handoffAuthToken: null,
  agentName: null,
  handoffStatus: HandoffStatus.NOT_INITIALIZED,
};

export function useHandoff({
  messages,
  mavenConversationId,
}: HandoffProps): HandoffHookReturn {
  // Configuration and refs
  const { misc } = useSettings();
  const handoffTypeRef = useRef(misc.handoffConfiguration?.type ?? null);
  const strategyRef = useRef(
    HandoffStrategyFactory.createStrategy(
      handoffTypeRef.current,
      misc.handoffConfiguration as ClientSafeHandoffConfig,
    ),
  );
  const abortController = useRef(new AbortController());
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();

  // State
  const [state, setState] = useState<HandoffState>(initialState);
  const handoffStatusRef = useRef<HandoffStatus>(state.handoffStatus);

  // Context hooks
  const { signedUserData, unsignedUserData } = useAuth();
  const { customData } = useCustomData();
  const { organizationId, agentId } = useParams<Params>();

  useEffect(() => {
    strategyRef.current = HandoffStrategyFactory.createStrategy(
      handoffTypeRef.current,
      misc.handoffConfiguration,
    );
  }, []);

  const resetAbortController = useCallback(() => {
    abortController.current.abort();
    abortController.current = new AbortController();
  }, []);

  const generatedHeaders = useMemo(() => {
    return generateHeaders(organizationId, agentId, state.handoffAuthToken);
  }, [state.handoffAuthToken, organizationId, agentId]);

  const getOrCreateUserAndConversation = useCallback(
    async (email?: string) => {
      if (!strategyRef.current) {
        throw new Error("Handoff strategy is not set");
      }

      const response = await fetch(strategyRef.current.conversationsEndpoint, {
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
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const handoffAuthToken = response.headers.get(HANDOFF_AUTH_HEADER);

      if (!handoffAuthToken) {
        throw new Error("Handoff auth token not found");
      }

      setState((prev) => ({ ...prev, handoffAuthToken: handoffAuthToken }));
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
    setState((prev) => ({
      ...prev,
      handoffAuthToken: null,
      agentName: null,
      handoffChatEvents: [
        ...prev.handoffChatEvents,
        {
          type: "ChatEnded",
          timestamp: new Date().getTime(),
        } as ChatEndedMessage,
      ],
    }));

    setState((prev) => ({
      ...prev,
      handoffStatus: HandoffStatus.NOT_INITIALIZED,
    }));

    if (!state.handoffAuthToken || !strategyRef.current) {
      return;
    }

    void fetch(`${strategyRef.current.conversationsEndpoint}/passControl`, {
      method: "POST",
      headers: generatedHeaders,
      body: JSON.stringify({ signedUserData, unsignedUserData }),
    });
  }, [setState, generatedHeaders, resetAbortController]);

  const handleHandoffChatEvent = useCallback(
    async (event: IncomingHandoffEvent) => {
      if (!strategyRef.current) return;

      const {
        agentName: newAgentName,
        formattedEvent,
        shouldEndHandoff,
      } = strategyRef.current.handleChatEvent(event);

      if (formattedEvent) {
        if (newAgentName) {
          setState((prev) => ({ ...prev, agentName: newAgentName }));
        }
        setState((prev) => ({
          ...prev,
          handoffChatEvents: [...prev.handoffChatEvents, formattedEvent],
        }));
      }

      if (shouldEndHandoff) {
        await handleEndHandoff();
      }
    },
    [state, setState, handleEndHandoff],
  );

  const getMessages = useCallback(async () => {
    if (!state.handoffAuthToken || !strategyRef.current) {
      return;
    }

    if (
      state.isConnected ||
      handoffStatusRef.current === HandoffStatus.NOT_INITIALIZED
    ) {
      return;
    }
    setState((prev) => ({ ...prev, isConnected: true }));

    resetAbortController();

    try {
      if (strategyRef.current.subjectHeaderKey) {
        const firstUserMessage: UserChatMessage | undefined = messages.find(
          (message) => isChatUserMessage(message),
        );
        if (firstUserMessage) {
          generatedHeaders[strategyRef.current.subjectHeaderKey] =
            firstUserMessage.text || "I need assistance";
        }
      }
      const response = await fetch(strategyRef.current.messagesEndpoint, {
        method: "GET",
        headers: generatedHeaders,
        signal: abortController.current.signal,
      });

      for await (const event of streamResponse(
        response,
        abortController.current,
      )) {
        if (abortController.current.signal.aborted) break;
        await handleHandoffChatEvent(event);
      }
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        console.log("Fetch aborted");
      } else {
        console.error("Error streaming response:", error);
        void handleEndHandoff();
      }
    } finally {
      setState((prev) => ({ ...prev, isConnected: false }));
      // Attempt to reconnect after interval
      if (handoffStatusRef.current === HandoffStatus.INITIALIZED) {
        reconnectTimeoutRef.current = setTimeout(() => {
          void getMessages();
        }, HANDOFF_RECONNECT_INTERVAL);
      }
    }
  }, [
    state.handoffAuthToken,
    generatedHeaders,
    resetAbortController,
    handleEndHandoff,
  ]);

  const initializeHandoff = useCallback(
    async ({ email }: { email?: string }): Promise<void> => {
      if (!strategyRef.current) {
        console.error("Handoff strategy is not set");
        return;
      }

      setState((prev) => ({
        ...prev,
        handoffStatus: HandoffStatus.INITIALIZING,
      }));

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
    handoffStatusRef.current = state.handoffStatus;
    if (state.handoffStatus === HandoffStatus.INITIALIZED) {
      setState((prev) => ({
        ...prev,
        handoffChatEvents: [
          ...prev.handoffChatEvents,
          {
            type:
              strategyRef.current?.connectedToAgentMessageType ||
              "ChatEstablished",
            timestamp: new Date().getTime(),
          } as IncomingHandoffConnectionEvent,
        ],
      }));
    }
  }, [state.handoffStatus]);

  useEffect(() => {
    if (
      state.handoffAuthToken &&
      state.handoffStatus === HandoffStatus.INITIALIZING
    ) {
      void getMessages();
      setState((prev) => ({
        ...prev,
        handoffStatus: HandoffStatus.INITIALIZED,
      }));
    }
  }, [state.handoffAuthToken, getMessages]);

  const askHandoff = useCallback(
    async (message: string) => {
      setState((prev) => ({
        ...prev,
        handoffChatEvents: [
          ...prev.handoffChatEvents,
          {
            text: message,
            timestamp: new Date().getTime(),
            type: "USER",
          } as UserChatMessage,
        ],
      }));

      if (!state.handoffAuthToken || !strategyRef.current) {
        return;
      }

      const response = await fetch(strategyRef.current.messagesEndpoint, {
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
      abortController.current?.abort();
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, []);

  const showTypingIndicator = useMemo(() => {
    return false;
  }, []);

  const shouldSupressHandoffInputDisplay = useMemo(() => {
    return (
      strategyRef.current?.shouldSupressHandoffInputDisplay?.(
        state.agentName,
      ) ?? false
    );
  }, [state.agentName]);

  return {
    initializeHandoff,
    handoffStatus: state.handoffStatus,
    handoffError: state.handoffError,
    handoffChatEvents: state.handoffChatEvents,
    agentName: state.agentName,
    isConnected: state.isConnected,
    askHandoff,
    handleEndHandoff,
    showTypingIndicator,
    shouldSupressHandoffInputDisplay,
  };
}
