'use client';

import { useEffect, useRef } from 'react';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import '@xterm/xterm/css/xterm.css';

interface DownloadMessage {
    type: 'download';
    fileId: string;
    fileName: string;
    url: string;
}

interface XtermComponentProps {
    wsUrl?: string;
}

/**
 * Triggers a file download in the browser
 */
function triggerDownload(url: string, fileName: string) {
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

/**
 * Check if data is a JSON download message
 */
function parseDownloadMessage(data: string): DownloadMessage | null {
    try {
        const parsed = JSON.parse(data);
        if (parsed.type === 'download' && parsed.fileId && parsed.fileName && parsed.url) {
            return parsed as DownloadMessage;
        }
    } catch {
        // Not JSON, ignore
    }
    return null;
}

export default function XtermComponent({ wsUrl = 'ws://localhost:3001' }: XtermComponentProps) {
    const terminalRef = useRef<HTMLDivElement>(null);
    const termInstance = useRef<Terminal | null>(null);
    const wsInstance = useRef<WebSocket | null>(null);

    useEffect(() => {
        if (!terminalRef.current) return;

        // Initialize xterm.js
        const term = new Terminal({
            cursorBlink: true,
            fontFamily: '"Fira Code", "SF Mono", "Monaco", "Inconsolata", "Fira Mono", "Droid Sans Mono", "Source Code Pro", monospace',
            fontSize: 14,
            theme: {
                background: '#0d0d0d',
                foreground: '#00ff00',
                cursor: '#00ff00',
            }
        });

        const fitAddon = new FitAddon();
        term.loadAddon(fitAddon);

        term.open(terminalRef.current);
        // Call fit() safely after the terminal is opened and DOM is painted.
        // In some environments xterm's renderer can be not yet initialized which
        // results in runtime errors when reading `dimensions`. Scheduling the
        // call avoids calling fit too early and guards against unexpected
        // errors coming from xterm internals.
        const safeFit = () => {
            try {
                // guard in case the addon or terminal was disposed already
                if (fitAddon && typeof fitAddon.fit === 'function') {
                    // run inside a frame to ensure layout has settled
                    requestAnimationFrame(() => {
                        try { fitAddon.fit(); } catch { /* ignore */ }
                    });
                }
            } catch {
                // ignore
            }
        };

        // call fit a tick later and expose the instance
        setTimeout(safeFit);
        termInstance.current = term;

        // Connect to WebSocket
        const ws = new WebSocket(wsUrl);
        wsInstance.current = ws;

        // Handle incoming WebSocket messages manually to intercept downloads
        ws.onmessage = (event) => {
            const data = typeof event.data === 'string' ? event.data : '';

            // Check if this is a download message
            const downloadMsg = parseDownloadMessage(data);
            if (downloadMsg) {
                // Trigger file download in browser
                triggerDownload(downloadMsg.url, downloadMsg.fileName);
                return; // Don't send to terminal
            }

            // Regular terminal data - write to terminal
            term.write(data);
        };

        // Handle terminal input - send to WebSocket
        term.onData((data) => {
            if (ws.readyState === WebSocket.OPEN) {
                ws.send(data);
            }
        });

        // Expose test hook so Playwright can access the active terminal+socket in tests
        // This is only useful for automated tests and will be cleaned up on unmount.
        try {
            window.__AMPHI_XTERM = { term, ws };
        } catch {
            // ignore in non-browser or restricted environments
        }

        // Handle resize
        const handleResize = () => {
            // use safe fit on resize to avoid calling into xterm internals while
            // the terminal is being torn down or renderer hasn't been created yet.
            try {
                if (fitAddon && typeof fitAddon.fit === 'function') {
                    requestAnimationFrame(() => { try { fitAddon.fit(); } catch { /* ignore */ } });
                }
            } catch {
                // ignore
            }
            if (ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({
                    type: 'resize',
                    cols: term.cols,
                    rows: term.rows
                }));
            }
        };

        window.addEventListener('resize', handleResize);

        // Initial resize after connection — use our safe method
        ws.onopen = () => {
            handleResize();
            try { term.focus(); } catch { /* ignore */ }
        };

        return () => {
            window.removeEventListener('resize', handleResize);
            try { term.dispose(); } catch { /* ignore */ }
            try {
                // cleanup test hook
                if (window.__AMPHI_XTERM?.ws === ws) delete window.__AMPHI_XTERM;
            } catch { }
            try { ws.close(); } catch { /* ignore */ }
        };
    }, [wsUrl]);

    return (
        <div
            ref={terminalRef}
            className="xterm-container"
            // Make this container a flexible child so it can shrink/grow inside
            // the parent's flexbox without forcing the page to overflow.
            style={{
                width: '100%',
                height: '100%',
                // allow parent flexbox to control height and permit shrinking
                minHeight: 400,
                display: 'flex',
                flex: '1 1 0',
                overflow: 'hidden',
            }}
        />
    );
}
