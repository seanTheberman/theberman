import type { ReactNode } from 'react';
import SEOHead from '../SEOHead';

export interface LegalSection {
    heading: string;
    paragraphs?: string[];
    bullets?: string[];
}

interface LegalDocProps {
    seoTitle: string;
    seoDesc: string;
    canonical: string;
    badge?: string;
    title: string;
    subtitle?: string;
    effectiveLabel?: string;
    notice?: ReactNode;
    callout?: { title: string; bullets?: string[]; text?: string };
    sections: LegalSection[];
    footer?: ReactNode;
}

/**
 * Shared renderer for full-length legal documents (France tenant).
 * Renders heading sections with paragraphs and bullet lists.
 */
const LegalDoc = ({ seoTitle, seoDesc, canonical, badge = 'Legal', title, subtitle, effectiveLabel, notice, callout, sections, footer }: LegalDocProps) => (
    <div className="font-sans text-gray-900 bg-white min-h-screen">
        <SEOHead title={seoTitle} description={seoDesc} canonical={canonical} />

        <section className="pt-24 pb-12 bg-white border-b border-gray-100">
            <div className="container mx-auto px-6 max-w-4xl">
                <span className="inline-block mb-4 px-4 py-1.5 rounded-full bg-green-50 text-[#007F00] text-xs font-black tracking-widest uppercase border border-green-100">
                    {badge}
                </span>
                <h1 className="text-3xl md:text-5xl font-black text-gray-900 mb-4 leading-tight">{title}</h1>
                {subtitle && <p className="text-lg text-gray-500 leading-relaxed">{subtitle}</p>}
                {effectiveLabel && <p className="text-sm text-gray-400 font-bold mt-3">{effectiveLabel}</p>}
            </div>
        </section>

        <section className="py-14 bg-white">
            <div className="container mx-auto px-6 max-w-4xl">
                {notice && (
                    <div className="mb-10 p-5 rounded-2xl bg-blue-50 border border-blue-100 text-blue-900 text-sm font-medium leading-relaxed">
                        {notice}
                    </div>
                )}

                {callout && (
                    <div className="mb-14 p-8 rounded-3xl bg-green-50/60 border border-green-100">
                        <h2 className="text-lg font-black text-gray-900 mb-4">{callout.title}</h2>
                        {callout.bullets && (
                            <ul className="list-disc pl-5 space-y-2 text-gray-700 font-medium">
                                {callout.bullets.map((b, i) => <li key={i}>{b}</li>)}
                            </ul>
                        )}
                        {callout.text && <p className="text-gray-500 text-sm mt-4 italic">{callout.text}</p>}
                    </div>
                )}

                <div className="space-y-12">
                    {sections.map((s, i) => (
                        <div key={i} className="pt-10 border-t border-gray-100 first:border-t-0 first:pt-0">
                            {s.heading && <h2 className="text-xl font-black text-gray-900 mb-4">{s.heading}</h2>}
                            <div className="space-y-3 text-gray-600 leading-relaxed font-medium">
                                {s.paragraphs?.map((p, j) => <p key={j}>{p}</p>)}
                                {s.bullets && (
                                    <ul className="list-disc pl-5 space-y-2">
                                        {s.bullets.map((b, j) => <li key={j}>{b}</li>)}
                                    </ul>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {footer && <div className="mt-14 pt-8 border-t border-gray-100">{footer}</div>}
            </div>
        </section>
    </div>
);

export default LegalDoc;
