import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
} from '@nestjs/common';
import { GiftsService } from './gifts.service';
import { CreateGiftDto } from './dto/create-gift.dto';
import { ClaimGiftDto } from './dto/claim-gift.dto';
import { LiveStatusDto } from './dto/live-status.dto';

@Controller(['api/gifts', 'gifts'])
export class GiftsController {
  constructor(private readonly giftsService: GiftsService) {}

  @Post()
  async createGift(@Body() dto: CreateGiftDto) {
    return this.giftsService.createGift(dto);
  }

  @Get()
  async findAll() {
    return this.giftsService.findAll();
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.giftsService.findById(id);
  }

  @Patch(':id/live-status')
  async updateLiveStatus(
    @Param('id') id: string,
    @Body() dto: LiveStatusDto,
  ) {
    return this.giftsService.updateLiveStatus(id, dto);
  }

  @Patch(':id/claim')
  async claimGift(
    @Param('id') id: string,
    @Body() dto: ClaimGiftDto,
  ) {
    return this.giftsService.claimGift(id, dto);
  }
}
