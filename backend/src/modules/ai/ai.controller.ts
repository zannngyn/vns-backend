import { Controller, Post, Get, Body, Param, Req, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { SemanticSearchService } from './semantic-search.service';
import { ChatService } from './chat.service';
import { EmbeddingService } from './embedding.service';
import { AiSearchDto, AiChatDto } from './dto/ai.dto';
import { Public } from '../auth/decorators/public.decorator';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('AI')
@Controller('ai')
export class AiController {
  constructor(
    private semanticSearch: SemanticSearchService,
    private chatService: ChatService,
    private embeddingService: EmbeddingService,
  ) {}

  // ── Semantic Search (Public, opt-in AI search) ────────────
  @Post('search')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'AI-powered semantic product search' })
  async search(@Body() dto: AiSearchDto) {
    return this.semanticSearch.search(dto.query, dto.limit || 10);
  }

  // ── Chat Stylist (Requires Auth) ──────────────────────────
  @Post('chat')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send message to AI Stylist and get recommendations' })
  async chat(@Body() dto: AiChatDto, @Req() req: any) {
    console.log('AI Chat Request - user:', req.user, 'dto:', dto);
    const userId = req.user?.id ? BigInt(req.user.id) : (req.user?.sub ? BigInt(req.user.sub) : BigInt(0));
    const sessionId = dto.sessionId ? BigInt(dto.sessionId) : null;
    return this.chatService.sendMessage(userId, sessionId, dto.message);
  }

  @Get('chat/sessions')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all chat sessions for current user' })
  async getSessions(@Req() req: any) {
    const userId = BigInt(req.user.id);
    return this.chatService.getSessions(userId);
  }

  @Get('chat/sessions/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get chat history for a session' })
  async getSessionHistory(@Param('id') id: string, @Req() req: any) {
    const userId = BigInt(req.user.id);
    return this.chatService.getSessionHistory(userId, BigInt(id));
  }

  // ── Admin: Embedding Management ───────────────────────────
  @Post('admin/embeddings/generate-all')
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: '[Admin] Generate embeddings for all products' })
  async generateAllEmbeddings() {
    return this.embeddingService.embedAllProducts();
  }

  @Post('admin/embeddings/:productId')
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: '[Admin] Generate embedding for a single product' })
  async generateEmbedding(@Param('productId') productId: string) {
    await this.embeddingService.embedProduct(BigInt(productId));
    return { message: `Embedding generated for product ${productId}` };
  }
}
