import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'CipherPulse | Enterprise End-to-End Encrypted Messaging SaaS',
  description: 'Production-Ready End-to-End Encrypted (E2EE) Messaging SaaS built with X25519 Double Ratchet, WebRTC calls, AI Assistant, and zero-knowledge persistence.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#090d16] text-slate-100 antialiased overflow-hidden min-h-screen">
        {children}
      </body>
    </html>
  );
}
