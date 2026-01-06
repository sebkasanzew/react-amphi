'use client'

import dynamic from 'next/dynamic'
import styles from './home.module.css'

// Dynamically import XtermComponent to avoid SSR issues with xterm.js
const XtermComponent = dynamic(() => import('../components/XtermComponent'), {
	ssr: false,
	loading: () => <div className={styles.loading}>Loading terminal...</div>,
})

export default function Home() {
	return (
		<main data-testid="terminal-container" className={`terminal-main ${styles.container}`}>
			<div data-testid="terminal-output" className={`terminal-output ${styles.output}`}>
				<XtermComponent />
			</div>
		</main>
	)
}
