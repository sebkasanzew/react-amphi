import React, { useState } from 'react';
import { Text, Box, useInput } from 'ink';
import { ASCII_ART, useTerminalLogic } from '@amphi/shared';

export default function App() {
    const { output, isReady } = useTerminalLogic();
    const [inputValue, setInputValue] = useState('');

    useInput((input, key) => {
        if (key.return) {
            // Input is ignored as per starter template requirements
            setInputValue('');
        } else if (key.backspace || key.delete) {
            setInputValue(prev => prev.slice(0, -1));
        } else if (!key.ctrl && !key.meta && input) {
            setInputValue(prev => prev + input);
        }
    });

    return (
        <Box flexDirection="column">
            <Text color="green">{ASCII_ART}</Text>
            <Box flexDirection="column" borderStyle="single" padding={1}>
                {output.map((line, index) => (
                    <Text key={index}>{line}</Text>
                ))}
                {isReady && (
                    <Box marginTop={1}>
                        <Text color="cyan">&gt; </Text>
                        <Text>{inputValue}</Text>
                        <Text color="gray">▋</Text>
                    </Box>
                )}
            </Box>
        </Box>
    );
}
