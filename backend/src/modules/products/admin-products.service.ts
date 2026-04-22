import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Gender } from '@prisma/client';

import { EmbeddingService } from '../ai/embedding.service';

@Injectable()
export class AdminProductsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly embeddingService: EmbeddingService,
  ) {}

  async findAll() {
    return this.prisma.product.findMany({
      include: { 
        category: true, 
        brand: true,
        skus: {
          include: { color: true, size: true }
        } 
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async findOne(id: bigint) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: { 
        category: true, 
        brand: true,
        skus: {
          where: { isActive: true },
          include: { color: true, size: true }
        } 
      }
    });

    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async create(data: CreateProductDto) {
    return this.prisma.$transaction(async (tx) => {
      // 1. Create Base Product
      const product = await tx.product.create({
        data: {
          name: data.name,
          slug: data.slug || data.name.toLowerCase().replace(/ /g, '-'),
          categoryId: BigInt(data.categoryId),
          brandId: BigInt(data.brandId),
          gender: data.gender || Gender.UNISEX,
          description: data.description,
          material: data.material,
          thumbnail: data.thumbnail,
          isActive: data.isActive ?? true,
        },
      });

      // 2. Process variants (SKUs)
      if (data.skus && Array.isArray(data.skus)) {
        for (const sku of data.skus) {
          const colorName = sku.color?.trim() ? sku.color.trim() : 'N/A';
          const sizeName = sku.size?.trim() ? sku.size.trim() : 'N/A';

          let colorId;
          const existingColor = await tx.color.findFirst({ where: { name: colorName } });
          if (existingColor) colorId = existingColor.id;
          else {
            const newColor = await tx.color.create({ data: { name: colorName, hexCode: sku.colorHex || '#000000' }});
            colorId = newColor.id;
          }

          let sizeId;
          const existingSize = await tx.size.findFirst({ where: { name: sizeName } });
          if (existingSize) sizeId = existingSize.id;
          else {
            const newSize = await tx.size.create({ data: { name: sizeName, sortOrder: 0 }});
            sizeId = newSize.id;
          }

          await tx.productSku.create({
            data: {
              skuCode: sku.skuCode || `SKU-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
              price: sku.price ? parseFloat(sku.price) : 0,
              salePrice: sku.salePrice ? parseFloat(sku.salePrice) : null,
              stock: sku.stock ? parseInt(sku.stock) : 0,
              productId: product.id,
              colorId: colorId,
              sizeId: sizeId,
            }
          });
        }
      }

      // Async trigger embedding generation in background so it doesn't block the request
      this.embeddingService.embedProduct(product.id).catch(e => console.error('Auto-embed failed:', e));

      return product;
    });
  }

  async update(id: bigint, data: UpdateProductDto) {
    const productExists = await this.prisma.product.findUnique({ where: { id } });
    if (!productExists) throw new NotFoundException('Product not found');

    return this.prisma.$transaction(async (tx) => {
      // 1. Update Base Product Info
      const baseData: any = {};
      if (data.name !== undefined) baseData.name = data.name;
      if (data.slug !== undefined) baseData.slug = data.slug;
      if (data.categoryId !== undefined) baseData.categoryId = BigInt(data.categoryId);
      if (data.brandId !== undefined) baseData.brandId = BigInt(data.brandId);
      if (data.gender !== undefined) baseData.gender = data.gender;
      if (data.description !== undefined) baseData.description = data.description;
      if (data.material !== undefined) baseData.material = data.material;
      if (data.thumbnail !== undefined) baseData.thumbnail = data.thumbnail;
      if (data.isActive !== undefined) baseData.isActive = data.isActive;

      if (Object.keys(baseData).length > 0) {
        await tx.product.update({ where: { id }, data: baseData });
      }

      // 2. Process variants update
      if (data.skus && Array.isArray(data.skus)) {
        // Collect current active SKUs
        const currentSkus = await tx.productSku.findMany({ where: { productId: id, isActive: true } });
        const currentSkuIds = currentSkus.map(s => s.id.toString());
        
        const payloadSkuIds = data.skus.map(s => s.id).filter(id => id);

        // Soft delete removed SKUs
        const skusToRemove = currentSkuIds.filter(id => !payloadSkuIds.includes(id));
        for (const skuId of skusToRemove) {
          await tx.productSku.update({
            where: { id: BigInt(skuId) },
            data: { isActive: false }
          });
        }

        // Upsert sent SKUs
        for (const sku of data.skus) {
          const colorName = sku.color?.trim() ? sku.color.trim() : 'N/A';
          const sizeName = sku.size?.trim() ? sku.size.trim() : 'N/A';

          let colorId;
          const existingColor = await tx.color.findFirst({ where: { name: colorName } });
          if (existingColor) colorId = existingColor.id;
          else {
            const newColor = await tx.color.create({ data: { name: colorName, hexCode: sku.colorHex || '#000000' }});
            colorId = newColor.id;
          }

          let sizeId;
          const existingSize = await tx.size.findFirst({ where: { name: sizeName } });
          if (existingSize) sizeId = existingSize.id;
          else {
            const newSize = await tx.size.create({ data: { name: sizeName, sortOrder: 0 }});
            sizeId = newSize.id;
          }

          let isExisting = false;
          if (sku.id) {
            // Securely verify if this SKU belongs to the current Product before attempting update
            const existingSku = await tx.productSku.findFirst({
              where: { id: BigInt(sku.id), productId: id }
            });
            if (existingSku) isExisting = true;
          }

          if (isExisting) {
             // Update existing - STRIP physical specifications to preserve Order relationships
             // We drop skuCode, colorId, sizeId updates silently.
             await tx.productSku.update({
               where: { id: BigInt(sku.id!) },
               data: {
                 price: sku.price ? parseFloat(sku.price) : undefined,
                 salePrice: sku.salePrice !== undefined ? (sku.salePrice ? parseFloat(sku.salePrice) : null) : undefined,
                 stock: sku.stock !== undefined ? parseInt(sku.stock) : undefined,
                 isActive: true,
               }
             });
          } else {
             // Create new
             await tx.productSku.create({
               data: {
                 skuCode: sku.skuCode || `SKU-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                 price: sku.price ? parseFloat(sku.price) : 0,
                 salePrice: sku.salePrice ? parseFloat(sku.salePrice) : null,
                 stock: sku.stock ? parseInt(sku.stock) : 0,
                 productId: id,
                 colorId: colorId,
                 sizeId: sizeId,
                 isActive: true,
               }
             });
          }
        }
      }

      const updatedProduct = await tx.product.findUnique({
        where: { id },
        include: { skus: { where: { isActive: true }, include: { color: true, size: true } } }
      });

      // Async trigger embedding generation in background
      this.embeddingService.embedProduct(updatedProduct!.id).catch(e => console.error('Auto-embed failed:', e));

      return updatedProduct;
    });
  }

  async delete(id: bigint) {
    // Soft delete to preserve order/cart integrity
    return this.prisma.$transaction(async (tx) => {
       await tx.productSku.updateMany({
         where: { productId: id },
         data: { isActive: false }
       });
       return tx.product.update({
         where: { id },
         data: { isActive: false }
       });
    });
  }
}
