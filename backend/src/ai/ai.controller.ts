import { Controller, Post, Body } from '@nestjs/common';
import { AiService } from './ai.service';
import { GiftAssistantDto, GiftAssistantResponse } from './dto/gift-assistant.dto';

@Controller(['api/ai', 'ai'])
export class AiController {
  constructor(private readonly aiService: AiService) {}

  /**
   * POST /api/ai/gift-assistant (y alias /ai/dedication)
   */
  @Post(['gift-assistant', 'dedication'])
  async getGiftAdvice(@Body() dto: GiftAssistantDto): Promise<GiftAssistantResponse> {
    return this.aiService.generateGiftAdvice(dto);
  }
}
