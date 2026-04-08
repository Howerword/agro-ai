import 'server-only';

import type { ArticleRecord, PageRecord, ProductFiltersResponse, ProductRecord, ProductsResponse } from '@agro/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

async function apiFetch<T>(pathname: string): Promise<T> {
  const response = await fetch(`${API_URL}${pathname}`, {
    cache: 'no-store'
  });

  if (!response.ok) {
    throw new Error(`API request failed for ${pathname}: ${response.status}`);
  }

  return (await response.json()) as T;
}

export function getProducts(query = '') {
  return apiFetch<ProductsResponse>(`/products${query}`);
}

export function getProductFilters() {
  return apiFetch<ProductFiltersResponse>('/products/filters');
}

export function getProduct(slug: string) {
  return apiFetch<ProductRecord>(`/products/${slug}`);
}

export function getPages() {
  return apiFetch<PageRecord[]>('/pages');
}

export function getPage(slug: string) {
  return apiFetch<PageRecord>(`/pages/${slug}`);
}

export function getArticles() {
  return apiFetch<ArticleRecord[]>('/articles');
}

export function getArticle(slug: string) {
  return apiFetch<ArticleRecord>(`/articles/${slug}`);
}
