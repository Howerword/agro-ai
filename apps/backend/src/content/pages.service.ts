import { Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PagesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.page.findMany({
      where: { isPublished: true },
      orderBy: [{ path: 'asc' }]
    });
  }

  async findBySlug(slug: string) {
    return this.prisma.page.findUnique({
      where: { slug }
    });
  }
}
