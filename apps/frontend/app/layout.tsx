import Link from 'next/link';
import type { ReactNode } from 'react';

import { ChatBot } from '@agro/ui';

import './globals.css';

const navigation = [
  { href: '/', label: 'Головна' },
  { href: '/catalog', label: 'Каталог' },
  { href: '/solutions', label: 'Рішення' },
  { href: '/services', label: 'Сервіси' },
  { href: '/blog', label: 'Блог' },
  { href: '/contacts', label: 'Контакти' }
];

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="uk">
      <body>
        <div className="min-h-screen">
          <header className="border-b border-stone-200 bg-white/90 backdrop-blur">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
              <Link href="/" className="text-xl font-semibold text-brand-900">
                Vitera Agro Platform
              </Link>
              <nav className="flex gap-6 text-sm text-stone-600">
                {navigation.map((item) => (
                  <Link key={item.href} href={item.href} className="hover:text-brand-700">
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>
          </header>
          <main>{children}</main>
          <footer className="border-t border-stone-200 bg-white">
            <div className="mx-auto max-w-7xl px-6 py-8 text-sm text-stone-500">
              Vitera Ukraine B2B platform scaffold for catalog, AI recommendations, and lead capture.
            </div>
          </footer>
          <ChatBot />
        </div>
      </body>
    </html>
  );
}
