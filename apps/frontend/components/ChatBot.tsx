'use client';

import { useState } from 'react';
import { apiPost } from '@/lib/api';

type Message = { role: 'user' | 'bot'; text: string };

export function ChatBot() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);

  async function send(text: string) {
    setMessages((prev) => [...prev, { role: 'user', text }]);
    setInput('');
    const response = await apiPost<{ reply: string }>('/bot/query', { message: text });
    setMessages((prev) => [...prev, { role: 'bot', text: response.reply }]);
  }

  return (
    <>
      <button
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-6 right-6 rounded-full bg-brand-500 px-5 py-3 text-white shadow-lg"
      >
        AI Бот
      </button>
      {open && (
        <div className="fixed bottom-24 right-6 w-96 rounded-xl border bg-white p-4 shadow-xl">
          <div className="mb-3 flex flex-wrap gap-2">
            {['Підібрати рішення', 'Отримати консультацію', 'Запитати про продукт'].map((q) => (
              <button
                key={q}
                onClick={() => send(q)}
                className="rounded-full bg-slate-100 px-3 py-1 text-sm"
              >
                {q}
              </button>
            ))}
          </div>
          <div className="mb-3 max-h-64 space-y-2 overflow-auto">
            {messages.map((message, idx) => (
              <p key={idx} className={message.role === 'bot' ? 'text-slate-700' : 'text-brand-700'}>
                <strong>{message.role === 'bot' ? 'Bot' : 'You'}:</strong> {message.text}
              </p>
            ))}
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (input.trim()) send(input);
            }}
            className="flex gap-2"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 rounded border p-2"
              placeholder="Ваше питання..."
            />
            <button className="rounded bg-brand-500 px-3 text-white">→</button>
          </form>
        </div>
      )}
    </>
  );
}
