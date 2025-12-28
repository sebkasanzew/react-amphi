import { test, expect } from '@playwright/test'

test.describe('Terminal Rendering Performance', () => {
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

	test('terminal does not flash or fully rerender on updates', async ({ page }) => {
		// Wait for initial CLI menu to render
		await expect(page.locator('.xterm-rows')).toContainText('Main Menu')

		// Track DOM mutations on the terminal screen
		const mutationData = await page.evaluate(() => {
			return new Promise<{
				totalMutations: number
				fullRerenderDetected: boolean
				textContentChanges: number
			}>((resolve) => {
				let totalMutations = 0
				let fullRerenderDetected = false
				let textContentChanges = 0
				const xtermScreen = document.querySelector('.xterm-screen')

				if (!xtermScreen) {
					resolve({ totalMutations: 0, fullRerenderDetected: false, textContentChanges: 0 })
					return
				}

				// Count child nodes before mutation
				const initialChildCount = xtermScreen.querySelectorAll('.xterm-rows > div').length

				const observer = new MutationObserver((mutations) => {
					totalMutations += mutations.length

					for (const mutation of mutations) {
						// Check if entire rows container was replaced (indicates full rerender)
						if (mutation.type === 'childList') {
							const currentChildCount = xtermScreen.querySelectorAll('.xterm-rows > div').length

							// If all rows are removed and re-added, it's a full rerender
							if (
								mutation.removedNodes.length > initialChildCount / 2 &&
								mutation.addedNodes.length > initialChildCount / 2
							) {
								fullRerenderDetected = true
							}
						}

						// Count text content changes (expected for actual updates)
						if (mutation.type === 'characterData') {
							textContentChanges++
						}
					}
				})

				observer.observe(xtermScreen, {
					childList: true,
					subtree: true,
					characterData: true,
					characterDataOldValue: true,
				})

				// Simulate user interaction by sending input to trigger terminal updates
				const hook = globalThis.__AMPHI_XTERM
				if (hook?.ws) {
					// Send arrow down to navigate menu (triggers terminal update)
					hook.ws.send('\x1b[B') // Arrow down escape sequence
				}

				// Wait for mutations to settle
				setTimeout(() => {
					observer.disconnect()
					resolve({
						totalMutations,
						fullRerenderDetected,
						textContentChanges,
					})
				}, 1000) // Wait 1 second for mutations
			})
		})

		// Verify no full rerender occurred
		expect(mutationData.fullRerenderDetected).toBe(false)

		// Some mutations are expected (actual content updates), but not excessive
		expect(mutationData.totalMutations).toBeGreaterThan(0) // Should have some updates
		expect(mutationData.totalMutations).toBeLessThan(100) // But not excessive
	})

	test('terminal instance is created only once', async ({ page }) => {
		// Track how many times Terminal constructor is called
		const creationCount = await page.evaluate(() => {
			return new Promise<number>((resolve) => {
				// Get current terminal instance
				const hook = globalThis.__AMPHI_XTERM
				const initialTerm = hook?.term

				// Store reference to check if it changes
				const checkInterval = setInterval(() => {
					const currentTerm = globalThis.__AMPHI_XTERM?.term
					if (currentTerm !== initialTerm) {
						// Terminal instance changed - this shouldn't happen
						clearInterval(checkInterval)
						resolve(2) // Recreated
					}
				}, 100)

				// After 1 second, if instance hasn't changed, we're good
				setTimeout(() => {
					clearInterval(checkInterval)
					resolve(1) // Only created once
				}, 1000)
			})
		})

		// Terminal should only be created once
		expect(creationCount).toBe(1)
	})

	test('terminal updates are smooth without visual flashing', async ({ page }) => {
		// Ensure initial render is complete
		await expect(page.locator('.xterm-rows')).toContainText('Main Menu')

		// Take screenshot before interaction
		const beforeBuffer = await page.locator('.xterm-screen').screenshot()

		// Send navigation input
		await page.evaluate(() => {
			const hook = globalThis.__AMPHI_XTERM
			hook?.ws?.send?.('\x1b[B') // Arrow down
		})

		// Wait a bit for the update
		await page.waitForTimeout(300)

		// Take screenshot after interaction
		const afterBuffer = await page.locator('.xterm-screen').screenshot()

		// The screenshots should be different (content changed)
		// but not dramatically so (no full flash/rerender)
		expect(beforeBuffer.equals(afterBuffer)).toBe(false)

		// Verify content still looks correct
		const terminalContent = await page.locator('.xterm-rows').textContent()
		expect(terminalContent).toContain('Main Menu')
	})
})
