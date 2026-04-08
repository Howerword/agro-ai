export type BotResponse = {
  reply: string;
  products: Array<{ id: string; slug: string; name: string }>;
  cta: 'lead_form' | 'consultation';
};
