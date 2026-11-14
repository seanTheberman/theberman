import { Link } from 'react-router-dom';
import { CheckCircle2, ArrowRight, MapPin, ShieldCheck, Zap as ZapIcon, CalendarCheck, Tag } from 'lucide-react';

interface Props {
    city: string;          // Display name (county or town)
    countyName: string;
    countySlug: string;
    towns: string[];
    isTown: boolean;
    custom?: any;          // location_pages row (template_content overrides)
}

const IrelandLocationTemplate = ({ city, countyName, countySlug, towns, isTown, custom }: Props) => {
    const townsText = towns.slice(0, 8).join(', ');
    // CMS overrides from location_pages.template_content — every value may use
    // {{CITY}}, {{COUNTY}} and {{TOWNS}} placeholders; paragraphs accept HTML links.
    const ov = {
        hero_heading: custom?.hero_title,
        cta_heading: custom?.cta_heading,
        cta_paragraph: custom?.cta_subtitle,
        ...(custom?.template_content || {}),
    } as Record<string, string>;
    const sub = (v: string) => v
        .replace(/\{\{CITY\}\}/g, city)
        .replace(/\{\{COUNTY\}\}/g, countyName)
        .replace(/\{\{TOWNS\}\}/g, townsText || city);
    const T = (key: string, fallback: string) => sub(ov[key] !== undefined && ov[key] !== '' ? String(ov[key]) : fallback);
    const heroPara1 = T('hero_para1', `If you are selling, renting or building in {{CITY}}, you will need an official BER certificate that {{CITY}} buyers and tenants can verify. Tell us about your property once, receive competitive quotes from <a href="/catalogue">SEAI registered assessors</a> that {{CITY}} property owners can choose between, and arrange your <a href="/services">BER assessment</a> online in minutes.`);
    const heroPara2 = T('hero_para2', `Want to <a href="/catalogue">find a BER assessor</a> that {{CITY}} owners can compare side by side? Our BER assessors listings cover {{TOWNS}} and the rest of the county. Whether you require a <a href="/services">domestic BER</a> assessment, a commercial energy rating, or a starting point before a <a href="/energy-advisor">home energy upgrade</a>, The Berman connects you with qualified local professionals.`);
    const allCounties = ['Carlow', 'Cavan', 'Clare', 'Cork', 'Donegal', 'Dublin', 'Galway', 'Kerry', 'Kildare', 'Kilkenny', 'Laois', 'Leitrim', 'Limerick', 'Longford', 'Louth', 'Mayo', 'Meath', 'Monaghan', 'Offaly', 'Roscommon', 'Sligo', 'Tipperary', 'Waterford', 'Westmeath', 'Wexford', 'Wicklow'];
    const slug = (v: string) => v.replace(/\s+/g, '-').toLowerCase();

    const faqs = [
        {
            q: 'What is a BER certificate?',
            a: <>A Building Energy Rating (BER) certificate measures the energy performance of a property on a scale from A to G (with A0 being the most energy-efficient and G being the least efficient). It is legally required when selling or renting a residential or commercial property in Ireland. <Link to="/blog" className="text-[#007F00] underline">BER rating scale from A to G</Link></>
        },
        {
            q: `What is a BER assessment in ${city}?`,
            a: <>A BER assessment is an on-site survey conducted by an SEAI-registered assessor. The assessor evaluates building characteristics including wall, floor and roof insulation, heating systems, ventilation, windows and doors, and renewable energy technologies to calculate your official rating.</>
        },
        {
            q: `Who needs a BER certificate in ${city}?`,
            a: <>Property owners offering a home or commercial building for sale or rent must have a valid BER certificate before advertising. It is also required for newly built properties and when applying for SEAI home energy upgrade grants.</>
        },
        {
            q: `How do I get a BER certificate in ${city}?`,
            a: <>You can <Link to="/get-quote" className="text-[#007F00] underline">submit your property details</Link> through The Berman in minutes, receive competing quotes from qualified local assessors, and arrange your assessment with the provider that best suits your budget and schedule.</>
        },
        {
            q: `How much does a BER certificate cost in ${city}?`,
            a: <>Prices generally range from €150 to €250 for apartments and standard 3-bed homes, and €250 to €350+ for larger or detached houses. Commercial BER assessments depend on floor area. <Link to="/pricing" className="text-[#007F00] underline">Comparing quotes through The Berman</Link> helps you find the most competitive local price.</>
        },
        {
            q: `How long does a BER assessment take in ${city}?`,
            a: <>The on-site inspection typically takes between 1 to 2 hours depending on property size and complexity. The assessor then calculates the rating using official DEAP software and publishes the cert to the SEAI National Register within a few days.</>
        },
        {
            q: `How can I improve my BER rating in ${city}?`,
            a: <>Your BER certificate comes with an Advisory Report listing specific, <Link to="/energy-advisor" className="text-[#007F00] underline">cost-effective upgrade recommendations</Link>. Common measures include attic insulation, external wall insulation, heat pump upgrades, draught-proofing, and solar PV panels.</>
        },
        {
            q: 'Can I request a BER assessment online?',
            a: <>Yes. With The Berman, the entire process starts online. Submit your details in under two minutes, receive quotes directly to your inbox, and <Link to="/get-quote" className="text-[#007F00] underline">book your preferred assessor online</Link>.</>
        },
        {
            q: 'Can a BER help with SEAI home energy upgrade grants?',
            a: <>Yes. A pre-works BER assessment is required to establish grant eligibility and guide your retrofit roadmap. A post-works BER assessment is required by SEAI to confirm the efficiency improvements before grant funds are paid out. <Link to="/energy-advisor" className="text-[#007F00] underline">SEAI home energy upgrade grants</Link></>
        },
    ];

    const schema = [
        {
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            name: `Find a BER Assessor in ${city} and Compare Quotes`,
            description: `Compare quotes from SEAI registered BER assessors in ${city}, Ireland. Book your BER assessment online.`,
            url: `https://www.theberman.eu/${isTown ? `${countySlug}/${slug(city)}` : countySlug}`,
        },
        {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
                { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.theberman.eu/' },
                { '@type': 'ListItem', position: 2, name: 'Locations', item: 'https://www.theberman.eu/locations' },
                ...(isTown
                    ? [
                        { '@type': 'ListItem', position: 3, name: countyName, item: `https://www.theberman.eu/${countySlug}` },
                        { '@type': 'ListItem', position: 4, name: city, item: `https://www.theberman.eu/${countySlug}/${slug(city)}` },
                    ]
                    : [{ '@type': 'ListItem', position: 3, name: city, item: `https://www.theberman.eu/${countySlug}` }]),
            ],
        },
        {
            '@context': 'https://schema.org',
            '@type': 'ProfessionalService',
            name: 'The Berman',
            url: 'https://www.theberman.eu',
            areaServed: { '@type': 'AdministrativeArea', name: `${city}, Ireland` },
        },
        {
            '@context': 'https://schema.org',
            '@type': 'Service',
            name: `BER Assessment ${city}`,
            provider: { '@type': 'Organization', name: 'The Berman', url: 'https://www.theberman.eu' },
            areaServed: { '@type': 'AdministrativeArea', name: `${city}, Ireland` },
            hasOfferCatalog: {
                '@type': 'OfferCatalog',
                name: 'BER Certificates',
                itemListElement: [
                    { '@type': 'Offer', name: 'Domestic BER Certificate', priceCurrency: 'EUR', priceSpecification: { '@type': 'PriceSpecification', minPrice: 150, maxPrice: 300, priceCurrency: 'EUR' } },
                    { '@type': 'Offer', name: 'Commercial BER Certificate', priceCurrency: 'EUR', priceSpecification: { '@type': 'PriceSpecification', minPrice: 350, maxPrice: 800, priceCurrency: 'EUR' } },
                ],
            },
        },
        {
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: faqs.map(f => ({
                '@type': 'Question',
                name: f.q,
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: typeof f.a === 'string' ? f.a : f.q,
                },
            })),
        },
    ];

    return (
        <div className="min-h-screen bg-white">
            {schema.map((s, i) => (
                <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(s) }} />
            ))}

            {/* ── Hero ── */}
            <section className="pt-28 pb-14 lg:pt-36 lg:pb-16 bg-white">
                <div className="max-w-4xl mx-auto px-6 text-center">
                    <span className="inline-block mb-5 px-4 py-1.5 rounded-full bg-green-50 text-[#007F00] text-xs font-black tracking-widest uppercase border border-green-100">
                        {T('badge_text', 'BER Certificate {{CITY}}')}
                    </span>
                    <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-6 leading-tight tracking-tight">
                        {T('hero_heading', 'Find a BER Assessor in {{CITY}} and Compare Quotes')}
                    </h1>
                    <style>{`.loc-tpl a { color: #007F00; text-decoration: underline; }`}</style>
                    <p className="loc-tpl text-gray-600 leading-relaxed font-medium mb-5" dangerouslySetInnerHTML={{ __html: heroPara1 }} />
                    <p className="loc-tpl text-gray-600 leading-relaxed font-medium mb-8" dangerouslySetInnerHTML={{ __html: heroPara2 }} />

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
                        <Link to={T('primary_cta_url', '/get-quote')} className="inline-flex items-center gap-2 bg-[#007F00] hover:bg-[#006400] text-white px-10 py-4 rounded-2xl font-black text-lg shadow-xl shadow-green-100 transition-all transform hover:-translate-y-0.5">
                            {T('primary_cta_text', 'Get BER Quotes')} <ArrowRight size={20} strokeWidth={3} />
                        </Link>
                        <a href={T('secondary_cta_url', '#how-it-works')} className="inline-flex items-center gap-2 bg-white border-2 border-gray-200 hover:border-[#007F00] text-gray-800 px-10 py-4 rounded-2xl font-black text-lg transition-all">
                            {T('secondary_cta_text', 'How It Works')}
                        </a>
                    </div>

                    <div className="flex flex-wrap justify-center gap-x-8 gap-y-3">
                        {[
                            T('trust_1', 'SEAI Registered Assessors — Fully accredited & vetted'),
                            T('trust_2', 'Compare Quotes — Transparent prices, save up to €50+'),
                            T('trust_3', 'Online in Minutes — Instant booking with zero hassle'),
                        ].filter(Boolean).map((text, i) => (
                            <div key={i} className="flex items-center gap-2 text-sm font-bold text-gray-700">
                                <CheckCircle2 size={18} className="text-[#007F00] flex-shrink-0" />
                                {text}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Trust Bar (4 Pillars) ── */}
            <section className="py-12 bg-gray-50 border-y border-gray-100">
                <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {[
                        { icon: <ShieldCheck size={28} />, title: 'SEAI Registered Assessors', desc: 'Fully insured, accredited independent assessors.' },
                        { icon: <Tag size={28} />, title: 'Compare Quotes & Prices', desc: 'Multiple quotes ensure you never overpay.' },
                        { icon: <ZapIcon size={28} />, title: 'Quick Online Process', desc: 'Complete your property enquiry in under 2 minutes.' },
                        { icon: <MapPin size={28} />, title: `${city} & Nationwide`, desc: `Comprehensive coverage across ${townsText || city} and beyond.` },
                    ].map((p, i) => (
                        <div key={i} className="text-center">
                            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-green-50 text-[#007F00] mb-4">{p.icon}</div>
                            <h3 className="font-black text-gray-900 mb-2">{p.title}</h3>
                            <p className="text-sm text-gray-500 font-medium leading-relaxed">{p.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── How It Works ── */}
            <section id="how-it-works" className="py-16 bg-white">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="text-center mb-12">
                        <span className="text-[#007F00] font-bold uppercase tracking-widest text-sm mb-3 block">Simple Process</span>
                        <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">How The Berman Works</h2>
                        <p className="text-gray-600 max-w-2xl mx-auto font-medium">From submitting your property details to arranging the assessment — The Berman keeps the process straightforward.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        {[
                            { step: '01', title: 'Submit Property Details', desc: 'Provide your property information online in just a few minutes.' },
                            { step: '02', title: 'Receive Quotes', desc: `Receive competing quotes from SEAI registered BER assessors covering ${city}.` },
                            { step: '03', title: 'Compare Your Options', desc: <>Review prices, turnaround times and assessor ratings before making your choice — <Link to="/pricing" className="text-[#007F00] underline">review available prices</Link>.</> },
                            { step: '04', title: 'Book Your BER Assessment', desc: <>Select the best offer and <Link to="/get-quote" className="text-[#007F00] underline">book your BER assessment</Link> directly.</> },
                        ].map((s, i) => (
                            <div key={i} className="relative bg-gray-50 rounded-2xl p-6 border border-gray-100">
                                <div className="text-4xl font-black text-green-100 mb-3">{s.step}</div>
                                <h3 className="font-black text-gray-900 mb-2">{s.title}</h3>
                                <p className="text-sm text-gray-600 font-medium leading-relaxed">{s.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Core Benefits ── */}
            <section className="py-16 bg-gray-50 border-y border-gray-100">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">A Simple Way to Find BER Assessors in {city}</h2>
                        <p className="text-gray-600 max-w-2xl mx-auto font-medium">Everything you need to find, compare, and arrange your BER assessment — in one place.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                            { icon: <Tag size={24} />, title: 'Compare Quotes', desc: 'Explore available quotes instead of contacting assessors individually. Save time and find options that fit your budget.' },
                            { icon: <ShieldCheck size={24} />, title: 'SEAI Registered Assessors', desc: 'Every assessor on our platform is accredited by the Sustainable Energy Authority of Ireland.' },
                            { icon: <ZapIcon size={24} />, title: 'Online in Minutes', desc: 'Fast submission, instant notifications, and no phone tag required.' },
                            { icon: <CalendarCheck size={24} />, title: 'Flexible Scheduling', desc: 'Choose dates and turnaround times that fit your sale, rental or renovation timeline.' },
                            { icon: <CheckCircle2 size={24} />, title: 'Transparent Pricing', desc: 'Clear quotes with no hidden call-out fees or unexpected extras.' },
                            { icon: <MapPin size={24} />, title: `${city} Focused`, desc: <>Dedicated coverage for {townsText || city} and surrounding areas, backed by a <Link to="/locations" className="text-[#007F00] underline">nationwide network of BER assessors</Link>.</> },
                        ].map((card, i) => (
                            <div key={i} className="bg-white rounded-2xl p-7 border border-gray-100 shadow-sm">
                                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-green-50 text-[#007F00] mb-4">{card.icon}</div>
                                <h3 className="font-black text-gray-900 mb-2">{card.title}</h3>
                                <p className="text-sm text-gray-600 font-medium leading-relaxed">{card.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── FAQs ── */}
            <section className="py-16 bg-white">
                <div className="max-w-3xl mx-auto px-6">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">Frequently Asked Questions</h2>
                        <p className="text-gray-600 font-medium">Everything you need to know about BER certificates and assessments in {city}.</p>
                    </div>
                    <div className="space-y-3">
                        {faqs.map((f, i) => (
                            <details key={i} className="group bg-gray-50 rounded-2xl border border-gray-100 open:border-green-200 open:bg-green-50/40 transition-colors">
                                <summary className="flex items-center justify-between gap-4 cursor-pointer list-none px-6 py-5 font-bold text-gray-900">
                                    {f.q}
                                    <span className="text-[#007F00] text-xl font-black group-open:rotate-45 transition-transform flex-shrink-0">+</span>
                                </summary>
                                <p className="px-6 pb-6 text-gray-600 font-medium leading-relaxed text-sm">{f.a}</p>
                            </details>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Final CTA ── */}
            <section className="py-16 bg-gradient-to-r from-[#007F00] to-[#006400] text-white">
                <div className="max-w-4xl mx-auto px-6 text-center">
                    <span className="inline-block mb-5 px-4 py-1.5 rounded-full bg-white/10 text-white text-xs font-black tracking-widest uppercase border border-white/20">
                        {T('badge_text', 'BER Certificate {{CITY}}')}
                    </span>
                    <h2 className="text-3xl md:text-4xl font-black mb-5">{T('cta_heading', 'Ready to Arrange Your BER Assessment?')}</h2>
                    <p className="loc-tpl text-white/90 font-medium leading-relaxed mb-8" dangerouslySetInnerHTML={{ __html: T('cta_paragraph', 'Whether you are selling, renting, buying or planning a home energy upgrade, The Berman makes it easier to find BER assessment options in {{CITY}}. Book your {{CITY}} appointment online: submit your property details, receive competing quotes, compare your options and arrange your assessment with a trusted SEAI registered assessor today.') }} />
                    <Link to={T('cta_button_url', '/get-quote')} className="inline-flex items-center gap-2 bg-white text-[#007F00] px-10 py-4 rounded-2xl font-black text-lg hover:bg-green-50 transition-all shadow-xl">
                        {T('cta_button_text', 'Get BER Quotes')} <ArrowRight size={20} strokeWidth={3} />
                    </Link>
                </div>
            </section>

            {/* ── Cross-County Links ── */}
            <section className="py-12 bg-white border-t border-gray-100">
                <div className="max-w-6xl mx-auto px-6">
                    <h3 className="text-center text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-6">BER Assessors Across Ireland</h3>
                    <div className="flex flex-wrap justify-center gap-x-5 gap-y-2">
                        {allCounties.map((cName) => (
                            <Link
                                key={cName}
                                to={`/${slug(cName)}`}
                                className={`text-sm font-bold transition-colors ${cName === countyName && !isTown ? 'text-[#007F00]' : 'text-gray-500 hover:text-[#007F00]'}`}
                            >
                                {cName}
                            </Link>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default IrelandLocationTemplate;
