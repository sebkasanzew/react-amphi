import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { exec } from 'child_process';
import ExcelJS from 'exceljs';
import { v4 as uuidv4 } from 'uuid';
import { createDownloadEscapeSequence } from '@amphi/shared';

// Temp directory for download files
const TEMP_DIR = path.join(os.tmpdir(), 'amphi-downloads');

// Ensure temp directory exists
if (!fs.existsSync(TEMP_DIR)) {
    fs.mkdirSync(TEMP_DIR, { recursive: true });
}

/**
 * Check if running inside the web PTY server
 * The PTY server sets this env var to indicate web mode
 */
function isWebMode(): boolean {
    return process.env.AMPHI_WEB_MODE === '1';
}

/**
 * Open a file with the system's default application
 */
function openFile(filePath: string): void {
    const platform = process.platform;
    let cmd: string;

    if (platform === 'darwin') {
        cmd = `open "${filePath}"`;
    } else if (platform === 'win32') {
        cmd = `start "" "${filePath}"`;
    } else {
        // Linux and others
        cmd = `xdg-open "${filePath}"`;
    }

    exec(cmd, (error) => {
        if (error) {
            // Silently fail - the file path will be shown to user
        }
    });
}

export interface ExcelColumn {
    key: string;
    header: string;
    width?: number;
}

export interface ExportOptions {
    fileName: string;
    sheetName?: string;
    columns?: ExcelColumn[];
}

/**
 * Creates an Excel file from data and triggers browser download
 * @param data - Array of objects to export
 * @param options - Export configuration
 * @returns The file ID (UUID) for the created file
 */
export async function exportToExcel<T extends object>(
    data: T[],
    options: ExportOptions
): Promise<string> {
    const fileId = uuidv4();
    const { fileName, sheetName = 'Sheet1', columns } = options;

    // Create workbook
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(sheetName);

    if (columns) {
        // Set up columns with headers and widths
        worksheet.columns = columns.map(col => ({
            header: col.header,
            key: col.key,
            width: col.width || 15
        }));

        // Add data rows
        data.forEach(row => {
            const rowData: Record<string, unknown> = {};
            columns.forEach(col => {
                rowData[col.key] = (row as Record<string, unknown>)[col.key];
            });
            worksheet.addRow(rowData);
        });
    } else {
        // Use default behavior - get keys from first object
        if (data.length > 0) {
            const keys = Object.keys(data[0]);
            worksheet.columns = keys.map(key => ({
                header: key,
                key: key,
                width: 15
            }));
            data.forEach(row => worksheet.addRow(row));
        }
    }

    // Write to file
    let filePath: string;

    if (isWebMode()) {
        // Web mode: save to temp dir and send escape sequence for browser download
        filePath = path.join(TEMP_DIR, `${fileId}.xlsx`);
        await workbook.xlsx.writeFile(filePath);
        process.stdout.write(createDownloadEscapeSequence(fileId, fileName));
    } else {
        // Standalone CLI mode: save to current directory and open file
        filePath = path.join(process.cwd(), fileName);
        await workbook.xlsx.writeFile(filePath);
        openFile(filePath);
    }

    return fileId;
}

/**
 * Get the temp directory path for downloads
 */
export function getTempDir(): string {
    return TEMP_DIR;
}

/**
 * Get the full path for a temp file
 */
export function getTempFilePath(fileId: string): string {
    return path.join(TEMP_DIR, `${fileId}.xlsx`);
}

/**
 * Clean up a temp file after download
 */
export function cleanupTempFile(fileId: string): void {
    const filePath = getTempFilePath(fileId);
    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
    }
}
