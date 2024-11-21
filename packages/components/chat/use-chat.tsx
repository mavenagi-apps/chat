'use client';

import React, { useEffect } from 'react';
import { nanoid } from 'nanoid';

import { type MavenAGI } from 'mavenagi'
import {
  type ConversationMessageResponse,
  BotConversationMessageType,
} from 'mavenagi/api';
import {
  type Message,
  type ChatMessage,
  type UserChatMessage,
  isBotMessage,
  isChatMessage,
  isChatUserMessage
} from '@/types';

const API_ENDPOINT = '/api/create';

type UseChatOptions = {
  orgFriendlyId: string;
  id: string;
  userData: Record<string, string> | null;
};

export function useChat({ orgFriendlyId, id, userData }: UseChatOptions) {
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [conversationId, setConversationId] = React.useState<string>(nanoid());
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [abortController, setAbortController] = React.useState(
    new AbortController()
  );

  const resetAbortController = () => {
    abortController.abort();
    const newAbortController = new AbortController();
    setAbortController(newAbortController);
    return newAbortController;
  };

  const userAskedQuestion = (_messages: Message[]) => {
    if (_messages.length === 0) {
      return false;
    }

    const lastMessage = _messages[_messages.length - 1];
    return (
      isChatMessage(lastMessage) &&
      _messages[_messages.length - 1].type === 'USER'
    );
  };

  const createResponse = async (
    _messages: Message[],
    newAbortController: AbortController
  ) => {
    const lastMessage = _messages[_messages.length - 1];
    if (!isChatUserMessage(lastMessage)) {
      throw new Error('Last message is not a user message');
    }
    return await fetch(API_ENDPOINT, {
      method: 'POST',
      body: JSON.stringify({
        orgFriendlyId,
        id,
        question: (_messages[_messages.length - 1] as UserChatMessage).text,
        conversationId: conversationId,
        initialize: _messages.length <= 1,
        userData: userData || undefined,
      }),
      headers: {
        'Content-Type': 'application/json',
      },
      signal: newAbortController.signal,
    });
  }

  const streamResponse = async (response: Response) => {
    const reader = response.body?.getReader();

    if (!response.ok || !reader) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const decoder = new TextDecoder();
    let done = false;
    let buffer = '';
    let referenceId: string | undefined; // Reference ID to be set by the "start" event
    const eventQueue: MavenAGI.StreamResponse[] = []; // Buffer to hold events that arrive before "start"

    while (!done) {
      const { done: readerDone, value } = await reader.read();
      done = readerDone;

      buffer += decoder.decode(value, { stream: true });

      let boundaryIndex;
      while ((boundaryIndex = buffer.indexOf('\n\n')) !== -1) {
        const completeEvent = buffer.slice(0, boundaryIndex + 2);
        buffer = buffer.slice(boundaryIndex + 2);

        const eventData = completeEvent
          .split('\n')
          .filter((line) => line.startsWith('data:'))
          .map((line) => line.replace(/^data: /, '').trim())
          .join('');

        if (eventData) {
          try {
            const parsedData = JSON.parse(eventData);

            // Handle the "start" event immediately
            if (parsedData.eventType === 'start') {
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
            console.error('Failed to parse JSON:', err);
          }
        }
      }
    }
  };

  const ask = async (_messages: Message[]) => {
    setIsLoading(true);
    const newAbortController = resetAbortController();

    const shouldHitApi = userAskedQuestion(_messages);

    if (shouldHitApi) {
      try {
        const response = await createResponse(_messages, newAbortController);
        await streamResponse(response);
      } catch (error) {
        console.log(error);
      }
    }
  };

  const handleParsedData = (
    parsedData: MavenAGI.StreamResponse,
    referenceId: string | undefined
  ) => {
    if (parsedData.eventType === 'start') {
      const { conversationMessageId } = parsedData;
      const newMessage: ConversationMessageResponse.Bot = {
        responses: [],
        conversationMessageId,
        type: 'bot',
        botMessageType: BotConversationMessageType.BotResponse,
        metadata: {
          followupQuestions: [],
          sources: [],
        }
      };
      setMessages((prevState) => [...prevState, newMessage]);
    } else if (parsedData.eventType === 'text') {
      setIsLoading(false);
      if (!referenceId) {
        throw new Error('No referenceId');
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
            : m
        )
      );
    } else if (parsedData.eventType === 'metadata') {
      const { followupQuestions, sources } = parsedData;
      if (!referenceId) {
        throw new Error('No referenceId');
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
            : m
        )
      );
    } else if (parsedData.eventType === 'action') {
      setMessages((prevMessages) =>
        prevMessages.map((m) =>
          isBotMessage(m) &&
          m.conversationMessageId?.referenceId === referenceId
            ? {
                ...m,
                action: parsedData
              }
            : m
        )
      );
    }
  };

  function getResponseAvailable() {
    if (messages.length === 0) {
      return;
    }

    const lastMessage = messages[messages.length - 1];
    if (!isBotMessage(lastMessage)) {
      return;
    }
    return lastMessage?.responses?.length > 0;
  }

  useEffect(() => {
    const timestamp = (new Date()).getTime();
    setMessages((prevMessages) =>
      prevMessages.map((m) =>
        ({ timestamp, ...m  } as Message)
      )
    );
  }, [messages.length, setMessages]);

  return {
    messages,
    askQuestion: (message: ChatMessage) => {
      setMessages((prevState) => [...prevState, message]);
      if (message.type === 'USER') {
        void ask([...messages, message]);
      }
    },
    setMessages: (newMessages: ChatMessage[]) => {
      setConversationId(nanoid());
      setMessages(newMessages);
      void ask(newMessages);
    },
    isLoading: isLoading,
    isResponseAvailable: getResponseAvailable(),
    conversationId: conversationId,
  };
}
