import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

type ProductFilters = {
  q?: string;
  category?: string;
};

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(filters: ProductFilters) {
    return this.prisma.product.findMany({
      where: {
        AND: [
          filters.q
            ? {
                OR: [
                  { name: { contains: filters.q, mode: 'insensitive' } },
                  { shortDesc: { contains: filters.q, mode: 'insensitive' } },
                  { description: { contains: filters.q, mode: 'insensitive' } }
                ]
              }
            : {},
          filters.category ? { category: { slug: filters.category } } : {}
        ]
      },
      include: { category: true },
      orderBy: { createdAt: 'desc' }
    });
  }

  async findBySlug(slug: string) {
    const product = await this.prisma.product.findUnique({
      where: { slug },
      include: { category: true, programs: true }
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }
}
