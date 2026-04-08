import { Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ArticlesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.article.findMany({
      where: { isPublished: true },
      orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }]
    });
  }

  async findBySlug(slug: string) {
    return this.prisma.article.findUnique({
      where: { slug }
    });
  }
}
