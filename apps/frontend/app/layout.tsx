import Link from 'next/link';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import { ChatBot } from '@agro/ui';

import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Vitera Agro — B2B платформа для агрокомпаній',
    template: '%s | Vitera Agro'
  },
  description:
    'AI-підбір добрив, каталог мікродобрив та спеціальних продуктів для агрокомпаній. Персональні рекомендації агронома.'
};

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
          <header className="sticky top-0 z-50 border-b border-stone-200 bg-white/95 backdrop-blur-sm">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
              <Link href="/" className="text-xl font-semibold text-brand-900">
                Vitera
              </Link>
              <nav className="hidden items-center gap-6 text-sm text-stone-600 md:flex">
                {navigation.map((item) => (
                  <Link key={item.href} href={item.href} className="hover:text-brand-700">
                    {item.label}
                  </Link>
                ))}
              </nav>
              <Link
                href="/contacts"
                className="hidden rounded-full bg-brand-700 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-900 md:inline-flex"
              >
                Зв&apos;язатись
              </Link>
            </div>
          </header>

          <main>{children}</main>

          <footer className="border-t border-stone-200 bg-white">
            <div className="mx-auto max-w-7xl px-6 py-12">
              <div className="grid gap-10 md:grid-cols-3">
                <div>
                  <p className="font-semibold text-stone-900">Vitera Ukraine</p>
                  <p className="mt-3 text-sm leading-6 text-stone-500">
                    B2B платформа для агрокомпаній. AI-підбір добрив, каталог продуктів та CRM-інтеграція.
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-stone-900">Навігація</p>
                  <nav className="mt-3 space-y-2">
                    {navigation.map((item) => (
                      <Link key={item.href} href={item.href} className="block text-sm text-stone-500 hover:text-brand-700">
                        {item.label}
                      </Link>
                    ))}
                  </nav>
                </div>
                <div>
                  <p className="font-semibold text-stone-900">Контакти</p>
                  <div className="mt-3 space-y-2 text-sm text-stone-500">
                    <p>Україна</p>
                    <a href="mailto:info@vitera.ua" className="block hover:text-brand-700">
                      info@vitera.ua
                    </a>
                    <a href="tel:+380800000000" className="block hover:text-brand-700">
                      0 800 000 000
                    </a>
                  </div>
                </div>
              </div>
              <div className="mt-10 border-t border-stone-100 pt-6 text-xs text-stone-400">
                © {new Date().getFullYear()} Vitera Ukraine. Усі права захищені.
              </div>
            </div>
          </footer>

          <ChatBot />
        </div>
      </body>
    </html>
  );
}
