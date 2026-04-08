import Link from 'next/link';

import { getArticles } from '../../lib/api';
import { formatDate, stripHtml } from '../../lib/content';

export default async function BlogPage() {
  const articles = await getArticles();

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <h1 className="text-4xl font-semibold">Блог та інфотека</h1>
      <p className="mt-4 max-w-3xl text-stone-600">
        Імпортовані статті й новини збережені для SEO-міграції та вже працюють через новий backend.
      </p>

      <div className="mt-10 grid gap-6">
        {articles.map((article) => (
          <article key={article.slug} className="rounded-[28px] border border-stone-200 bg-white p-6 shadow-sm">
            <p className="text-sm text-stone-500">{formatDate(article.publishedAt)}</p>
            <h2 className="mt-2 text-2xl font-semibold text-stone-900">{article.title}</h2>
            <p className="mt-3 text-sm leading-6 text-stone-600">{stripHtml(article.excerpt).slice(0, 320)}...</p>
            <Link href={`/blog/${article.slug}`} className="mt-5 inline-flex text-sm font-medium text-brand-700">
              Відкрити статтю
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
}
