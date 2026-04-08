import { Injectable, Logger } from '@nestjs/common';
import { CreateLeadDto } from './dto-create-lead';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LeadsService {
  private readonly logger = new Logger(LeadsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async createLead(dto: CreateLeadDto) {
    const lead = await this.prisma.lead.create({
      data: {
        ...dto,
        source: dto.source ?? 'site'
      }
    });

    await this.sendWebhook(lead).catch((error: unknown) => {
      this.logger.warn(`Telegram webhook failed: ${String(error)}`);
    });

    return lead;
  }

  private async sendWebhook(lead: {
    name: string;
    phone: string;
    email: string | null;
    company: string | null;
    message: string | null;
  }) {
    const webhookUrl = process.env.TELEGRAM_WEBHOOK_URL;
    if (!webhookUrl) {
      return;
    }

    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        text: `Новий лід: ${lead.name}, ${lead.phone}, ${lead.email ?? '-'}, ${lead.company ?? '-'}, ${lead.message ?? '-'}`
      })
    });
  }
}
