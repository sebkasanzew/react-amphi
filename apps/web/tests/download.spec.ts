import { test, expect } from '@playwright/test'
import path from 'node:path'
import * as fs from 'node:fs'

test.describe('Excel Download Feature', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/')

		// Wait for terminal to be ready
		await expect(page.locator('.xterm-screen')).toBeVisible()

		// Wait until WebSocket is connected
		await page.waitForFunction(() => {
			const hook = globalThis.__AMPHI_XTERM
			return !!hook && hook.ws?.readyState === 1
		})
	})

	test('displays users table with data from API', async ({ page }) => {
		// Wait for the users table to load (react-query fetches from JSONPlaceholder)
		await expect(page.locator('.xterm-rows')).toContainText('Users')
		await expect(page.locator('.xterm-rows')).toContainText('records')

		// Should show table headers
		await expect(page.locator('.xterm-rows')).toContainText('Name')
		await expect(page.locator('.xterm-rows')).toContainText('Email')
	})

	test('shows download instructions', async ({ page }) => {
		// Wait for the CLI to fully load
		await expect(page.locator('.xterm-rows')).toContainText('Users')

		// Should show download instruction
		await expect(page.locator('.xterm-rows')).toContainText("'d'")
		await expect(page.locator('.xterm-rows')).toContainText('download')
	})

	test('downloads Excel file when pressing d key', async ({ page }) => {
		// Wait for the users table to load
		await expect(page.locator('.xterm-rows')).toContainText('Users')
		await expect(page.locator('.xterm-rows')).toContainText('records')

		// Set up download listener before triggering download
		const downloadPromise = page.waitForEvent('download')

		// Send 'd' key to trigger download
		await page.evaluate(() => {
			const hook = globalThis.__AMPHI_XTERM
			hook?.ws?.send?.('d')
		})

		// Wait for download to start
		const download = await downloadPromise

		// Verify the filename
		const suggestedFilename = download.suggestedFilename()
		expect(suggestedFilename).toBe('users-export.xlsx')

		const downloadPath = path.join(process.cwd(), 'test-results', `download-${Date.now()}.xlsx`)
		await download.saveAs(downloadPath)

		// Verify file exists and has content
		expect(fs.existsSync(downloadPath)).toBe(true)
		const stats = fs.statSync(downloadPath)
		expect(stats.size).toBeGreaterThan(0)

		// Clean up downloaded file
		fs.unlinkSync(downloadPath)
	})

	test('shows download status message after pressing d', async ({ page }) => {
		// Wait for the users table to load
		await expect(page.locator('.xterm-rows')).toContainText('Users')
		await expect(page.locator('.xterm-rows')).toContainText('records')

		// Set up download listener
		const downloadPromise = page.waitForEvent('download')

		// Send 'd' key to trigger download
		await page.evaluate(() => {
			const hook = globalThis.__AMPHI_XTERM
			hook?.ws?.send?.('d')
		})

		// Should show download status message
		await expect(page.locator('.xterm-rows')).toContainText('download')

		// Wait for download to complete
		await downloadPromise
	})

	test('can refresh data with r key', async ({ page }) => {
		// Wait for initial load
		await expect(page.locator('.xterm-rows')).toContainText('Users')
		await expect(page.locator('.xterm-rows')).toContainText('records')

		// Send 'r' key to refresh
		await page.evaluate(() => {
			const hook = globalThis.__AMPHI_XTERM
			hook?.ws?.send?.('r')
		})

		// Data should still be present after refresh (react-query will refetch)
		await expect(page.locator('.xterm-rows')).toContainText('Users')
		await expect(page.locator('.xterm-rows')).toContainText('records')
	})
})
