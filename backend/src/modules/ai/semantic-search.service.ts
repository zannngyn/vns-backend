import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { GeminiService } from './gemini.service';

@Injectable()
export class SemanticSearchService {
  private readonly logger = new Logger(SemanticSearchService.name);

  constructor(
    private prisma: PrismaService,
    private gemini: GeminiService,
  ) {}

  async search(query: string, limit = 10) {
    // 1. Convert user's natural language query into a vector
    const queryVector = await this.gemini.generateEmbedding(query);
    const vectorStr = `[${queryVector.join(',')}]`;

    // 2. Use pgvector cosine distance to find most similar products
    const results = await this.prisma.$queryRawUnsafe<
      {
        product_id: bigint;
        text_content: string;
        similarity: number;
      }[]
    >(
      `SELECT pe.product_id, pe.text_content,
              1 - (pe.embedding <=> $1::vector) AS similarity
       FROM product_embeddings pe
       JOIN products p ON p.id = pe.product_id
       WHERE p.is_active = true
       ORDER BY pe.embedding <=> $1::vector
       LIMIT $2`,
      vectorStr,
      limit,
    );

    if (results.length === 0) {
      return { products: [], query };
    }

    // 3. Fetch full product details for the matched IDs
    const productIds = results.map((r) => r.product_id);

    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds } },
      include: {
        category: true,
        brand: true,
        skus: {
          where: { isActive: true },
          include: { color: true, size: true },
          take: 6,
        },
        styleTags: { include: { style: true } },
      },
    });

    // Re-order by similarity score
    const similarityMap = new Map(
      results.map((r) => [r.product_id.toString(), Number(r.similarity)]),
    );
    products.sort(
      (a, b) =>
        (similarityMap.get(b.id.toString()) || 0) -
        (similarityMap.get(a.id.toString()) || 0),
    );

    // Attach similarity score
    const enriched = products.map((p) => ({
      ...p,
      similarityScore: similarityMap.get(p.id.toString()) || 0,
    }));

    return { products: enriched, query };
  }
}
