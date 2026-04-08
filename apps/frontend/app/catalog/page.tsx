import { Filters } from '@/components/Filters';
import { ProductCard } from '@/components/ProductCard';
import { apiGet } from '@/lib/api';

export default async function CatalogPage({ searchParams }: { searchParams: { category?: string } }) {
  const category = searchParams.category ? `?category=${searchParams.category}` : '';
  const products = await apiGet<Array<{ slug: string; name: string; shortDesc: string; category: { title: string } }>>(
    `/products${category}`
  );

  return (
    <div>
      <h1 className="mb-4 text-3xl font-bold">Каталог добрив</h1>
      <Filters />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <ProductCard key={product.slug} product={product} />
        ))}
      </div>
    </div>
  );
}
