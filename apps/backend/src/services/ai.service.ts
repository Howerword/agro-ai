import { Injectable } from '@nestjs/common';
import Groq from 'groq-sdk';

@Injectable()
export class AiService {
  private readonly client = new Groq({
    apiKey: process.env.GROQ_API_KEY
  });

  async chat(systemPrompt: string, userPrompt: string) {
    if (!process.env.GROQ_API_KEY) {
      return 'AI тимчасово недоступний. Залиште заявку, і ми звʼяжемося з вами.';
    }

    const completion = await this.client.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      temperature: 0.2,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ]
    });

    return completion.choices[0]?.message?.content ?? 'Потрібна консультація менеджера.';
  }
}
