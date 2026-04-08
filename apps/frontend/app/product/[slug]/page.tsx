import { notFound } from 'next/navigation';

import { LeadForm } from '@agro/ui';

import { LegacyContentSections } from '../../../components/legacy-content-sections';
import { getProduct } from '../../../lib/api';
import { getCategoryLabel } from '../../../lib/content';

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;

  try {
    const product = await getProduct(slug);

    return (
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-10 lg:grid-cols-[1.1fr,0.9fr]">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-brand-700">{getCategoryLabel(product.category)}</p>
            <h1 className="mt-2 text-4xl font-semibold">{product.name}</h1>
            <p className="mt-4 max-w-3xl text-lg leading-8 text-stone-600">{product.shortDescription}</p>

            <div className="mt-8 grid gap-4 rounded-[28px] border border-stone-200 bg-white p-6 shadow-sm md:grid-cols-2">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-stone-500">Виробник</p>
                <p className="mt-2 text-base text-stone-800">{product.manufacturer || 'Уточнюється'}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-stone-500">Застосування</p>
                <p className="mt-2 text-base text-stone-800">{product.application || 'Уточнюється'}</p>
              </div>
            </div>

            <LegacyContentSections html={product.description} mode="product" className="mt-8 space-y-6" />
          </div>

          <div>
            <LeadForm
              title="Отримати рекомендацію по продукту"
              description="Залиште контакти, і ми підготуємо консультацію по застосуванню, дозуванню та сумісності."
              defaultCropFocus={product.name}
              defaultMessage={`Цікавить продукт: ${product.name}`}
              recommendedProductIds={[product.id]}
            />
          </div>
        </div>
      </div>
    );
  } catch {
    notFound();
  }
}
