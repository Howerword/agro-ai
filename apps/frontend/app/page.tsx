import Link from 'next/link';

import { LeadForm, ProductCard } from '@agro/ui';

import { LegacyContentSections } from '../components/legacy-content-sections';
import { getArticles, getPage, getProducts } from '../lib/api';
import { formatDate, getCategoryLabel, stripHtml } from '../lib/content';

export default async function HomePage() {
  const [productsResponse, articles, aboutPage] = await Promise.all([
    getProducts('?limit=4'),
    getArticles(),
    getPage('page-about')
  ]);

  const featuredArticles = articles.slice(0, 3);

  return (
    <div>
      {/* Hero */}
      <section className="bg-brand-900 text-white">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 py-20 lg:grid-cols-[1.2fr,0.8fr]">
          <div className="space-y-6">
            <span className="inline-flex rounded-full border border-white/20 px-4 py-1 text-sm text-white/80">
              AI-підбір добрив для B2B агрокомпаній
            </span>
            <h1 className="max-w-3xl text-5xl font-semibold leading-tight">
              Vitera як sales-інструмент: каталог, AI-рекомендації, ліди та CRM-флоу.
            </h1>
            <p className="max-w-2xl text-lg text-white/75">
              Новий сайт зберігає контент і SEO, але водночас перетворює консультацію на керований шлях від пошуку
              продукту до заявки в CRM.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/catalog"
                className="rounded-full bg-white px-6 py-3 font-medium text-brand-900 transition-colors hover:bg-brand-50"
              >
                Перейти в каталог
              </Link>
              <Link
                href="/solutions"
                className="rounded-full border border-white/20 px-6 py-3 font-medium text-white transition-colors hover:border-white/40 hover:bg-white/10"
              >
                Готові рішення
              </Link>
            </div>
          </div>
          <LeadForm />
        </div>
      </section>

      {/* About */}
      <section className="mx-auto grid max-w-7xl gap-8 px-6 py-16 lg:grid-cols-[1.1fr,0.9fr]">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-brand-700">Про компанію</p>
          <h2 className="mt-2 text-3xl font-semibold text-stone-900">{aboutPage.title}</h2>
          <p className="mt-4 max-w-3xl text-base leading-7 text-stone-600">
            {stripHtml(aboutPage.excerpt ?? aboutPage.content).slice(0, 480)}...
          </p>
          <Link
            href="/services"
            className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-brand-700 hover:gap-2.5 transition-all"
          >
            Детальніше про сервіси <span aria-hidden="true">→</span>
          </Link>
        </div>
        <LegacyContentSections
          html={aboutPage.content}
          className=""
          sectionClassName="rounded-[32px] border border-stone-200 bg-white p-8 shadow-sm"
        />
      </section>

      {/* Featured products */}
      <section className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-brand-700">Каталог</p>
            <h2 className="mt-2 text-3xl font-semibold text-stone-900">Актуальні продукти</h2>
          </div>
          <Link
            href="/catalog"
            className="inline-flex items-center gap-1 text-sm font-medium text-brand-700 hover:gap-2 transition-all"
          >
            Увесь каталог <span aria-hidden="true">→</span>
          </Link>
        </div>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
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
      </section>

      {/* Articles */}
      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-brand-700">Інфотека</p>
            <h2 className="mt-2 text-3xl font-semibold text-stone-900">Останні матеріали</h2>
          </div>
          <Link
            href="/blog"
            className="inline-flex items-center gap-1 text-sm font-medium text-brand-700 hover:gap-2 transition-all"
          >
            Усі статті <span aria-hidden="true">→</span>
          </Link>
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          {featuredArticles.map((article) => (
            <article
              key={article.slug}
              className="group flex flex-col rounded-[28px] border border-stone-200 bg-white p-6 shadow-sm transition-all duration-200 hover:border-brand-100 hover:shadow-md"
            >
              <p className="text-sm text-stone-500">{formatDate(article.publishedAt)}</p>
              <h3 className="mt-3 text-xl font-semibold leading-snug text-stone-900">{article.title}</h3>
              <p className="mt-3 flex-1 text-sm leading-6 text-stone-600 line-clamp-3">
                {stripHtml(article.excerpt).slice(0, 190)}...
              </p>
              <Link
                href={`/blog/${article.slug}`}
                className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-brand-700 transition-all group-hover:gap-2.5"
              >
                Читати матеріал <span aria-hidden="true">→</span>
              </Link>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
