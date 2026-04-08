'use client';

import { FormEvent, useMemo, useState, useTransition } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import type { FilterOption } from '@agro/types';

type FiltersProps = {
  initialQuery?: string;
  selectedCategory?: string;
  selectedCrop?: string;
  selectedProgram?: string;
  total: number;
  categories: FilterOption[];
  crops: FilterOption[];
  programs: FilterOption[];
};

export function Filters({
  initialQuery = '',
  selectedCategory = '',
  selectedCrop = '',
  selectedProgram = '',
  total,
  categories,
  crops,
  programs
}: FiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [query, setQuery] = useState(initialQuery);

  const hasActiveFilters = useMemo(
    () => Boolean(initialQuery || selectedCategory || selectedCrop || selectedProgram),
    [initialQuery, selectedCategory, selectedCrop, selectedProgram]
  );

  function navigate(nextValues: Record<string, string>) {
    const params = new URLSearchParams(searchParams.toString());

    for (const [key, value] of Object.entries(nextValues)) {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    }

    params.delete('page');

    startTransition(() => {
      const nextUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;
      router.replace(nextUrl, { scroll: false });
    });
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    navigate({ q: query.trim() });
  }

  return (
    <aside className="rounded-[28px] border border-stone-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-stone-900">Фільтри каталогу</h3>
          <p className="mt-2 text-sm leading-6 text-stone-500">{total} продуктів доступно для підбору.</p>
        </div>
        {hasActiveFilters ? (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              navigate({ q: '', category: '', crop: '', program: '' });
            }}
            className="text-sm font-medium text-brand-700"
          >
            Скинути
          </button>
        ) : null}
      </div>

      <form onSubmit={onSubmit} className="mt-5 space-y-5">
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">Пошук</label>
          <div className="flex gap-2">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Назва, опис або виробник"
              className="min-w-0 flex-1 rounded-2xl border border-stone-200 px-4 py-3 text-sm text-stone-800"
            />
            <button
              type="submit"
              disabled={isPending}
              className="rounded-2xl bg-brand-700 px-4 py-3 text-sm font-medium text-white disabled:opacity-60"
            >
              Знайти
            </button>
          </div>
        </div>

        <FilterSelect
          label="Категорія"
          value={selectedCategory}
          options={categories}
          placeholder="Усі категорії"
          onChange={(value) => navigate({ category: value })}
        />

        <FilterSelect
          label="Культура"
          value={selectedCrop}
          options={crops}
          placeholder="Усі культури"
          onChange={(value) => navigate({ crop: value })}
        />

        {programs.length ? (
          <FilterSelect
            label="Програма"
            value={selectedProgram}
            options={programs}
            placeholder="Усі програми"
            onChange={(value) => navigate({ program: value })}
          />
        ) : null}

        {crops.length ? (
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">Швидкі культури</p>
            <div className="flex flex-wrap gap-2">
              {crops.slice(0, 6).map((crop) => {
                const active = crop.slug === selectedCrop;

                return (
                  <button
                    key={crop.slug}
                    type="button"
                    onClick={() => navigate({ crop: active ? '' : crop.slug })}
                    className={`rounded-full px-3 py-2 text-sm transition-colors ${
                      active ? 'bg-brand-700 text-white' : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                    }`}
                  >
                    {crop.name}
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}
      </form>
    </aside>
  );
}

type FilterSelectProps = {
  label: string;
  value: string;
  options: FilterOption[];
  placeholder: string;
  onChange: (value: string) => void;
};

function FilterSelect({ label, value, options, placeholder, onChange }: FilterSelectProps) {
  return (
    <div>
      <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">{label}</label>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-800"
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.slug} value={option.slug}>
            {option.name} ({option.count})
          </option>
        ))}
      </select>
    </div>
  );
}
