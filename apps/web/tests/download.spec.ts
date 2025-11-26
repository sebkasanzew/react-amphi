import { test, expect } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';
import ExcelJS from 'exceljs';

test.describe('Excel Download Feature', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');

        // Wait for terminal to be ready
        await expect(page.locator('.xterm-screen')).toBeVisible();

        // Wait until WebSocket is connected
        await page.waitForFunction(() => {
            const hook = window.__AMPHI_XTERM;
            return !!hook && hook.ws?.readyState === 1;
        }, null, { timeout: 15000 });
    });

    test('displays users table with data from API', async ({ page }) => {
        // Wait for the users table to load (react-query fetches from JSONPlaceholder)
        await expect(page.locator('.xterm-rows')).toContainText('Users', { timeout: 15000 });
        await expect(page.locator('.xterm-rows')).toContainText('records', { timeout: 10000 });

        // Should show table headers
        await expect(page.locator('.xterm-rows')).toContainText('Name', { timeout: 5000 });
        await expect(page.locator('.xterm-rows')).toContainText('Email', { timeout: 5000 });
    });

    test('shows download instructions', async ({ page }) => {
        // Wait for the CLI to fully load
        await expect(page.locator('.xterm-rows')).toContainText('Users', { timeout: 15000 });

        // Should show download instruction
        await expect(page.locator('.xterm-rows')).toContainText("'d'", { timeout: 5000 });
        await expect(page.locator('.xterm-rows')).toContainText('download', { timeout: 5000 });
    });

    test('downloads Excel file when pressing d key', async ({ page }) => {
        // Wait for the users table to load
        await expect(page.locator('.xterm-rows')).toContainText('Users', { timeout: 15000 });
        await expect(page.locator('.xterm-rows')).toContainText('records', { timeout: 10000 });

        // Set up download listener before triggering download
        const downloadPromise = page.waitForEvent('download', { timeout: 30000 });

        // Send 'd' key to trigger download
        await page.evaluate(() => {
            const hook = window.__AMPHI_XTERM;
            hook?.ws.send('d');
        });

        // Wait for download to start
        const download = await downloadPromise;

        // Verify the filename
        const suggestedFilename = download.suggestedFilename();
        expect(suggestedFilename).toBe('users-export.xlsx');

        // Save file to temp location and verify contents
        const downloadPath = path.join(__dirname, '..', 'test-results', `download-${Date.now()}.xlsx`);
        await download.saveAs(downloadPath);

        // Verify file exists and has content
        expect(fs.existsSync(downloadPath)).toBe(true);
        const stats = fs.statSync(downloadPath);
        expect(stats.size).toBeGreaterThan(0);

        // Parse the Excel file and verify structure
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.readFile(downloadPath);

        // Should have at least one sheet
        expect(workbook.worksheets.length).toBeGreaterThan(0);

        // First sheet should be named 'Users'
        expect(workbook.worksheets[0]?.name).toBe('Users');

        // Get the Users worksheet
        const sheet = workbook.getWorksheet('Users')!;

        // Convert sheet to array of objects and verify data
        const data: Record<string, unknown>[] = [];
        const headers: string[] = [];

        sheet.eachRow((row: ExcelJS.Row, rowNumber: number) => {
            if (rowNumber === 1) {
                // First row is headers
                row.eachCell((cell: ExcelJS.Cell, colNumber: number) => {
                    headers[colNumber - 1] = String(cell.value);
                });
            } else {
                // Data rows
                const rowData: Record<string, unknown> = {};
                row.eachCell((cell: ExcelJS.Cell, colNumber: number) => {
                    rowData[headers[colNumber - 1] ?? ''] = cell.value;
                });
                data.push(rowData);
            }
        });

        // Should have user data (local JSON has 10 users)
        expect(data.length).toBe(10);

        // Verify expected columns exist
        const firstRow = data[0];
        expect(firstRow).toHaveProperty('ID');
        expect(firstRow).toHaveProperty('Name');
        expect(firstRow).toHaveProperty('Username');
        expect(firstRow).toHaveProperty('Email');
        expect(firstRow).toHaveProperty('City');
        expect(firstRow).toHaveProperty('Company');

        // Clean up downloaded file
        fs.unlinkSync(downloadPath);
    });

    test('shows download status message after pressing d', async ({ page }) => {
        // Wait for the users table to load
        await expect(page.locator('.xterm-rows')).toContainText('Users', { timeout: 15000 });
        await expect(page.locator('.xterm-rows')).toContainText('records', { timeout: 10000 });

        // Set up download listener
        const downloadPromise = page.waitForEvent('download', { timeout: 30000 });

        // Send 'd' key to trigger download
        await page.evaluate(() => {
            const hook = window.__AMPHI_XTERM;
            hook?.ws.send('d');
        });

        // Should show download status message
        await expect(page.locator('.xterm-rows')).toContainText('download', { timeout: 5000 });

        // Wait for download to complete
        await downloadPromise;
    });

    test('can refresh data with r key', async ({ page }) => {
        // Wait for initial load
        await expect(page.locator('.xterm-rows')).toContainText('Users', { timeout: 15000 });
        await expect(page.locator('.xterm-rows')).toContainText('records', { timeout: 10000 });

        // Send 'r' key to refresh
        await page.evaluate(() => {
            const hook = window.__AMPHI_XTERM;
            hook?.ws.send('r');
        });

        // Data should still be present after refresh (react-query will refetch)
        await expect(page.locator('.xterm-rows')).toContainText('Users', { timeout: 15000 });
        await expect(page.locator('.xterm-rows')).toContainText('records', { timeout: 10000 });
    });
});
