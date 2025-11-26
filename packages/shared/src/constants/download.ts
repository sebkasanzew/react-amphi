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
export const OSC_START = '\x1b]1337;';
export const OSC_END = '\x07';

// Protocol prefix for file downloads
export const FILE_DOWNLOAD_PREFIX = 'AmphiDownload=';

/**
 * Creates an escape sequence to signal a file download
 * @param fileId - UUID of the file stored on disk
 * @param fileName - Original filename to use for download
 */
export function createDownloadEscapeSequence(fileId: string, fileName: string): string {
    const encodedName = Buffer.from(fileName).toString('base64');
    return `${OSC_START}${FILE_DOWNLOAD_PREFIX}name=${encodedName}:id=${fileId}${OSC_END}`;
}

/**
 * Parses a download escape sequence
 * Returns null if the data doesn't contain a valid download sequence
 */
export function parseDownloadSequence(data: string): { fileId: string; fileName: string } | null {
    const prefix = `${OSC_START}${FILE_DOWNLOAD_PREFIX}`;
    const startIdx = data.indexOf(prefix);
    if (startIdx === -1) return null;

    const endIdx = data.indexOf(OSC_END, startIdx);
    if (endIdx === -1) return null;

    const content = data.slice(startIdx + prefix.length, endIdx);
    const nameMatch = content.match(/name=([^:]+)/);
    const idMatch = content.match(/id=([a-f0-9-]+)/i);

    if (!nameMatch || !idMatch) return null;

    try {
        const fileName = Buffer.from(nameMatch[1], 'base64').toString('utf-8');
        return { fileId: idMatch[1], fileName };
    } catch {
        return null;
    }
}

/**
 * Removes download escape sequences from terminal output
 * to prevent garbled display
 */
export function stripDownloadSequences(data: string): string {
    const prefix = `${OSC_START}${FILE_DOWNLOAD_PREFIX}`;
    let result = data;
    let startIdx: number;

    while ((startIdx = result.indexOf(prefix)) !== -1) {
        const endIdx = result.indexOf(OSC_END, startIdx);
        if (endIdx === -1) break;
        result = result.slice(0, startIdx) + result.slice(endIdx + 1);
    }

    return result;
}
