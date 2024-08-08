// Custom hook for managing idle timeouts
import { useState, useEffect } from 'react';

export function useIdleTimeout(timeout: number) {
    const [isIdle, setIsIdle] = useState(false);

    useEffect(() => {
        let timer: NodeJS.Timeout;

        const resetTimer = () => {
            clearTimeout(timer);
            timer = setTimeout(() => {
                setIsIdle(true);
            }, timeout);
        };

        const handleUserActivity = () => {
            setIsIdle(false);
            resetTimer();
        };

        window.addEventListener('mousemove', handleUserActivity);
        window.addEventListener('keypress', handleUserActivity);

        resetTimer();

        return () => {
            clearTimeout(timer);
            window.removeEventListener('mousemove', handleUserActivity);
            window.removeEventListener('keypress', handleUserActivity);
        };
    }, [timeout]);

    return isIdle;
}