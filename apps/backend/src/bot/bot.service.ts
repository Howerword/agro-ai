import { Injectable } from '@nestjs/common';
import { ProductsService } from '../products/products.service';
import { AiService } from '../services/ai.service';

const SYSTEM_PROMPT = `Ти агроном-консультант. Відповідай коротко, практично і українською мовою.
Повертай тільки рекомендації для B2B агроклієнтів.`;

type BotIntent = 'selection' | 'consultation' | 'product';

@Injectable()
export class BotService {
  constructor(
    private readonly aiService: AiService,
    private readonly productsService: ProductsService
  ) {}

  async query(message: string) {
    const intent = this.detectIntent(message);

    if (intent === 'product') {
      const products = await this.productsService.findAll({ q: message });
      const shortlisted = products.slice(0, 3);

      return {
        reply:
          shortlisted.length > 0
            ? `Знайшов ${shortlisted.length} релевантні продукти. Можу допомогти порівняти або підібрати норму внесення.`
            : 'Не знайшов точного збігу. Рекомендую консультацію агронома для точного підбору.',
        products: shortlisted,
        cta: shortlisted.length > 0 ? 'lead_form' : 'consultation'
      };
    }

    const kbContext = await this.buildKnowledgeBaseContext(message);
    const reply = await this.aiService.chat(
      SYSTEM_PROMPT,
      `Intent: ${intent}\nПитання: ${message}\nКонтекст:\n${kbContext}`
    );

    return {
      reply,
      products: [],
      cta: intent === 'consultation' ? 'consultation' : 'lead_form'
    };
  }

  private detectIntent(message: string): BotIntent {
    const normalized = message.toLowerCase();
    if (/(ціна|продукт|добрив|npk|мікроелемент|каталог)/.test(normalized)) {
      return 'product';
    }

    if (/(консультац|агроном|зв\W*яз|допоможіть)/.test(normalized)) {
      return 'consultation';
    }

    return 'selection';
  }

  private async buildKnowledgeBaseContext(message: string) {
    const products = await this.productsService.findAll({ q: message });

    return JSON.stringify(
      {
        products: products.slice(0, 5).map((product) => ({
          name: product.name,
          shortDesc: product.shortDesc,
          category: product.category.title
        })),
        programs: [
          'Інтенсивна програма живлення зернових',
          'Антистрес програма для овочів',
          'Стартова програма для соняшнику'
        ],
        problems: ['дефіцит азоту', 'стрес від посухи', 'повільний старт вегетації']
      },
      null,
      2
    );
  }
}
