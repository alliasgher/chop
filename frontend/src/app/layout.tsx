import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Chop — Barbershop Booking',
  description: 'Real-time appointment booking for modern barbershops.',
  openGraph: {
    title: 'Chop — Barbershop Booking',
    description: "See a booking appear live on the owner's dashboard the instant you make it.",
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Clash+Display:wght@400;500;600;700&family=Outfit:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col antialiased">{children}</body>
    </html>
  );
}
