
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import SEOHead from '../components/SEOHead';
import InternalLinks from '../components/InternalLinks';
import { getTenantFromDomain, getTenantEmail } from '../lib/tenant';
import { usePageContent, cmsValue } from '../hooks/usePageContent';

interface FaqItem {
    id: string;
    slug: string;
    title: string;
    content: string;
    category: string;
    sort_order: number;
}

const DEFAULT_PORTUGAL_FAQS: FaqItem[] = [
    { id: 'sce-1', slug: 'o-que-e-o-sce', title: 'O que é o SCE (Sistema de Certificação Energética)?', content: '<p>O SCE é o Sistema de Certificação Energética dos Edifícios, que regula a emissão dos Certificados Energéticos em Portugal. O certificado classifica o desempenho energético de um imóvel numa escala de A+ (mais eficiente) a F (menos eficiente).</p>', category: 'SCE / ADENE', sort_order: 1 },
    { id: 'sce-2', slug: 'certificado-energetico-obrigatorio', title: 'O Certificado Energético é obrigatório?', content: '<p>Sim, é obrigatório em Portugal para a venda ou arrendamento de imóveis, bem como na publicação de anúncios imobiliários. Sem certificado válido, o proprietário pode estar sujeito a coimas.</p>', category: 'SCE / ADENE', sort_order: 2 },
    { id: 'sce-3', slug: 'quem-emitir', title: 'Quem pode emitir o Certificado Energético?', content: '<p>Apenas peritos qualificados e registados na ADENE — Agência para a Energia — podem emitir certificados energéticos válidos em Portugal.</p>', category: 'SCE / ADENE', sort_order: 3 },
    { id: 'sce-4', slug: 'quanto-custa', title: 'Quanto custa um Certificado Energético?', content: '<p>O preço varia consoante o tipo e dimensão do imóvel. Na Certificado Energia pode comparar orçamentos grátis de vários peritos qualificados e escolher a melhor opção.</p>', category: 'SCE / ADENE', sort_order: 4 },
    { id: 'sce-5', slug: 'duracao-avaliacao', title: 'Quanto tempo dura a avaliação?', content: '<p>A visita ao imóvel costuma durar entre 30 minutos e 2 horas, dependendo do tamanho e complexidade do edifício. O certificado é emitido após a análise documental.</p>', category: 'SCE / ADENE', sort_order: 5 },
    { id: 'sce-6', slug: 'validade-certificado', title: 'Qual a validade do Certificado Energético?', content: '<p>De acordo com o SCE, o Certificado Energético tem validade de 10 anos, exceto se forem efetuadas obras que alterem significativamente o desempenho energético do imóvel.</p>', category: 'SCE / ADENE', sort_order: 6 },
    { id: 'sce-7', slug: 'classificacao-baixa', title: 'O que acontece se o imóvel tiver uma classificação baixa?', content: '<p>Uma classificação baixa não impede a venda ou arrendamento, mas pode reduzir o valor de mercado. O certificado inclui recomendações de melhoria para aumentar a eficiência energética.</p>', category: 'SCE / ADENE', sort_order: 7 },
    { id: 'sce-8', slug: 'como-reservar', title: 'Como reservo um perito qualificado?', content: '<p>Peça um orçamento grátis na Certificado Energia, compare propostas de peritos qualificados registados na ADENE e reserve online a data e hora que mais lhe convier.</p>', category: 'SCE / ADENE', sort_order: 8 },
];

const DEFAULT_FRANCE_FAQS: FaqItem[] = [
    { id: 'dpe-1', slug: 'qu-est-ce-qu-un-dpe', title: "Qu'est-ce qu'un DPE ?", content: '<p>Le Diagnostic de Performance Énergétique (DPE) évalue la performance énergétique d\'un logement. Il classe les biens de A (plus efficace) à G (moins efficace), comme l\'étiquetage des appareils électroménagers.</p>', category: 'DPE Général', sort_order: 1 },
    { id: 'dpe-2', slug: 'dpe-obligatoire', title: 'Le DPE est-il obligatoire en France ?', content: '<p>Oui. Le DPE est obligatoire par la loi pour vendre, louer ou mettre en annonce un bien immobilier, avec des exceptions très limitées.</p>', category: 'DPE Légal', sort_order: 2 },
    { id: 'dpe-3', slug: 'qui-peut-emettre-dpe', title: 'Qui peut émettre un DPE ?', content: "<p>Seuls les diagnostiqueurs certifiés et assurés peuvent émettre un DPE valide en France. Tous nos diagnostiqueurs sont certifiés et suivent une formation continue.</p>", category: 'DPE Général', sort_order: 3 },
    { id: 'dpe-4', slug: 'combien-coute-dpe', title: 'Combien coûte un DPE ?', content: "<p>Le prix dépend de la taille et du type de bien. Comparer les devis de plusieurs diagnostiqueurs vous aide à obtenir le meilleur prix pour votre diagnostic de performance énergétique.</p>", category: 'DPE Prix', sort_order: 4 },
    { id: 'dpe-5', slug: 'duree-diagnostic', title: 'Combien de temps dure le diagnostic ?', content: "<p>La visite sur place dure généralement entre 1 et 3 heures, selon la taille et la complexité du bien.</p>", category: 'DPE Processus', sort_order: 5 },
    { id: 'dpe-6', slug: 'validite-dpe', title: 'Quelle est la validité du DPE ?', content: "<p>Le DPE est valide 10 ans, sauf si des travaux importants modifient la performance énergétique du bien.</p>", category: 'DPE Validité', sort_order: 6 },
    { id: 'dpe-7', slug: 'note-faible', title: 'Que se passe-t-il si j\'obtiens une mauvaise note ?', content: "<p>Une mauvaise note ne vous empêche pas de vendre. Elle informe simplement l'acheteur. Le rapport de recommandations vous indiquera comment améliorer la performance énergétique de votre bien.</p>", category: 'DPE Notes', sort_order: 7 },
    { id: 'dpe-8', slug: 'comment-reserver', title: 'Comment réserver un diagnostiqueur ?', content: "<p>Demandez un devis gratuit sur DPE Cert France, comparez les propositions de diagnostiqueurs certifiés et réservez en ligne à la date et l'heure qui vous conviennent.</p>", category: 'DPE Réservation', sort_order: 8 },
];

const DEFAULT_IRELAND_FAQS: FaqItem[] = [
    { id: 'ber-1', slug: 'what-is-a-ber-certificate', title: 'What is a BER certificate?', content: '<p>A BER certificate (Building Energy Rating) rates a home\'s energy efficiency from A1 to G, based on an energy assessment by a SEAI registered assessor.</p>', category: 'BER Certificates', sort_order: 1 },
    { id: 'ber-2', slug: 'do-i-need-one-to-sell-or-rent', title: 'Do I need one to sell or rent?', content: '<p>Yes — a valid energy certificate is legally required before advertising a property for sale or rent anywhere in Ireland, including BER cert Dublin and every other county.</p>', category: 'BER Certificates', sort_order: 2 },
    { id: 'ber-3', slug: 'how-do-i-find-a-ber-assessor-near-me', title: 'How do I find a BER assessor near me?', content: '<p>Enter your address and we\'ll match you with a BER assessor near you from our BER assessor directory of 100+ SEAI registered assessors nationwide.</p>', category: 'BER Assessors', sort_order: 3 },
    { id: 'ber-4', slug: 'how-much-does-a-ber-cert-cost', title: 'How much does a BER cert cost?', content: '<p>It depends on property size and location. Comparing assessors on The Berman gets you cheap BER Dublin and lowest priced BER cert options, all fully SEAI registered.</p>', category: 'BER Pricing', sort_order: 4 },
    { id: 'ber-5', slug: 'do-you-cover-areas-outside-dublin', title: 'Do you cover areas outside Dublin?', content: '<p>Yes — beyond BER rating Dublin, our network covers every county in Ireland.</p>', category: 'BER Coverage', sort_order: 5 },
    { id: 'ber-6', slug: 'how-long-is-a-ber-valid-for', title: 'How long is a BER valid for?', content: '<p>Up to 10 years, unless major upgrades change your home energy performance sooner.</p>', category: 'BER Validity', sort_order: 6 },
    { id: 'ber-7', slug: 'how-fast-will-i-get-my-certificate', title: 'How fast will I get my certificate?', content: '<p>Most assessors issue your energy certificate within 24–48 hours of the visit.</p>', category: 'BER Process', sort_order: 7 },
    { id: 'ber-8', slug: 'is-my-property-ber-exempt', title: 'Is my property BER-exempt?', content: '<p>Some buildings qualify for BER exemptions (e.g. protected structures, sub-50sqm standalone buildings). Ask an assessor to confirm.</p>', category: 'BER Exemptions', sort_order: 8 },
    { id: 'ber-9', slug: 'are-seai-grants-available', title: 'Are SEAI grants available?', content: '<p>Yes. SEAI grants and BER assessments go together — most grants need a before/after BER cert.</p>', category: 'SEAI Grants', sort_order: 9 },
    { id: 'ber-10', slug: 'how-does-the-a-g-rating-scale-work', title: 'How does the A–G rating scale work?', content: '<p>The BER rating scale reflects your home\'s calculated energy use — better insulation and heating systems mean a higher score.</p>', category: 'BER Ratings', sort_order: 10 },
];

const DEFAULT_ENGLAND_FAQS: FaqItem[] = [
    { id: 'epc-1', slug: 'can-i-sell-or-rent-my-property-without-an-epc-certificate', title: 'Can I sell or rent my property without an EPC Certificate?', content: '<p>No. An EPC Certificate is legally required before you can market a property for sale or rent in England. You must have a valid EPC in place before advertising the property.</p>', category: 'EPC Legal Requirements', sort_order: 1 },
    { id: 'epc-2', slug: 'which-areas-do-you-cover', title: 'Which areas do you cover?', content: '<p>EPCCert covers all of England. Our network of accredited EPC assessors serves homeowners, landlords, and businesses across every region, from London to Manchester, Birmingham, and beyond.</p>', category: 'EPC Coverage', sort_order: 2 },
    { id: 'epc-3', slug: 'is-an-epc-certificate-a-legal-requirement', title: 'Is an EPC Certificate a legal requirement?', content: '<p>Yes. Under UK law, an Energy Performance Certificate (EPC) is mandatory for most residential and commercial properties being sold or rented in England. Properties without a valid EPC cannot be legally marketed.</p>', category: 'EPC Legal Requirements', sort_order: 3 },
    { id: 'epc-4', slug: 'can-i-get-an-epc-certificate-urgently', title: 'Can I get an EPC Certificate urgently?', content: '<p>Yes. Many of our accredited assessors offer fast-track EPC assessments with same-day or next-day appointments. Contact EPCCert to check urgent availability in your area.</p>', category: 'EPC Process', sort_order: 4 },
    { id: 'epc-5', slug: 'how-much-does-an-epc-certificate-cost', title: 'How much does an EPC Certificate cost?', content: '<p>The cost of an EPC Certificate depends on the size, type, and location of your property. EPCCert lets you compare quotes from accredited assessors across England to find the best price for your needs.</p>', category: 'EPC Pricing', sort_order: 5 },
];

const FAQ = () => {
    const [faqItems, setFaqItems] = useState<FaqItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeId, setActiveId] = useState('');
    const tenant = getTenantFromDomain();
    const isSpanish = tenant === 'spain';
    const isEngland = tenant === 'england';
    const isFrance = tenant === 'france';
    const isPortugal = tenant === 'portugal';
    const tenantEmail = getTenantEmail(tenant);
    const baseUrl = tenant === 'england' ? 'https://www.epccert.com' : isSpanish ? 'https://www.xn--certificadoenergtico-q2b.eu' : tenant === 'france' ? 'https://www.dpecert.fr' : tenant === 'portugal' ? 'https://www.certificadoenergia.com' : 'https://www.theberman.eu';
    const brand = isSpanish ? 'Certificado Energético' : isEngland ? 'EPC Cert' : isFrance ? 'DPE Cert France' : isPortugal ? 'Certificado Energia' : 'The Berman';
    const { content: cms, loading: cmsLoading } = usePageContent('faq');
    const c = (section: string, key: string, fallback: string) => cmsValue(cms, section, key, fallback);
    const tr = isSpanish ? {
        loading: 'Cargando FAQ...',
        comingSoonH: 'FAQ Próximamente',
        comingSoonP: 'Estamos preparando nuestras preguntas frecuentes. Vuelve pronto.',
        seoTitle: 'Preguntas Frecuentes',
        seoDesc: 'Encuentra respuestas a las preguntas más comunes sobre certificados energéticos, calificaciones, costes y mejoras energéticas en España.',
        needHelp: '¿Necesitas ayuda inmediata?',
        emailUs: `Escríbenos a ${tenantEmail}`,
        getQuote: 'Pedir Presupuesto',
        sidebarLabel: 'FAQ Energético',
        consultantsH: 'Consultoría Energética Líder en España',
        consultantsP: 'Más de 10000 clientes satisfechos.',
        emailLine: `Correo: ${tenantEmail}`,
    } : isFrance ? {
        loading: 'Chargement FAQ...',
        comingSoonH: 'FAQ Bientôt Disponible',
        comingSoonP: "Nous préparons actuellement nos questions fréquentes. Revenez bientôt.",
        seoTitle: 'Questions Fréquentes',
        seoDesc: 'Trouvez les réponses aux questions courantes sur le DPE, les diagnostics énergétiques, les coûts et les rénovations en France.',
        needHelp: 'Besoin d\'aide immédiate ?',
        emailUs: `Email: ${tenantEmail}`,
        getQuote: 'Obtenir un Devis',
        sidebarLabel: 'FAQ DPE',
        consultantsH: 'Experts en Diagnostic Énergétique en France',
        consultantsP: 'Plus de 10 000 clients satisfaits.',
        emailLine: `Email: ${tenantEmail}`,
    } : isPortugal ? {
        loading: 'A carregar FAQ...',
        comingSoonH: 'FAQ em Breve',
        comingSoonP: 'Estamos a preparar as nossas perguntas frequentes. Volte em breve.',
        seoTitle: 'Perguntas Frequentes',
        seoDesc: 'Encontre respostas às perguntas mais comuns sobre certificação energética, custos e melhorias em Portugal.',
        needHelp: 'Precisa de ajuda imediata?',
        emailUs: `Email: ${tenantEmail}`,
        getQuote: 'Pedir Orçamento',
        sidebarLabel: 'FAQ Energética',
        consultantsH: 'Especialistas em Certificação Energética em Portugal',
        consultantsP: 'Mais de 10 000 clientes satisfeitos.',
        emailLine: `Email: ${tenantEmail}`,
    } : isEngland ? {
        loading: 'Loading FAQ...',
        comingSoonH: 'FAQ Coming Soon',
        comingSoonP: "We're currently preparing our frequently asked questions. Check back shortly.",
        seoTitle: 'EPC Certificate FAQ England | EPC Assessor',
        seoDesc: 'Find Answers to Common EPC Certificate Questions, Including Costs, Timelines, and Legal Requirements for Property Owners Across England',
        ogTitle: 'EPC Certificate FAQs England | EPCCert',
        ogDescription: 'Get answers to common EPC Certificate questions — legal requirements, costs, coverage areas, and urgent assessments across England.',
        twitterTitle: 'EPC Certificate FAQ | Common Questions Answered',
        twitterDescription: 'Find answers to common EPC Certificate questions including costs, legal requirements, and coverage across England.',
        needHelp: 'Need immediate help?',
        emailUs: `Email ${tenantEmail}`,
        getQuote: 'Get a Quote Now',
        sidebarLabel: 'EPC FAQ',
        consultantsH: "England's Leading EPC Consultants",
        consultantsP: 'Trusted by homeowners, landlords and property professionals across England.',
        emailLine: `Email: ${tenantEmail}`,
    } : {
        loading: 'Loading FAQ...',
        comingSoonH: 'FAQ Coming Soon',
        comingSoonP: "We're currently preparing our frequently asked questions. Check back shortly.",
        seoTitle: 'BER Certificate FAQs | Common Questions Answered',
        seoDesc: 'Find answers to common questions about BER certificates, ratings, costs, validity and exemptions in Ireland.',
        ogTitle: 'BER Certificate FAQs | The Berman',
        ogDescription: 'Get clear answers to the most common BER certificate questions, from cost to validity and exemptions.',
        twitterTitle: 'BER Certificate FAQs Answered',
        twitterDescription: 'Common questions about BER certificates, ratings and costs in Ireland, answered simply.',
        needHelp: 'Need immediate help?',
        emailUs: `Email ${tenantEmail}`,
        getQuote: 'Get a Quote Now',
        sidebarLabel: 'BER FAQ',
        consultantsH: "Ireland's Leading BER Consultants",
        consultantsP: 'Trusted by homeowners across the country.',
        emailLine: `Email: ${tenantEmail}`,
    };
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchFaq = async () => {
            try {
                const tenant = getTenantFromDomain();
                const { data, error } = await supabase
                    .from('faq_items')
                    .select('*')
                    .eq('is_active', true)
                    .eq('tenant', tenant)
                    .order('sort_order');
                if (error) throw error;
                const items = data && data.length > 0 ? data : (tenant === 'portugal' ? DEFAULT_PORTUGAL_FAQS : tenant === 'ireland' ? DEFAULT_IRELAND_FAQS : tenant === 'england' ? DEFAULT_ENGLAND_FAQS : tenant === 'france' ? DEFAULT_FRANCE_FAQS : []);
                setFaqItems(items);
                if (items.length > 0) {
                    const hash = location.hash.replace('#', '');
                    const found = items.find(item => item.slug === hash);
                    setActiveId(found ? found.slug : items[0].slug);
                }
            } catch (error) {
                console.error('Error fetching FAQ:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchFaq();
    }, []);

    useEffect(() => {
        const hash = location.hash.replace('#', '');
        if (hash && faqItems.find(item => item.slug === hash)) {
            setActiveId(hash);
        }
    }, [location, faqItems]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center pt-32 bg-white">
                <SEOHead
                    title={tr.seoTitle}
                    description={tr.seoDesc}
                    canonical={isEngland ? '/epc-faq' : isSpanish ? '/preguntas-frecuentes' : '/faq'}
                    skipSiteNameSuffix={isEngland || (!isSpanish && !isFrance && !isPortugal)}
                    ogTitle={tr.ogTitle}
                    ogDescription={tr.ogDescription}
                    twitterTitle={tr.twitterTitle}
                    twitterDescription={tr.twitterDescription}
                />
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-[#007F00]/20 border-t-[#007F00] rounded-full animate-spin"></div>
                    <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">{tr.loading}</p>
                </div>
            </div>
        );
    }

    if (faqItems.length === 0) {
        return (
            <div className="min-h-screen pt-40 bg-white flex flex-col items-center justify-center p-6 text-center">
            <SEOHead
                title={tr.seoTitle}
                description={tr.seoDesc}
                canonical={isEngland ? '/epc-faq' : isSpanish ? '/preguntas-frecuentes' : '/faq'}
                skipSiteNameSuffix={isEngland || (!isSpanish && !isFrance && !isPortugal)}
            />
                <h1 className="text-4xl font-black text-gray-900 mb-4 uppercase tracking-tight">{tr.comingSoonH}</h1>
                <p className="text-gray-500 max-w-md mx-auto leading-relaxed">
                    {tr.comingSoonP}
                </p>
            </div>
        );
    }

    const activeItem = faqItems.find(item => item.slug === activeId) || faqItems[0];

    return (
        <div className="bg-white min-h-screen pt-32 pb-24 font-sans">
            <SEOHead
                title={tr.seoTitle}
                description={tr.seoDesc}
                canonical={isEngland ? '/epc-faq' : isSpanish ? '/preguntas-frecuentes' : '/faq'}
                skipSiteNameSuffix={isEngland || (!isSpanish && !isFrance && !isPortugal)}
                ogTitle={tr.ogTitle}
                ogDescription={tr.ogDescription}
                twitterTitle={tr.twitterTitle}
                twitterDescription={tr.twitterDescription}
                jsonLd={[
                    {
                        '@context': 'https://schema.org',
                        '@type': 'BreadcrumbList',
                        itemListElement: [
                            { '@type': 'ListItem', position: 1, name: 'Home', item: `${baseUrl}/` },
                            { '@type': 'ListItem', position: 2, name: isEngland ? 'EPC Certificate FAQs' : isSpanish ? 'Preguntas Frecuentes' : isPortugal ? 'Perguntas Frequentes' : 'BER Certificate FAQs', item: `${baseUrl}${isEngland ? '/epc-faq' : '/faq'}` },
                        ],
                    },
                    {
                        '@context': 'https://schema.org',
                        '@type': 'FAQPage',
                        mainEntity: faqItems.map(item => ({
                            '@type': 'Question',
                            name: item.title.charAt(0).toUpperCase() + item.title.slice(1),
                            acceptedAnswer: {
                                '@type': 'Answer',
                                text: item.content || item.title
                            }
                        }))
                    },
                    {
                        '@context': 'https://schema.org',
                        '@type': 'Organization',
                        name: brand,
                        url: baseUrl,
                        logo: `${baseUrl}/logo.png`,
                        sameAs: tenant === 'england'
                            ? ['https://www.facebook.com/epccert', 'https://www.instagram.com/epccert']
                            : isSpanish
                                ? ['https://www.facebook.com/certificadoenergetico', 'https://www.instagram.com/certificadoenergetico']
                                : tenant === 'france'
                                    ? ['https://www.facebook.com/dpefrance', 'https://www.instagram.com/dpefrance']
                                    : tenant === 'portugal'
                                        ? ['https://www.facebook.com/certificadoenergeticopt', 'https://www.instagram.com/certificadoenergeticopt']
                                        : ['https://www.facebook.com/people/The-Berman/61578159843471/', 'https://www.instagram.com/thebermanireland'],
                    }
                ]}
            />
            {cmsLoading ? (
                <div className="min-h-screen bg-white" />
            ) : (
            <>
            <div className="container mx-auto px-6 max-w-7xl">
                <div className="grid lg:grid-cols-12 gap-16 items-start">
                    {/* Main Content (Left) */}
                    <div className="lg:col-span-8 order-2 lg:order-1 animate-in fade-in slide-in-from-bottom-4 duration-500 min-w-0 overflow-hidden">
                        <div className="max-w-3xl">
                            <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4 leading-tight uppercase tracking-tight">
                                {isSpanish ? 'Preguntas Frecuentes' : isEngland ? 'Frequently Asked Questions About EPC Certificates' : isPortugal ? 'Perguntas Frequentes' : 'BER Certificate FAQs'}
                            </h1>
                            <h2 className="text-xl md:text-2xl font-black text-[#007F00] mb-8 leading-tight uppercase tracking-tight">
                                {isSpanish ? 'Preguntas Frecuentes sobre Certificados Energéticos' : isEngland ? 'Frequently Asked Questions About EPC Certificates' : isPortugal ? 'Perguntas Frequentes sobre Certificados Energéticos' : 'Frequently Asked Questions About BER Certificates'}
                            </h2>
                            <h3 className="text-2xl md:text-3xl font-black text-[#007F00] mb-6 leading-tight uppercase tracking-tight">
                                {activeItem.title.charAt(0).toUpperCase() + activeItem.title.slice(1)}
                            </h3>
                            <div
                                className="prose prose-lg max-w-none text-gray-700 leading-relaxed font-medium space-y-6 faq-content-body"
                                dangerouslySetInnerHTML={{ __html: activeItem.content }}
                            />
                            <style>{`
                                .faq-content-body p { margin-bottom: 1rem; }
                                .faq-content-body ul, .faq-content-body ol { margin-bottom: 1rem; padding-left: 1.5rem; }
                                .faq-content-body ul { list-style-type: disc; }
                                .faq-content-body ol { list-style-type: decimal; }
                                .faq-content-body a { color: #007F00; text-decoration: underline; }
                            `}</style>

                            <div className="mt-16 pt-8 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-6">
                                <div>
                                    <p className="text-sm text-gray-400 mb-1 font-bold uppercase tracking-widest">{tr.needHelp}</p>
                                    <p className="text-xl font-black text-gray-900 tracking-tight">{tr.emailUs}</p>
                                </div>
                                <button onClick={() => navigate('/get-quote')} className="bg-[#007F00] text-white px-10 py-4 rounded-full font-black text-sm uppercase tracking-wider hover:bg-[#006400] transition-all shadow-lg hover:-translate-y-1">
                                    {tr.getQuote}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar (Right) */}
                    <div className="lg:col-span-4 order-1 lg:order-2 lg:sticky lg:top-32">
                        <div className="border-l border-gray-100 pl-8">
                            <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-8">{tr.sidebarLabel}</h3>
                            <nav className="flex flex-col gap-5 max-h-[70vh] overflow-y-auto pr-4 custom-scrollbar">
                                {faqItems.map((item) => (
                                    <button
                                        key={item.id}
                                        onClick={() => {
                                            setActiveId(item.slug);
                                            window.scrollTo({ top: 0, behavior: 'smooth' });
                                        }}
                                        className={`w-full text-left text-[13px] font-bold transition-all leading-normal py-1 cursor-pointer hover:text-[#007F00] ${activeId === item.slug
                                            ? 'text-[#007F00]'
                                            : 'text-gray-500'
                                            }`}
                                    >
                                        {item.title.charAt(0).toUpperCase() + item.title.slice(1)}
                                    </button>
                                ))}
                            </nav>

                            <div className="mt-12 p-8 bg-green-50 rounded-[2rem] border border-green-100">
                                <p className="text-lg font-black text-[#007F00] mb-2 uppercase tracking-tight">{c('cta', 'heading', tr.consultantsH)}</p>
                                <p className="text-sm text-green-700/80 mb-6 font-medium leading-relaxed">{c('cta', 'description', tr.consultantsP)}</p>
                                <p className="text-sm text-green-700/80 mb-6 font-medium leading-relaxed">{tr.emailLine}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            </>
            )}
            <InternalLinks page="faq" />
        </div>
    );
};

export default FAQ;
