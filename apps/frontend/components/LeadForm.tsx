'use client';

import { FormEvent, useState } from 'react';
import { apiPost } from '@/lib/api';

export function LeadForm() {
  const [sent, setSent] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    await apiPost('/leads', {
      name: formData.get('name'),
      phone: formData.get('phone'),
      email: formData.get('email'),
      message: formData.get('message'),
      source: 'lead_form'
    });
    setSent(true);
    e.currentTarget.reset();
  }

  return (
    <form className="space-y-3 rounded-xl bg-white p-6 shadow" onSubmit={onSubmit}>
      <h3 className="text-xl font-semibold">Залиште заявку</h3>
      <input name="name" required placeholder="Ім'я" className="w-full rounded border p-2" />
      <input name="phone" required placeholder="Телефон" className="w-full rounded border p-2" />
      <input name="email" placeholder="Email" className="w-full rounded border p-2" />
      <textarea name="message" placeholder="Коментар" className="w-full rounded border p-2" />
      <button className="rounded bg-brand-500 px-4 py-2 text-white">Надіслати</button>
      {sent && <p className="text-green-700">Дякуємо! Менеджер зв'яжеться з вами.</p>}
    </form>
  );
}
