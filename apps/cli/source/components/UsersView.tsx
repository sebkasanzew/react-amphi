import React, { useCallback, useState } from 'react'
import { Text, Box, useInput } from 'ink'
import { useFetchUsers, FlatUser } from '../hooks/useFetchUsers.js'
import { DataTable } from './DataTable.js'
import { exportToExcel } from '../utils/excel.js'

const columns = [
	{ key: 'id', header: 'ID', width: 4 },
	{ key: 'name', header: 'Name', width: 22 },
	{ key: 'username', header: 'Username', width: 14 },
	{ key: 'email', header: 'Email', width: 26 },
	{ key: 'city', header: 'City', width: 14 },
	{ key: 'company', header: 'Company', width: 20 },
] as const satisfies Array<{ key: keyof FlatUser; header: string; width?: number }>

const isWebMode = Bun.env.AMPHI_WEB_MODE === '1'

interface UsersViewProperties {
	onBack?: () => void
}

export function UsersView({ onBack }: UsersViewProperties) {
	const { data, isLoading, isError, error, refetch } = useFetchUsers()
	const [downloadStatus, setDownloadStatus] = useState<string | null>(null)

	const handleExport = useCallback(() => {
		if (!data) return

		setDownloadStatus('Preparing download...')

		exportToExcel(data, {
			fileName: 'users-export.xlsx',
			sheetName: 'Users',
			columns: columns.map((col) => ({
				key: col.key,
				header: col.header,
				width: col.width,
			})),
		})
			.then(() => {
				const message = isWebMode ? 'Download ready! Check your browser.' : 'File saved and opened!'
				setDownloadStatus(message)
				setTimeout(() => setDownloadStatus(null), 3000)
			})
			.catch(() => {
				setDownloadStatus('Failed to export')
				setTimeout(() => setDownloadStatus(null), 3000)
			})
	}, [data])

	useInput((input, key) => {
		if (input === 'd' || input === 'D') {
			handleExport()
		} else if (input === 'r' || input === 'R') {
			refetch()
		} else if ((key.escape || input === 'q' || input === 'Q') && onBack) {
			onBack()
		}
	})

	if (isLoading) {
		return (
			<Box flexDirection="column" padding={1}>
				<Text color="yellow">⏳ Loading users from API...</Text>
			</Box>
		)
	}

	if (isError) {
		return (
			<Box flexDirection="column" padding={1}>
				<Text color="red">❌ Error: {error?.message || 'Failed to fetch users'}</Text>
				<Text color="gray" dimColor>
					Press 'r' to retry
				</Text>
			</Box>
		)
	}

	if (!data || data.length === 0) {
		return (
			<Box flexDirection="column" padding={1}>
				<Text color="yellow">No users found</Text>
			</Box>
		)
	}

	return (
		<Box flexDirection="column">
			<Box marginBottom={1}>
				<Text color="green" bold>
					Users ({data.length} records)
				</Text>
			</Box>

			<DataTable data={data} columns={columns} />

			<Box marginTop={1} flexDirection="column">
				<Text color="cyan">
					{isWebMode ? (
						<>
							Press <Text bold>'d'</Text> to download as Excel
						</>
					) : (
						<>
							Press <Text bold>'d'</Text> to save as Excel
						</>
					)}
					{' | '}
					Press <Text bold>'r'</Text> to refresh
					{onBack && (
						<>
							{' | '}
							Press <Text bold>'q'</Text> to go back
						</>
					)}
				</Text>
				{downloadStatus && <Text color="magenta">{downloadStatus}</Text>}
			</Box>
		</Box>
	)
}
