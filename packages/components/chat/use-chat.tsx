import React from 'react';
import { nanoid } from 'nanoid';

import { type ChatMessage } from './Chat';
import { create } from '@/app/actions';


type UseChatOptions = {
  orgFriendlyId: string;
  id: string;
};

export function useChat({ orgFriendlyId, id }: UseChatOptions) {
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [conversationId, setConversationId] = React.useState<string>(nanoid());
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [abortController, setAbortController] = React.useState(
    new AbortController()
  );

  const ask = async (messages: ChatMessage[]) => {
    setIsLoading(true);
    abortController.abort();
    const newAbortController = new AbortController();
    setAbortController(newAbortController);

    if (messages.length > 0 && messages[messages.length - 1].type === 'USER') {
      try {
        const reader = await create({
          orgFriendlyId,
          id,
          question: messages[messages.length - 1].text,
          conversationId: conversationId,
          initialize: messages.length <= 1,
        });
        setIsLoading(false)
        for (const message of reader.messages) {
          if (newAbortController.signal.aborted) {
            break;
          }
          // @ts-ignore
          setMessages((messages) => {
            if (messages.length === 0 || messages[messages.length - 1].type === 'USER') {
              console.log("appending message last one is user", message);
              return [...messages, message];
            } else {
              console.log("appending message other", message);
              return [...messages.slice(0, -1), message];
            }
          })
        }
      } catch(error) {
        console.log(error)
      }
    }
  };

  return {
    messages,
    askQuestion: (message: ChatMessage) => {
      setMessages((prevState) => [...prevState, message]);
      ask([...messages, message]);
    },
    setMessages: (newMessages: ChatMessage[]) => {
      setConversationId(nanoid());
      setMessages(newMessages);
      ask(newMessages);
    },
    isLoading: isLoading,
    isResponseAvailable:
      messages.length > 0 && messages[messages.length - 1].type !== 'USER',
    conversationId: conversationId,
  };
}
