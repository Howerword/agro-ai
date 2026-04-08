import { Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { SearchService } from '../search/search.service';
import { ProductQueryDto } from './dto/product-query.dto';

@Injectable()
export class ProductsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly searchService: SearchService
  ) {}

  async findAll(query: ProductQueryDto) {
    const meiliResult = await this.searchService.searchCatalog(query);
    const where = this.buildWhere(query, !meiliResult);

    const [items, total] = meiliResult
      ? await Promise.all([
          this.getProductsByIds(meiliResult.ids),
          Promise.resolve(meiliResult.total)
        ])
      : await Promise.all([
          this.prisma.product.findMany({
            where,
            include: {
              category: true,
              programs: true
            },
            skip: (query.page - 1) * query.limit,
            take: query.limit,
            orderBy: [{ createdAt: 'desc' }]
          }),
          this.prisma.product.count({ where })
        ]);

    return {
      items,
      meta: {
        page: query.page,
        limit: query.limit,
        total,
        pageCount: Math.ceil(total / query.limit)
      }
    };
  }

  async getFilters() {
    const [categories, programs, products] = await Promise.all([
      this.prisma.category.findMany({
        where: {
          products: {
            some: {
              isPublished: true
            }
          }
        },
        select: {
          slug: true,
          name: true,
          products: {
            where: {
              isPublished: true
            },
            select: {
              id: true
            }
          }
        },
        orderBy: [{ name: 'asc' }]
      }),
      this.prisma.program.findMany({
        where: {
          products: {
            some: {
              isPublished: true
            }
          }
        },
        select: {
          slug: true,
          title: true,
          products: {
            where: {
              isPublished: true
            },
            select: {
              id: true
            }
          }
        },
        orderBy: [{ title: 'asc' }]
      }),
      this.prisma.product.findMany({
        where: { isPublished: true },
        select: {
          cropTags: true
        }
      })
    ]);

    const cropCounts = new Map<string, number>();

    for (const product of products) {
      for (const crop of product.cropTags) {
        cropCounts.set(crop, (cropCounts.get(crop) ?? 0) + 1);
      }
    }

    return {
      categories: categories.map((category) => ({
        slug: category.slug,
        name: this.getCategoryLabel(category.slug, category.name),
        count: category.products.length
      })),
      crops: [...cropCounts.entries()]
        .sort((left, right) => {
          if (right[1] !== left[1]) {
            return right[1] - left[1];
          }

          return left[0].localeCompare(right[0], 'uk');
        })
        .map(([slug, count]) => ({
          slug,
          name: this.toTitleCase(slug),
          count
        })),
      programs: programs.map((program) => ({
        slug: program.slug,
        name: program.title,
        count: program.products.length
      }))
    };
  }

  async reindexSearch() {
    return this.searchService.syncProductsIndex();
  }

  async findBySlug(slug: string) {
    return this.prisma.product.findUnique({
      where: { slug },
      include: {
        category: true,
        programs: true
      }
    });
  }

  private buildWhere(query: ProductQueryDto, includeTextQuery: boolean) {
    return {
      isPublished: true,
      ...(query.category
        ? {
            category: {
              slug: query.category
            }
          }
        : {}),
      ...(query.crop
        ? {
            cropTags: {
              has: query.crop
            }
          }
        : {}),
      ...(query.program
        ? {
            programs: {
              some: {
                slug: query.program
              }
            }
          }
        : {}),
      ...(includeTextQuery && query.q
        ? {
            OR: [
              { name: { contains: query.q, mode: 'insensitive' as const } },
              { shortDescription: { contains: query.q, mode: 'insensitive' as const } },
              { description: { contains: query.q, mode: 'insensitive' as const } }
            ]
          }
        : {})
    };
  }

  private async getProductsByIds(ids: string[]) {
    const products = await this.prisma.product.findMany({
      where: { id: { in: ids } },
      include: {
        category: true,
        programs: true
      }
    });

    const order = new Map(ids.map((id, index) => [id, index]));
    return [...products].sort((left, right) => (order.get(left.id) ?? 0) - (order.get(right.id) ?? 0));
  }

  private getCategoryLabel(slug: string, fallback: string) {
    if (slug === 'vitera-imported-catalog') {
      return 'Основний каталог';
    }

    if (slug === 'vitera-imported-smallpack') {
      return 'Дрібне фасування';
    }

    return fallback;
  }

  private toTitleCase(value: string) {
    if (!value) {
      return value;
    }

    return value.charAt(0).toUpperCase() + value.slice(1);
  }
}
