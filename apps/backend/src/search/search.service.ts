import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MeiliSearch } from 'meilisearch';

import { PrismaService } from '../prisma/prisma.service';
import { ProductQueryDto } from '../products/dto/product-query.dto';

type IndexedProductDocument = {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  description: string;
  manufacturer: string;
  application: string;
  categorySlug: string;
  categoryName: string;
  cropTags: string[];
  programSlugs: string[];
  programTitles: string[];
  benefits: string[];
  createdAt: string;
};

@Injectable()
export class SearchService implements OnModuleInit {
  private readonly logger = new Logger(SearchService.name);
  private readonly meili?: MeiliSearch;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService
  ) {
    const host = this.configService.get<string>('MEILI_HOST');

    if (host) {
      this.meili = new MeiliSearch({
        host,
        apiKey: this.configService.get<string>('MEILI_API_KEY')
      });
    }
  }

  async onModuleInit() {
    if (!this.meili) {
      return;
    }

    try {
      await this.syncProductsIndex();
    } catch (error) {
      this.logger.warn(`Initial Meilisearch sync failed: ${String(error)}`);
    }
  }

  isEnabled() {
    return Boolean(this.meili);
  }

  async syncProductsIndex() {
    if (!this.meili) {
      return {
        enabled: false,
        indexed: 0
      };
    }

    const index = await this.ensureProductsIndex();
    const products = await this.prisma.product.findMany({
      where: { isPublished: true },
      include: {
        category: true,
        programs: true
      },
      orderBy: [{ createdAt: 'desc' }]
    });

    const documents = products.map((product) => this.toIndexedDocument(product));
    const task = await index.addDocuments(documents, { primaryKey: 'id' });
    await this.meili.tasks.waitForTask(task.taskUid);

    return {
      enabled: true,
      indexed: documents.length,
      taskUid: task.taskUid
    };
  }

  async searchCatalog(query: ProductQueryDto) {
    if (!this.meili || !query.q?.trim()) {
      return null;
    }

    try {
      const index = await this.ensureProductsIndex();
      const response = await index.search<IndexedProductDocument>(query.q.trim(), {
        limit: query.limit,
        offset: (query.page - 1) * query.limit,
        filter: this.buildFilters(query),
        sort: ['name:asc']
      });

      const ids = response.hits.map((hit) => hit.id);

      return {
        ids,
        total: response.estimatedTotalHits ?? ids.length
      };
    } catch (error) {
      this.logger.warn(`Catalog search fallback: ${String(error)}`);
      return null;
    }
  }

  async searchProducts(query: string, crop?: string) {
    if (this.meili && query) {
      try {
        const index = await this.ensureProductsIndex();
        const response = await index.search<IndexedProductDocument>(query, {
          limit: 6,
          filter: crop ? [`cropTags = "${this.escapeFilterValue(crop)}"`] : undefined
        });

        const ids = response.hits.map((hit) => hit.id);

        if (ids.length) {
          return this.getProductsByIds(ids);
        }
      } catch (error) {
        this.logger.warn(`Meilisearch fallback: ${String(error)}`);
      }
    }

    const strictResults = await this.prisma.product.findMany({
      where: {
        isPublished: true,
        ...(crop ? { cropTags: { has: crop } } : {}),
        ...(query
          ? {
              OR: [
                { name: { contains: query, mode: 'insensitive' } },
                { shortDescription: { contains: query, mode: 'insensitive' } },
                { description: { contains: query, mode: 'insensitive' } }
              ]
            }
          : {})
      },
      include: {
        category: true,
        programs: true
      },
      take: 6
    });

    if (strictResults.length || !crop) {
      return strictResults;
    }

    const cropOnlyResults = await this.prisma.product.findMany({
      where: {
        isPublished: true,
        cropTags: { has: crop }
      },
      include: {
        category: true,
        programs: true
      },
      take: 6
    });

    if (cropOnlyResults.length) {
      return cropOnlyResults;
    }

    return this.prisma.product.findMany({
      where: {
        isPublished: true,
        ...(query
          ? {
              OR: [
                { name: { contains: query, mode: 'insensitive' } },
                { shortDescription: { contains: query, mode: 'insensitive' } },
                { description: { contains: query, mode: 'insensitive' } }
              ]
            }
          : {})
      },
      include: {
        category: true,
        programs: true
      },
      take: 6
    });
  }

  private async ensureProductsIndex() {
    if (!this.meili) {
      throw new Error('Meilisearch is not configured');
    }

    const indexName = 'products';

    try {
      await this.meili.getIndex(indexName);
    } catch {
      const task = await this.meili.createIndex(indexName, { primaryKey: 'id' });
      await this.meili.tasks.waitForTask(task.taskUid);
    }

    const index = this.meili.index<IndexedProductDocument>(indexName);
    const settingsTask = await index.updateSettings({
      searchableAttributes: [
        'name',
        'shortDescription',
        'description',
        'manufacturer',
        'application',
        'benefits',
        'categoryName',
        'programTitles'
      ],
      filterableAttributes: ['categorySlug', 'cropTags', 'programSlugs'],
      sortableAttributes: ['name', 'createdAt'],
      displayedAttributes: [
        'id',
        'slug',
        'name',
        'shortDescription',
        'categorySlug',
        'categoryName',
        'cropTags',
        'programSlugs'
      ]
    });

    await this.meili.tasks.waitForTask(settingsTask.taskUid);
    return index;
  }

  private async getProductsByIds(ids: string[]) {
    const products = await this.prisma.product.findMany({
      where: { id: { in: ids } },
      include: { category: true, programs: true }
    });

    const order = new Map(ids.map((id, index) => [id, index]));
    return [...products].sort((left, right) => (order.get(left.id) ?? 0) - (order.get(right.id) ?? 0));
  }

  private buildFilters(query: ProductQueryDto) {
    const filters: string[] = [];

    if (query.category) {
      filters.push(`categorySlug = "${this.escapeFilterValue(query.category)}"`);
    }

    if (query.crop) {
      filters.push(`cropTags = "${this.escapeFilterValue(query.crop)}"`);
    }

    if (query.program) {
      filters.push(`programSlugs = "${this.escapeFilterValue(query.program)}"`);
    }

    return filters.length ? filters : undefined;
  }

  private escapeFilterValue(value: string) {
    return value.replaceAll('\\', '\\\\').replaceAll('"', '\\"');
  }

  private stripHtml(value: string) {
    return value.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  }

  private toIndexedDocument(product: {
    id: string;
    slug: string;
    name: string;
    shortDescription: string;
    description: string;
    manufacturer: string | null;
    application: string | null;
    cropTags: string[];
    benefits: string[];
    createdAt: Date;
    category: {
      slug: string;
      name: string;
    };
    programs: Array<{
      slug: string;
      title: string;
    }>;
  }): IndexedProductDocument {
    return {
      id: product.id,
      slug: product.slug,
      name: product.name,
      shortDescription: product.shortDescription,
      description: this.stripHtml(product.description),
      manufacturer: product.manufacturer ?? '',
      application: product.application ?? '',
      categorySlug: product.category.slug,
      categoryName: product.category.name,
      cropTags: product.cropTags,
      programSlugs: product.programs.map((program) => program.slug),
      programTitles: product.programs.map((program) => program.title),
      benefits: product.benefits,
      createdAt: product.createdAt.toISOString()
    };
  }
}
