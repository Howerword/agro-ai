import { Module } from '@nestjs/common';
import { ProductsModule } from '../products/products.module';
import { AiService } from '../services/ai.service';
import { BotController } from './bot.controller';
import { BotService } from './bot.service';

@Module({
  imports: [ProductsModule],
  controllers: [BotController],
  providers: [BotService, AiService]
})
export class BotModule {}
