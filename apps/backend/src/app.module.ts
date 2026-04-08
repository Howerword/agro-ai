import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';

import { BotController } from './bot/bot.controller';
import { BotService } from './bot/bot.service';
import { HealthController } from './health/health.controller';
import { ArticlesController } from './content/articles.controller';
import { ArticlesService } from './content/articles.service';
import { PagesController } from './content/pages.controller';
import { PagesService } from './content/pages.service';
import { LeadWebhookService } from './leads/webhooks/lead-webhook.service';
import { LeadsController } from './leads/leads.controller';
import { LeadsService } from './leads/leads.service';
import { PrismaModule } from './prisma/prisma.module';
import { ProductsController } from './products/products.controller';
import { ProductsService } from './products/products.service';
import { SearchService } from './search/search.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['../../.env', '.env'],
      validationSchema: Joi.object({
        DATABASE_URL: Joi.string().optional(),
        GROQ_API_KEY: Joi.string().optional(),
        GROQ_MODEL: Joi.string().default('llama-3.3-70b-versatile'),
        MEILI_HOST: Joi.string().allow('').optional(),
        MEILI_API_KEY: Joi.string().allow('').optional(),
        LEAD_WEBHOOK_URL: Joi.string().allow('').optional(),
        PORT: Joi.number().default(4000)
      })
    }),
    PrismaModule
  ],
  controllers: [
    HealthController,
    ProductsController,
    LeadsController,
    BotController,
    PagesController,
    ArticlesController
  ],
  providers: [
    ProductsService,
    LeadsService,
    LeadWebhookService,
    SearchService,
    BotService,
    PagesService,
    ArticlesService
  ]
})
export class AppModule {}
