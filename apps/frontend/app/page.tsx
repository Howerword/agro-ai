import { LeadForm } from '@/components/LeadForm';

export default function HomePage() {
  return (
    <div className="space-y-8">
      <section className="rounded-2xl bg-gradient-to-r from-brand-700 to-brand-500 p-10 text-white">
        <h1 className="text-4xl font-bold">Інструмент підбору добрив для B2B агрокомпаній</h1>
        <p className="mt-3 max-w-2xl">Редизайн платформи з фокусом на підбір продукту, консультацію та генерацію лідів у CRM.</p>
      </section>
      <LeadForm />
    </div>
  );
}
