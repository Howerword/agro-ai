import { Injectable } from '@nestjs/common';
import { MeiliSearch } from 'meilisearch';

@Injectable()
export class MeiliService {
  private readonly client = new MeiliSearch({
    host: process.env.MEILI_HOST ?? 'http://localhost:7700',
    apiKey: process.env.MEILI_API_KEY
  });

  indexProducts(products: Array<Record<string, unknown>>) {
    return this.client.index('products').addDocuments(products);
  }
}
