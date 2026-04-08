import Link from 'next/link';

import type { ProductSummary } from '@agro/types';

type ProductCardProps = {
  product: ProductSummary;
};

export function ProductCard({ product }: ProductCardProps) {
  return (
    <article className="rounded-[28px] border border-stone-200 bg-white p-6 shadow-sm">
      <p className="text-sm text-brand-700">{product.categoryName}</p>
      <h3 className="mt-3 text-2xl font-semibold text-stone-900">{product.name}</h3>
      <p className="mt-3 text-sm leading-6 text-stone-600">{product.shortDescription}</p>
      <Link href={`/product/${product.slug}`} className="mt-6 inline-flex text-sm font-medium text-brand-700">
        Детальніше
      </Link>
    </article>
  );
}
