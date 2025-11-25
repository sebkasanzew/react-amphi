// Augment the global Window interface so tests and components can access
// `window.__AMPHI_XTERM` without TypeScript errors.

declare global {
  interface Window {
    __AMPHI_XTERM?: {
      term: import('@xterm/xterm').Terminal;
      ws: WebSocket;
    };
  }
}

export {};
