import React from 'react'
import type { Metadata } from 'next'
import styles from './layout.module.css'

export const metadata: Metadata = {
	title: 'Amphi Web Terminal',
	description: 'Web interface for Amphi',
}

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body className={styles.body}>{children}</body>
		</html>
	)
}
