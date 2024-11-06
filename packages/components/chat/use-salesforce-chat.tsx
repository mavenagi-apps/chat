import { useState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { useAnalytics } from "@/lib/use-analytics";
import { MagiEvent } from "@/lib/analytics/events";
import {
  type UserChatMessage,
  type SalesforceChatMessage,
  isChatTransferredMessage,
} from "@/types";

export const useSalesforceChat = (
  params: { id: string; orgFriendlyId: string },
  conversationId: string | null,
  initialUserChatMessage: UserChatMessage | null,
  unverifiedUserInfo: Record<string, string>,
  messages: any[],
  onSalesforceExit: () => void,
) => {
  // Init dependencies
  const t = useTranslations("chat.ChatPage");
  const analytics = useAnalytics();

  // Salesforce connection states
  const [isSalesforceChatMode, setIsSalesforceChatMode] = useState(false);
  const isSalesforceChatModeRef = useRef(isSalesforceChatMode);
  const salesforcePollingAbortController = useRef<AbortController | null>(null);
  const [salesforceChatSessionParams, setSalesforceChatSessionParams] =
    useState<any | null>(null);
  const [connectingToSalesforce, setConnectingToSalesforce] = useState(false);
  const [connectedToSalesforce, setConnectedToSalesforce] = useState(false);
  const salesforceChatAck = useRef<number>(-1);
  const [salesforceError, setSalesforceError] = useState<string | null>(null);

  // Salesforce chat messages
  const [salesforceChatMessages, setSalesforceChatMessages] = useState<
    (SalesforceChatMessage & { timestamp?: number })[]
  >([]);
  const [showTypingIndicator, setShowTypingIndicator] = useState(false);
  const [agentName, setAgentName] = useState<string | null>(null);

  const handleSalesforceChatMode = () => {
    setIsSalesforceChatMode(true);
  };

  const handleEndSalesforceChatMode = async () => {
    setIsSalesforceChatMode(false);
    setConnectingToSalesforce(false);
    setConnectedToSalesforce(false);
    salesforcePollingAbortController.current?.abort();
    salesforceChatAck.current = -1;
    if (salesforceChatSessionParams) {
      try {
        await fetch("/api/salesforce", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            "X-LIVEAGENT-AFFINITY": salesforceChatSessionParams.affinityToken,
            "X-LIVEAGENT-SESSION-KEY": salesforceChatSessionParams.key,
            "X-ORGANIZATION-ID": params.orgFriendlyId,
            "X-AGENT-ID": params.id,
          },
        });
      } catch (error) {
        console.error("Error ending salesforce chat:", error);
      }
    }
    setSalesforceChatSessionParams(null);
    setAgentName(null);
    createDisconnectedFromSalesforceMessage();
    analytics.logEvent(MagiEvent.endChatClick, {
      agentId: params.id,
      conversationId: conversationId || "",
    });
    onSalesforceExit();
  };

  const askSalesForce = async (question: string) => {
    try {
      setSalesforceChatMessages((prevMessages) => [
        ...prevMessages,
        {
          type: "USER",
          text: question,
        },
      ]);

      await fetch("/api/salesforce/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-LIVEAGENT-AFFINITY": salesforceChatSessionParams.affinityToken,
          "X-LIVEAGENT-SESSION-KEY": salesforceChatSessionParams.key,
        },
        body: JSON.stringify({
          text: question,
          orgFriendlyId: params.orgFriendlyId,
          agentId: params.id,
        }),
      });
    } catch (error) {
      console.error("Error asking salesforce:", error);
    }
  };

  const createSalesforceChatMessage = (message: SalesforceChatMessage) => {
    setSalesforceChatMessages((prevMessages) => [...prevMessages, message]);
  };

  const createConnectingToAgentMessage = () => {
    createSalesforceChatMessage({
      type: "ChatEstablished",
      message: {
        text: t("connecting_to_agent"),
      },
    });
  };

  const createDisconnectedFromSalesforceMessage = () => {
    createSalesforceChatMessage({
      type: "ChatEnded",
      message: {
        text: t("chat_has_ended"),
        name: "",
        agentId: "",
        schedule: {
          responseDelayMilliseconds: 0,
        },
      },
    });
  };

  useEffect(() => {
    const pollMessages = async (userData: any, chatSessionData: any) => {
      const pollMessagesParams = new URLSearchParams({
        ack: salesforceChatAck.current.toString(),
        orgFriendlyId: params.orgFriendlyId,
        agentId: params.id,
      });
      if (userData.subject) {
        pollMessagesParams.append("subject", userData.subject);
      }
      const url = `/api/salesforce/messages?${pollMessagesParams.toString()}`;
      salesforcePollingAbortController.current = new AbortController();
      try {
        const response = await fetch(url, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "X-LIVEAGENT-AFFINITY": chatSessionData.affinityToken,
            "X-LIVEAGENT-SESSION-KEY": chatSessionData.key,
          },
          signal: salesforcePollingAbortController.current.signal,
        });
        salesforcePollingAbortController.current = null;

        if (!response.ok) {
          console.error("Done polling messages:", response);
          setConnectedToSalesforce(false);
          return;
        }

        const {
          messages: retrievedSalesforceMessages,
          sequence: retrievedSalesforceMessagesAck,
        }: { messages: SalesforceChatMessage[]; sequence: number } =
          await response.json();

        if (retrievedSalesforceMessagesAck > salesforceChatAck.current) {
          salesforceChatAck.current = retrievedSalesforceMessagesAck;
        }

        // Find the last message of type ChatTransferred
        const chatTransferredMessage = retrievedSalesforceMessages.findLast(
          isChatTransferredMessage,
        );
        if (chatTransferredMessage) {
          setAgentName(chatTransferredMessage.message?.name);
        }

        const chatFailedToConnectMessageIndex =
          retrievedSalesforceMessages.findIndex(
            (message) =>
              (message.type === "ChatMessage" &&
                message.message.text ===
                  "Click the close button to end this chat") ||
              message.type === "ChatEnded",
          );
        if (chatFailedToConnectMessageIndex !== -1) {
          void handleEndSalesforceChatMode();
          return;
        }

        if (retrievedSalesforceMessages.length > 0) {
          setSalesforceChatMessages((prevMessages) => [
            ...prevMessages,
            ...retrievedSalesforceMessages,
          ]);
        }

        if (isSalesforceChatModeRef.current) {
          void pollMessages(userData, chatSessionData);
        }
      } catch (error: unknown) {
        if (error instanceof Error && error.name === "AbortError") {
          console.log("Polling aborted");
        } else {
          throw error;
        }
      }
    };

    const handleSalesforceChatMode = async () => {
      // create "connecting to agent" message
      createConnectingToAgentMessage();

      // create the user context data
      const userData = {
        userAgent: navigator.userAgent,
        screenResolution: `${window.screen.width}x${window.screen.height}`,
        subject:
          initialUserChatMessage?.text || "How can I remove a fake review?",
        question: "",
        firstName: unverifiedUserInfo?.firstName || "",
        lastName: unverifiedUserInfo?.lastName || "",
        email: unverifiedUserInfo?.email || "",
      };

      // initialize the chat session
      // const chatSessionData = await startChatSession(data);
      const chatSessionRequest = await fetch("/api/salesforce", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userData,
          messages,
          orgFriendlyId: params.orgFriendlyId,
          agentId: params.id,
        }),
      });

      if (!chatSessionRequest.ok) {
        throw new Error(
          `Failed to initiate chat session: ${chatSessionRequest.statusText}`,
        );
      }

      const chatSessionData = await chatSessionRequest.json();
      setSalesforceChatSessionParams(chatSessionData);
      setConnectedToSalesforce(true);
      setSalesforceError(null);

      void pollMessages(userData, chatSessionData);
    };

    if (
      isSalesforceChatMode &&
      !connectingToSalesforce &&
      !connectedToSalesforce &&
      !salesforceError
    ) {
      setConnectingToSalesforce(true);
      void handleSalesforceChatMode();
    }
  }, [
    initialUserChatMessage?.text,
    isSalesforceChatMode,
    messages,
    unverifiedUserInfo?.email,
    unverifiedUserInfo?.name,
    connectedToSalesforce,
    connectingToSalesforce,
    salesforceError,
  ]);

  useEffect(() => {
    const timestamp = new Date().getTime();
    setSalesforceChatMessages((prevMessages) =>
      prevMessages.map((m) => ({
        timestamp,
        ...m,
      })),
    );
  }, [salesforceChatMessages.length, setSalesforceChatMessages]);

  useEffect(() => {
    isSalesforceChatModeRef.current = isSalesforceChatMode;
  }, [isSalesforceChatMode]);

  useEffect(() => {
    return () => {
      // Cleanup the chat session
      void handleEndSalesforceChatMode();
    };
  }, []);

  useEffect(() => {
    const lastMessage =
      salesforceChatMessages[salesforceChatMessages.length - 1];
    if (
      lastMessage &&
      ["AgentTyping", "AgentNotTyping"].includes(lastMessage.type)
    ) {
      setShowTypingIndicator(lastMessage.type === "AgentTyping");
    }
  }, [salesforceChatMessages]);

  return {
    isSalesforceChatMode,
    connectedToSalesforce,
    salesforceChatMessages,
    agentName,
    handleSalesforceChatMode,
    handleEndSalesforceChatMode,
    askSalesForce,
    showTypingIndicator,
    createConnectingToAgentMessage,
    salesforceError,
  };
};
