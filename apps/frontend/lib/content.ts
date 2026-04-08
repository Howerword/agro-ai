import 'server-only';

import * as cheerio from 'cheerio';

const LEGACY_BASE_URL = 'https://viteraukraine.com';

const PAGE_ROUTE_MAP: Record<string, string> = {
  '/': '/',
  '/news': '/blog',
  '/newspaper': '/blog',
  '/newspaper/index': '/blog',
  '/page/contact': '/contacts',
  '/page/filterizer': '/catalog',
  '/products/catalog': '/catalog',
  '/products/smallpack': '/catalog',
  '/products/programm': '/solutions',
  '/page/agroservice': '/services'
};

const CATEGORY_LABELS: Record<string, string> = {
  'vitera-imported-catalog': 'Основний каталог',
  'vitera-imported-smallpack': 'Дрібне фасування'
};

export type LegacyContentSection = {
  id: string;
  title?: string;
  html: string;
};

function normalizeProductSlug(slug: string): string {
  return decodeURIComponent(slug).replaceAll('_', '-').toLowerCase();
}

function mapLegacyPath(path: string): string | null {
  if (PAGE_ROUTE_MAP[path]) {
    return PAGE_ROUTE_MAP[path];
  }

  if (path.startsWith('/product/')) {
    const slug = path.split('/').filter(Boolean).pop();
    return slug ? `/product/${normalizeProductSlug(slug)}` : null;
  }

  if (path.startsWith('/news/')) {
    const slug = path.split('/').filter(Boolean).pop();
    return slug ? `/blog/${slug}` : null;
  }

  return null;
}

export function rewriteLegacyContentHtml(html: string): string {
  return html
    .replace(/(src|href)=["']\/(?!\/)/g, `$1="${LEGACY_BASE_URL}/`)
    .replace(/href=["']https:\/\/viteraukraine\.com([^"']+)["']/g, (_, path: string) => {
      const localPath = mapLegacyPath(path);
      return `href="${localPath ?? `${LEGACY_BASE_URL}${path}`}"`;
    })
    .replace(/href=["']\/([^"']+)["']/g, (_, path: string) => {
      const localPath = mapLegacyPath(`/${path}`);
      return `href="${localPath ?? `${LEGACY_BASE_URL}/${path}`}"`;
    });
}

export function normalizeLegacySections(
  html: string,
  mode: 'generic' | 'article' | 'product' = 'generic'
): LegacyContentSection[] {
  const $ = loadLegacyDocument(html);

  if (mode === 'product') {
    const productSections = extractProductSections($);

    if (productSections.length) {
      return productSections;
    }
  }

  return extractGenericSections($, mode === 'article' ? 'article' : 'generic');
}

export function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

export function getCategoryLabel(category?: { slug?: string | null; name?: string | null } | null) {
  if (!category) {
    return 'Каталог';
  }

  return CATEGORY_LABELS[category.slug ?? ''] ?? category.name ?? 'Каталог';
}

export function formatDate(value?: string | null): string {
  if (!value) {
    return '';
  }

  return new Intl.DateTimeFormat('uk-UA', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  }).format(new Date(value));
}

function loadLegacyDocument(html: string) {
  const $ = cheerio.load(rewriteLegacyContentHtml(html));

  $('script, style, noscript, iframe, form, input, textarea, select, option, button').remove();
  $('.modal, .modal-content, .orderModal, .thank-modal, .error-modal, .help-block').remove();
  $('.main-title, .productCard__images, .slider, .slider-single, .slider-nav, .count-character').remove();
  $('.addToFavorits, .main-btn, .material-icons, .breadcrumbs, .newsInner__sub').remove();
  $('.productCard__descr > h2').remove();
  $('br').each((_, element) => {
    $(element).replaceWith('\n');
  });

  $('.agroService__content-item').addClass('legacy-link-card');

  unwrap($, '.container');
  unwrap($, '.newsInner__content');
  unwrap($, '.agroService__content');
  unwrap($, '.productCard__wrap');
  unwrap($, '.productCard__descr');
  unwrap($, '.productCard__tabs');
  unwrap($, 'div[title^="Page "]');

  $('img').each((_, element) => {
    const node = $(element);
    node.removeAttr('class');
    node.removeAttr('style');
    node.removeAttr('width');
    node.removeAttr('height');
    node.attr('loading', 'lazy');
  });

  $('a').each((_, element) => {
    const node = $(element);
    node.removeAttr('class');
    node.removeAttr('style');
  });

  $('p, li, h1, h2, h3, h4').each((_, element) => {
    const node = $(element);
    const text = node.text().replace(/\s+/g, ' ').trim();

    if (!text && !node.find('img').length && !node.find('a').length) {
      node.remove();
    }
  });

  $('div').each((_, element) => {
    const node = $(element);
    const text = node.text().replace(/\s+/g, ' ').trim();

    if (!text && !node.find('img').length && !node.find('a').length) {
      node.remove();
    }
  });

  return $;
}

function unwrap($: cheerio.CheerioAPI, selector: string) {
  $(selector).each((_, element) => {
    $(element).replaceWith($(element).html() ?? '');
  });
}

function extractProductSections($: cheerio.CheerioAPI): LegacyContentSection[] {
  const tabLabels = new Map<string, string>();

  $('[href^="#"]').each((_, element) => {
    const node = $(element);
    const href = node.attr('href');
    const label = node.text().replace(/\s+/g, ' ').trim();

    if (href?.startsWith('#') && label) {
      tabLabels.set(href.slice(1), label);
    }
  });

  return $('.tabs__content')
    .toArray()
    .reduce<LegacyContentSection[]>((sections, element, index) => {
      const node = $(element).clone();
      const id = node.attr('id') ?? `product-section-${index + 1}`;
      const titleFromHeading = node.find('h3').first().text().replace(/\s+/g, ' ').trim();
      const title = tabLabels.get(id) ?? titleFromHeading ?? undefined;

      if (titleFromHeading && normalizeHeading(titleFromHeading) === normalizeHeading(title)) {
        node.find('h3').first().remove();
      }

      const sectionHtml = node.html()?.trim() ?? '';

      if (!sectionHtml) {
        return sections;
      }

      sections.push({
        id,
        title,
        html: sectionHtml
      });

      return sections;
    }, []);
}

function extractGenericSections($: cheerio.CheerioAPI, mode: 'generic' | 'article'): LegacyContentSection[] {
  const sections: LegacyContentSection[] = [];
  const nodes = $('body').contents().toArray();
  let currentTitle: string | undefined;
  let currentNodes: string[] = [];

  const flush = () => {
    const html = currentNodes.join('').trim();

    if (!html) {
      currentNodes = [];
      return;
    }

    sections.push({
      id: `section-${sections.length + 1}`,
      title: currentTitle,
      html
    });

    currentTitle = undefined;
    currentNodes = [];
  };

  for (const node of nodes) {
    if (node.type === 'text') {
      const text = $(node).text().replace(/\s+/g, ' ').trim();

      if (text) {
        currentNodes.push(`<p>${text}</p>`);
      }

      continue;
    }

    if (node.type !== 'tag') {
      continue;
    }

    const element = $(node);
    const tagName = node.tagName?.toLowerCase() ?? '';
    const text = element.text().replace(/\s+/g, ' ').trim();

    if (!text && !element.find('img').length && !element.find('a').length) {
      continue;
    }

    if (tagName === 'h1' || tagName === 'h2' || tagName === 'h3') {
      flush();
      currentTitle = text;
      continue;
    }

    currentNodes.push($.html(node));
  }

  flush();

  if (mode === 'article') {
    return sections.filter((section) => stripHtml(section.html) !== 'Вас може зацікавити:');
  }

  return sections.length ? sections : [{ id: 'section-1', html: $('body').html() ?? '' }];
}

function normalizeHeading(value?: string) {
  return (value ?? '').replace(/[:\s]+$/g, '').trim().toLowerCase();
}
