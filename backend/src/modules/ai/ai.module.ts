import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { GeminiService } from './gemini.service';
import { EmbeddingService } from './embedding.service';
import { SemanticSearchService } from './semantic-search.service';
import { ChatService } from './chat.service';
import { AiController } from './ai.controller';

@Module({
  imports: [PrismaModule],
  controllers: [AiController],
  providers: [GeminiService, EmbeddingService, SemanticSearchService, ChatService],
  exports: [GeminiService, EmbeddingService],
})
export class AiModule {}
