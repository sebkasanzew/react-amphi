import type { Metadata } from 'next'

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
		<html lang="en">
			<head>
				<style>{`
                    /* Hide xterm scrollbar to prevent white line on right */
                    .xterm-viewport::-webkit-scrollbar {
                        width: 0;
                        height: 0;
                    }
                    .xterm-viewport {
                        scrollbar-width: none;
                    }
                `}</style>
			</head>
			<body style={{ margin: 0 }}>{children}</body>
		</html>
	)
}
