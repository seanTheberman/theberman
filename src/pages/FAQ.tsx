
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import SEOHead from '../components/SEOHead';
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
        seoTitle: 'BER Certificate FAQs Ireland | The BER Man',
        seoDesc: 'Find Answers to Common BER Certificate Questions, Including Costs, Timelines, and Legal Requirements',
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
                setFaqItems(data || []);
                if (data && data.length > 0) {
                    const hash = location.hash.replace('#', '');
                    const found = data.find(item => item.slug === hash);
                    setActiveId(found ? found.slug : data[0].slug);
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
                canonical={isEngland ? '/epc-faq' : isSpanish ? '/faq' : '/ber-faqs/'}
                jsonLd={[
                    {
                        '@context': 'https://schema.org',
                        '@type': 'BreadcrumbList',
                        itemListElement: isEngland ? [
                            { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.epccert.com/' },
                            { '@type': 'ListItem', position: 2, name: 'EPC Certificate FAQs', item: 'https://www.epccert.com/epc-faq' },
                        ] : [
                            { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.theberman.eu/' },
                            { '@type': 'ListItem', position: 2, name: 'BER Certificate FAQs', item: 'https://www.theberman.eu/ber-faqs/' },
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
                        name: isEngland ? 'EPC Cert' : 'The BER Man',
                        url: isEngland ? 'https://epccert.com' : 'https://www.theberman.eu',
                        logo: isEngland ? 'https://epccert.com/logo.png' : 'https://www.theberman.eu/logo.svg',
                        sameAs: isEngland
                            ? ['https://www.facebook.com/epccert', 'https://www.instagram.com/epccert']
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
                                {isSpanish ? 'Preguntas Frecuentes' : isEngland ? 'Frequently Asked Questions About EPC Certificates' : 'BER Certificate FAQs'}
                            </h1>
                            <h2 className="text-xl md:text-2xl font-black text-[#007F00] mb-8 leading-tight uppercase tracking-tight">
                                {isSpanish ? 'Preguntas Frecuentes sobre Certificados Energéticos' : isEngland ? 'Frequently Asked Questions About EPC Certificates' : 'Frequently Asked Questions About BER Certificates'}
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
                    <div className="lg:col-span-4 order-1 lg:order-2 sticky top-32">
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
        </div>
    );
};

export default FAQ;
