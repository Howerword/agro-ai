import { Controller, Get, NotFoundException, Param } from '@nestjs/common';

import { ArticlesService } from './articles.service';

@Controller('articles')
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @Get()
  findAll() {
    return this.articlesService.findAll();
  }

  @Get(':slug')
  async findBySlug(@Param('slug') slug: string) {
    const article = await this.articlesService.findBySlug(slug);

    if (!article) {
      throw new NotFoundException(`Article with slug '${slug}' not found`);
    }

    return article;
  }
}
