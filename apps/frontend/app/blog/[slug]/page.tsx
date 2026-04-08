import { notFound } from 'next/navigation';

import { LegacyContentSections } from '../../../components/legacy-content-sections';
import { getArticle } from '../../../lib/api';
import { formatDate } from '../../../lib/content';

type ArticlePageProps = {
  params: Promise<{ slug: string }>;
};

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;

  try {
    const article = await getArticle(slug);

    return (
      <article className="mx-auto max-w-4xl px-6 py-16">
        <p className="text-sm uppercase tracking-[0.2em] text-brand-700">Інфотека</p>
        <h1 className="mt-2 text-4xl font-semibold text-stone-900">{article.title}</h1>
        <p className="mt-4 text-sm text-stone-500">{formatDate(article.publishedAt)}</p>
        <LegacyContentSections html={article.content} mode="article" className="mt-8 space-y-6" />
      </article>
    );
  } catch {
    notFound();
  }
}
