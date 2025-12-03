/**
 * Download Protocol for Amphi CLI -> Browser communication
 *
 * Uses OSC (Operating System Command) escape sequences to send download
 * messages through the terminal. Format:
 *
 * \x1b]1337;File=name=<base64_filename>:id=<uuid>\x07
 *
 * The PTY server intercepts these messages and the browser triggers downloads.
 */

// OSC sequence markers
export const OSC_START = '\u001B]1337;'
export const OSC_END = '\u0007'

// Protocol prefix for file downloads
export const FILE_DOWNLOAD_PREFIX = 'AmphiDownload='

/**
 * Creates an escape sequence to signal a file download
 * @param fileId - UUID of the file stored on disk
 * @param fileName - Original filename to use for download
 */
export function createDownloadEscapeSequence(fileId: string, fileName: string): string {
	const encodedName = Buffer.from(fileName).toString('base64')
	return `${OSC_START}${FILE_DOWNLOAD_PREFIX}name=${encodedName}:id=${fileId}${OSC_END}`
}

/**
 * Parses a download escape sequence
 * Returns null if the data doesn't contain a valid download sequence
 */
export function parseDownloadSequence(data: string): { fileId: string; fileName: string } | null {
	const prefix = `${OSC_START}${FILE_DOWNLOAD_PREFIX}`
	const startIndex = data.indexOf(prefix)
	if (startIndex === -1) return null

	const endIndex = data.indexOf(OSC_END, startIndex)
	if (endIndex === -1) return null

	const content = data.slice(startIndex + prefix.length, endIndex)
	const nameMatch = content.match(/name=([^:]+)/)
	const idMatch = content.match(/id=([a-f0-9-]+)/i)

	if (!nameMatch || !idMatch) return null

	try {
		const fileName = Buffer.from(nameMatch[1], 'base64').toString('utf8')
		return { fileId: idMatch[1], fileName }
	} catch {
		return null
	}
}

/**
 * Removes download escape sequences from terminal output
 * to prevent garbled display
 */
export function stripDownloadSequences(data: string): string {
	const prefix = `${OSC_START}${FILE_DOWNLOAD_PREFIX}`
	let result = data
	let startIndex: number

	while ((startIndex = result.indexOf(prefix)) !== -1) {
		const endIndex = result.indexOf(OSC_END, startIndex)
		if (endIndex === -1) break
		result = result.slice(0, startIndex) + result.slice(endIndex + 1)
	}

	return result
}
