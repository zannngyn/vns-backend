import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { AdminCategoriesController } from './admin-categories.controller';
import { AdminBrandsController } from './admin-brands.controller';
import { AdminProductsController } from './admin-products.controller';

@Module({
  controllers: [
    ProductsController,
    AdminCategoriesController,
    AdminBrandsController,
    AdminProductsController,
  ],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {}
