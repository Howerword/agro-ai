import { Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { LeadWebhookService } from './webhooks/lead-webhook.service';

@Injectable()
export class LeadsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly webhookService: LeadWebhookService
  ) {}

  async create(dto: CreateLeadDto) {
    const lead = await this.prisma.lead.create({
      data: {
        name: dto.name,
        phone: dto.phone,
        email: dto.email,
        company: dto.company,
        region: dto.region,
        acreage: dto.acreage,
        cropFocus: dto.cropFocus,
        message: dto.message,
        source: dto.source ?? 'website',
        recommendedProductIds: dto.recommendedProductIds ?? [],
        recommendedProgramIds: dto.recommendedProgramIds ?? []
      }
    });

    await this.webhookService.notify({
      event: 'lead.created',
      lead
    });

    return lead;
  }
}
