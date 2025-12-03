import React, { useState } from 'react'
import { Text, Box } from 'ink'
import { ASCII_ART } from '@amphi/shared'
import { QueryProvider } from './providers/QueryProvider.js'
import { UsersView } from './components/UsersView.js'
import { AboutView } from './components/AboutView.js'
import { Menu, MenuItem } from './components/Menu.js'

type ViewId = 'menu' | 'users' | 'about'

const menuItems: MenuItem[] = [
	{ id: 'users', label: 'Users', description: 'View and export user data' },
	{ id: 'about', label: 'About', description: 'About this application' },
]

interface ViewRouterProperties {
	currentView: ViewId
	onSelect: (id: string) => void
	onBack: () => void
}

function ViewRouter({ currentView, onSelect, onBack }: ViewRouterProperties) {
	switch (currentView) {
		case 'users': {
			return <UsersView onBack={onBack} />
		}
		case 'about': {
			return <AboutView onBack={onBack} />
		}
		default: {
			return <Menu items={menuItems} onSelect={onSelect} title="Main Menu" />
		}
	}
}

export default function App() {
	const [currentView, setCurrentView] = useState<ViewId>('menu')

	const handleMenuSelect = (id: string) => {
		setCurrentView(id as ViewId)
	}

	const handleBack = () => {
		setCurrentView('menu')
	}

	return (
		<QueryProvider>
			<Box flexDirection="column">
				<Text color="green">{ASCII_ART}</Text>
				<Box flexDirection="column" borderStyle="single" padding={1}>
					<ViewRouter currentView={currentView} onSelect={handleMenuSelect} onBack={handleBack} />
				</Box>
			</Box>
		</QueryProvider>
	)
}
