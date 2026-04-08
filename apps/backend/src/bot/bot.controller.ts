import { Body, Controller, Post } from '@nestjs/common';

import { BotQueryDto } from './dto/bot-query.dto';
import { BotService } from './bot.service';

@Controller('bot')
export class BotController {
  constructor(private readonly botService: BotService) {}

  @Post('query')
  query(@Body() dto: BotQueryDto) {
    return this.botService.query(dto);
  }
}
