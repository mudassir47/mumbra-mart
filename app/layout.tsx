// app/layout.tsx

"use client"; // Mark this file as a client component


import localFont from 'next/font/local';
import './globals.css';
import { BottomNav } from '@/components/BottomNav'; // Import the BottomNav component
import { usePathname } from 'next/navigation'; // Import usePathname

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900',
});
const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
  weight: '100 900',
});


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname(); // Get the current pathname

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen`}
      >
        {/* Main Content */}
        <main className="flex-grow pb-16 md:pb-0">{children}</main>

        {/* Bottom Navigation - Render only if not on the login page */}
        {pathname !== '/login' && <BottomNav />}
      </body>
    </html>
  );
}
