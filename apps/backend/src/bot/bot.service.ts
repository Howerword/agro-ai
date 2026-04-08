import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Groq from 'groq-sdk';

import { PrismaService } from '../prisma/prisma.service';
import { SearchService } from '../search/search.service';
import { BotQueryDto } from './dto/bot-query.dto';

@Injectable()
export class BotService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly searchService: SearchService,
    private readonly configService: ConfigService
  ) {}

  async query(dto: BotQueryDto) {
    const relevantProducts = await this.searchService.searchProducts(dto.message, dto.crop);
    const relevantPrograms = await this.prisma.program.findMany({
      where: {
        ...(dto.crop ? { targetCrops: { has: dto.crop } } : {}),
        ...(dto.problem ? { targetProblems: { has: dto.problem } } : {})
      },
      take: 3
    });

    const productContext = relevantProducts
      .map(
        (product: {
          name: string;
          slug: string;
          shortDescription: string;
          benefits: string[];
          cropTags: string[];
        }) =>
          `${product.name} (${product.slug}) — ${product.shortDescription}. Переваги: ${product.benefits.join(', ')}. Культури: ${product.cropTags.join(', ')}.`
      )
      .join('\n');

    const programContext = relevantPrograms
      .map(
        (program: {
          title: string;
          targetCrops: string[];
          targetProblems: string[];
          description: string;
        }) =>
          `${program.title} — культури: ${program.targetCrops.join(', ')}; задачі: ${program.targetProblems.join(', ')}. ${program.description}`
      )
      .join('\n');

    const apiKey = this.configService.get<string>('GROQ_API_KEY');

    if (!apiKey) {
      return {
        reply: 'AI-ключ не налаштований. Заповніть GROQ_API_KEY у .env.',
        suggestedProducts: relevantProducts,
        suggestedPrograms: relevantPrograms,
        leadCaptureRecommended: true
      };
    }

    const client = new Groq({ apiKey });
    const model = this.configService.get<string>('GROQ_MODEL') ?? 'llama-3.3-70b-versatile';

    const completion = await client.chat.completions.create({
      model,
      temperature: 0.3,
      messages: [
        {
          role: 'system',
          content:
            'Ти — AI Senior Agronomy Sales Assistant для B2B-агросайту Vitera. Відповідай українською. Давай практичні рекомендації щодо підбору добрив, але не вигадуй характеристик. Якщо доречно, запроси контакт для персонального підбору.'
        },
        {
          role: 'system',
          content: `Релевантні продукти:\n${productContext || 'Наразі немає точних збігів.'}\n\nРелевантні програми:\n${programContext || 'Наразі немає програм за заданими параметрами.'}`
        },
        {
          role: 'user',
          content: `Запит клієнта: ${dto.message}\nКультура: ${dto.crop ?? 'не вказано'}\nПроблема: ${dto.problem ?? 'не вказано'}`
        }
      ]
    });

    return {
      reply: completion.choices[0]?.message?.content ?? 'Не вдалося сформувати рекомендацію.',
      suggestedProducts: relevantProducts,
      suggestedPrograms: relevantPrograms,
      leadCaptureRecommended: dto.contactRequested ?? relevantProducts.length > 0
    };
  }
}
