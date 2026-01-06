import { WebSocketServer, WebSocket } from 'ws'
import * as pty from 'node-pty'
import { IPty } from 'node-pty'
import path from 'node:path'
import * as fs from 'node:fs'
import * as os from 'node:os'
import * as http from 'node:http'
import { fileURLToPath } from 'node:url'
import { parseDownloadSequence, stripDownloadSequences } from '@amphi/shared'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const PORT = Number.parseInt(process.env.PTY_PORT || process.env.PORT || '3001', 10)
const PUBLIC_URL = process.env.PUBLIC_URL || `http://localhost:${PORT}`

// Temp directory for download files (same as CLI)
const TEMP_DIR = path.join(os.tmpdir(), 'amphi-downloads')

// Path to the CLI package
const CLI_PACKAGE_DIR = path.resolve(__dirname, '../../cli')

// CLI command - use bun for both development and production
const CLI_COMMAND = 'bun'
const CLI_ARGS = ['--conditions=production', path.join(CLI_PACKAGE_DIR, 'source/cli.tsx')]

// Configuration for restart behavior
const MAX_RESTART_ATTEMPTS = 5
const RESTART_DELAY_MS = 1000
const RESTART_BACKOFF_MULTIPLIER = 2

// Create a clean environment for the CLI process
// Filter out npm config variables that cause warnings
function getCleanEnvironment(): Record<string, string> {
	const environment: Record<string, string> = {}
	const problematicPrefixes = ['npm_config_', 'npm_package_', 'npm_lifecycle_']

	for (const [key, value] of Object.entries(process.env)) {
		if (value === undefined) continue

		// Skip npm-specific config variables that cause warnings
		const lowerKey = key.toLowerCase()
		const isProblematic = problematicPrefixes.some((prefix) => lowerKey.startsWith(prefix))

		if (!isProblematic) {
			environment[key] = value
		}
	}

	// Remove CI environment variable to ensure Ink behaves interactively
	delete environment.CI

	return environment
}

// Create HTTP server for file downloads
const httpServer = http.createServer((request, response) => {
	// CORS headers
	response.setHeader('Access-Control-Allow-Origin', '*')
	response.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
	response.setHeader('Access-Control-Allow-Headers', 'Content-Type')

	if (request.method === 'OPTIONS') {
		response.writeHead(204)
		response.end()
		return
	}

	if (request.method !== 'GET') {
		response.writeHead(405, { 'Content-Type': 'text/plain' })
		response.end('Method Not Allowed')
		return
	}

	const url = new URL(request.url || '/', PUBLIC_URL)
	const pathParts = url.pathname.split('/')

	// Expect /download/:fileId
	if (pathParts[1] !== 'download' || !pathParts[2]) {
		response.writeHead(404, { 'Content-Type': 'text/plain' })
		response.end('Not Found')
		return
	}

	const fileId = pathParts[2]
	// Remove .xlsx extension if present in the request
	const cleanFileId = fileId.replace(/\.xlsx$/, '')
	const fileName = url.searchParams.get('name') || `${cleanFileId}.xlsx`
	const filePath = path.join(TEMP_DIR, `${cleanFileId}.xlsx`)

	// Security: validate fileId is a valid UUID pattern
	const uuidPattern = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i
	if (!uuidPattern.test(cleanFileId)) {
		response.writeHead(400, { 'Content-Type': 'text/plain' })
		response.end('Invalid file ID')
		return
	}

	if (!fs.existsSync(filePath)) {
		response.writeHead(404, { 'Content-Type': 'text/plain' })
		response.end('File not found')
		return
	}

	// Set headers for file download
	response.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
	response.setHeader('Content-Disposition', `attachment; filename="${fileName}"`)

	const stream = fs.createReadStream(filePath)
	stream.pipe(response)

	// Clean up file after successful download
	stream.on('end', () => {
		// Delay cleanup to ensure download completes
		setTimeout(() => {
			try {
				if (fs.existsSync(filePath)) {
					fs.unlinkSync(filePath)
					console.log(`Cleaned up temp file: ${filePath}`)
				}
			} catch (error) {
				console.error(`Failed to cleanup temp file: ${filePath}`, error)
			}
		}, 1000)
	})

	stream.on('error', (error) => {
		console.error('File stream error:', error)
		response.writeHead(500, { 'Content-Type': 'text/plain' })
		response.end('Internal Server Error')
	})
})

httpServer.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`)
})

const wss = new WebSocketServer({ server: httpServer })

console.log(`PTY WebSocket server running on ws://localhost:${PORT}`)
console.log(`CLI will be spawned from: ${CLI_PACKAGE_DIR}`)

interface ClientSession {
	ws: WebSocket
	ptyProcess: IPty | null
	restartAttempts: number
	isClosing: boolean
	pendingCols: number
	pendingRows: number
}

function sendStatusMessage(ws: WebSocket, type: string, message: string) {
	if (ws.readyState === WebSocket.OPEN) {
		// Send as ANSI escape sequence to display in terminal
		const coloredMessage =
			type === 'error'
				? `\u001B[31m${message}\u001B[0m\r\n` // Red for errors
				: type === 'warning'
					? `\u001B[33m${message}\u001B[0m\r\n` // Yellow for warnings
					: `\u001B[36m${message}\u001B[0m\r\n` // Cyan for info
		ws.send(coloredMessage)
	}
}

function spawnCLI(session: ClientSession): IPty | null {
	if (session.isClosing) {
		return null
	}

	try {
		const ptyProcess = pty.spawn(CLI_COMMAND, CLI_ARGS, {
			name: 'xterm-256color',
			cols: session.pendingCols || 80,
			rows: session.pendingRows || 24,
			cwd: CLI_PACKAGE_DIR,
			env: {
				...getCleanEnvironment(),
				// Force color output for Ink
				FORCE_COLOR: '1',
				// Ensure proper terminal behavior
				TERM: 'xterm-256color',
				// Indicate we're running in web mode (for download handling)
				AMPHI_WEB_MODE: '1',
			},
		})

		console.log(`Spawned CLI process with PID: ${ptyProcess.pid}`)

		// Send PTY output to the WebSocket client
		ptyProcess.onData((data: string) => {
			if (session.ws.readyState === WebSocket.OPEN) {
				// Check for download sequences
				const downloadInfo = parseDownloadSequence(data)
				if (downloadInfo) {
					// Send download message as JSON for the browser to handle
					const downloadMessage = JSON.stringify({
						type: 'download',
						fileId: downloadInfo.fileId,
						fileName: downloadInfo.fileName,
						url: `${PUBLIC_URL}/download/${downloadInfo.fileId}?name=${encodeURIComponent(downloadInfo.fileName)}`,
					})
					session.ws.send(downloadMessage)

					// Strip the download sequence from terminal output
					const cleanData = stripDownloadSequences(data)
					if (cleanData) {
						session.ws.send(cleanData)
					}
				} else {
					session.ws.send(data)
				}
			}
		})

		// Handle PTY process exit - this is where we handle crashes
		ptyProcess.onExit(({ exitCode, signal }) => {
			console.log(`CLI process exited with code ${exitCode}, signal ${signal}`)
			session.ptyProcess = null

			if (session.isClosing) {
				return
			}

			// Calculate restart delay with exponential backoff
			const delay = RESTART_DELAY_MS * Math.pow(RESTART_BACKOFF_MULTIPLIER, session.restartAttempts)

			if (session.restartAttempts < MAX_RESTART_ATTEMPTS) {
				session.restartAttempts++

				if (exitCode === 0) {
					sendStatusMessage(
						session.ws,
						'info',
						`[System] CLI exited normally. Restarting in ${delay / 1000}s...`
					)
				} else {
					sendStatusMessage(
						session.ws,
						'warning',
						`[System] CLI crashed (exit code: ${exitCode}). Restarting in ${delay / 1000}s... (attempt ${session.restartAttempts}/${MAX_RESTART_ATTEMPTS})`
					)
				}

				// Clear terminal before restart
				setTimeout(() => {
					if (!session.isClosing && session.ws.readyState === WebSocket.OPEN) {
						// Clear screen and move cursor to top
						session.ws.send('\u001B[2J\u001B[H')
						sendStatusMessage(session.ws, 'info', '[System] Restarting CLI...')

						const newPty = spawnCLI(session)
						if (newPty) {
							session.ptyProcess = newPty
							// Reset restart counter on successful spawn after a delay
							setTimeout(() => {
								if (session.ptyProcess && session.ptyProcess.pid) {
									session.restartAttempts = 0
								}
							}, 5000)
						}
					}
				}, delay)
			} else {
				sendStatusMessage(
					session.ws,
					'error',
					`[System] CLI has crashed too many times (${MAX_RESTART_ATTEMPTS} attempts). Connection will be closed.`
				)
				sendStatusMessage(session.ws, 'error', '[System] Please refresh the page to reconnect.')

				// Close the WebSocket after a brief delay to allow message to be sent
				setTimeout(() => {
					if (session.ws.readyState === WebSocket.OPEN) {
						session.ws.close()
					}
				}, 1000)
			}
		})

		return ptyProcess
	} catch (error) {
		console.error('Failed to spawn CLI process:', error)
		sendStatusMessage(session.ws, 'error', `[System] Failed to start CLI: ${error}`)
		return null
	}
}

wss.on('connection', (ws: WebSocket) => {
	console.log('Client connected')

	const session: ClientSession = {
		ws,
		ptyProcess: null,
		restartAttempts: 0,
		isClosing: false,
		pendingCols: 80,
		pendingRows: 24,
	}

	// Send initial status message
	sendStatusMessage(ws, 'info', '[System] Starting Amphi CLI...')

	// Spawn the CLI process
	session.ptyProcess = spawnCLI(session)

	if (!session.ptyProcess) {
		sendStatusMessage(ws, 'error', '[System] Failed to start CLI. Please try again later.')
		ws.close()
		return
	}

	// Handle incoming messages from the WebSocket client
	ws.on('message', (message: Buffer | ArrayBuffer | Buffer[]) => {
		const data = message.toString()

		// Handle resize messages (JSON format)
		try {
			const parsed = JSON.parse(data)
			if (parsed.type === 'resize' && parsed.cols && parsed.rows) {
				session.pendingCols = parsed.cols
				session.pendingRows = parsed.rows
				if (session.ptyProcess) {
					session.ptyProcess.resize(parsed.cols, parsed.rows)
					console.log(`Resized terminal to ${parsed.cols}x${parsed.rows}`)
				}
				return
			}
		} catch {
			// Not JSON, treat as regular input
		}

		// Only send input if CLI process is running
		// This prevents any shell access if CLI is down
		if (session.ptyProcess) {
			session.ptyProcess.write(data)
		} else {
			// CLI is not running, don't forward input
			// This is a security measure to prevent shell access
			sendStatusMessage(ws, 'warning', '[System] CLI is not running. Input ignored.')
		}
	})

	// Handle WebSocket close
	ws.on('close', () => {
		console.log('Client disconnected, cleaning up')
		session.isClosing = true
		if (session.ptyProcess) {
			session.ptyProcess.kill()
			session.ptyProcess = null
		}
	})

	// Handle WebSocket errors
	ws.on('error', (error) => {
		console.error('WebSocket error:', error)
		session.isClosing = true
		if (session.ptyProcess) {
			session.ptyProcess.kill()
			session.ptyProcess = null
		}
	})
})

// Handle server shutdown gracefully
process.on('SIGINT', () => {
	console.log('\nShutting down PTY server...')
	wss.close(() => {
		console.log('Server closed')
		process.exit(0)
	})
})

process.on('SIGTERM', () => {
	console.log('\nShutting down PTY server...')
	wss.close(() => {
		console.log('Server closed')
		process.exit(0)
	})
})
