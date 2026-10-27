import { Controller, Get, Param } from '@nestjs/common';
import { ProductsService } from './products.service';

@Controller(['api/products', 'products'])
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  async findAll() {
    return this.productsService.findAll();
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.productsService.findById(id);
  }

  @Get(':id/alternatives')
  async findAlternatives(@Param('id') id: string) {
    return this.productsService.findAlternatives(id);
  }
}
