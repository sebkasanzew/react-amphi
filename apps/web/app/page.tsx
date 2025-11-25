'use client';

import { ASCII_ART } from '@amphi/shared';
import dynamic from 'next/dynamic';

// Dynamically import XtermComponent to avoid SSR issues with xterm.js
const XtermComponent = dynamic(() => import('../components/XtermComponent'), {
    ssr: false,
    loading: () => <div style={{ padding: '20px', color: '#00ff00' }}>Loading terminal...</div>
});

export default function Home() {
    return (
        <main
            data-testid="terminal-container"
            className="terminal-main"
            style={{
                // include padding in minHeight calculations so 100vh doesn't overflow
                boxSizing: 'border-box',
                backgroundColor: '#0a0a0a',
                color: '#00ff00',
                fontFamily: '"Fira Code", "SF Mono", "Monaco", "Inconsolata", "Fira Mono", "Droid Sans Mono", "Source Code Pro", monospace',
                minHeight: '100vh',
                padding: '20px',
                fontSize: '14px',
                lineHeight: '1.6',
                display: 'flex',
                flexDirection: 'column'
            }}
        >
            <div
                data-testid="terminal-output"
                className="terminal-output"
                style={{
                    border: '1px solid #333',
                    borderRadius: '4px',
                    padding: '15px',
                    backgroundColor: '#0d0d0d',
                    boxShadow: 'inset 0 0 10px rgba(0, 255, 0, 0.1)',
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden'
                }}
            >
                <XtermComponent />
            </div>
        </main>
    );
}

