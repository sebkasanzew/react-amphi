import { useState, useEffect, useCallback } from 'react';
import type { TerminalState, TerminalConfig } from '../types';

const DEFAULT_MESSAGES = [
    'Welcome to Amphi!',
];

export const useTerminalLogic = (config?: TerminalConfig): TerminalState & {
    addOutput: (line: string) => void;
    clearOutput: () => void;
} => {
    const [output, setOutput] = useState<string[]>([]);
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        const messages = config?.welcomeMessage
            ? [config.welcomeMessage, ...DEFAULT_MESSAGES.slice(1)]
            : DEFAULT_MESSAGES;

        const delay = config?.initialDelay ?? 0;

        const timer = setTimeout(() => {
            setOutput(messages);
            setIsReady(true);
        }, delay);

        return () => clearTimeout(timer);
    }, [config?.welcomeMessage, config?.initialDelay]);

    const addOutput = useCallback((line: string) => {
        setOutput(prev => [...prev, line]);
    }, []);

    const clearOutput = useCallback(() => {
        setOutput([]);
    }, []);

    return { output, isReady, addOutput, clearOutput };
};
