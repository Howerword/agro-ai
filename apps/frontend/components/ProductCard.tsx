import Link from 'next/link';

type ProductCardProps = {
  product: {
    slug: string;
    name: string;
    shortDesc: string;
    category: { title: string };
  };
};

export function ProductCard({ product }: ProductCardProps) {
  return (
    <article className="rounded-xl border bg-white p-5 shadow-sm">
      <p className="text-sm text-brand-700">{product.category.title}</p>
      <h3 className="mt-2 text-xl font-semibold">{product.name}</h3>
      <p className="mt-2 text-slate-600">{product.shortDesc}</p>
      <Link className="mt-4 inline-block text-brand-700 font-medium" href={`/product/${product.slug}`}>
        Детальніше →
      </Link>
    </article>
  );
}
