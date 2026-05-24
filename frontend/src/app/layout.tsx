import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';

export const metadata: Metadata = {
    title: 'Urban Traffic Platform',
    description: 'Real-time urban traffic monitoring and management dashboard',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" className="dark">
            <body>
                <Providers>{children}</Providers>
            </body>
        </html>
    );
}
