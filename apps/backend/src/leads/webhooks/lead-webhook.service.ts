import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class LeadWebhookService {
  private readonly logger = new Logger(LeadWebhookService.name);

  constructor(private readonly configService: ConfigService) {}

  async notify(payload: Record<string, unknown>) {
    const webhookUrl = this.configService.get<string>('LEAD_WEBHOOK_URL');

    if (!webhookUrl) {
      return;
    }

    try {
      await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
    } catch (error) {
      this.logger.warn(`Lead webhook failed: ${String(error)}`);
    }
  }
}
