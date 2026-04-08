import './globals.css';
import Link from 'next/link';
import { ChatBot } from '@/components/ChatBot';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uk">
      <body>
        <header className="border-b bg-white">
          <nav className="mx-auto flex max-w-6xl gap-6 p-4">
            <Link href="/" className="font-semibold text-brand-700">Agro AI</Link>
            <Link href="/catalog">Каталог</Link>
            <Link href="/solutions">Рішення</Link>
            <Link href="/services">Сервіси</Link>
            <Link href="/blog">Блог</Link>
            <Link href="/contacts">Контакти</Link>
          </nav>
        </header>
        <main className="mx-auto max-w-6xl p-4">{children}</main>
        <ChatBot />
      </body>
    </html>
  );
}
