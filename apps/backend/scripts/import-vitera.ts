import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

import * as cheerio from 'cheerio';

const BASE_URL = 'https://viteraukraine.com';
const OUTPUT_DIR = path.resolve(process.cwd(), 'data', 'import', 'vitera');
const PRODUCT_TAB_KEYS = ['properties', 'application', 'composition'];
const SEED_URLS = [
  `${BASE_URL}/`,
  `${BASE_URL}/news`,
  `${BASE_URL}/newspaper`,
  `${BASE_URL}/page/about`,
  `${BASE_URL}/page/filterizer`,
  `${BASE_URL}/page/dobryva`,
  `${BASE_URL}/page/contact`,
  `${BASE_URL}/page/agroservice`,
  `${BASE_URL}/page/distributor`,
  `${BASE_URL}/page/sertificate`,
  `${BASE_URL}/products/programm`,
  `${BASE_URL}/products/smallpack`,
  `${BASE_URL}/gallery`
];

type PageKind =
  | 'home'
  | 'page'
  | 'news-index'
  | 'news-article'
  | 'product'
  | 'product-list'
  | 'newspaper-index'
  | 'gallery'
  | 'other';

type BaseEntry = {
  url: string;
  path: string;
  kind: PageKind;
  title: string;
  seoTitle: string;
  metaDescription: string;
  canonicalUrl: string;
  sourceLinks: string[];
  contentText: string;
  contentHtml: string;
};

type ProductEntry = BaseEntry & {
  productName: string;
  manufacturer: string;
  shortDescription: string;
  tabs: Array<{ key: string; text: string; html: string }>;
};

type NewsEntry = BaseEntry & {
  publishedAt: string;
};

type ListingEntry = BaseEntry & {
  discoveredItemUrls: string[];
};

function normalizeUrl(input: string, currentUrl?: string): string | null {
  try {
    const url = new URL(input, currentUrl ?? BASE_URL);

    if (url.hostname !== 'viteraukraine.com') {
      return null;
    }

    url.hash = '';

    if (url.pathname !== '/' && url.pathname.endsWith('/')) {
      url.pathname = url.pathname.slice(0, -1);
    }

    if (url.pathname !== '/newspaper/index') {
      url.search = '';
    }

    return url.toString();
  } catch {
    return null;
  }
}

function shouldCrawl(url: string): boolean {
  const pathname = new URL(url).pathname;

  if (pathname === '/') return true;
  if (pathname === '/news' || pathname.startsWith('/news/')) return true;
  if (pathname === '/newspaper' || pathname === '/newspaper/index') return true;
  if (pathname.startsWith('/page/')) return true;
  if (pathname.startsWith('/product/')) return true;
  if (pathname.startsWith('/products/')) return true;
  if (pathname === '/gallery') return true;

  return false;
}

function detectKind(url: string): PageKind {
  const pathname = new URL(url).pathname;

  if (pathname === '/') return 'home';
  if (pathname === '/news') return 'news-index';
  if (pathname.startsWith('/news/')) return 'news-article';
  if (pathname === '/newspaper' || pathname === '/newspaper/index') return 'newspaper-index';
  if (pathname.startsWith('/page/')) return 'page';
  if (pathname.startsWith('/product/')) return 'product';
  if (pathname.startsWith('/products/')) return 'product-list';
  if (pathname === '/gallery') return 'gallery';

  return 'other';
}

function textOf(element: cheerio.Cheerio<any>): string {
  return element.text().replace(/\s+/g, ' ').trim();
}

function htmlOf(element: cheerio.Cheerio<any>): string {
  return element.html()?.trim() ?? '';
}

function firstNonEmpty(values: Array<string | undefined>): string {
  return values.map((value) => value?.trim() ?? '').find(Boolean) ?? '';
}

function extractLinks(html: string, currentUrl: string): string[] {
  const $ = cheerio.load(html);
  const found = new Set<string>();

  $('a[href]').each((_, element) => {
    const href = $(element).attr('href');
    if (!href) return;
    const normalized = normalizeUrl(href.replaceAll('&amp;', '&'), currentUrl);
    if (normalized && shouldCrawl(normalized)) {
      found.add(normalized);
    }
  });

  const regex = /\/(?:page|news|product|products|newspaper|gallery)[^"'<>\\s]*/g;
  const matches = html.match(regex) ?? [];
  for (const match of matches) {
    const normalized = normalizeUrl(match.replaceAll('&amp;', '&'), currentUrl);
    if (normalized && shouldCrawl(normalized)) {
      found.add(normalized);
    }
  }

  return [...found];
}

function selectMain($: cheerio.CheerioAPI, kind: PageKind): cheerio.Cheerio<any> {
  const selectors: Record<PageKind, string[]> = {
    home: ['main', 'body'],
    page: ['main section', 'main', 'body'],
    'news-index': ['main', 'body'],
    'news-article': ['section.newsInner', 'main', 'body'],
    product: ['section.productCard', 'main', 'body'],
    'product-list': ['section.catalog', 'main', 'body'],
    'newspaper-index': ['main', 'body'],
    gallery: ['main', 'body'],
    other: ['main', 'body']
  };

  for (const selector of selectors[kind]) {
    const element = $(selector).first();
    if (element.length) {
      const clone = element.clone();
      clone.find('script, style, noscript, header, footer, .nav-wrapper, .page-footer').remove();
      return clone;
    }
  }

  return $.root();
}

function extractBaseEntry(url: string, html: string): BaseEntry {
  const $ = cheerio.load(html);
  const kind = detectKind(url);
  const main = selectMain($, kind);
  const heading = firstNonEmpty([
    textOf(main.find('h1').first()),
    textOf(main.find('h2').first()),
    textOf(main.find('h3').first())
  ]);
  const seoTitle = firstNonEmpty([
    $('meta[property="og:title"]').attr('content'),
    $('title').text()
  ]);
  const fallbackTitle = new URL(url).pathname.split('/').filter(Boolean).pop()?.replaceAll('-', ' ') ?? 'home';

  return {
    url,
    path: new URL(url).pathname,
    kind,
    title: firstNonEmpty([heading, seoTitle, fallbackTitle]),
    seoTitle,
    metaDescription: firstNonEmpty([
      $('meta[name="description"]').attr('content'),
      $('meta[property="og:description"]').attr('content')
    ]),
    canonicalUrl: firstNonEmpty([
      $('link[rel="canonical"]').attr('href'),
      url
    ]),
    sourceLinks: extractLinks(html, url),
    contentText: textOf(main),
    contentHtml: htmlOf(main)
  };
}

function extractProductEntry(url: string, html: string): ProductEntry {
  const $ = cheerio.load(html);
  const base = extractBaseEntry(url, html);
  const productCard = $('section.productCard').first();
  const tabs = $('.tabs__content')
    .toArray()
    .map((element, index) => ({
      key: PRODUCT_TAB_KEYS[index] ?? `tab-${index + 1}`,
      text: textOf($(element)),
      html: htmlOf($(element))
    }))
    .filter((tab) => tab.text);

  const cardText = textOf(productCard);
  const manufacturerMatch = cardText.match(/Виробник:\s*([^]+?)(?=star_border|Властивості|Застосування|Склад|$)/i);

  return {
    ...base,
    productName: firstNonEmpty([
      textOf(productCard.find('h1').first()),
      textOf(productCard.find('h2').first()),
      base.title
    ]),
    manufacturer: manufacturerMatch?.[1]?.replace(/\s+/g, ' ').trim() ?? '',
    shortDescription: firstNonEmpty([
      textOf(productCard.find('p').first()),
      textOf(productCard.find('.productCard__descr').first())
    ]),
    tabs
  };
}

function extractNewsEntry(url: string, html: string): NewsEntry {
  const $ = cheerio.load(html);
  const base = extractBaseEntry(url, html);
  const dateMatch = base.contentText.match(/\b\d{2}\.\d{2}\.\d{4}\b/);

  return {
    ...base,
    publishedAt: dateMatch?.[0] ?? ''
  };
}

function extractListingEntry(url: string, html: string): ListingEntry {
  const base = extractBaseEntry(url, html);
  const itemPattern =
    base.kind === 'product-list'
      ? /\/product\/[A-Za-z0-9_%\-]+/g
      : base.kind === 'news-index'
        ? /\/news\/[A-Za-z0-9_%\-]+/g
        : /\/(?:news|product)\/[A-Za-z0-9_%\-]+/g;

  const discoveredItemUrls = [...new Set(html.match(itemPattern) ?? [])]
    .map((value) => normalizeUrl(value))
    .filter((value): value is string => Boolean(value));

  return {
    ...base,
    discoveredItemUrls
  };
}

async function fetchHtml(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: {
      'user-agent': 'Mozilla/5.0 (compatible; ViteraImportBot/1.0; +https://viteraukraine.com)'
    }
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  return response.text();
}

async function crawlSite() {
  const queue = [...SEED_URLS];
  const seen = new Set<string>();
  const pages = new Map<string, string>();

  while (queue.length) {
    const url = queue.shift()!;
    if (seen.has(url)) continue;

    seen.add(url);

    try {
      const html = await fetchHtml(url);
      pages.set(url, html);
      const links = extractLinks(html, url);

      for (const link of links) {
        if (!seen.has(link)) {
          queue.push(link);
        }
      }

      console.log(`Fetched ${url}`);
    } catch (error) {
      console.warn(`Skip ${url}: ${String(error)}`);
    }
  }

  return pages;
}

async function writeJson(filename: string, data: unknown) {
  await writeFile(path.join(OUTPUT_DIR, filename), JSON.stringify(data, null, 2), 'utf8');
}

async function main() {
  await mkdir(OUTPUT_DIR, { recursive: true });

  const pages = await crawlSite();
  const allUrls = [...pages.keys()].sort();

  const pageEntries: BaseEntry[] = [];
  const productEntries: ProductEntry[] = [];
  const newsEntries: NewsEntry[] = [];
  const listingEntries: ListingEntry[] = [];

  for (const [url, html] of pages.entries()) {
    const kind = detectKind(url);

    if (kind === 'product') {
      productEntries.push(extractProductEntry(url, html));
      continue;
    }

    if (kind === 'news-article') {
      newsEntries.push(extractNewsEntry(url, html));
      continue;
    }

    if (kind === 'product-list' || kind === 'news-index' || kind === 'newspaper-index') {
      listingEntries.push(extractListingEntry(url, html));
      continue;
    }

    pageEntries.push(extractBaseEntry(url, html));
  }

  const summary = {
    crawledAt: new Date().toISOString(),
    totalPages: allUrls.length,
    pages: pageEntries.length,
    products: productEntries.length,
    newsArticles: newsEntries.length,
    listingPages: listingEntries.length,
    urls: allUrls
  };

  await Promise.all([
    writeJson('summary.json', summary),
    writeJson('pages.json', pageEntries),
    writeJson('products.json', productEntries),
    writeJson('news.json', newsEntries),
    writeJson('listings.json', listingEntries)
  ]);

  console.log(JSON.stringify(summary, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
