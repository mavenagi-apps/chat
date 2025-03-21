/**
 * Custom React hook for managing chat functionality
 *
 * Key features:
 * - Manages chat messages and conversation state
 * - Handles streaming responses from the API
 * - Supports user authentication
 * - Processes different types of responses (text, metadata, actions)
 *
 * Usage:
 * const { messages, addMessage, isLoading, isResponseAvailable } = useChat();
 */

"use client";

import React, { useCallback, useEffect, useMemo } from "react";
import { nanoid } from "nanoid";

import { type MavenAGI } from "mavenagi";
import {
  BotConversationMessageType,
  type ConversationMessageResponse,
} from "mavenagi/api";
import {
  type ChatMessage,
  isBotMessage,
  isChatMessage,
  isChatUserMessage,
  type Message,
  type UserChatMessage,
} from "@/src/types";
import {
  AGENT_HEADER,
  AUTHENTICATION_HEADER,
  type AuthJWTPayload,
  ORGANIZATION_HEADER,
} from "@/src/app/constants/authentication";
import { decodeJwt } from "jose";
import { useParams } from "next/navigation";
import { useAuth } from "@/src/app/providers/AuthProvider";
const API_ENDPOINT = "/api/create";

export type UseChatResponse = {
  messages: Message[];
  addMessage: (message: ChatMessage) => void;
  isLoading: boolean;
  isResponseAvailable: boolean | undefined;
  conversationId: string;
  mavenUserId: string | null;
  onBailoutFormSubmitSuccess: (
    actionFormResponse: ConversationMessageResponse.Bot,
  ) => void;
};

type UseChatParams = {
  organizationId: string;
  agentId: string;
};

export function useChat(): UseChatResponse {
  const { signedUserData } = useAuth();
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [conversationId, setConversationId] = React.useState<string>(nanoid());
  const [authToken, setAuthToken] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [mavenUserId, setMavenUserId] = React.useState<string | null>(null);
  const [abortController, setAbortController] = React.useState(
    new AbortController(),
  );

  const { organizationId, agentId }: UseChatParams = useParams();
  const { unsignedUserData } = useAuth();

  const requestHeaders = useMemo(() => {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      [ORGANIZATION_HEADER]: organizationId,
      [AGENT_HEADER]: agentId,
    };
    if (authToken) {
      headers[AUTHENTICATION_HEADER] = authToken;
    }
    return headers;
  }, [authToken, organizationId, agentId]);

  const resetAbortController = useCallback(() => {
    abortController.abort();
    const newAbortController = new AbortController();
    setAbortController(newAbortController);
    return newAbortController;
  }, []);

  const userAskedQuestion = useCallback((_messages: Message[]) => {
    if (_messages.length === 0) {
      return false;
    }

    const lastMessage = _messages[_messages.length - 1];
    return (
      isChatMessage(lastMessage) &&
      _messages[_messages.length - 1].type === "USER"
    );
  }, []);

  const createResponse = useCallback(
    async (_messages: Message[], newAbortController: AbortController) => {
      const lastMessage = _messages[_messages.length - 1];
      if (!isChatUserMessage(lastMessage)) {
        throw new Error("Last message is not a user message");
      }

      return await fetch(API_ENDPOINT, {
        method: "POST",
        body: JSON.stringify({
          question: (_messages[_messages.length - 1] as UserChatMessage).text,
          attachments: (_messages[_messages.length - 1] as UserChatMessage)
            .attachments,
          signedUserData: signedUserData || undefined,
          unsignedUserData: unsignedUserData || undefined,
        }),
        headers: requestHeaders,
        signal: newAbortController.signal,
      });
    },
    [signedUserData, requestHeaders, unsignedUserData],
  );

  const streamResponse = useCallback(async (response: Response) => {
    const reader = response.body?.getReader();

    if (!response.ok || !reader) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const decoder = new TextDecoder();
    let done = false;
    let buffer = "";
    let referenceId: string | undefined; // Reference ID to be set by the "start" event
    const eventQueue: MavenAGI.StreamResponse[] = []; // Buffer to hold events that arrive before "start"

    while (!done) {
      const { done: readerDone, value } = await reader.read();
      done = readerDone;

      buffer += decoder.decode(value, { stream: true });

      let boundaryIndex;
      while ((boundaryIndex = buffer.indexOf("\n\n")) !== -1) {
        const completeEvent = buffer.slice(0, boundaryIndex + 2);
        buffer = buffer.slice(boundaryIndex + 2);

        const eventData = completeEvent
          .split("\n")
          .filter((line) => line.startsWith("data:"))
          .map((line) => line.replace(/^data: /, "").trim())
          .join("");

        if (eventData) {
          try {
            const parsedData = JSON.parse(eventData);

            // Handle the "start" event immediately
            if (parsedData.eventType === "start") {
              referenceId = parsedData.conversationMessageId?.referenceId;

              handleParsedData(parsedData, referenceId);

              // Process any queued events that were waiting for the referenceId
              while (eventQueue.length > 0) {
                const queuedEvent: MavenAGI.StreamResponse =
                  eventQueue.shift()!;
                handleParsedData(queuedEvent, referenceId);
              }
            } else if (!referenceId) {
              // If no referenceId yet, buffer this event
              eventQueue.push(parsedData);
            } else {
              // Otherwise, process the event immediately
              handleParsedData(parsedData, referenceId);
            }
          } catch (err) {
            console.error("Failed to parse JSON:", err);
          }
        }
      }
    }
  }, []);

  const ask = useCallback(
    async (_messages: Message[]) => {
      setIsLoading(true);
      const newAbortController = resetAbortController();

      const shouldHitApi = userAskedQuestion(_messages);

      if (shouldHitApi) {
        try {
          const response = await createResponse(_messages, newAbortController);
          // Get user id from headers
          const authToken = response.headers.get(AUTHENTICATION_HEADER);
          if (!authToken) {
            throw new Error("Auth token not found");
          }
          const responseAuthData = decodeJwt<AuthJWTPayload>(authToken);
          if (!responseAuthData.conversationId) {
            throw new Error("Conversation ID not found");
          }
          setMavenUserId(responseAuthData.userId || null);
          setAuthToken(authToken);
          setConversationId(responseAuthData.conversationId);
          await streamResponse(response);
        } catch (error) {
          console.log(error);
        }
      }
    },
    [createResponse, streamResponse, userAskedQuestion],
  );

  const handleParsedData = useCallback(
    (parsedData: MavenAGI.StreamResponse, referenceId: string | undefined) => {
      if (parsedData.eventType === "start") {
        const { conversationMessageId } = parsedData;
        const newMessage: ConversationMessageResponse.Bot = {
          responses: [],
          conversationMessageId,
          type: "bot",
          botMessageType: BotConversationMessageType.BotResponse,
          metadata: {
            followupQuestions: [],
            sources: [],
          },
        };
        setMessages((prevState) => [...prevState, newMessage]);
      } else if (parsedData.eventType === "text") {
        setIsLoading(false);
        if (!referenceId) {
          throw new Error("No referenceId");
        }
        setMessages((prevMessages) =>
          prevMessages.map((m) =>
            isBotMessage(m) &&
            m.conversationMessageId?.referenceId === referenceId
              ? {
                  ...m,
                  responses: [
                    ...(m.responses || []),
                    {
                      text: parsedData.contents,
                      type: parsedData.eventType,
                    },
                  ],
                }
              : m,
          ),
        );
      } else if (parsedData.eventType === "metadata") {
        const { followupQuestions, sources } = parsedData;
        if (!referenceId) {
          throw new Error("No referenceId");
        }
        setMessages((prevMessages) =>
          prevMessages.map((m) =>
            isBotMessage(m) &&
            m.conversationMessageId?.referenceId === referenceId
              ? {
                  ...m,
                  metadata: {
                    followupQuestions,
                    sources,
                  },
                }
              : m,
          ),
        );
      } else if (parsedData.eventType === "action") {
        setMessages((prevMessages) =>
          prevMessages.map((m) =>
            isBotMessage(m) &&
            m.conversationMessageId?.referenceId === referenceId
              ? {
                  ...m,
                  action: parsedData,
                }
              : m,
          ),
        );
      } else if (parsedData.eventType === "chart") {
        const { specSchema, spec } = parsedData;
        setMessages((prevMessages) =>
          prevMessages.map((m) =>
            isBotMessage(m) &&
            m.conversationMessageId?.referenceId === referenceId
              ? {
                  ...m,
                  responses: [
                    ...(m.responses || []),
                    {
                      specSchema,
                      spec,
                      type: parsedData.eventType,
                      label: "Chart",
                    },
                  ],
                }
              : m,
          ),
        );
      }
    },
    [],
  );

  const getResponseAvailable = useCallback(() => {
    if (messages.length === 0) {
      return;
    }

    const lastMessage = messages[messages.length - 1];
    if (!isBotMessage(lastMessage)) {
      return;
    }
    return lastMessage?.responses?.length > 0;
  }, []);

  const onBailoutFormSubmitSuccess = useCallback(
    (actionFormResponse: ConversationMessageResponse.Bot) => {
      setMessages((prevMessages) => [...prevMessages, actionFormResponse]);
    },
    [setMessages],
  );

  useEffect(() => {
    const timestamp = new Date().getTime();
    setMessages((prevMessages) =>
      prevMessages.map((m) => ({ timestamp, ...m }) as Message),
    );
  }, [messages.length, setMessages]);

  return {
    messages,
    addMessage: (message: ChatMessage) => {
      setMessages((prevState) => [...prevState, message]);
      if (message.type === "USER") {
        void ask([...messages, message]);
      }
    },
    onBailoutFormSubmitSuccess,
    isLoading: isLoading,
    mavenUserId: mavenUserId,
    isResponseAvailable: getResponseAvailable(),
    conversationId: conversationId,
  };
}
