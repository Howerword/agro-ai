'use client';

import Link from 'next/link';
import { KeyboardEvent, useEffect, useMemo, useRef, useState } from 'react';

import type { BotResponse } from '@agro/types';

type ChatMessage = {
  role: 'assistant' | 'user';
  content: string;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export function ChatBot() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [crop, setCrop] = useState('');
  const [problem, setProblem] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [lastResponse, setLastResponse] = useState<BotResponse | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: 'Опишіть культуру, проблему або фазу розвитку, і я запропоную релевантні добрива та наступний крок.'
    }
  ]);

  const scrollRef = useRef<HTMLDivElement>(null);
  const suggestions = useMemo(() => lastResponse?.suggestedProducts ?? [], [lastResponse]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  async function send() {
    if (!message.trim() || loading) {
      return;
    }

    const userMessage = message.trim();
    setLoading(true);
    setError('');
    setMessages((current) => [...current, { role: 'user', content: userMessage }]);
    setMessage('');

    try {
      const response = await fetch(`${API_URL}/bot/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: userMessage,
          crop: crop || undefined,
          problem: problem || undefined
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const payload = (await response.json()) as BotResponse;
      setLastResponse(payload);
      setMessages((current) => [
        ...current,
        {
          role: 'assistant',
          content: payload.reply
        }
      ]);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Не вдалося отримати відповідь консультанта.');
    } finally {
      setLoading(false);
    }
  }

  function onKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      void send();
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {open ? (
        <div className="mb-3 w-[380px] rounded-[28px] border border-stone-200 bg-white p-5 shadow-2xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-brand-700">AI-консультант</p>
              <h3 className="text-lg font-semibold text-stone-900">Підбір добрив</h3>
            </div>
            <button
              className="flex h-8 w-8 items-center justify-center rounded-full text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-700"
              onClick={() => setOpen(false)}
              type="button"
              aria-label="Закрити"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M12 4L4 12M4 4l8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          <div className="mt-4 grid gap-3">
            <input
              value={crop}
              onChange={(event) => setCrop(event.target.value)}
              className="rounded-2xl border border-stone-200 px-4 py-3 text-sm transition-colors focus:border-brand-500 focus:outline-none"
              placeholder="Культура, наприклад: соя"
            />
            <input
              value={problem}
              onChange={(event) => setProblem(event.target.value)}
              className="rounded-2xl border border-stone-200 px-4 py-3 text-sm transition-colors focus:border-brand-500 focus:outline-none"
              placeholder="Проблема, наприклад: гербіцидний стрес"
            />
          </div>

          <div
            ref={scrollRef}
            className="chat-scroll mt-4 max-h-72 space-y-3 overflow-y-auto rounded-3xl bg-stone-50 p-4"
          >
            {messages.map((item, index) => (
              <div
                key={`${item.role}-${index}`}
                className={`rounded-2xl px-4 py-3 text-sm leading-6 ${
                  item.role === 'assistant' ? 'bg-white text-stone-700' : 'bg-brand-700 text-white'
                }`}
              >
                {item.content}
              </div>
            ))}
            {loading ? (
              <div className="rounded-2xl bg-white px-4 py-3">
                <span className="inline-flex gap-1">
                  <span className="h-2 w-2 animate-bounce rounded-full bg-stone-300 [animation-delay:0ms]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-stone-300 [animation-delay:150ms]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-stone-300 [animation-delay:300ms]" />
                </span>
              </div>
            ) : null}
          </div>

          <div className="mt-4">
            <textarea
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              onKeyDown={onKeyDown}
              className="min-h-20 w-full resize-none rounded-2xl border border-stone-200 px-4 py-3 text-sm transition-colors focus:border-brand-500 focus:outline-none"
              placeholder="Напишіть запит: культура, задача або симптом"
            />
          </div>

          {suggestions.length ? (
            <div className="mt-3 rounded-2xl border border-stone-200 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-brand-700">Рекомендовані продукти</p>
              <div className="mt-3 space-y-2">
                {suggestions.map((product) => (
                  <Link
                    key={product.id}
                    href={`/product/${product.slug}`}
                    className="block rounded-2xl bg-stone-50 px-3 py-3 text-sm text-stone-700 transition-colors hover:bg-brand-50"
                  >
                    <span className="block font-medium text-stone-900">{product.name}</span>
                    <span className="block text-stone-500">{product.shortDescription}</span>
                  </Link>
                ))}
              </div>
            </div>
          ) : null}

          {lastResponse?.leadCaptureRecommended ? (
            <p className="mt-3 rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
              Залиште заявку на сторінці — менеджер підготує персональну схему.
            </p>
          ) : null}

          {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}

          <button
            type="button"
            disabled={loading}
            onClick={() => void send()}
            className="mt-4 w-full rounded-full bg-brand-700 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-brand-900 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Готуємо відповідь...' : 'Надіслати'}
          </button>
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex items-center gap-2 rounded-full bg-brand-700 px-5 py-3 text-sm font-medium text-white shadow-lg transition-colors hover:bg-brand-900"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path
            d="M14 5.5C14 8.538 11.314 11 8 11c-.42 0-.83-.04-1.226-.115L4 13V10.5C2.757 9.607 2 8.143 2 6.5 2 3.462 4.686 1 8 1s6 2.462 6 4.5z"
            fill="currentColor"
            fillOpacity="0.9"
          />
        </svg>
        AI-консультант
      </button>
    </div>
  );
}
