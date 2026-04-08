import { getPage } from '../../lib/api';
import { LegacyContentSections } from '../../components/legacy-content-sections';

export default async function SolutionsPage() {
  const page = await getPage('products-programm');

  return (
    <div className="mx-auto max-w-7xl px-6 py-16">
      <p className="text-sm uppercase tracking-[0.2em] text-brand-700">Рішення</p>
      <h1 className="mt-2 text-4xl font-semibold">{page.title}</h1>
      <p className="mt-4 max-w-3xl text-stone-600">
        Програми живлення імпортовані зі старого сайту та розкладені на чистіші контентні секції для нового каталогу.
      </p>
      <LegacyContentSections html={page.content} className="mt-8 space-y-6" />
    </div>
  );
}
