import Link from 'next/link';

import type { ProductSummary } from '@agro/types';

type ProductCardProps = {
  product: ProductSummary;
};

export function ProductCard({ product }: ProductCardProps) {
  return (
    <article className="group flex flex-col rounded-[28px] border border-stone-200 bg-white p-6 shadow-sm transition-all duration-200 hover:border-brand-100 hover:shadow-md">
      <span className="inline-flex w-fit rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700">
        {product.categoryName}
      </span>
      <h3 className="mt-3 text-xl font-semibold leading-snug text-stone-900">{product.name}</h3>
      <p className="mt-3 line-clamp-3 flex-1 text-sm leading-6 text-stone-600">{product.shortDescription}</p>
      <Link
        href={`/product/${product.slug}`}
        className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-brand-700 transition-all group-hover:gap-2.5"
      >
        Детальніше <span aria-hidden="true">→</span>
      </Link>
    </article>
  );
}
