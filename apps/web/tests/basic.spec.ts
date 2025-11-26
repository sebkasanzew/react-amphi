import { test, expect } from '@playwright/test'

test.describe('Amphi Web Terminal', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/')
	})

	test('has correct title', async ({ page }) => {
		await expect(page).toHaveTitle(/Amphi Web Terminal/)
	})

	test('initializes xterm.js', async ({ page }) => {
		// Check if the terminal container is visible
		const terminalOutput = page.getByTestId('terminal-output')
		await expect(terminalOutput).toBeVisible()

		// Check if xterm.js has rendered its structure
		const xtermScreen = page.locator('.xterm-screen')
		await expect(xtermScreen).toBeVisible()

		const xtermViewport = page.locator('.xterm-viewport')
		await expect(xtermViewport).toBeVisible()
	})

	test('page does not vertically overflow after terminal mounts', async ({ page }) => {
		// Wait for terminal to render
		await expect(page.locator('.xterm-screen')).toBeVisible()

		// Ensure the document height is not taller than the viewport (no vertical scrollbar)
		const noOverflow = await page.evaluate(() => {
			return document.documentElement.scrollHeight <= window.innerHeight
		})
		expect(noOverflow).toBe(true)
	})

	test('displays the Ink CLI app in the terminal', async ({ page }) => {
		// Wait for terminal container + test hook
		await expect(page.locator('.xterm-screen')).toBeVisible()

		// Wait until the client-side test hook exposes the active WS and it's open
		await page.waitForFunction(() => {
			const hook = globalThis.__AMPHI_XTERM
			return !!hook && hook.ws?.readyState === 1
		})

		// The terminal should display the CLI app's users table
		// The CLI now shows users fetched from JSONPlaceholder API
		await expect(page.locator('.xterm-rows')).toContainText('Users')
	})

	test('prevents direct shell access - only CLI input is accepted', async ({ page }) => {
		// Wait for terminal container + test hook
		await expect(page.locator('.xterm-screen')).toBeVisible()

		// Wait until the client-side test hook exposes the active WS and it's open
		await page.waitForFunction(() => {
			const hook = globalThis.__AMPHI_XTERM
			return !!hook && hook.ws?.readyState === 1
		})

		// Wait for CLI to be ready
		await expect(page.locator('.xterm-rows')).toContainText('Users')

		// Try sending a shell command - it should NOT execute in a shell
		// The input goes to the CLI app, not to bash/zsh
		await page.evaluate(() => {
			const hook = globalThis.__AMPHI_XTERM
			hook?.ws?.send?.('ls -la\r')
		})

		// Wait for any potential response by checking the terminal content hasn't changed to shell output
		// Use a stability check instead of waitForTimeout
		await expect(page.locator('.xterm-rows')).toContainText('Users')

		// The terminal should NOT show typical shell output like file listings
		// It should still show the CLI interface
		const terminalContent = await page.locator('.xterm-rows').textContent()

		// Should not contain shell-specific output patterns
		expect(terminalContent).not.toMatch(/drwx|total \d+|-rw-/)

		// Should still show the CLI content
		expect(terminalContent).toContain('Users')
	})
})
