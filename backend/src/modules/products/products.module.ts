import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { AdminCategoriesController } from './admin-categories.controller';
import { AdminBrandsController } from './admin-brands.controller';
import { AdminProductsController } from './admin-products.controller';
import { AdminProductsService } from './admin-products.service';
import { AdminCategoriesService } from './admin-categories.service';
import { AdminBrandsService } from './admin-brands.service';
import { AdminReviewsController } from './admin-reviews.controller';

import { AiModule } from '../ai/ai.module';


@Module({
  imports: [AiModule],
  controllers: [
    ProductsController,
    AdminCategoriesController,
    AdminBrandsController,
    AdminProductsController,
    AdminReviewsController,
  ],
  providers: [ProductsService, AdminProductsService, AdminCategoriesService, AdminBrandsService],
  exports: [ProductsService, AdminProductsService, AdminCategoriesService, AdminBrandsService],
})
export class ProductsModule {}
