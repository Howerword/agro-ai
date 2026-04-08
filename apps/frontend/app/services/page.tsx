import { getPage } from '../../lib/api';
import { LegacyContentSections } from '../../components/legacy-content-sections';

export default async function ServicesPage() {
  const [servicePage, diagnosticsPage, soilPage] = await Promise.all([
    getPage('page-agroservice'),
    getPage('page-functional-diagnostics'),
    getPage('page-soil-analysis')
  ]);

  return (
    <div className="mx-auto max-w-7xl px-6 py-16">
      <p className="text-sm uppercase tracking-[0.2em] text-brand-700">Сервіси</p>
      <h1 className="mt-2 text-4xl font-semibold">{servicePage.title}</h1>
      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        {[servicePage, diagnosticsPage, soilPage].map((page) => (
          <div key={page.slug}>
            <h2 className="mb-4 text-2xl font-semibold text-stone-900">{page.title}</h2>
            <LegacyContentSections
              html={page.content}
              sectionClassName="rounded-[28px] border border-stone-200 bg-white p-6 shadow-sm"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
