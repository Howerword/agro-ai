import { normalizeLegacySections } from '../lib/content';

type LegacyContentSectionsProps = {
  html: string;
  mode?: 'generic' | 'article' | 'product';
  className?: string;
  sectionClassName?: string;
};

export function LegacyContentSections({
  html,
  mode = 'generic',
  className = 'space-y-6',
  sectionClassName = 'rounded-[28px] border border-stone-200 bg-white p-8 shadow-sm'
}: LegacyContentSectionsProps) {
  const sections = normalizeLegacySections(html, mode);

  return (
    <div className={className}>
      {sections.map((section) => (
        <section key={section.id} className={sectionClassName}>
          {section.title ? <h2 className="mb-5 text-2xl font-semibold text-stone-900">{section.title}</h2> : null}
          <div className="rich-content" dangerouslySetInnerHTML={{ __html: section.html }} />
        </section>
      ))}
    </div>
  );
}
