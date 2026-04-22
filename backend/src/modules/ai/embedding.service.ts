import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { GeminiService } from './gemini.service';

@Injectable()
export class EmbeddingService {
  private readonly logger = new Logger(EmbeddingService.name);

  constructor(
    private prisma: PrismaService,
    private gemini: GeminiService,
  ) {}

  private buildTextContent(product: {
    name: string;
    description: string | null;
    material: string | null;
    gender: string;
    category: { name: string } | null;
    brand: { name: string } | null;
    styleTags: { style: { name: string } }[];
  }): string {
    const parts = [
      product.name,
      product.description || '',
      product.category?.name || '',
      product.brand?.name || '',
      product.material || '',
      `Gioi tinh: ${product.gender}`,
      ...product.styleTags.map((t) => t.style.name),
    ];
    return parts.filter(Boolean).join('. ');
  }

  async embedProduct(productId: bigint): Promise<void> {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      include: {
        category: true,
        brand: true,
        styleTags: { include: { style: true } },
      },
    });

    if (!product) {
      this.logger.warn(`Product ${productId} not found, skipping embedding`);
      return;
    }

    const textContent = this.buildTextContent(product);

    try {
      const vector = await this.gemini.generateEmbedding(textContent);
      const vectorStr = `[${vector.join(',')}]`;

      await this.prisma.$executeRawUnsafe(
        `INSERT INTO product_embeddings (product_id, text_content, embedding, updated_at)
         VALUES ($1, $2, $3::vector, NOW())
         ON CONFLICT (product_id)
         DO UPDATE SET text_content = $2, embedding = $3::vector, updated_at = NOW()`,
        productId,
        textContent,
        vectorStr,
      );

      this.logger.log(`Embedded product ${productId}: "${product.name}"`);
    } catch (error: any) {
      this.logger.error(`Failed to embed product ${productId}: ${error.message}`);
      throw error;
    }
  }

  async embedAllProducts(): Promise<{ total: number; success: number; failed: number; errors: string[] }> {
    const products = await this.prisma.product.findMany({
      where: { isActive: true },
      select: { id: true, name: true },
    });

    let success = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const product of products) {
      try {
        await this.embedProduct(product.id);
        success++;
        // Small delay to respect Gemini API rate limits
        await new Promise((r) => setTimeout(r, 200));
      } catch (error: any) {
        failed++;
        const msg = `Product ${product.id} (${product.name}): ${error.message}`;
        errors.push(msg);
        this.logger.error(msg);
      }
    }

    this.logger.log(`Embedding complete: ${success} success, ${failed} failed out of ${products.length}`);
    return { total: products.length, success, failed, errors };
  }
}
