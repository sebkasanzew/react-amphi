# react-amphi

A type-safe monorepo template for Next.js (Web) and Ink (CLI) that shares a common React core. The web app embeds an interactive terminal (xterm.js) that connects to the CLI via WebSocket, allowing you to run your React-based CLI application directly in the browser.

## Features

- 🚀 **Turborepo** - High-performance build system for monorepos
- ⚛️ **React** - Latest React for both web and CLI
- 🥟 **Bun** - Fast all-in-one JavaScript runtime and package manager
- 🎨 **Ink** - React for CLIs with terminal UI
- 🌐 **Next.js** - App router with React Server Components
- 🔄 **Shared Logic** - Reusable hooks and utilities across apps
- 📝 **TypeScript** - Full type safety throughout
- 🖥️ **xterm.js** - Full terminal emulator in the browser
- 🔌 **WebSocket PTY Server** - Bridges web terminals to CLI processes
- 📦 **Standalone Executables** - Build CLI as single-file binaries for macOS and Windows
- 🧪 **Playwright** - End-to-end testing for web app
- 📐 **ESLint** - Code linting with Playwright plugin

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Browser                                 │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │              Next.js Web App (Tab 1)                    │    │
│  │  ┌─────────────────────────────────────────────────┐    │    │
│  │  │              xterm.js Terminal                  │    │    │
│  │  └──────────────────────┬──────────────────────────┘    │    │
│  └─────────────────────────┼───────────────────────────────┘    │
│                            │ WebSocket                          │
└────────────────────────────┼────────────────────────────────────┘
                             │
                             ▼
┌────────────────────────────────────────────────────────────────┐
│                    PTY WebSocket Server                        │
│                     (ws://localhost:3001)                      │
│                                                                │
│  ┌──────────────────┐      ┌──────────────────┐                │
│  │  Client Session  │      │  Client Session  │  ...           │
│  │  (Tab 1)         │      │  (Tab 2)         │                │
│  │  ┌────────────┐  │      │  ┌────────────┐  │                │
│  │  │ PTY Process│  │      │  │ PTY Process│  │                │
│  │  │ (CLI App)  │  │      │  │ (CLI App)  │  │                │
│  │  └────────────┘  │      │  └────────────┘  │                │
│  └──────────────────┘      └──────────────────┘                │
└────────────────────────────────────────────────────────────────┘
```

### Key Architectural Points

- **Per-Tab Isolation**: Each browser tab that connects gets its **own dedicated CLI process**. If you open two tabs, two separate CLI instances are spawned. Data displayed in one tab is **not** visible in other tabs.
- **Automatic Restart**: If the CLI process crashes, the PTY server automatically restarts it with exponential backoff (up to 5 attempts).
- **Secure by Design**: When the CLI is not running, input is ignored to prevent shell access.

## Project Structure

```
├── apps/
│   ├── cli/                  # Ink CLI application
│   │   └── source/
│   │       ├── app.tsx       # Main CLI React component
│   │       └── cli.tsx       # Entry point
│   └── web/                  # Next.js web application
│       ├── app/
│       │   ├── layout.tsx
│       │   └── page.tsx            # Terminal page
│       ├── components/
│       │   └── XtermComponent.tsx  # xterm.js wrapper
│       ├── server/
│       │   └── pty-server.ts       # WebSocket PTY server
│       └── tests/
│           └── basic.spec.ts
├── packages/
│   └── shared/               # Shared business logic
│       └── src/
│           ├── constants/
│           │   └── ascii.ts
│           ├── hooks/
│           │   └── useTerminalLogic.ts
│           ├── types/
│           │   └── index.ts
│           └── index.ts
└── turbo.json
```

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) 1.3.3+

### Installation

```bash
bun install
```

### Development

Start the web app with the integrated terminal:

```bash
bun run dev
```

This starts:
- Next.js dev server on `http://localhost:3000`
- PTY WebSocket server on `ws://localhost:3001`

The web app will display an interactive terminal that runs the CLI app. Each browser tab gets its own CLI instance.

**CLI app standalone** (Ink) - run directly in your terminal:
```bash
bun run dev:cli
```

### Build

Build all packages:

```bash
bun run build
```

### Testing

Run Playwright tests for the web app:

```bash
bun run test
```

### Linting & Type Checking

```bash
bun run lint
bun run typecheck
```

## Shared Package

The `@amphi/shared` package contains reusable business logic that works in both web and CLI environments:

### Hooks

- `useTerminalLogic()` - Terminal state management with output and ready state

### Constants

- `ASCII_ART` - The Amphi ASCII art banner

### Types

- `TerminalState` - Type definition for terminal state
- `TerminalConfig` - Configuration options for terminal logic

## Apps

### CLI (`@amphi/cli`)

A terminal-based React application built with [Ink](https://github.com/vadimdemedes/ink). This is the core application that handles user interaction and displays output.

Features:
- React-based terminal UI with Ink
- Keyboard input handling
- Shared logic with web app via `@amphi/shared`
- **Standalone executables** for macOS and Windows

```bash
# Development
bun run --filter @amphi/cli dev

# Build (bundled JS)
bun run --filter @amphi/cli build

# Run built version
bun run --filter @amphi/cli start
```

#### Building Standalone Executables

You can compile the CLI app into standalone executables that can be distributed without requiring Bun or Node.js to be installed:

```bash
# Build for both macOS and Windows
bun run --filter @amphi/cli build:exe

# Build for macOS only
bun run --filter @amphi/cli build:exe:macos

# Build for Windows only
bun run --filter @amphi/cli build:exe:windows
```

**Output files** (located in `apps/cli/dist/`):

| Platform | File | Description |
|----------|------|-------------|
| macOS | `amphi-macos` | Native macOS executable (~60MB) |
| Windows | `amphi-windows.exe` | Native Windows executable (~119MB) |

**Running the standalone executables:**

```bash
# macOS - run directly
./apps/cli/dist/amphi-macos

# Windows - run in cmd/PowerShell
.\apps\cli\dist\amphi-windows.exe
```

> **Note:** The executables are self-contained and include the Bun runtime. No additional dependencies are required on the target machine.

### Web (`@amphi/web`)

A Next.js web application that embeds a full terminal emulator (xterm.js) connected to the CLI app via WebSocket.

Features:
- Full terminal emulator with xterm.js
- WebSocket connection to PTY server
- Automatic terminal resizing
- CLI process lifecycle management (auto-restart on crash)

```bash
# Development (starts both Next.js and PTY server)
bun run --filter @amphi/web dev

# Build
bun run --filter @amphi/web build

# Production
bun run --filter @amphi/web start
```

## How It Works

1. **Web App**: The Next.js app serves a page with an xterm.js terminal component
2. **WebSocket Connection**: When the page loads, xterm.js connects to the PTY WebSocket server
3. **PTY Server**: For each WebSocket connection, a new PTY (pseudo-terminal) is spawned running the CLI app
4. **Bidirectional Communication**: 
   - User input from xterm.js → WebSocket → PTY → CLI stdin
   - CLI stdout → PTY → WebSocket → xterm.js display
5. **Isolation**: Each connection has its own CLI process, ensuring complete isolation between users/tabs

## Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PTY_PORT` | `3001` | Port for the PTY WebSocket server |
| `NODE_ENV` | `development` | Set to `production` for optimized builds |

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT
