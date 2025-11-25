import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Amphi Web Terminal",
    description: "Web interface for Amphi",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body style={{ margin: 0 }}>{children}</body>
        </html>
    );
}
