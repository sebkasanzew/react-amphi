import React from 'react';
import { Text, Box } from 'ink';
import { ASCII_ART } from '@amphi/shared';
import { QueryProvider } from './providers/QueryProvider.js';
import { UsersView } from './components/UsersView.js';

export default function App() {
    return (
        <QueryProvider>
            <Box flexDirection="column">
                <Text color="green">{ASCII_ART}</Text>
                <Box flexDirection="column" borderStyle="single" padding={1}>
                    <UsersView />
                </Box>
            </Box>
        </QueryProvider>
    );
}
