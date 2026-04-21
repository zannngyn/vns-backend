import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { ProductQueryDto } from './dto/product-query.dto';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Get a list of products with traditional search & filters' })
  @ApiResponse({ status: 200, description: 'List of products.' })
  async findAll(@Query() query: ProductQueryDto) {
    return this.productsService.findAll(query);
  }

  @Public()
  @Get('suggestions')
  @ApiOperation({ summary: 'Get autocomplete product suggestions based on text search' })
  @ApiResponse({ status: 200, description: 'Suggestions returned.' })
  async getSuggestions(@Query('q') q: string) {
    return this.productsService.getSuggestions(q);
  }

  @Public()
  @Get(':idOrSlug')
  @ApiOperation({ summary: 'Get product details by ID or Slug' })
  @ApiResponse({ status: 200, description: 'Product details.' })
  @ApiResponse({ status: 404, description: 'Product not found.' })
  async findOne(@Param('idOrSlug') idOrSlug: string) {
    return this.productsService.findOne(idOrSlug);
  }
}
