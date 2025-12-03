import React from 'react'
import { Text, Box, useInput } from 'ink'

interface AboutViewProperties {
	onBack: () => void
}

export function AboutView({ onBack }: AboutViewProperties) {
	useInput((input, key) => {
		if (key.escape || input === 'q' || input === 'Q') {
			onBack()
		}
	})

	return (
		<Box flexDirection="column">
			<Box marginBottom={1}>
				<Text color="cyan" bold>
					About Amphi CLI
				</Text>
			</Box>

			<Box flexDirection="column" paddingLeft={1}>
				<Box marginBottom={1}>
					<Text color="white">
						<Text bold>Version:</Text> 0.0.1
					</Text>
				</Box>

				<Box marginBottom={1}>
					<Text color="white">
						<Text bold>Description:</Text>
						{' A CLI tool for managing and viewing data with Excel export capabilities.'}
					</Text>
				</Box>

				<Box marginBottom={1} flexDirection="column">
					<Text bold color="yellow">
						Features:
					</Text>
					<Box paddingLeft={2} flexDirection="column">
						<Text color="white">• View and browse user data</Text>
						<Text color="white">• Export data to Excel format</Text>
						<Text color="white">• Web terminal integration</Text>
						<Text color="white">• Keyboard-driven navigation</Text>
					</Box>
				</Box>

				<Box marginBottom={1} flexDirection="column">
					<Text bold color="yellow">
						Tech Stack:
					</Text>
					<Box paddingLeft={2} flexDirection="column">
						<Text color="white">• React + Ink for terminal UI</Text>
						<Text color="white">• TanStack Query for data fetching</Text>
						<Text color="white">• ExcelJS for spreadsheet generation</Text>
					</Box>
				</Box>

				<Box marginTop={1}>
					<Text color="gray">Built with ❤️ using Bun + TypeScript</Text>
				</Box>
			</Box>

			<Box marginTop={2}>
				<Text color="gray" dimColor>
					Press <Text bold>'q'</Text> or <Text bold>Esc</Text> to go back
				</Text>
			</Box>
		</Box>
	)
}
