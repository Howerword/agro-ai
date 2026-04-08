'use client';

import { useRouter, useSearchParams } from 'next/navigation';

export function Filters() {
  const router = useRouter();
  const params = useSearchParams();

  return (
    <div className="mb-6 flex gap-3">
      {[
        { label: 'Усі', value: '' },
        { label: 'Мікродобрива', value: 'micro' },
        { label: 'Біостимулятори', value: 'biostim' }
      ].map((item) => (
        <button
          key={item.label}
          className="rounded-full border px-4 py-2 text-sm"
          onClick={() => {
            const query = new URLSearchParams(params.toString());
            if (!item.value) query.delete('category');
            else query.set('category', item.value);
            router.push(`/catalog?${query.toString()}`);
          }}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
