import { Terminal } from '@xterm/xterm'

declare global {
	var __AMPHI_XTERM:
		| {
				term: Terminal
				ws: WebSocket
		  }
		| undefined
}
