import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'The Hotels',
  description: 'Sanctuary of Surakarta — Luxury Hotel Booking',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="id" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
