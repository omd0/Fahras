import type { Metadata } from 'next';
import { Providers } from '@/providers/Providers';
import '@/styles/accessibility.css';
import './globals.css';

export const metadata: Metadata = {
  title: 'Fahras \u2014 Graduation Project Archive',
  description:
    'A comprehensive graduation project archiving system for universities',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
