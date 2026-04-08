import { Filters, ProductCard } from '@agro/ui';

import { getProductFilters, getProducts } from '../../lib/api';
import { getCategoryLabel } from '../../lib/content';

type CatalogPageProps = {
  searchParams: Promise<{
    q?: string;
    category?: string;
    crop?: string;
    program?: string;
    page?: string;
  }>;
};

export default async function CatalogPage({ searchParams }: CatalogPageProps) {
  const params = await searchParams;
  const query = new URLSearchParams();

  query.set('limit', '24');

  if (params.q) {
    query.set('q', params.q);
  }

  if (params.category) {
    query.set('category', params.category);
  }

  if (params.crop) {
    query.set('crop', params.crop);
  }

  if (params.program) {
    query.set('program', params.program);
  }

  if (params.page) {
    query.set('page', params.page);
  }

  const [productsResponse, filters] = await Promise.all([
    getProducts(`?${query.toString()}`),
    getProductFilters()
  ]);

  return (
    <div className="mx-auto max-w-7xl px-6 py-16">
      <div className="mb-10">
        <p className="text-sm uppercase tracking-[0.2em] text-brand-700">Каталог</p>
        <h1 className="mt-2 text-4xl font-semibold">Добрива та спеціальні продукти</h1>
        <p className="mt-4 max-w-3xl text-stone-600">
          Каталог уже працює з живими фільтрами, Meilisearch-пошуком та імпортованими продуктами Vitera.
        </p>
      </div>
      <div className="grid gap-8 lg:grid-cols-[320px,1fr]">
        <Filters
          initialQuery={params.q ?? ''}
          selectedCategory={params.category}
          selectedCrop={params.crop}
          selectedProgram={params.program}
          total={productsResponse.meta.total}
          categories={filters.categories}
          crops={filters.crops}
          programs={filters.programs}
        />
        <div>
          <div className="mb-5 flex items-center justify-between gap-4 rounded-[28px] border border-stone-200 bg-white px-5 py-4 shadow-sm">
            <p className="text-sm text-stone-600">
              Знайдено <span className="font-semibold text-stone-900">{productsResponse.meta.total}</span> позицій
            </p>
            <p className="text-sm text-stone-500">Сторінка {productsResponse.meta.page}</p>
          </div>

          {productsResponse.items.length ? (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {productsResponse.items.map((product) => (
                <ProductCard
                  key={product.slug}
                  product={{
                    id: product.id,
                    slug: product.slug,
                    name: product.name,
                    shortDescription: product.shortDescription,
                    categoryName: getCategoryLabel(product.category)
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-[28px] border border-dashed border-stone-300 bg-white p-8 text-center shadow-sm">
              <h2 className="text-2xl font-semibold text-stone-900">Нічого не знайдено</h2>
              <p className="mt-3 text-sm leading-6 text-stone-600">
                Спробуйте інший запит або скиньте частину фільтрів, щоб розширити вибір продуктів.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
