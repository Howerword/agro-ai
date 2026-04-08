import { Controller, Get, NotFoundException, Param, Post, Query } from '@nestjs/common';

import { ProductQueryDto } from './dto/product-query.dto';
import { ProductsService } from './products.service';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  findAll(@Query() query: ProductQueryDto) {
    return this.productsService.findAll(query);
  }

  @Get('filters')
  getFilters() {
    return this.productsService.getFilters();
  }

  @Post('reindex')
  reindex() {
    return this.productsService.reindexSearch();
  }

  @Get(':slug')
  async findOne(@Param('slug') slug: string) {
    const product = await this.productsService.findBySlug(slug);

    if (!product) {
      throw new NotFoundException(`Product with slug '${slug}' not found`);
    }

    return product;
  }
}
