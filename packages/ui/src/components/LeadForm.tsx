'use client';

import { FormEvent, useMemo, useState } from 'react';

type LeadFormProps = {
  title?: string;
  description?: string;
  submitLabel?: string;
  source?: string;
  defaultMessage?: string;
  defaultCropFocus?: string;
  recommendedProductIds?: string[];
  recommendedProgramIds?: string[];
  compact?: boolean;
};

type FormState = {
  name: string;
  phone: string;
  email: string;
  company: string;
  cropFocus: string;
  message: string;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export function LeadForm({
  title = 'Запитати персональну рекомендацію',
  description = 'Залиште контакти, і агроном або менеджер підбере рішення під вашу культуру та задачу.',
  submitLabel = 'Надіслати в CRM',
  source = 'website',
  defaultMessage = '',
  defaultCropFocus = '',
  recommendedProductIds = [],
  recommendedProgramIds = [],
  compact = false
}: LeadFormProps) {
  const initialState = useMemo<FormState>(
    () => ({
      name: '',
      phone: '',
      email: '',
      company: '',
      cropFocus: defaultCropFocus,
      message: defaultMessage
    }),
    [defaultCropFocus, defaultMessage]
  );

  const [form, setForm] = useState<FormState>(initialState);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError] = useState('');

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus('loading');
    setError('');

    try {
      const response = await fetch(`${API_URL}/leads`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...form,
          source,
          recommendedProductIds,
          recommendedProgramIds
        })
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => ({}))) as { message?: string; error?: string };
        throw new Error(payload.message || payload.error || `HTTP ${response.status}`);
      }

      setStatus('success');
      setForm(initialState);
    } catch (submitError) {
      setStatus('error');
      setError(submitError instanceof Error ? submitError.message : 'Не вдалося надіслати лід.');
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className={`rounded-[32px] bg-white text-stone-900 shadow-2xl ${compact ? 'p-6' : 'p-8'}`}
    >
      <p className="text-sm uppercase tracking-[0.2em] text-brand-700">Lead capture</p>
      <h2 className="mt-3 text-2xl font-semibold">{title}</h2>
      <p className="mt-3 text-sm leading-6 text-stone-600">{description}</p>

      <div className="mt-6 grid gap-4">
        <input
          required
          value={form.name}
          onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
          className="rounded-2xl border border-stone-200 px-4 py-3"
          placeholder="Ім'я"
        />
        <input
          required
          value={form.phone}
          onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
          className="rounded-2xl border border-stone-200 px-4 py-3"
          placeholder="Телефон"
        />
        <input
          value={form.email}
          onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
          className="rounded-2xl border border-stone-200 px-4 py-3"
          placeholder="Email"
          type="email"
        />
        <input
          value={form.company}
          onChange={(event) => setForm((current) => ({ ...current, company: event.target.value }))}
          className="rounded-2xl border border-stone-200 px-4 py-3"
          placeholder="Компанія"
        />
        <input
          value={form.cropFocus}
          onChange={(event) => setForm((current) => ({ ...current, cropFocus: event.target.value }))}
          className="rounded-2xl border border-stone-200 px-4 py-3"
          placeholder="Культура / запит"
        />
        <textarea
          value={form.message}
          onChange={(event) => setForm((current) => ({ ...current, message: event.target.value }))}
          className="min-h-28 rounded-2xl border border-stone-200 px-4 py-3"
          placeholder="Опишіть проблему або задачу"
        />
      </div>

      {status === 'success' ? (
        <p className="mt-4 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          Дякуємо! Лід збережено, команда вже може зв’язатися з вами.
        </p>
      ) : null}
      {status === 'error' ? (
        <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      ) : null}

      <button
        type="submit"
        disabled={status === 'loading'}
        className="mt-6 rounded-full bg-brand-700 px-5 py-3 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
      >
        {status === 'loading' ? 'Надсилаємо...' : submitLabel}
      </button>
    </form>
  );
}
