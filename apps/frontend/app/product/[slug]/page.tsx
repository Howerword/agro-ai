import { apiGet } from '@/lib/api';

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const product = await apiGet<{ name: string; description: string; shortDesc: string; category: { title: string } }>(
    `/products/${params.slug}`
  );

  return (
    <article className="prose max-w-none">
      <p className="text-brand-700">{product.category.title}</p>
      <h1>{product.name}</h1>
      <p>{product.shortDesc}</p>
      <p>{product.description}</p>
    </article>
  );
}
