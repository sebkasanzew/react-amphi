import React, { useState } from 'react'
import { Text, Box, useInput } from 'ink'

export interface MenuItem {
	id: string
	label: string
	description?: string
	submenu?: MenuItem[]
}

interface MenuProperties {
	items: MenuItem[]
	onSelect: (id: string) => void
	title?: string
}

export function Menu({ items, onSelect, title }: MenuProperties) {
	const [selectedIndex, setSelectedIndex] = useState(0)
	const [submenuStack, setSubmenuStack] = useState<{ items: MenuItem[]; parentLabel: string }[]>([])

	const currentItems = submenuStack.at(-1)?.items ?? items

	useInput((input, key) => {
		if (key.upArrow) {
			setSelectedIndex((previous) => (previous > 0 ? previous - 1 : currentItems.length - 1))
		} else if (key.downArrow) {
			setSelectedIndex((previous) => (previous < currentItems.length - 1 ? previous + 1 : 0))
		} else if (key.return) {
			const selectedItem = currentItems[selectedIndex]
			if (selectedItem?.submenu && selectedItem.submenu.length > 0) {
				setSubmenuStack((previous) => [
					...previous,
					{ items: selectedItem.submenu!, parentLabel: selectedItem.label },
				])
				setSelectedIndex(0)
			} else if (selectedItem) {
				onSelect(selectedItem.id)
			}
		} else if ((key.escape || key.leftArrow) && submenuStack.length > 0) {
			setSubmenuStack((previous) => previous.slice(0, -1))
			setSelectedIndex(0)
		}
	})

	const breadcrumb = submenuStack.length > 0 ? submenuStack.map((s) => s.parentLabel).join(' › ') + ' ›' : null

	return (
		<Box flexDirection="column">
			{title && (
				<Box marginBottom={1}>
					<Text bold color="cyan">
						{title}
					</Text>
				</Box>
			)}

			{breadcrumb && (
				<Box marginBottom={1}>
					<Text color="gray">{breadcrumb}</Text>
				</Box>
			)}

			{currentItems.map((item, index) => {
				const isSelected = index === selectedIndex
				const hasSubmenu = item.submenu && item.submenu.length > 0

				return (
					<Box key={item.id} paddingLeft={1}>
						<Text color={isSelected ? 'green' : 'white'} bold={isSelected}>
							{isSelected ? '❯ ' : '  '}
							{item.label}
							{hasSubmenu && ' ▸'}
						</Text>
						{item.description && isSelected && (
							<Text color="gray" dimColor>
								{' '}
								- {item.description}
							</Text>
						)}
					</Box>
				)
			})}

			<Box marginTop={1}>
				<Text color="gray" dimColor>
					↑↓ Navigate | Enter Select{submenuStack.length > 0 ? ' | ← Back' : ''}
				</Text>
			</Box>
		</Box>
	)
}
