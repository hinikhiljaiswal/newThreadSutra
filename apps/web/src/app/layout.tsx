import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'eRetail Replica',
  description: 'Operations portal built with Next.js, NestJS, Tailwind, and MongoDB',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
