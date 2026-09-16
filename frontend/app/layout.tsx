import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';

import Image from 'next/image';
import { siteConfig } from '../lib/site';


export const metadata: Metadata = {
  title: 'Dr. Hajar Ouadoud | Psychiatre à Tanger',
  description:
    'Cabinet de psychiatrie à Tanger. Informations et prise de rendez-vous en ligne.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr">
      <body>
        <header className="border-b border-emerald-900/10 bg-white/90 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
           <Link href="/" className="flex items-center gap-3">
  <Image
    src={siteConfig.logo}
    alt={`Logo ${siteConfig.doctorName}`}
    width={50}
    height={50}
    className="h-12 w-12 object-contain"
  />

  <div>
    <div className="font-bold text-emerald-950">
      {siteConfig.doctorName}
    </div>

    <div className="text-xs text-slate-500">
      {siteConfig.specialty}
    </div>
  </div>
</Link>
            <nav className="flex items-center gap-4 text-sm font-medium">
              <Link href="/#cabinet">Le cabinet</Link>
              <Link href="/#specialites">Spécialités</Link>
              <Link href="/rendez-vous" className="rounded-full bg-emerald-800 px-4 py-2 text-white">Prendre RDV</Link>
            </nav>
          </div>
        </header>
        {children}
        <footer className="mt-20 border-t border-emerald-900/10 bg-white">
          <div className="mx-auto max-w-6xl px-5 py-8 text-sm text-slate-600">
            © 2026 Cabinet {siteConfig.doctorName} — {siteConfig.city}, Maroc. En cas d’urgence médicale, contactez les services d’urgence compétents.
          </div>
        </footer>
      </body>
    </html>
  );
}
