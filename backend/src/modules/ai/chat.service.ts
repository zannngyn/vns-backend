import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { GeminiService } from './gemini.service';
import { SemanticSearchService } from './semantic-search.service';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  private readonly SYSTEM_PROMPT = `Ban la VIESTYLE AI Stylist — tro ly thoi trang thong minh.
Nhiem vu cua ban:
- Tu van phoi do, goi y san pham phu hop voi so thich, dip, phong cach cua khach hang.
- Tra loi bang tieng Viet.
- Khi goi y san pham, liet ke ro ten, gia, mau sac co san.
- Neu khong tim thay san pham phu hop trong danh sach duoc cung cap, hay noi that la "hien tai VIESTYLE chua co san pham nay" va goi y phuong an thay the.
- Giu giong dieu than thien, chuyen nghiep, nhu mot stylist thuc thu.
- KHONG BAO GIO tu bao la AI, chat bot, hay may. Hay dap nhu mot nguoi tu van thoi trang that su.
- Neu khach hoi ve gia, hay tra loi bang don vi VND.`;

  constructor(
    private prisma: PrismaService,
    private gemini: GeminiService,
    private semanticSearch: SemanticSearchService,
  ) {}

  // Send a message and get AI response with product recommendations
  async sendMessage(
    userId: bigint,
    sessionId: bigint | null,
    message: string,
  ): Promise<{
    sessionId: bigint;
    reply: string;
    recommendedProducts: any[];
  }> {
    // 1. Get or create chat session
    let session: { id: bigint };
    if (sessionId) {
      const existing = await this.prisma.chatSession.findFirst({
        where: { id: sessionId, userId },
      });
      if (!existing) {
        throw new NotFoundException('Chat session not found');
      }
      session = existing;
    } else {
      // Auto-generate title from first message
      const title = message.length > 50 ? message.substring(0, 50) + '...' : message;
      session = await this.prisma.chatSession.create({
        data: { userId, title },
      });
    }

    // 2. Save user message
    await this.prisma.chatMessage.create({
      data: {
        sessionId: session.id,
        role: 'USER',
        message,
      },
    });

    // 3. RAG: Retrieve relevant products via semantic search
    let relevantProducts: any[] = [];
    try {
      const searchResult = await this.semanticSearch.search(message, 5);
      relevantProducts = searchResult.products;
    } catch (error: any) {
      this.logger.warn(`Semantic search failed, proceeding without context: ${error.message}`);
    }

    // 4. Build product context for the prompt
    const productContext =
      relevantProducts.length > 0
        ? relevantProducts
            .map((p, i) => {
              const prices = p.skus?.map((s) => Number(s.price)) || [];
              const minPrice = prices.length ? Math.min(...prices) : 0;
              const colors = [...new Set(p.skus?.map((s) => s.color?.name).filter(Boolean))];
              return `${i + 1}. ${p.name} — ${p.brand?.name || ''} — ${p.category?.name || ''} — Tu ${minPrice.toLocaleString('vi-VN')}d — Mau: ${colors.join(', ')}`;
            })
            .join('\n')
        : 'Khong tim thay san pham nao phu hop trong kho.';

    // 5. Fetch user preferences (if any)
    let preferencesContext = '';
    const prefs = await this.prisma.userPreference.findUnique({
      where: { userId },
    });
    if (prefs) {
      const parts: string[] = [];
      if (prefs.favoriteColors?.length) parts.push(`Mau yeu thich: ${prefs.favoriteColors.join(', ')}`);
      if (prefs.favoriteStyles?.length) parts.push(`Phong cach: ${prefs.favoriteStyles.join(', ')}`);
      if (prefs.fitPreference) parts.push(`Fit: ${prefs.fitPreference}`);
      if (prefs.budgetMin || prefs.budgetMax) {
        parts.push(`Ngan sach: ${prefs.budgetMin || 0} - ${prefs.budgetMax || 'khong gioi han'} VND`);
      }
      if (parts.length) {
        preferencesContext = `\nSo thich cua khach hang:\n${parts.join('\n')}`;
      }
    }

    // 6. Fetch recent chat history for context
    const recentMessages = await this.prisma.chatMessage.findMany({
      where: { sessionId: session.id },
      orderBy: { createdAt: 'desc' },
      take: 6,
    });
    const historyContext = recentMessages
      .reverse()
      .map((m) => `${m.role === 'USER' ? 'Khach' : 'Stylist'}: ${m.message}`)
      .join('\n');

    // 7. Construct final prompt
    const prompt = `${historyContext ? `Lich su hoi thoai:\n${historyContext}\n\n` : ''}San pham trong kho co the phu hop:\n${productContext}${preferencesContext}\n\nKhach hang hoi: "${message}"\n\nHay tra loi va tu van phoi do, goi y san pham cu the tu danh sach tren.`;

    // 8. Call Gemini
    let reply: string;
    try {
      reply = await this.gemini.chat(prompt, this.SYSTEM_PROMPT);
    } catch (error: any) {
      this.logger.error(`Gemini chat failed: ${error.message}`);
      reply = 'Xin loi ban, hien tai minh dang gap su co ky thuat. Ban vui long thu lai sau nhe!';
    }

    // 9. Save AI response
    await this.prisma.chatMessage.create({
      data: {
        sessionId: session.id,
        role: 'ASSISTANT',
        message: reply,
        metadata: relevantProducts.length
          ? { recommendedProductIds: relevantProducts.map((p) => p.id.toString()) }
          : undefined,
      },
    });

    return {
      sessionId: session.id,
      reply,
      recommendedProducts: relevantProducts.map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        thumbnail: p.thumbnail,
        category: p.category?.name,
        brand: p.brand?.name,
        similarityScore: p.similarityScore,
        priceRange: {
          min: p.skus?.length ? Math.min(...p.skus.map((s) => Number(s.price))) : null,
          max: p.skus?.length ? Math.max(...p.skus.map((s) => Number(s.price))) : null,
        },
      })),
    };
  }

  // Get all chat sessions for a user
  async getSessions(userId: bigint) {
    return this.prisma.chatSession.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        title: true,
        createdAt: true,
        updatedAt: true,
        _count: { select: { messages: true } },
      },
    });
  }

  // Get full chat history of a session
  async getSessionHistory(userId: bigint, sessionId: bigint) {
    const session = await this.prisma.chatSession.findFirst({
      where: { id: sessionId, userId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!session) {
      throw new NotFoundException('Chat session not found');
    }

    return session;
  }
}
