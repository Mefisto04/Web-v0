"use client"
import { ReactNode } from 'react';
import { Inter } from 'next/font/google';
import { SessionProvider } from 'next-auth/react';

import '@stream-io/video-react-sdk/dist/css/styles.css';
import 'react-datepicker/dist/react-datepicker.css';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';

const inter = Inter({ subsets: ['latin'] });


export default function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <SessionProvider>
        <body className={`${inter.className} bg-dark-2`}>
          <Toaster />
          {children}
        </body>
      </SessionProvider>
    </html>
  );
}
