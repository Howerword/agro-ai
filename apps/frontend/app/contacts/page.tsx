import { LeadForm } from '@agro/ui';

import { LegacyContentSections } from '../../components/legacy-content-sections';
import { getPage } from '../../lib/api';

export default async function ContactsPage() {
  const page = await getPage('page-contact');

  return (
    <div className="mx-auto grid max-w-7xl gap-10 px-6 py-16 lg:grid-cols-[1fr,420px]">
      <div>
        <p className="text-sm uppercase tracking-[0.2em] text-brand-700">Контакти</p>
        <h1 className="mt-2 text-4xl font-semibold">{page.title}</h1>
        <LegacyContentSections html={page.content} className="mt-8 space-y-6" />
      </div>
      <LeadForm
        title="Зв’язатися з командою"
        description="Надішліть запит, і ми повернемось з конкретною рекомендацією або комерційною пропозицією."
      />
    </div>
  );
}
