import React from 'react'
import { Text, Box } from 'ink'

interface Column<T> {
	key: keyof T
	header: string
	width?: number
}

interface DataTableProperties<T> {
	data: T[]
	columns: Column<T>[]
}

export function DataTable<T extends object>({ data, columns }: DataTableProperties<T>) {
	// Treat numeric `width` on columns as a weight for percentage distribution.
	// If no widths are provided, distribute equal weights across columns.
	const weights = columns.map((c) => (typeof c.width === 'number' && c.width > 0 ? c.width : 1))
	const total = weights.reduce((s, w) => s + w, 0)

	// Convert weights to percentage strings Ink understands (e.g. "10%", "50%")
	const pctWidths = weights.map((w) => `${Math.max(1, Math.floor((w / total) * 100))}%`)

	return (
		<Box flexDirection="column" width="100%">
			{/* Header row */}
			<Box>
				{columns.map((col, index) => (
					<Box key={String(col.key)} width={pctWidths[index]} paddingLeft={1} paddingRight={1}>
						<Text bold color="cyan">
							{col.header}
						</Text>
					</Box>
				))}
			</Box>

			{/* Data rows */}
			{data.map((row, rowIndex) => (
				<Box key={rowIndex}>
					{columns.map((col, colIndex) => (
						<Box
							key={`${rowIndex}-${colIndex}`}
							width={pctWidths[colIndex]}
							paddingLeft={1}
							paddingRight={1}
						>
							<Text color="white">{String(row[col.key] ?? '')}</Text>
						</Box>
					))}
				</Box>
			))}
		</Box>
	)
}
