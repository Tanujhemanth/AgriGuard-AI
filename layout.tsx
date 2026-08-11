import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AgriGuard AI — Real-time Crop Pathology & Climate Resilience Platform',
  description: 'AI-powered real-time bridge between raw field conditions, micro-climate signals, and expert agronomic guidance.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Outfit:wght@500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col bg-[#08120d] text-[#ecfdf5] antialiased">
        {children}
      </body>
    </html>
  );
}
