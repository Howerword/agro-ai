import { readFile } from 'node:fs/promises';
import path from 'node:path';

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const IMPORT_DIR = path.resolve(process.cwd(), 'data', 'import', 'vitera');

type ImportedBase = {
  url: string;
  path: string;
  title: string;
  seoTitle: string;
  metaDescription: string;
  sourceLinks: string[];
  contentText: string;
  contentHtml: string;
};

type ImportedProduct = ImportedBase & {
  productName: string;
  manufacturer: string;
  shortDescription: string;
  tabs: Array<{ key: string; text: string; html: string }>;
};

type ImportedNews = ImportedBase & {
  publishedAt: string;
};

function normalizeSlug(input: string): string {
  const decoded = decodeURIComponent(input)
    .toLowerCase()
    .replace(/[^a-z0-9а-яіїєґ]+/giu, '-')
    .replace(/^-+|-+$/g, '');

  return decoded || 'imported-item';
}

function excerpt(text: string, length = 280): string {
  return text.replace(/\s+/g, ' ').trim().slice(0, length);
}

function detectCropTags(text: string): string[] {
  const dictionary = [
    'пшениця',
    'ячмінь',
    'кукурудза',
    'соняшник',
    'соя',
    'ріпак',
    'томат',
    'огірок',
    'картопля',
    'яблуня',
    'груша',
    'суниця',
    'малина',
    'виноград'
  ];

  const haystack = text.toLowerCase();
  return dictionary.filter((crop) => haystack.includes(crop));
}

function collectBenefits(product: ImportedProduct): string[] {
  const properties = product.tabs.find((tab) => tab.key === 'properties')?.text ?? product.contentText;

  return properties
    .split(/[.•]/g)
    .map((item) => item.trim())
    .filter((item) => item.length > 20)
    .slice(0, 6);
}

async function readJson<T>(filename: string): Promise<T> {
  const fullPath = path.join(IMPORT_DIR, filename);
  const raw = await readFile(fullPath, 'utf8');
  return JSON.parse(raw) as T;
}

async function main() {
  const [pages, listings, products, news] = await Promise.all([
    readJson<ImportedBase[]>('pages.json'),
    readJson<ImportedBase[]>('listings.json'),
    readJson<ImportedProduct[]>('products.json'),
    readJson<ImportedNews[]>('news.json')
  ]);

  const catalogCategory = await prisma.category.upsert({
    where: { slug: 'vitera-imported-catalog' },
    update: {},
    create: {
      slug: 'vitera-imported-catalog',
      name: 'Vitera Imported Catalog',
      description: 'Імпортований каталог продуктів із чинного сайту Vitera.',
      seoTitle: 'Vitera Imported Catalog',
      seoDescription: 'Технічна категорія для імпортованих продуктів з попереднього сайту.'
    }
  });

  const smallPackCategory = await prisma.category.upsert({
    where: { slug: 'vitera-imported-smallpack' },
    update: {},
    create: {
      slug: 'vitera-imported-smallpack',
      name: 'Vitera Imported Small Pack',
      description: 'Імпортовані продукти дрібного фасування.',
      seoTitle: 'Vitera Small Pack',
      seoDescription: 'Технічна категорія для імпортованих продуктів дрібного фасування.'
    }
  });

  for (const page of [...pages, ...listings]) {
    const slug = page.path === '/' ? 'home' : normalizeSlug(page.path.split('/').filter(Boolean).join('-'));

    await prisma.page.upsert({
      where: { path: page.path },
      update: {
        slug,
        title: page.title,
        content: page.contentHtml || page.contentText,
        excerpt: excerpt(page.contentText),
        seoTitle: page.seoTitle || page.title,
        seoDescription: page.metaDescription || excerpt(page.contentText, 160),
        sourceUrl: page.url,
        sourceLinks: page.sourceLinks
      },
      create: {
        slug,
        path: page.path,
        title: page.title,
        content: page.contentHtml || page.contentText,
        excerpt: excerpt(page.contentText),
        seoTitle: page.seoTitle || page.title,
        seoDescription: page.metaDescription || excerpt(page.contentText, 160),
        sourceUrl: page.url,
        sourceLinks: page.sourceLinks
      }
    });
  }

  for (const article of news) {
    const rawSlug = article.path.split('/').filter(Boolean).pop() ?? article.title;
    const slug = normalizeSlug(rawSlug);
    const publishedAt = article.publishedAt
      ? (() => {
          const [day, month, year] = article.publishedAt.split('.');
          return new Date(`${year}-${month}-${day}T00:00:00.000Z`);
        })()
      : null;

    await prisma.article.upsert({
      where: { slug },
      update: {
        title: article.title,
        excerpt: article.metaDescription || excerpt(article.contentText),
        content: article.contentHtml || article.contentText,
        seoTitle: article.seoTitle || article.title,
        seoDescription: article.metaDescription || excerpt(article.contentText, 160),
        publishedAt
      },
      create: {
        slug,
        title: article.title,
        excerpt: article.metaDescription || excerpt(article.contentText),
        content: article.contentHtml || article.contentText,
        seoTitle: article.seoTitle || article.title,
        seoDescription: article.metaDescription || excerpt(article.contentText, 160),
        publishedAt
      }
    });
  }

  for (const product of products) {
    const rawSlug = product.path.split('/').filter(Boolean).pop() ?? product.productName;
    const slug = normalizeSlug(rawSlug);
    const categoryId = rawSlug.includes('small') ? smallPackCategory.id : catalogCategory.id;
    const application = product.tabs.find((tab) => tab.key === 'application')?.text ?? '';
    const composition = product.tabs.find((tab) => tab.key === 'composition')?.html ?? '';

    await prisma.product.upsert({
      where: { slug },
      update: {
        name: product.productName || product.title,
        shortDescription: product.shortDescription || excerpt(product.contentText),
        description: product.contentHtml || product.contentText,
        manufacturer: product.manufacturer || null,
        application: application || null,
        cropTags: detectCropTags(product.contentText),
        benefits: collectBenefits(product),
        composition: composition ? { html: composition } : undefined,
        dosage: application ? { text: application } : undefined,
        seoTitle: product.seoTitle || product.title,
        seoDescription: product.metaDescription || excerpt(product.contentText, 160),
        categoryId
      },
      create: {
        slug,
        name: product.productName || product.title,
        shortDescription: product.shortDescription || excerpt(product.contentText),
        description: product.contentHtml || product.contentText,
        manufacturer: product.manufacturer || null,
        application: application || null,
        cropTags: detectCropTags(product.contentText),
        benefits: collectBenefits(product),
        composition: composition ? { html: composition } : undefined,
        dosage: application ? { text: application } : undefined,
        seoTitle: product.seoTitle || product.title,
        seoDescription: product.metaDescription || excerpt(product.contentText, 160),
        categoryId
      }
    });
  }

  console.log(
    JSON.stringify(
      {
        pages: pages.length + listings.length,
        articles: news.length,
        products: products.length
      },
      null,
      2
    )
  );
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
