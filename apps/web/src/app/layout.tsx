import type { Metadata } from 'next';
import { Providers } from '@/providers/providers';
import './globals.css';

export const metadata: Metadata = {
  title: { default: 'PropCRM — AI Real Estate CRM', template: '%s | PropCRM' },
  description: 'AI-powered Real Estate CRM for modern sales teams. Manage leads, properties, bookings, payments and WhatsApp communication in one platform.',
  keywords: ['real estate CRM', 'property management', 'lead management', 'AI CRM'],
  openGraph: {
    title: 'PropCRM — AI Real Estate CRM',
    description: 'AI-powered Real Estate CRM for modern sales teams.',
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
          href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,400;0,14..32,500;0,14..32,600;0,14..32,700;0,14..32,800;0,14..32,900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
