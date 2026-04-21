import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { AdminCategoriesController } from './admin-categories.controller';
import { AdminBrandsController } from './admin-brands.controller';
import { AdminProductsController } from './admin-products.controller';
import { AdminProductsService } from './admin-products.service';

@Module({
  controllers: [
    ProductsController,
    AdminCategoriesController,
    AdminBrandsController,
    AdminProductsController,
  ],
  providers: [ProductsService, AdminProductsService],
  exports: [ProductsService, AdminProductsService],
})
export class ProductsModule {}
