import { Controller, Get, NotFoundException, Param } from '@nestjs/common';

import { PagesService } from './pages.service';

@Controller('pages')
export class PagesController {
  constructor(private readonly pagesService: PagesService) {}

  @Get()
  findAll() {
    return this.pagesService.findAll();
  }

  @Get(':slug')
  async findBySlug(@Param('slug') slug: string) {
    const page = await this.pagesService.findBySlug(slug);

    if (!page) {
      throw new NotFoundException(`Page with slug '${slug}' not found`);
    }

    return page;
  }
}
