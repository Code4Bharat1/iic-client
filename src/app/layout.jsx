import { Plus_Jakarta_Sans, Fraunces } from 'next/font/google';
import { Suspense } from 'react';
import Providers from '@/providers/Providers';
import '@/styles/globals.css';

const sans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800'],
});

const display = Fraunces({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
  weight: ['500', '600'],
  style: ['normal', 'italic'],
});

export const metadata = {
  title: 'IIC Event Management',
  description: 'IIC Event Floor & Equipment Booking Management System',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${sans.variable} ${display.variable}`}>
      <body className="font-sans antialiased text-gray-900">
        <Providers>
          <Suspense fallback={null}>
            {children}
          </Suspense>
        </Providers>
      </body>
    </html>
  );
}
