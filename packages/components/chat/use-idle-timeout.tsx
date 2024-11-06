import { useState, useEffect, useCallback, useRef } from 'react';

interface UseIdleTimeoutProps {
  timeout: number;
  isExternalProviderChatMode: boolean;
  isWaitingForChatResponse: boolean;
  hasUserSentFirstMessage: boolean;
}

export function useIdleTimeout({
  timeout,
  isExternalProviderChatMode,
  isWaitingForChatResponse,
  hasUserSentFirstMessage,
}: UseIdleTimeoutProps) {
  const [isIdle, setIsIdle] = useState(false);
  const timerRef = useRef<NodeJS.Timeout>();

  const resetTimer = useCallback(() => {
    if (isIdle) return; // Don't reset if already idle

    clearTimeout(timerRef.current);
    if (hasUserSentFirstMessage && !isExternalProviderChatMode && !isWaitingForChatResponse) {
      timerRef.current = setTimeout(() => {
        setIsIdle(true);
      }, timeout);
    }
  }, [timeout, isExternalProviderChatMode, isWaitingForChatResponse, hasUserSentFirstMessage, isIdle]);

  const handleUserActivity = useCallback(() => {
    if (!isIdle) {
      resetTimer();
    }
  }, [resetTimer, isIdle]);

  useEffect(() => {
    if (isIdle) return; // Don't set up listeners if already idle

    window.addEventListener('mousemove', handleUserActivity);
    window.addEventListener('keypress', handleUserActivity);

    resetTimer();

    return () => {
      clearTimeout(timerRef.current);
      window.removeEventListener('mousemove', handleUserActivity);
      window.removeEventListener('keypress', handleUserActivity);
    };
  }, [handleUserActivity, resetTimer, isIdle]);

  useEffect(() => {
    if (!isIdle) {
      resetTimer();
    }
  }, [isExternalProviderChatMode, isWaitingForChatResponse, hasUserSentFirstMessage, resetTimer, isIdle]);

  return { isIdle, resetIdleTimer: resetTimer };
}