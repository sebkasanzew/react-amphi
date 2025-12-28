import { test, expect } from '@playwright/test'

test.describe('Startup Message', () => {
	test('removes system startup message after CLI loads', async ({ page }) => {
		await page.goto('/')

		// Wait for terminal to be ready
		await expect(page.locator('.xterm-screen')).toBeVisible()

		const startupMessage = '[System] Starting Amphi CLI...'

		// Wait for the startup message to appear first (to ensure we connected)
		await expect(page.locator('.xterm-rows')).toContainText(startupMessage)

		// Now wait for the startup message to DISAPPEAR
		// This confirms that the CLI app started and cleared the screen
		await expect(page.locator('.xterm-rows')).not.toContainText(startupMessage)
	})
})
