import {
    ArrowRight, CheckCircle2, Star, Clock,
    Zap as ZapIcon, ShieldCheck, TrendingUp,
    Users, Shield, ClipboardList, X, Search, MapPin
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useTranslation } from '../hooks/useTranslation';
import { usePageContent, cmsValue } from '../hooks/usePageContent';
import SEOHead from '../components/SEOHead';
import InternalLinks from '../components/InternalLinks';
import { HOME_SEO } from '../../seo-metadata.js';

interface PromoSettings {
    is_enabled: boolean;
    headline: string;
    sub_text: string;
    image_url: string;
    destination_url: string;
}

const HomePage = () => {
    const { t, isSpanish, tenant } = useTranslation();
    const isPortuguese = tenant === 'portugal';
    const { content: cms, loading: cmsLoading } = usePageContent('home');
    const c = (section: string, key: string, fallback: string) => cmsValue(cms, section, key, fallback);
    const [promo, setPromo] = useState<PromoSettings | null>(null);
    const [isDismissed, setIsDismissed] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const brandName = isSpanish ? 'Certificado Energético' : tenant === 'england' ? 'EPC Cert' : tenant === 'france' ? 'DPE Cert France' : tenant === 'portugal' ? 'Certificado Energia' : 'The Berman';
    const regAuthority = isSpanish ? 'CEE CAT' : tenant === 'england' ? 'accredited' : tenant === 'france' ? 'DPE' : tenant === 'portugal' ? 'ADENE' : 'SEAI';
    const homeSeo = HOME_SEO[tenant] || HOME_SEO.ireland;

    useEffect(() => {
        const fetchPromo = async () => {
            const { data } = await supabase
                .from('promo_settings')
                .select('*')
                .eq('id', 1)
                .maybeSingle();

            if (data) setPromo(data);
        };
        fetchPromo();
    }, []);

    return (
        <div className="font-sans text-gray-900 overflow-x-hidden">
            <SEOHead
                title={homeSeo.title}
                description={homeSeo.description}
                skipSiteNameSuffix
                canonical="/"
                jsonLd={[
                    {
                        '@context': 'https://schema.org',
                        '@type': 'BreadcrumbList',
                        itemListElement: [
                            { '@type': 'ListItem', position: 1, name: tenant === 'portugal' ? 'Início' : isSpanish ? 'Inicio' : tenant === 'france' ? 'Accueil' : 'Home', item: tenant === 'england' ? 'https://www.epccert.com/' : isSpanish ? 'https://www.xn--certificadoenergtico-q2b.eu/' : tenant === 'france' ? 'https://www.dpecert.fr/' : tenant === 'portugal' ? 'https://www.certificadoenergia.com/' : 'https://www.theberman.eu/' },
                        ],
                    },
                    {
                        '@context': 'https://schema.org',
                        '@type': 'WebSite',
                        name: brandName,
                        url: tenant === 'england' ? 'https://www.epccert.com' : isSpanish ? 'https://www.xn--certificadoenergtico-q2b.eu' : tenant === 'france' ? 'https://www.dpecert.fr' : tenant === 'portugal' ? 'https://www.certificadoenergia.com' : 'https://www.theberman.eu',
                        potentialAction: {
                            '@type': 'SearchAction',
                            target: tenant === 'england' ? 'https://www.epccert.com/catalogue?q={search_term_string}' : isSpanish ? 'https://www.xn--certificadoenergtico-q2b.eu/catalogue?q={search_term_string}' : tenant === 'france' ? 'https://www.dpecert.fr/catalogue?q={search_term_string}' : tenant === 'portugal' ? 'https://www.certificadoenergia.com/catalogue?q={search_term_string}' : 'https://www.theberman.eu/catalogue?q={search_term_string}',
                            'query-input': 'required name=search_term_string',
                        },
                    },
                    {
                        '@context': 'https://schema.org',
                        '@type': 'Organization',
                        name: brandName,
                        url: tenant === 'england' ? 'https://www.epccert.com' : isSpanish ? 'https://www.xn--certificadoenergtico-q2b.eu' : tenant === 'france' ? 'https://www.dpecert.fr' : tenant === 'portugal' ? 'https://www.certificadoenergia.com' : 'https://www.theberman.eu',
                        logo: tenant === 'england' ? 'https://www.epccert.com/logo.png' : isSpanish ? 'https://www.xn--certificadoenergtico-q2b.eu/logo.png' : tenant === 'france' ? 'https://www.dpecert.fr/logo.png' : tenant === 'portugal' ? 'https://www.certificadoenergia.com/logo.png' : 'https://www.theberman.eu/logo.png',
                        sameAs: tenant === 'england' ? ['https://www.facebook.com/epccert', 'https://www.instagram.com/epccert'] : isSpanish ? ['https://www.facebook.com/certificadoenergetico', 'https://www.instagram.com/certificadoenergetico'] : tenant === 'france' ? ['https://www.facebook.com/dpefrance', 'https://www.instagram.com/dpefrance'] : tenant === 'portugal' ? [] : ['https://www.facebook.com/people/The-Berman/61578159843471/', 'https://www.instagram.com/thebermanireland'],
                        contactPoint: { '@type': 'ContactPoint', email: tenant === 'england' ? 'hello@epccert.com' : isSpanish ? 'info@certificadoenergético.eu' : tenant === 'france' ? 'contact@dpefrance.eu' : tenant === 'portugal' ? 'hello@certificadoenergia.com' : 'hello@theberman.eu', contactType: 'customer service', areaServed: tenant === 'england' ? 'GB' : isSpanish ? 'ES' : tenant === 'france' ? 'FR' : tenant === 'portugal' ? 'PT' : 'IE' }
                    },
                    {
                        '@context': 'https://schema.org',
                        '@type': 'LocalBusiness',
                        name: brandName,
                        url: tenant === 'england' ? 'https://www.epccert.com' : isSpanish ? 'https://www.xn--certificadoenergtico-q2b.eu' : tenant === 'france' ? 'https://www.dpecert.fr' : tenant === 'portugal' ? 'https://www.certificadoenergia.com' : 'https://www.theberman.eu',
                        address: tenant === 'england'
                            ? { '@type': 'PostalAddress', streetAddress: 'Kings Court, 33 King Street', addressLocality: 'Blackburn', postalCode: 'BB2 2DH', addressCountry: 'GB' }
                            : { '@type': 'PostalAddress', addressCountry: isSpanish ? 'ES' : tenant === 'france' ? 'FR' : tenant === 'portugal' ? 'PT' : 'IE', addressLocality: isSpanish ? 'Madrid' : tenant === 'france' ? 'Paris' : tenant === 'portugal' ? 'Portugal' : 'Dublin' },
                        telephone: tenant === 'england' ? '+44 1217260031' : undefined,
                        priceRange: tenant === 'england' ? '££' : '€€'
                    }
                ]}
            />

            {cmsLoading ? (
                <div className="min-h-screen bg-white" />
            ) : (
            <>
            {/* 1. HERO SECTION - BERcert Conversion Style */}
            <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-28 bg-white overflow-hidden">
                {/* Subtle background accents */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-20 left-10 w-72 h-72 bg-green-50 rounded-full blur-3xl opacity-60"></div>
                    <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-50 rounded-full blur-3xl opacity-40"></div>
                </div>
                <div className="container mx-auto px-6 relative z-10">
                    <div className="max-w-4xl mx-auto text-center">
                        {tenant !== 'england' && (
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-100 rounded-full mb-8 animate-fade-in">
                                <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                                <p className="text-sm font-bold text-green-700">{c('hero', 'badge_text', isSpanish ? 'La Mayor Plataforma de Certificados Energéticos' : tenant === 'france' ? 'La Plus Grande Plateforme de DPE en France' : tenant === 'portugal' ? 'A Plataforma Líder de Certificação Energética em Portugal' : "Ireland's Largest BER Marketplace")}</p>
                            </div>
                        )}

                        <h1 className={`font-black mb-6 md:mb-8 leading-[1.1] tracking-tight ${isSpanish ? 'text-4xl md:text-5xl lg:text-6xl' : tenant === 'england' ? 'text-4xl md:text-6xl lg:text-7xl' : 'text-5xl md:text-7xl lg:text-8xl'}`} style={{ color: c('hero', 'heading_color', '#111827') }}>
                            {isSpanish ? <Link to="/services" className="hover:underline">Certificado Energético en España</Link> : (tenant === 'england' ? <Link to="/services" className="hover:underline">{c('hero', 'heading', 'Need an')}</Link> : (tenant === 'portugal' ? 'Precisa de um ' : c('hero', 'heading', (tenant === 'france' ? 'Besoin d\'un' : 'BER Cert Ireland – Get Quotes from'))))}{' '}
                            <span style={{ color: c('hero', 'highlight_color', '#007F00') }}>{isSpanish ? <Link to="/services" className="hover:underline">Técnicos Acreditados</Link> : (tenant === 'ireland' ? <Link to="/services" className="hover:underline">{c('hero', 'heading_highlight', 'Registered Assessors')}</Link> : (tenant === 'portugal' ? <Link to="/services" className="hover:underline">Certificado Energético?</Link> : c('hero', 'heading_highlight', (tenant === 'england' ? 'EPC Cert?' : tenant === 'france' ? 'DPE ?' : 'Registered Assessors'))))}</span>
                        </h1>

                        <p className={`text-gray-600 max-w-2xl mx-auto leading-relaxed font-medium ${isSpanish ? 'text-base md:text-lg mb-6 md:mb-8' : 'text-lg md:text-2xl mb-10 md:mb-12'}`}>
                            {isSpanish ? (
                                <>La forma más rápida y fiable de obtener tu Certificado Energético. Los mejores precios garantizados de más de 1000 certificadores en toda España. <Link to="/get-quote" className="text-[#007F00] font-bold hover:underline">reserva online al instante</Link>.</>
                            ) : (tenant === 'england' ? (
                                <>{c('hero', 'subheading', "England's largest EPC website | Fast, Reliable & Hassle-Free")}</>
                            ) : (tenant === 'portugal' ? <>Encontre, de forma simples e segura, um <Link to="/catalogue" className="text-[#007F00] font-bold hover:underline">Perito Qualificado</Link> na sua região.</> : c('hero', 'subheading', (tenant === 'france'
                                ? 'Le moyen le plus rapide et le plus fiable d\'obtenir votre DPE. Comparez les devis compétitifs de diagnostiqueurs certifiés près de chez vous.'
                                : "Ireland's largest BER marketplace. Instantly compare quotes from trusted SEAI-registered assessors near you and book your BER assessment in minutes."))))}
                        </p>

                        {(isSpanish || isPortuguese) && (
                            <p className="text-gray-500 max-w-2xl mx-auto leading-relaxed text-sm md:text-base mb-6 md:mb-8">
                                {isSpanish ? <>Conectamos a propietarios con <Link to="/services" className="text-[#007F00] font-bold hover:underline">técnicos certificados</Link> en toda España para obtener su certificado energético de forma rápida y sencilla.</> : <>Receba propostas de <Link to="/energy-advisor" className="text-[#007F00] font-bold hover:underline">Peritos Qualificados</Link> disponíveis na sua região.</>}
                            </p>
                        )}
                        {tenant === 'ireland' && (
                            <p className="text-gray-500 max-w-2xl mx-auto leading-relaxed text-sm md:text-base mb-6 md:mb-8">
                                The Berman is Ireland's largest BER website, built to make finding a BER certificate simple, fast and affordable. Whether you need an energy certificate for a house sale, a rental property, a new build, or an SEAI grant application, we connect you directly with qualified, SEAI registered assessors across every county in the country.
                            </p>
                        )}
                        {tenant === 'england' && (
                            <p className="text-gray-600 max-w-2xl mx-auto leading-relaxed font-medium text-lg md:text-2xl mb-8 md:mb-10">
                                {c('hero', 'benefit_1', 'Lowest Prices Guaranteed')} | {c('hero', 'benefit_2', '100+ Accredited Assessors Nationwide')} | {c('hero', 'benefit_3', 'Choose your Date & Time')}
                            </p>
                        )}

                        {/* Trust indicators - Ireland only */}
                        {tenant === 'ireland' && (
                            <div className="flex flex-wrap items-center justify-center gap-4 mb-8 md:mb-10">
                                <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
                                    <CheckCircle2 size={18} className="text-[#007F00]" />
                                    100+ SEAI Assessors
                                </div>
                                <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
                                    <CheckCircle2 size={18} className="text-[#007F00]" />
                                    Compare Quotes Instantly
                                </div>
                                <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
                                    <CheckCircle2 size={18} className="text-[#007F00]" />
                                    Book Online in Minutes
                                </div>
                            </div>
                        )}

                        <p className={`font-bold animate-fade-in ${isSpanish ? 'my-4 text-lg md:text-xl' : tenant === 'england' ? 'my-4 text-lg md:text-xl' : 'my-6 text-2xl md:text-3xl'}`} style={{ color: c('hero', 'highlight_color', '#007F00') }}>
                            {isPortuguese
                                ? 'Receba propostas de Peritos Qualificados disponíveis na sua região.'
                                : c('hero', 'cta_line', isSpanish
                                    ? 'Obtén los mejores presupuestos de certificadores locales hoy mismo.'
                                    : (tenant === 'england'
                                        ? 'Get the Best Quotes from local EPC Assessors today.'
                                        : tenant === 'france'
                                            ? 'Obtenez les meilleurs devis de diagnostiqueurs locaux dès aujourd\'hui'
                                            : 'Get competitive quotes from SEAI-registered local BER Assessors Today'))}
                        </p>
                        {/* Dual Primary CTAs */}
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-2xl mx-auto mb-16 px-4">
                            <Link to="/get-quote" className="w-full sm:w-auto">
                                <button className="w-full sm:px-16 py-8 bg-[#007F00] hover:bg-[#006400] text-white text-2xl md:text-3xl font-black rounded-[2rem] shadow-2xl shadow-green-100 transition-all transform hover:-translate-y-2 hover:scale-105 flex items-center justify-center gap-4 cursor-pointer border-4 border-white/10">
                                    {isPortuguese ? 'Pedir Orçamento Grátis' : tenant === 'england' ? c('hero', 'cta_button_text', 'Get EPC Quotes') : t('get_quote')}
                                    <ArrowRight size={32} strokeWidth={3} />
                                </button>
                            </Link>
                        </div>

                        {/* Fast Benefits Row */}
                        {tenant !== 'england' && (
                        <div className="flex flex-wrap justify-center gap-x-12 gap-y-6">
                            {[
                                { icon: <Users size={20} />, text: c('hero', 'benefit_1', isSpanish ? '1000+ Certificadores en Toda España' : (tenant === 'england' ? '100+ Accredited EPC Assessors' : tenant === 'france' ? '100+ Diagnostiqueurs en France' : tenant === 'portugal' ? '100+ Peritos em Todo o País' : '100+ Assessors Nationwide')) },
                                { icon: <ShieldCheck size={20} />, text: c('hero', 'benefit_2', isSpanish ? 'SOLO CERTIFICADORES ACREDITADOS' : (tenant === 'england' ? 'ACCREDITED EPC ASSESSORS ONLY' : tenant === 'france' ? 'DIAGNOSTIQUEURS CERTIFIÉS UNIQUEMENT' : tenant === 'portugal' ? 'SÓ PERITOS QUALIFICADOS' : 'SEAI REGISTERED ASSESSORS ONLY')) },
                                { icon: <Clock size={20} />, text: c('hero', 'benefit_3', isSpanish ? 'Elige tu Fecha y Hora' : (tenant === 'england' ? 'Choose Your Appointment Time' : tenant === 'france' ? 'Choisissez votre Date et Heure' : tenant === 'portugal' ? 'Escolha a Data e Hora' : 'Choose Your Date & Time')) }
                            ].map((item, i) => (
                                <div key={i} className="flex items-center gap-2 text-gray-500 font-bold text-sm tracking-wide uppercase">
                                    <span className="text-[#007F00] flex-shrink-0 w-5 h-5 inline-flex items-center justify-center">{item.icon}</span>
                                    {item.text}
                                </div>
                            ))}
                        </div>
                        )}
                    </div>
                </div>
            </section>

            {/* 2. HOW IT WORKS - 4 Step Linear Flow */}
            <section className="py-24 bg-gray-50 border-y border-gray-100">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-20">
                        <span className="text-[#007F00] font-bold uppercase tracking-widest text-sm mb-4 block">{c('how_it_works', 'tag', isSpanish ? 'Proceso Sencillo' : tenant === 'france' ? 'Processus Simple' : tenant === 'portugal' ? 'Processo Simples' : 'Simple Process')}</span>
                        <h2 className="text-4xl md:text-5xl font-black text-gray-900">{isSpanish ? <Link to="/services" className="hover:underline">Cómo Obtener tu Certificado Energético</Link> : (tenant === 'portugal' ? <Link to="/services" className="hover:underline">Como Funciona</Link> : c('how_it_works', 'heading', (tenant === 'england' ? 'How to Arrange an EPC Assessment in England' : tenant === 'france' ? 'Comment ça Marche' : 'How to Get Your BER Certificate')))}</h2>
                        {isSpanish && (
                            <p className="text-gray-600 mt-4 max-w-2xl mx-auto font-medium">
                                <Link to="/services" className="text-[#007F00] font-bold hover:underline">Obtén tu Certificado Energético</Link> de forma rápida y sencilla. Elige la fecha de tu inspección, proporciona los datos de tu inmueble, <Link to="/pricing" className="text-[#007F00] font-bold hover:underline">recibe presupuestos</Link> de profesionales y <Link to="/get-quote" className="text-[#007F00] font-bold hover:underline">reserva la opción que mejor se adapte a tus necesidades</Link>.
                            </p>
                        )}
                        {tenant === 'england' && (
                            <p className="text-gray-600 mt-4 max-w-2xl mx-auto font-medium">
                                <Link to="/services" className="text-[#007F00] font-bold hover:underline">EPC Cert</Link> helps property owners, landlords, and businesses <Link to="/get-quote" className="text-[#007F00] font-bold hover:underline">compare quotes</Link> from accredited EPC assessors across England. Once you submit your details, you&apos;ll receive quotes from qualified professionals, so you can choose the right assessor and book your EPC assessment online in minutes.
                            </p>
                        )}
                        {tenant !== 'england' && !isSpanish && (
                            <p className="text-gray-600 mt-4 max-w-2xl mx-auto font-medium">
                                {tenant === 'france'
                                    ? 'DPE Cert France aide les propriétaires à trouver et comparer des diagnostiqueurs certifiés. Envoyez vos détails et recevez des devis de professionnels qualifiés, pour choisir le bon diagnostiqueur et réserver votre diagnostic en ligne en quelques minutes.'
                                    : tenant === 'portugal'
                                    ? (<><Link to="/services" className="text-[#007F00] font-bold hover:underline">Certificado Energia</Link> ajuda os proprietários a encontrar e comparar peritos qualificados. Envie os seus dados e receba orçamentos de profissionais qualificados, para escolher o perito ideal e <Link to="/get-quote" className="text-[#007F00] font-bold hover:underline">marcar a sua avaliação</Link> online em minutos.</>)
                                    : "The BER Man helps property owners find and compare trusted BER assessors. Once you submit your details, you'll receive quotes from qualified professionals, so you can choose the right assessor and book your assessment online in minutes."}
                            </p>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
                        {/* Connecting Line (Desktop) */}
                        <div className="hidden md:block absolute top-12 left-[12%] right-[12%] h-0.5 bg-gray-200 -z-0"></div>

                        {[
                            {
                                step: "01",
                                icon: <Clock size={32} />,
                                title: isSpanish ? "Elige la Fecha de tu Inspección" : c('how_it_works', 'step1_title', (tenant === 'england' ? "Choose Your EPC Assessment Date" : tenant === 'france' ? "Choisissez la Date" : tenant === 'portugal' ? "Envie os dados do imóvel" : "Select Date")),
                                desc: c('how_it_works', 'step1_desc', isSpanish ? "Indícanos tu fecha y hora preferida para la visita al inmueble." : (tenant === 'england' ? "Select a convenient date and time for your EPC assessment." : tenant === 'france' ? "Indiquez-nous votre date et heure préférées pour la visite du bien." : tenant === 'portugal' ? "Partilhe as informações do seu imóvel em menos de 1 minuto." : "Tell us your preferred date & time for assessment.")),
                                link: isSpanish ? '/get-quote' : (tenant === 'england' || tenant === 'ireland' ? '/get-quote' : tenant === 'portugal' ? '/get-quote' : null)
                            },
                            {
                                step: "02",
                                icon: <ClipboardList size={32} />,
                                title: isSpanish ? "Datos del Inmueble" : c('how_it_works', 'step2_title', (tenant === 'england' ? "Provide Property Details" : tenant === 'france' ? "Envoyez les Détails" : tenant === 'portugal' ? "Escolha a data" : "Property Details")),
                                desc: c('how_it_works', 'step2_desc', isSpanish ? "Comparte la información de tu propiedad en menos de 1 minuto." : (tenant === 'england' ? "Share key details about your property so assessors can provide accurate quotes." : tenant === 'france' ? "Partagez les informations de votre bien en moins de 1 minute." : tenant === 'portugal' ? "Indique-nos a data e hora preferidas para a visita ao imóvel." : "Tell us about your property.")),
                                link: isSpanish ? '/contact-us' : (tenant === 'england' || tenant === 'ireland' ? '/get-quote' : tenant === 'portugal' ? '/contact-us' : null)
                            },
                            {
                                step: "03",
                                icon: <TrendingUp size={32} />,
                                title: isSpanish ? "Recibir presupuestos" : c('how_it_works', 'step3_title', (tenant === 'england' ? "Compare Accredited EPC Quotes" : tenant === 'france' ? "Recevez des Devis" : tenant === 'portugal' ? "Receba propostas" : "Receive Quotes")),
                                desc: c('how_it_works', 'step3_desc', isSpanish ? "Recibe precios competitivos de certificadores locales." : (tenant === 'england' ? "Receive competitive quotes from accredited EPC assessors in your area." : tenant === 'france' ? "Recevez des devis compétitifs de diagnostiqueurs certifiés près de chez vous." : tenant === 'portugal' ? "Receba preços competitivos de peritos qualificados na sua zona." : "Receive competitive prices from local BER assessors.")),
                                link: isSpanish ? '/pricing' : (tenant === 'england' || tenant === 'ireland' ? '/pricing' : tenant === 'portugal' ? '/pricing' : null)
                            },
                            {
                                step: "04",
                                icon: <CheckCircle2 size={32} />,
                                title: isSpanish ? "Reserve su inspección" : c('how_it_works', 'step4_title', (tenant === 'england' ? "Confirm Your EPC Appointment" : tenant === 'france' ? "Réservez en Ligne" : tenant === 'portugal' ? "Escolha o perito" : "Book Assessment")),
                                desc: c('how_it_works', 'step4_desc', isSpanish ? "Elige tu presupuesto favorito y confirma al instante." : (tenant === 'england' ? "Choose your preferred assessor and confirm your EPC appointment online." : tenant === 'portugal' ? "Escolha o seu orçamento preferido e confirme instantaneamente." : "Confirm and arrange your assessment.")),
                                link: isSpanish ? '/get-quote' : (tenant === 'england' || tenant === 'ireland' ? '/get-quote' : tenant === 'portugal' ? '/energy-advisor' : null)
                            }
                        ].map((item, i) => (
                            <Link key={i} to={item.link || '#'} className="relative z-10 bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all group overflow-hidden cursor-pointer block">
                                <div className="absolute top-0 right-0 -mr-4 -mt-4 text-6xl md:text-7xl font-black text-gray-50 group-hover:text-green-50 transition-colors -z-0">
                                    {item.step}
                                </div>
                                <div className="w-14 h-14 md:w-16 md:h-16 bg-green-50 text-[#007F00] rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:bg-[#007F00] group-hover:text-white transition-all relative z-10">
                                    {item.icon}
                                </div>
                                <h3 className="text-lg md:text-xl font-black text-gray-900 mb-3 relative z-10">{item.title}</h3>
                                <p className="text-sm md:text-base text-gray-500 font-medium leading-relaxed relative z-10">{item.desc}</p>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* 3. BENEFITS / WHY CHOOSE US */}
            <section className="py-24 bg-white">
                <div className="container mx-auto px-6">
                    <div className="flex flex-col lg:flex-row items-center gap-16">
                        <div className="flex-1">
                            <span className="text-[#007F00] font-bold uppercase tracking-widest text-sm mb-4 block">{c('benefits', 'tag', isSpanish ? 'La Ventaja' : tenant === 'france' ? 'L\'Avantage' : 'The Advantage')}</span>
                            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-8 leading-tight">
                                {isSpanish ? <Link to="/about-us" className="hover:underline">¿Por qué Organizar tu Certificado Energético con CertificadoEnergético.eu?</Link> : (tenant === 'portugal' ? <>Porque é que os proprietários confiam em <span className="text-[#007F00]"><Link to="/services" className="hover:underline">Certificados Energéticos</Link></span>?</> : (
                                    <>
                                    {tenant === 'england' ? <Link to="/about-us" className="hover:underline">{c('benefits', 'heading', 'Why Property Owners Across England Trust')}</Link> : c('benefits', 'heading', (tenant === 'france' ? 'Pourquoi les Propriétaires Font Confiance à' : 'Why Homeowners Trust'))} <br />
                                    <span className="text-[#007F00]">{tenant === 'england' ? <Link to="/about-us" className="hover:underline">{c('benefits', 'heading_highlight', 'EPC Cert')}</Link> : c('benefits', 'heading_highlight', (tenant === 'france' ? 'DPE Cert France' : 'The BER Man'))}</span>
                                    </>
                                ))}
                            </h2>
                            <div className="space-y-6">
                                {[
                                    { title: isSpanish ? "Compara Múltiples Presupuestos" : c('benefits', 'benefit1_title', (tenant === 'england' ? "Compare Multiple Quotes and Save" : tenant === 'france' ? "Comparez Plusieurs Devis" : tenant === 'portugal' ? "Compare vários orçamentos" : "Compare Multiple Quotes")), desc: c('benefits', 'benefit1_desc', isSpanish ? "Recibe presupuestos de certificadores y elige la opción que mejor se adapte a tu inmueble." : (tenant === 'england' ? "Receive quotes from accredited EPC assessors and choose the option that best suits your property and budget." : tenant === 'france' ? "Recevez des devis de diagnostiqueurs certifiés et choisissez l'option qui convient le mieux à votre bien et à votre budget." : "Receive quotes from trusted assessors and find the option that suits your needs.")), link: isSpanish ? '/pricing' : (tenant === 'england' || tenant === 'ireland' || tenant === 'portugal' ? '/pricing' : null) },
                                    { title: isSpanish ? "Técnicos Competentes Acreditados" : c('benefits', 'benefit2_title', (tenant === 'england' ? "Accreditation EPC Assessors Only" : tenant === 'france' ? "Diagnostiqueurs Certifiés Uniquement" : tenant === 'portugal' ? "Peritos qualificados e verificados" : "SEAI-registered BER Assessors")), desc: c('benefits', 'benefit2_desc', isSpanish ? "Todos los certificadores están plenamente acreditados y verificados." : (tenant === 'england' ? "All assessors are accredited, vetted and qualified to issue Energy Performance Certificates in England." : tenant === 'france' ? "Tous les diagnostiqueurs sont certifiés et vérifiés." : "Every assessor is verified to help maintain high service standards.")), link: isSpanish ? '/services' : (tenant === 'england' || tenant === 'ireland' || tenant === 'portugal' ? '/services' : null) },
                                    { title: isSpanish ? "Reserva con Confianza" : c('benefits', 'benefit3_title', (tenant === 'england' ? "Local Assessors, National Coverage" : tenant === 'france' ? "Diagnostiqueurs Locaux, Couverture Nationale" : tenant === 'portugal' ? "Apoio durante o processo" : "Book with Confidence")), desc: c('benefits', 'benefit3_desc', isSpanish ? "Te aseguramos un servicio profesional o te devolvemos tu dinero." : (tenant === 'england' ? "Connect with accredited EPC assessors serving your local area and across England." : tenant === 'france' ? "Connectez-vous avec des diagnostiqueurs certifiés près de chez vous et partout en France." : "We're committed to helping property owners connect with trusted professionals.")), link: isSpanish ? '/locations' : (tenant === 'england' ? '/locations' : tenant === 'ireland' || tenant === 'portugal' ? '/energy-advisor' : null) },
                                    { title: isSpanish ? "Reserva Rápida Online" : c('benefits', 'benefit4_title', (tenant === 'england' ? "Book Your EPC Assessment Online" : tenant === 'france' ? "Réservation en Ligne Instantanée" : tenant === 'portugal' ? "Marcação online simples" : "Quick Online Booking")), desc: c('benefits', 'benefit4_desc', isSpanish ? "Sin llamadas de teléfono de ida y vuelta. Reserva todo en tiempo real." : (tenant === 'england' ? "Request quotes, review assessor details and confirm your EPC assessment online at your convenience." : tenant === 'france' ? "Sans appels téléphoniques. Réservez tout en temps réel." : "Choose an appointment time that fits your schedule.")), link: isSpanish ? '/get-quote' : (tenant === 'england' || tenant === 'ireland' || tenant === 'portugal' ? '/get-quote' : null) }
                                ].map((benefit, i) => (
                                    <div key={i} className="flex gap-4">
                                        <div className="mt-1 flex-shrink-0 w-6 h-6 rounded-full bg-green-100 flex items-center justify-center text-[#007F00]">
                                            <CheckCircle2 size={16} />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-900">{benefit.link ? <Link to={benefit.link} className="hover:text-[#007F00] hover:underline">{benefit.title}</Link> : benefit.title}</h3>
                                            <p className="text-gray-500 font-medium">{benefit.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="flex-1 w-full max-w-xl">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-4 pt-8">
                                    <div className="bg-gray-50 p-8 rounded-3xl border border-gray-100">
                                        <div className="text-4xl font-black text-[#007F00] mb-2">{c('benefits', 'stat1_value', isSpanish ? '1k+' : tenant === 'portugal' ? '1k+' : '1k+')}</div>
                                        <div className="text-sm font-bold text-gray-500 uppercase">{c('benefits', 'stat1_label', isSpanish ? 'Usuarios Atendidos' : tenant === 'france' ? 'Utilisateurs Servis' : tenant === 'portugal' ? 'Utilizadores Atendidos' : 'Users Served')}</div>
                                    </div>
                                    <div className="bg-green-50 p-8 rounded-3xl border border-green-100">
                                        <div className="text-4xl font-black text-[#007F00] mb-2">{c('benefits', 'stat2_value', isSpanish ? '1000+' : tenant === 'portugal' ? '100+' : '100+')}</div>
                                        <div className="text-sm font-bold text-gray-500 uppercase">{c('benefits', 'stat2_label', isSpanish ? 'Certificadores' : tenant === 'france' ? 'Diagnostiqueurs' : tenant === 'portugal' ? 'Peritos Qualificados' : 'Assessors')}</div>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div className="bg-[#007F00] p-8 rounded-3xl text-white shadow-xl shadow-green-100">
                                        <div className="text-4xl font-black mb-2">{c('benefits', 'stat3_value', '4.9/5')}</div>
                                        <div className="text-sm font-bold opacity-80 uppercase tracking-widest">{c('benefits', 'stat3_label', isSpanish ? 'Valoración Media' : tenant === 'france' ? 'Note Moyenne' : tenant === 'portugal' ? 'Classificação Média' : 'Average Rating')}</div>
                                        <div className="flex gap-1 mt-4">
                                            {[1, 2, 3, 4, 5].map(s => <Star key={s} size={16} fill="white" />)}
                                        </div>
                                    </div>
                                    <div className="bg-gray-50 p-8 rounded-3xl border border-gray-100">
                                        <div className="text-4xl font-black text-gray-900 mb-2">{isSpanish ? 'Rápido' : tenant === 'france' ? 'Rapide' : tenant === 'portugal' ? 'Rápido' : 'Fast'}</div>
                                        <div className="text-sm font-bold text-gray-500 uppercase">{isSpanish ? 'Servicio' : tenant === 'france' ? 'Service' : tenant === 'portugal' ? 'Serviço' : 'Turnaround'}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 4. TRUSTPILOT STYLE REVIEWS */}
            <section className="py-24 bg-gray-50">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-16">
                        <div className="flex items-center justify-center gap-2 mb-4">
                            <Star className="text-green-500 fill-green-500" size={32} />
                            <h2 className="text-3xl font-black">{c('reviews', 'heading', isSpanish ? 'Excelente' : (tenant === 'england' ? 'Trusted by Property Owners Across England' : tenant === 'france' ? 'Excellent' : tenant === 'portugal' ? 'Excelente' : 'What homeowners say about The Berman'))}</h2>
                        </div>
                        <p className="text-gray-500 font-bold uppercase tracking-widest text-sm">{c('reviews', 'subheading', isSpanish ? 'Basado en 1.000 valoraciones verificadas de clientes' : tenant === 'france' ? 'Basé sur 1.000 avis clients vérifiés' : 'Based on 1,000+ verified customer reviews and ratings')}</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 items-stretch">
                        {[
                            {
                                author: c('reviews', 'review1_author', isSpanish ? "Carlos García" : tenant === 'france' ? "Pierre Dubois" : "Michael Byrne"),
                                location: c('reviews', 'review1_location', isSpanish ? "Madrid" : tenant === 'france' ? "Paris" : "Dublin"),
                                quote: c('reviews', 'review1_quote', isSpanish ? "He usado la plataforma dos veces. En ambas recibí varios presupuestos en menos de una hora y el certificador fue muy profesional. Ahorré unos 30€ respecto a otras webs." : tenant === 'france' ? "J'ai utilisé la plateforme deux fois. À chaque fois, j'ai reçu plusieurs devis en moins d'une heure et le diagnostiqueur était très professionnel. J'ai économisé environ 30€ par rapport aux autres sites." : "Used the platform twice now. Both times I got several quotes within an hour and the assessor was super professional. Saved about €30 vs other sites."),
                                rating: 5
                            },
                            {
                                author: c('reviews', 'review2_author', isSpanish ? "Lucía Martínez" : tenant === 'france' ? "Marie Lefevre" : "Sarah O'Toole"),
                                location: c('reviews', 'review2_location', isSpanish ? "Barcelona" : tenant === 'france' ? "Lyon" : "Cork"),
                                quote: c('reviews', 'review2_quote', isSpanish ? "Extremadamente fácil de usar. Me encantó poder ver la acreditación y las reseñas de los certificadores antes de reservar. Muy recomendable para propietarios." : tenant === 'france' ? `Extrêmement facile à utiliser. J'ai pu voir les certifications et les avis des diagnostiqueurs avant de réserver. Très recommandé pour les propriétaires.` : `Extremely easy to use. I loved that I could see the ${regAuthority} registration numbers and reviews for the assessors before booking. Highly recommended for landlords.`),
                                rating: 5
                            },
                            {
                                author: c('reviews', 'review3_author', isSpanish ? "Javier Fernández" : tenant === 'france' ? "Thomas Bernard" : "James Murphy"),
                                location: c('reviews', 'review3_location', isSpanish ? "Valencia" : tenant === 'france' ? "Marseille" : "Galway"),
                                quote: c('reviews', 'review3_quote', isSpanish ? "Rapidez y precios competitivos. El portal hace muy sencillo gestionarlo todo y el certificado se emitió en las 24 horas siguientes a la inspección." : tenant === 'france' ? "Rapidité et prix compétitifs. Le portail rend la gestion très simple et le certificat a été émis dans les 24 heures suivant l'inspection." : "Fast turnaround and competitive pricing. The portal makes it very simple to manage everything and the certificate was issued within 24 hours of inspection."),
                                rating: 5
                            }
                        ].map((testi, i) => (
                            <div key={i} className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm relative group overflow-hidden flex flex-col h-full cursor-pointer">
                                <div className="flex gap-1 mb-4">
                                    {[1, 2, 3, 4, 5].map(s => <Star key={s} size={16} className="text-green-500 fill-green-500" />)}
                                </div>
                                <p className="text-gray-700 italic mb-6 font-medium leading-relaxed flex-1">"{testi.quote}"</p>
                                <div className="flex items-center gap-3 mt-auto">
                                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-[#007F00] font-black">
                                        {testi.author[0]}
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900 leading-none">{testi.author}</p>
                                        <p className="text-xs text-gray-500 mt-1">{testi.location}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ASSESSOR CTA SECTION */}
            <aside className="py-20 bg-gray-50 border-b border-gray-100">
                <div className="container mx-auto px-6 text-center">
                    {tenant === 'england' ? (
                        <>
                        <h3 className="text-3xl md:text-4xl font-black text-[#007F00] mb-4">Join Your Network of <Link to="/services" className="hover:underline">Accredited EPC Assessors</Link></h3>
                        <p className="text-gray-600 font-medium mb-8 max-w-2xl mx-auto">
                            Expand your reach by <Link to="/contact-us" className="text-[#007F00] font-bold hover:underline">joining our network of accredited EPC assessors</Link>. Receive local assessment opportunities and connect with property owners across England.
                        </p>
                        </>
                    ) : (
                    <>
                    <p className="text-3xl md:text-4xl font-black text-[#007F00] mb-4">{isSpanish ? <Link to="/energy-advisor" className="hover:underline">¿Eres técnico certificador?</Link> : (tenant === 'portugal' ? 'Junte-se à sua rede de avaliadores credenciados de Certificados de Desempenho Energético.' : c('assessor_cta', 'heading', tenant === 'france' ? 'Vous Êtes Diagnostiqueur DPE ?' : 'Are You a BER Assessor?'))}</p>
                    <p className="text-gray-600 font-medium mb-8 max-w-2xl mx-auto">
                        {isSpanish ? (
                            <>Regístrate y recibe leads de <Link to="/contact-us" className="text-[#007F00] font-bold hover:underline">propietarios que buscan certificados energéticos</Link>, directamente en tu teléfono.</>
                        ) : (tenant === 'portugal' ? <>Registe-se na plataforma <Link to="/energy-advisor" className="text-[#007F00] font-bold hover:underline">Certificado Energia</Link> e receba pedidos de clientes da sua região diretamente no seu dispositivo.</> : c('assessor_cta', 'description', (tenant === 'france' ? 'Inscrivez-vous et recevez des missions locales directement sur votre téléphone.' : 'SEAI-registered assessors can join our nationwide network and connect with property owners looking for BER assessments in their area.')))}
                    </p>
                    </>
                    )}
                    <Link to={isSpanish ? '/get-quote' : (tenant === 'england' ? '/contact-us' : (tenant === 'ireland' ? '/about-us' : c('assessor_cta', 'cta_url', '/signup?role=contractor')))}>
                        <button className="px-12 py-4 border-2 border-[#007F00] text-[#007F00] hover:bg-[#007F00] hover:text-white font-black rounded-xl transition-all shadow-sm hover:shadow-lg transform hover:-translate-y-0.5 cursor-pointer">
                            {isSpanish ? 'Registrarse como Técnico' : (tenant === 'ireland' ? 'Register as a BER Assessor' : c('assessor_cta', 'cta_text', (tenant === 'england' ? 'Join as an EPC Assessor' : tenant === 'france' ? 'Rejoindre Maintenant' : 'Register as an Assessor')))}
                        </button>
                    </Link>
                </div>
            </aside>

            {/* Solar Panel Promotion - temporarily removed */}

            {/* Selling Home Promotion */}
            {/* <section className="py-24 bg-white relative overflow-hidden">
                <div className="container mx-auto px-6">
                    <div className="bg-gray-50 rounded-[3rem] p-8 md:p-16 border border-gray-100 relative overflow-hidden flex flex-col md:flex-row items-center gap-12">
                        <div className="absolute top-0 left-0 w-32 h-32 bg-[#007EF0]/5 rounded-full blur-3xl"></div>

                        <div className="md:w-3/5 relative z-10">
                            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-6 leading-tight uppercase tracking-tight">
                                Considering selling <br /> your home?
                            </h2>
                            <p className="text-gray-600 text-lg mb-10 leading-relaxed">
                                We've partnered with <span className="font-bold text-[#007F00]">Berman Property</span> to provide you with seamless property services. Get a professional valuation and expert advice on how to maximize your home's value before you sell.
                            </p>
                            <a
                                href="https://bermanproperty.ie"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-3 bg-gray-900 hover:bg-black text-white px-10 py-5 rounded-2xl font-black text-xs md:text-sm uppercase tracking-widest transition-all active:scale-95 shadow-2xl"
                            >
                                Visit Property Partner
                                <ChevronRight size={18} />
                            </a>
                        </div>

                        <div className="md:w-2/5">
                            <div className="bg-white p-4 rounded-[2rem] shadow-xl border border-gray-100 rotate-2 hover:rotate-0 transition-transform duration-500">
                                <img
                                    src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=600"
                                    alt="Modern Home Interior"
                                    className="rounded-[1.5rem] w-full h-[300px] object-cover"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section> */}

            {/* 6. HOME ENERGY CATALOG SECTION */}
            <section className="py-24 bg-gray-50 overflow-hidden relative border-t border-gray-100">
                <div className="container mx-auto px-6 relative z-10">
                    <div className="flex flex-col lg:flex-row items-center gap-16">
                        <div className="flex-1">
                            <span className="inline-block px-4 py-1.5 rounded-full bg-[#007F00]/10 text-[#007F00] text-xs font-black uppercase tracking-widest mb-6">{c('catalogue_promo', 'tag', isSpanish ? 'Explora Nuestra Red' : (tenant === 'england' ? 'Explore Our Network' : tenant === 'france' ? 'Explorez Notre Réseau' : 'Explore Our Network'))}</span>
                            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 mb-8 leading-tight">
                                {isSpanish ? (
                                    <>
                                    Mejora tu Calificación Energética con <Link to="/energy-advisor" className="text-[#007F00] hover:underline">Especialistas de Confianza</Link>
                                    </>
                                ) : (tenant === 'portugal' ? <Link to="/catalogue" className="hover:underline">Improve Your EPC Rating</Link> : (
                                    <>
                                    {tenant === 'england' ? <Link to="/catalogue" className="hover:underline">{c('catalogue_promo', 'heading', 'Improve Your EPC Rating with Trusted Energy Efficiency Specialists')}</Link> : c('catalogue_promo', 'heading', (tenant === 'france' ? 'Trouvez les Meilleurs' : 'Home Energy Upgrade Services Across Ireland'))} <br />
                                    <span className="text-[#007F00]">{c('catalogue_promo', 'heading_highlight', (tenant === 'france' ? 'Partenaires en Efficacité Énergétique.' : ''))}</span>
                                    </>
                                ))}
                            </h2>
                            <p className="text-lg md:text-xl text-gray-500 font-medium leading-relaxed mb-10 max-w-2xl">
                                {isSpanish ? (
                                    <>Accede a nuestra <Link to="/energy-advisor" className="text-[#007F00] font-bold hover:underline">red de especialistas en eficiencia energética</Link>. Desde <Link to="/services" className="text-[#007F00] font-bold hover:underline">instaladores de placas solares</Link> hasta especialistas en aislamiento, encuentra el colaborador adecuado para el camino de tu hogar hacia la eficiencia.</>
                                ) : (tenant === 'england' ? <>Access our curated network of trusted home energy specialists. From solar panel installers to insulation experts, find the right partner to improve your property&apos;s energy efficiency and <Link to="/energy-advisor" className="text-[#007F00] font-bold hover:underline">support better EPC performance</Link>.</> : (tenant === 'portugal' ? <>Aceda ao <Link to="/energy-advisor" className="text-[#007F00] font-bold hover:underline">catálogo de empresas e profissionais</Link> Certificado Energia. Desde instaladores de painéis solares a especialistas em isolamento, encontre o parceiro ideal para melhorar a eficiência energética da sua casa.</> : c('catalogue_promo', 'description', (tenant === 'england' ? "Access our curated network of trusted home energy specialists. From solar panel installers to insulation experts, find the right partner to improve your property's energy efficiency and support better EPC performance." : tenant === 'france' ? "Accédez à notre réseau sélectionné d'entreprises certifiées en efficacité énergétique. Des installateurs de panneaux solaires aux spécialistes de l'isolation, trouvez le bon partenaire pour le parcours d'efficacité énergétique de votre maison." : "Access our curated catalogue of certified home energy businesses. From solar panel installers to insulation specialists, find the right partner for your home's journey to efficiency."))))}
                            </p>
                            <div className="flex flex-wrap gap-4">
                                <Link to="/catalogue">
                                    <button className="px-10 py-5 bg-[#007F00] text-white font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-[#006400] transition-all shadow-xl shadow-green-100 flex items-center gap-3 active:scale-95 cursor-pointer">
                                        {isSpanish ? 'Explora nuestro catálogo' : (tenant === 'england' || tenant === 'ireland' || tenant === 'portugal' ? 'Explore Our Catalogue' : tenant === 'france' ? 'Explorer le Catalogue' : 'Browse Catalogue')}
                                        <ArrowRight size={18} />
                                    </button>
                                </Link>
                                <Link to={isSpanish ? '/contact-us' : (tenant === 'england' ? '/contact-us' : (tenant === 'ireland' ? '/about-us' : tenant === 'portugal' ? '/contact-us' : '/signup?role=business'))}>
                                    <button className="px-10 py-5 bg-white text-gray-900 border-2 border-[#007F00] font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-green-50 transition-all flex items-center gap-3 active:scale-95 cursor-pointer">
                                        {isSpanish ? 'Registra tu Negocio' : tenant === 'france' ? 'Inscrire votre Entreprise' : tenant === 'portugal' ? 'Registe a sua empresa' : 'Register your Business'}
                                    </button>
                                </Link>
                                <Link to="/energy-advisor">
                                    <button className="px-10 py-5 bg-white text-gray-900 border-2 border-gray-100 font-black text-xs uppercase tracking-widest rounded-2xl hover:border-[#007F00] transition-all flex items-center gap-3 active:scale-95 cursor-pointer">
                                        {isSpanish ? 'Habla con un Asesor' : tenant === 'france' ? 'Parler à un Conseiller' : tenant === 'portugal' ? 'Fale com um Consultor' : 'Speak to Advisor'}
                                    </button>
                                </Link>
                            </div>
                        </div>
                        <div className="hidden lg:block flex-1 relative w-full max-w-xl mx-auto">
                            <div className="relative aspect-square bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-gray-100 group">
                                <img
                                    src={c('catalogue_promo', 'image_url', `/catalogue-${tenant}.png`)}
                                    alt={tenant === 'england' ? 'Residential EPC assessment showing energy efficiency rating recommendations for a property owner - EPC Cert' : tenant === 'portugal' ? 'Melhorias Energéticas em Casa' : 'Home Energy Upgrades'}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                    loading="lazy"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                                <div className="absolute bottom-10 left-10 right-10">
                                    <div className="bg-white/95 p-6 rounded-3xl shadow-lg border border-white/20">
                                        <div className="flex items-center gap-4 mb-3">
                                            <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center text-[#007F00]">
                                                <Search size={24} />
                                            </div>
                                            <div>
                                                <h4 className="text-lg font-black text-gray-900 leading-none">{isSpanish ? 'Búsqueda Inteligente' : tenant === 'france' ? 'Recherche Intelligente' : tenant === 'portugal' ? 'Pesquisa Inteligente' : 'Smart Search'}</h4>
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">{isSpanish ? 'Por Comunidad Autónoma y Tipo de Servicio' : tenant === 'france' ? 'Par Région et Type de Service' : tenant === 'portugal' ? 'Por Região e Tipo de Serviço' : 'By County & Service Type'}</p>
                                            </div>
                                        </div>
                                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                            <div className="h-full bg-[#007F00] w-2/3 animate-pulse"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 5. FAQ / EDUCATION SECTION */}
            <section className="py-24 bg-white relative">
                <div className="container mx-auto px-6 grid md:grid-cols-2 gap-20 items-center">
                    <div>
                        <span className="text-[#007F00] font-bold uppercase tracking-widest text-sm mb-4 block">{c('faq', 'tag', isSpanish ? 'Base de Conocimiento' : tenant === 'france' ? 'Base de Connaissances' : 'Knowledge Base')}</span>
                        <h2 className="text-4xl font-black mb-8 text-gray-900 leading-tight">{c('faq', 'heading', isSpanish ? 'Preguntas Frecuentes' : tenant === 'france' ? 'Questions Fréquentes' : 'Frequently Asked Questions')}</h2>
                        <div className="space-y-6">
                            {[
                                { q: isSpanish ? <Link to="/services" className="hover:text-[#007F00] hover:underline">¿Qué Es un Certificado de Eficiencia Energética?</Link> : (tenant === 'portugal' ? <Link to="/services" className="hover:text-[#007F00] hover:underline">O que é um Certificado Energético?</Link> : (tenant === 'england' || tenant === 'ireland' ? <Link to="/services" className="hover:text-[#007F00] hover:underline">{c('faq', 'faq1_q', (tenant === 'ireland' ? 'What Is a BER Certificate?' : 'What is an EPC Certificate?'))}</Link> : c('faq', 'faq1_q', (tenant === 'france' ? "Qu'est-ce qu'un DPE ?" : "What Is a BER Certificate?")))), a: c('faq', 'faq1_a', isSpanish ? "El Certificado de Eficiencia Energética indica el nivel de eficiencia energética de tu propiedad, calificada de la A (más eficiente) a la G (menos eficiente)." : (tenant === 'england' ? "An EPC Certificate shows the energy efficiency of a property using a rating from A to G." : tenant === 'france' ? "Le DPE indique le niveau d'efficacité énergétique de votre bien, noté de A (plus efficace) à G (moins efficace)." : "A BER Certificate shows the energy efficiency of a property using a rating from A to G.")) },
                                { q: isSpanish ? <Link to="/faq" className="hover:text-[#007F00] hover:underline">When Is the Energy Certificate Mandatory?</Link> : (tenant === 'portugal' ? <Link to="/epc-faq" className="hover:text-[#007F00] hover:underline">Porque preciso de um Certificado Energético?</Link> : (tenant === 'england' || tenant === 'ireland' ? <Link to={tenant === 'ireland' ? '/services' : '/epc-faq'} className="hover:text-[#007F00] hover:underline">{c('faq', 'faq2_q', (tenant === 'ireland' ? 'When Do I Need a BER Certificate?' : 'When Do I Need an EPC Certificate in England?'))}</Link> : c('faq', 'faq2_q', (tenant === 'france' ? "Pourquoi ai-je besoin d'un DPE ?" : "When Do I Need a BER Certificate?")))), a: c('faq', 'faq2_a', isSpanish ? "Es obligatorio por ley para vender o alquilar una propiedad. También es necesario para acceder a subvenciones de rehabilitación energética." : (tenant === 'england' ? "An EPC Certificate is usually required when selling or renting a property in England." : tenant === 'france' ? "Il est obligatoire par loi pour vendre ou louer un bien. Il est également nécessaire pour accéder aux aides à la rénovation énergétique." : "A BER Certificate is usually required when selling or renting a property in Ireland.")) },
                                { q: isSpanish ? <Link to="/pricing" className="hover:text-[#007F00] hover:underline">¿Cuánto Cuesta un Certificado Energético en España?</Link> : (tenant === 'portugal' ? <Link to="/pricing" className="hover:text-[#007F00] hover:underline">Quanto custa?</Link> : (tenant === 'england' || tenant === 'ireland' ? <Link to="/pricing" className="hover:text-[#007F00] hover:underline">{c('faq', 'faq3_q', (tenant === 'ireland' ? 'How Much Does a BER Assessment Cost?' : 'How Much Does an EPC Assessment Cost?'))}</Link> : c('faq', 'faq3_q', (tenant === 'france' ? "Combien ça coûte ?" : "How Much Does a BER Assessment Cost?")))), a: c('faq', 'faq3_a', isSpanish ? "Cada presupuesto es personalizado acorde a las necesidades de nuestros clientes y el tipo de propiedad." : (tenant === 'england' ? "The cost depends on the size, type, and location of the property." : tenant === 'france' ? "Chaque devis est personnalisé selon les besoins de nos clients et le type de bien." : "The cost depends on the size, type, and location of the property.")) },
                                { q: isSpanish ? <Link to="/services" className="hover:text-[#007F00] hover:underline">¿Cuánto Tarda en Obtenerse el Certificado Energético?</Link> : (tenant === 'portugal' ? <Link to="/services" className="hover:text-[#007F00] hover:underline">Qual a validade do certificado?</Link> : (tenant === 'england' || tenant === 'ireland' ? <Link to="/services" className="hover:text-[#007F00] hover:underline">{c('faq', 'faq4_q', (tenant === 'ireland' ? 'How Long Is a BER Certificate Valid?' : 'How Quickly Can I Get an EPC Certificate?'))}</Link> : c('faq', 'faq4_q', (tenant === 'france' ? "Combien de temps est-il valide ?" : "How Long Is a BER Certificate Valid?")))), a: c('faq', 'faq4_a', isSpanish ? "Un Certificado Energético tiene una validez de hasta 10 años, salvo que se realicen cambios importantes que alteren el rendimiento energético de la propiedad." : (tenant === 'england' ? "Most EPC assessments can be booked quickly, with certificates often issued shortly after the assessment is completed." : tenant === 'france' ? "Un DPE est valable jusqu'à 10 ans, sauf si des changements importants modifient la performance énergétique du bien." : "Most BER Certificates remain valid for up to 10 years.")) }
                            ].map((faq, i) => (
                                <div key={i} className="group cursor-pointer">
                                    <h3 className="font-bold text-lg text-gray-900 mb-2 group-hover:text-[#007F00] transition-colors">{faq.q}</h3>
                                    <p className="text-gray-500 text-sm font-medium leading-relaxed">{faq.a}</p>
                                </div>
                            ))}
                        </div>
                        <Link to={isSpanish ? '/faq' : (tenant === 'england' ? '/epc-faq' : '/faq')}>
                            <button className="mt-12 text-[#007F00] font-black border-b-2 border-[#007F00] pb-1 hover:text-[#006400] transition-all flex items-center gap-2 group cursor-pointer">
                                {isSpanish ? 'Ver todas las preguntas frecuentes' : tenant === 'france' ? 'Voir toutes les questions' : tenant === 'portugal' ? 'Ver todas as perguntas' : 'View All FAQs'}
                                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                        </Link>
                    </div>

                    <div className="bg-gray-900 text-white p-12 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white/5 blur-3xl"></div>
                        <h3 className="text-3xl font-black mb-6">{c('faq', 'cta_heading', isSpanish ? '¿Listo para tu Certificado Energético?' : (tenant === 'england' ? 'Ready to Get Your EPC Certificate?' : tenant === 'france' ? 'Prêt pour votre DPE ?' : 'Ready to Get Your BER Certificate?'))}</h3>
                        <p className="text-gray-400 mb-10 text-lg leading-relaxed">
                            {c('faq', 'cta_description', isSpanish ? 'Únete a más de 10000 clientes satisfechos. Obtén presupuestos competitivos de certificadores locales de confianza en segundos.' : (tenant === 'england' ? 'Compare quotes from accredited EPC assessors and arrange your assessment online.' : tenant === 'france' ? 'Rejoignez plus de 10 000 clients satisfaits. Obtenez des devis compétitifs de diagnostiqueurs locaux en quelques secondes.' : 'Compare quotes from qualified assessors and arrange your assessment online.'))}
                        </p>
                        <div className="space-y-6 mb-12">

                        </div>
                        <Link to="/get-quote">
                            <button className="w-full bg-[#007F00] hover:bg-green-600 text-white font-black py-5 rounded-2xl transition-all shadow-xl shadow-green-900/40 transform hover:-translate-y-1 cursor-pointer">
                                {isSpanish ? 'Pide Presupuesto Online' : tenant === 'france' ? 'Demander un Devis en Ligne' : tenant === 'portugal' ? 'Pedir Orçamento Online' : 'Get a Quote Online'}
                            </button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* 7. WHY CHOOSE - England only */}
            {tenant === 'england' && (
                <section className="py-24 bg-white border-t border-gray-100">
                    <div className="container mx-auto px-6">
                        <div className="text-center mb-16">
                            <span className="text-[#007F00] font-bold uppercase tracking-widest text-sm mb-4 block">The <Link to="/services" className="hover:underline">EPC Cert</Link> Advantage</span>
                            <h2 className="text-4xl md:text-5xl font-black text-gray-900">Why Arrange Your EPC Assessment Through EPC Cert?</h2>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[
                                { emoji: '💬', title: 'Compare Multiple EPC Quotes', desc: 'Receive quotes from accredited EPC assessors and choose the option that best suits your property and budget.', link: '/get-quote' },
                                { emoji: '📅', title: 'Fast Assessment', desc: 'Arrange an EPC assessment quickly with flexible appointment times to suit your schedule.', link: '/get-quote' },
                                { emoji: '✅', title: 'Accredited EPC Assessors', desc: 'All assessors are accredited, vetted and qualified to issue Energy Performance Certificates in England.', link: '/energy-advisor' },
                                { emoji: '💻', title: 'Simple Online Booking', desc: 'Request quotes, review assessor details and confirm your EPC assessment online at your convenience.', link: '/get-quote' },
                                { emoji: '⭐', title: 'Trusted by Property Owners', desc: 'Rated highly by homeowners, landlords and estate agents across England for reliable EPC assessment services.', link: '/catalogue' },
                                { emoji: '🗓️', title: 'Flexible Appointment Times', desc: 'Choose a date and time that works for you when booking your EPC assessment through EPC Cert.', link: '/contact-us' },
                            ].map((item, i) => (
                                <Link key={i} to={item.link} className="bg-gray-50 rounded-3xl p-8 border border-gray-100 hover:border-[#007F00]/20 hover:shadow-lg transition-all block cursor-pointer">
                                    <div className="text-4xl mb-4">{item.emoji}</div>
                                    <h3 className="text-lg font-black text-gray-900 mb-2">{item.title}</h3>
                                    <p className="text-sm text-gray-500 font-medium leading-relaxed">{item.desc}</p>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* WHY CHOOSE OUR SERVICE - Spain only */}
            {isSpanish && (
                <section className="py-24 bg-white border-t border-gray-100">
                    <div className="container mx-auto px-6">
                        <div className="text-center mb-16">
                            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
                                <Link to="/services" className="hover:underline">¿Por qué elegir nuestro servicio de Certificado Energético?</Link>
                            </h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                            {[
                                { title: "Compara Presupuestos", desc: "Recibe presupuestos de certificadores y elige la opción que mejor se adapte a tu inmueble.", link: "/get-quote", icon: <TrendingUp size={24} /> },
                                { title: "Certificadores Acreditados", desc: "Encuentra profesionales cualificados para realizar tu certificado energético.", link: "/get-quote", icon: <ShieldCheck size={24} /> },
                                { title: "Proceso Rápido y Sencillo", desc: "Obtén tu certificado energético de forma rápida y sencilla.", link: "/energy-advisor", icon: <Clock size={24} /> },
                                { title: "Reserva tu Inspección", desc: "Elige la fecha de tu inspección y facilita los datos de tu inmueble.", link: "/get-quote", icon: <ClipboardList size={24} /> },
                                { title: "Profesionales de Toda España", desc: "Encuentra profesionales para realizar tu certificado energético en tu comunidad autónoma.", link: "/catalogue", icon: <MapPin size={24} /> },
                                { title: "Elige tu Comunidad Autónoma", desc: "Consulta las opciones disponibles para Andalucía, Aragón, Asturias, Islas Baleares, Canarias, Cantabria, Castilla-La Mancha, Castilla y León, Cataluña, Comunidad de Madrid, Navarra, Comunidad Valenciana, Extremadura, Galicia, La Rioja, País Vasco y Región de Murcia.", link: "/contact-us", icon: <Search size={24} /> },
                            ].map((item, i) => (
                                <Link key={i} to={item.link} className="p-8 bg-white rounded-[2rem] border border-gray-100 hover:border-green-100 transition-all hover:shadow-lg group cursor-pointer block">
                                    <div className="w-12 h-12 rounded-2xl bg-green-50 text-[#007F00] flex items-center justify-center mb-6 group-hover:bg-[#007F00] group-hover:text-white transition-all">
                                        {item.icon}
                                    </div>
                                    <h3 className="text-lg font-black text-gray-900 mb-3 uppercase tracking-tight">{item.title}</h3>
                                    <p className="text-gray-500 font-bold text-sm leading-relaxed">{item.desc}</p>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* WHY CHOOSE OUR SERVICE - Portugal only */}
            {tenant === 'portugal' && (
                <section className="py-24 bg-white border-t border-gray-100">
                    <div className="container mx-auto px-6">
                        <div className="text-center mb-16">
                            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
                                Why Choose Certificado Energia?
                            </h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                            {[
                                { title: 'Melhores Tarifas', link: '/pricing', icon: <TrendingUp size={24} /> },
                                { title: 'Resultados Rápidos', link: '/get-quote', icon: <ZapIcon size={24} /> },
                                { title: 'Especialistas Certificados', link: '/services', icon: <ShieldCheck size={24} /> },
                                { title: 'Fluido e sem stress', link: '/catalogue', icon: <CheckCircle2 size={24} /> },
                                { title: 'Satisfação garantida', link: '/contact-us', icon: <Shield size={24} /> },
                                { title: 'Escolha o seu horário', link: '/get-quote', icon: <Clock size={24} /> },
                            ].map((item, i) => (
                                <Link key={i} to={item.link} className="p-8 bg-white rounded-[2rem] border border-gray-100 hover:border-green-100 transition-all hover:shadow-lg group cursor-pointer block">
                                    <div className="w-12 h-12 rounded-2xl bg-green-50 text-[#007F00] flex items-center justify-center mb-6 group-hover:bg-[#007F00] group-hover:text-white transition-all">
                                        {item.icon}
                                    </div>
                                    <h3 className="text-lg font-black text-gray-900 mb-3 uppercase tracking-tight">{item.title}</h3>
                                </Link>
                            ))}
                        </div>
                        <div className="text-center mt-12">
                            <Link to="/contact-us">
                                <button className="px-12 py-5 bg-[#007F00] text-white font-black text-sm uppercase tracking-widest rounded-2xl hover:bg-[#006400] transition-all shadow-xl flex items-center gap-3 mx-auto cursor-pointer">
                                    Entre em contacto agora <ArrowRight size={18} />
                                </button>
                            </Link>
                        </div>
                    </div>
                </section>
            )}

            {/* WE COVER ALL COUNTIES / PROVINCES */}
            <section className="py-20 bg-gray-50 border-t border-gray-100">
                <div className="container mx-auto px-6">
                    {tenant === 'portugal' ? (
                        <>
                            <h2 className="text-3xl md:text-4xl font-black text-center text-[#007F00] mb-4">
                                Serviços de <Link to="/services" className="hover:underline">Certificados Energéticos</Link> em Todo o Portugal
                            </h2>
                            <p className="text-center text-gray-600 font-medium mb-12 max-w-2xl mx-auto">
                                Ajudamos proprietários em todo o país a ligar-se a peritos qualificados na sua zona.
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
                                {[
                                    { name: 'Norte', count: '86 Municípios', counties: 'Porto, Braga, Guimarães, Vila Nova de Gaia & mais' },
                                    { name: 'Centro', count: '77 Municípios', counties: 'Coimbra, Aveiro, Leiria, Viseu & mais' },
                                    { name: 'Oeste e Vale do Tejo', count: '34 Municípios', counties: 'Santarém, Torres Vedras, Tomar & mais' },
                                    { name: 'Grande Lisboa', count: '9 Municípios', counties: 'Lisboa, Sintra, Cascais, Loures & mais' },
                                    { name: 'Península de Setúbal', count: '9 Municípios', counties: 'Setúbal, Almada, Barreiro, Seixal & mais' },
                                    { name: 'Alentejo', count: '47 Municípios', counties: 'Évora, Beja, Portalegre, Elvas & mais' },
                                    { name: 'Algarve', count: '16 Municípios', counties: 'Faro, Portimão, Albufeira, Lagos & mais' },
                                    { name: 'Região Autónoma dos Açores', count: '19 Municípios', counties: 'Ponta Delgada, Angra do Heroísmo, Horta & mais' },
                                    { name: 'Região Autónoma da Madeira', count: '11 Municípios', counties: 'Funchal, Câmara de Lobos, Machico & mais' },
                                ].map((province) => (
                                    <Link key={province.name} to="/get-quote" className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all hover:border-[#007F00]/30 group">
                                        <div className="flex items-start gap-3">
                                            <span className="text-xl">📍</span>
                                            <div>
                                                <h3 className="text-lg font-black text-gray-900 group-hover:text-[#007F00] transition-colors">{province.name}</h3>
                                                <p className="text-sm font-bold text-[#007F00]">{province.count}</p>
                                                <p className="text-sm text-gray-500 font-medium">{province.counties}</p>
                                                <span className="text-sm text-[#007F00] font-bold mt-2 inline-block group-hover:underline">Ver Localizações →</span>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </>
                    ) : (!isSpanish && tenant !== 'england') ? (
                        <>
                            {tenant === 'france' ? (
                                <>
                                    <h2 className="text-3xl md:text-4xl font-black text-center text-[#007F00] mb-4">
                                        Services de DPE en France
                                    </h2>
                                    <p className="text-center text-gray-600 font-medium mb-12 max-w-2xl mx-auto">
                                        Accompagnement des propriétaires en France pour les diagnostics de performance énergétique (DPE) et études énergétiques.
                                    </p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
                                        {[
                                            { name: 'Île-de-France', count: 'Paris & région', counties: 'Paris, Hauts-de-Seine, Seine-Saint-Denis & plus' },
                                            { name: 'Provence-Alpes-Côte d\'Azur', count: 'Sud-Est', counties: 'Marseille, Nice, Aix-en-Provence & plus' },
                                            { name: 'Auvergne-Rhône-Alpes', count: 'Centre-Est', counties: 'Lyon, Grenoble, Saint-Étienne & plus' },
                                            { name: 'Hauts-de-France', count: 'Nord', counties: 'Lille, Amiens, Roubaix & plus' },
                                        ].map((province) => (
                                            <Link key={province.name} to="/get-quote" className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all hover:border-[#007F00]/30 group">
                                                <div className="flex items-start gap-3">
                                                    <span className="text-xl">📍</span>
                                                    <div>
                                                        <h3 className="text-lg font-black text-gray-900 group-hover:text-[#007F00] transition-colors">{province.name}</h3>
                                                        <p className="text-sm font-bold text-[#007F00]">{province.count}</p>
                                                        <p className="text-sm text-gray-500 font-medium">{province.counties}</p>
                                                        <span className="text-sm text-[#007F00] font-bold mt-2 inline-block group-hover:underline">Voir les départements →</span>
                                                    </div>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                </>
                            ) : (
                                <>
                                    <h2 className="text-3xl md:text-4xl font-black text-center text-[#007F00] mb-4">
                                        BER Assessment Services Across Ireland
                                    </h2>
                                    <p className="text-center text-gray-600 font-medium mb-12 max-w-2xl mx-auto">
                                        Serving property owners across all 26 counties, The BER Man helps you connect with qualified BER assessors in your local area.
                                    </p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
                                        {[
                                            { name: 'Leinster', count: '12 Counties', counties: 'Dublin, Kildare, Wicklow & more' },
                                            { name: 'Munster', count: '6 Counties', counties: 'Cork, Kerry, Limerick & more' },
                                            { name: 'Connacht', count: '5 Counties', counties: 'Galway, Mayo, Sligo & more' },
                                            { name: 'Ulster', count: '3 Counties', counties: 'Donegal, Cavan & Monaghan' },
                                        ].map((province) => (
                                            <Link key={province.name} to="/get-quote" className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all hover:border-[#007F00]/30 group">
                                                <div className="flex items-start gap-3">
                                                    <span className="text-xl">📍</span>
                                                    <div>
                                                        <h3 className="text-lg font-black text-gray-900 group-hover:text-[#007F00] transition-colors">{province.name}</h3>
                                                        <p className="text-sm font-bold text-[#007F00]">{province.count}</p>
                                                        <p className="text-sm text-gray-500 font-medium">{province.counties}</p>
                                                        <span className="text-sm text-[#007F00] font-bold mt-2 inline-block group-hover:underline">View Counties →</span>
                                                    </div>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                </>
                            )}
                        </>
                    ) : (
                        <>
                            {tenant === 'england' ? (
                                <>
                                    <h2 className="text-3xl md:text-4xl font-black text-center text-gray-900 mb-4"><Link to="/about-us" className="hover:underline">EPC Assessments Across England</Link></h2>
                                    <p className="text-center text-gray-600 font-medium mb-12 max-w-2xl mx-auto">
                                        Compare quotes from accredited EPC assessors serving homeowners, landlords and businesses across England.
                                    </p>
                                    <div className="max-w-5xl mx-auto">
                                        <h3 className="text-xl font-black text-center text-gray-900 mb-8 uppercase tracking-widest">Popular Locations</h3>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-10">
                                            {[
                                                { city: 'London', slug: 'epc-assessment-london' },
                                                { city: 'Manchester', slug: 'epc-assessment-manchester' },
                                                { city: 'Birmingham', slug: 'epc-assessment-birmingham' },
                                                { city: 'Leeds', slug: 'epc-assessment-leeds' },
                                                { city: 'Liverpool', slug: 'epc-assessment-liverpool' },
                                                { city: 'Bristol', slug: 'epc-assessment-bristol' },
                                                { city: 'Sheffield', slug: 'epc-assessment-sheffield' },
                                                { city: 'Nottingham', slug: 'epc-assessment-nottingham' },
                                                { city: 'Leicester', slug: 'epc-assessment-leicester' },
                                                { city: 'Newcastle', slug: 'epc-assessment-newcastle' },
                                                { city: 'Southampton', slug: 'epc-assessment-southampton' },
                                                { city: 'Oxford', slug: 'epc-assessment-oxford' },
                                            ].map(({ city, slug }) => (
                                                <Link
                                                    key={city}
                                                    to={`/${slug}/`}
                                                    className="group flex items-center gap-2 bg-white p-4 rounded-2xl border border-gray-100 hover:border-[#007F00]/30 hover:shadow-md transition-all"
                                                >
                                                    <MapPin size={16} className="text-[#007F00] shrink-0" />
                                                    <span className="text-sm font-bold text-gray-800 group-hover:text-[#007F00] transition-colors">{city}</span>
                                                </Link>
                                            ))}
                                        </div>
                                        <div className="text-center">
                                            <Link to="/locations/">
                                                <button className="px-8 py-4 border-2 border-[#007F00] text-[#007F00] hover:bg-[#007F00] hover:text-white font-black text-xs uppercase tracking-widest rounded-2xl transition-all cursor-pointer flex items-center gap-2 mx-auto">
                                                    View All Locations We Cover
                                                    <ArrowRight size={16} />
                                                </button>
                                            </Link>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <h2 className="text-3xl md:text-4xl font-black text-center text-[#007F00] mb-12">
                                        {isSpanish ? 'Selecciona tu Comunidad Autónoma' : 'We Cover All Counties'}
                                    </h2>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-16 gap-y-3 max-w-4xl mx-auto">
                                        {(isSpanish ? [
                                            'Andalucía', 'Aragón', 'Principado de Asturias', 'Islas Baleares', 'Canarias',
                                            'Cantabria', 'Castilla-La Mancha', 'Castilla y León', 'Cataluña',
                                            'Comunidad de Madrid', 'Comunidad Foral de Navarra', 'Comunidad Valenciana',
                                            'Extremadura', 'Galicia', 'La Rioja', 'País Vasco', 'Región de Murcia'
                                        ] : []).map((place) => (
                                            <Link
                                                key={place}
                                                to="/get-quote"
                                                className="text-gray-600 hover:text-[#007F00] transition-colors text-sm font-semibold py-1 text-center"
                                            >
                                                {`Certificado Energético ${place}`}
                                            </Link>
                                        ))}
                                    </div>
                                </>
                            )}
                        </>
                    )}
                </div>
            </section>

            {/* 6. FINAL CTA / NEWSLETTER - moved to /subscribe page */}
            {(isSpanish || tenant === 'portugal') && <section id="newsletter" className="py-24 bg-gray-50 border-t border-gray-100">
                <div className="container mx-auto px-6">
                    <div className="p-16 text-center relative overflow-hidden">
                        <div className="absolute top-0 right-0 -mr-32 -mt-32 w-80 h-80 rounded-full bg-white/5 blur-3xl"></div>
                        <div className="absolute bottom-0 left-0 -ml-32 -mb-32 w-80 h-80 rounded-full bg-white/5 blur-3xl"></div>

                        <div className="relative z-10 max-w-3xl mx-auto">
                            <span className="text-[#007F00] font-bold uppercase tracking-widest text-sm mb-6 block">{c('newsletter', 'tag', isSpanish ? 'Recursos Premium' : tenant === 'portugal' ? 'Recursos Premium' : 'Premium Resources')}</span>
                            <h2 className="text-4xl md:text-5xl font-black mb-8 leading-tight text-gray-900">{isSpanish ? <>Consigue nuestra <Link to="/energy-advisor" className="text-[#007F00] hover:underline">guía completa de mejoras energéticas</Link></> : (tenant === 'portugal' ? 'Fique a par das novidades' : 'Get Our Complete Home Energy Upgrade Guide')}</h2>
                            <p className="text-gray-600 mb-12 text-xl font-medium leading-relaxed">
                                {c('newsletter', 'description', isSpanish ? 'Únete a más de 5.000 propietarios que reciben nuestras novedades energéticas semanales, ofertas flash y promociones exclusivas de rehabilitación energética.' : tenant === 'portugal' ? 'Subscreva para receber atualizações sobre apoios à eficiência energética, campanhas e guias técnicos.' : 'Join 5,000+ homeowners receiving our weekly energy updates, flash sales, and exclusive energy upgrade offers.')}
                            </p>

                            <form
                                className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto mb-8"
                                onSubmit={async (e) => {
                                    e.preventDefault();
                                    const emailInput = (e.target as HTMLFormElement).querySelector('input[type="email"]') as HTMLInputElement;
                                    const email = emailInput?.value;

                                    if (!email) return;

                                    setIsSubmitting(true);
                                    try {
                                        const { error } = await supabase
                                            .from('leads')
                                            .insert([{
                                                tenant,
                                                name: 'Guide Subscriber',
                                                email: email,
                                                message: 'Requested Complete Home Energy Upgrade Guide via Home Page Newsletter',
                                                status: 'new',
                                                purpose: 'Home Energy Guide'
                                            }]);

                                        if (error) throw error;

                                        toast.success(isSpanish ? 'Subscrito! Verifique o seu email em breve.' : tenant === 'portugal' ? 'Subscrito! Verifique o seu email em breve.' : 'Subscribed! Check your email soon.', {
                                            icon: '✅',
                                            duration: 5000
                                        });
                                        (e.target as HTMLFormElement).reset();
                                    } catch (err: unknown) {
                                        console.error('Newsletter error:', err);
                                        const errorMessage = err instanceof Error ? err.message : '';
                                        toast.error(errorMessage || (isSpanish ? 'Erro ao subscrever' : tenant === 'portugal' ? 'Erro ao subscrever' : 'Failed to subscribe'));
                                    } finally {
                                        setIsSubmitting(false);
                                    }
                                }}
                            >
                                <input
                                    type="email"
                                    placeholder={c('newsletter', 'placeholder', isSpanish ? 'Introduce tu correo electrónico' : tenant === 'portugal' ? 'Endereço de e-mail' : 'Enter your email address')}
                                    className="flex-grow bg-white border border-gray-200 rounded-2xl px-6 py-5 text-gray-900 placeholder:text-gray-400 outline-none focus:border-[#007F00] transition-all font-bold text-lg"
                                    required
                                    disabled={isSubmitting}
                                />
                                <button
                                    disabled={isSubmitting}
                                    className="bg-[#007F00] text-white font-black px-10 py-5 rounded-2xl hover:bg-[#006400] transition-all shadow-xl shadow-green-100 whitespace-nowrap text-lg cursor-pointer disabled:opacity-70 flex items-center justify-center min-w-[200px]"
                                >
                                    {isSubmitting ? (isSpanish ? 'Enviando...' : tenant === 'portugal' ? 'A enviar...' : 'Sending...') : c('newsletter', 'button_text', isSpanish ? 'Suscribirse' : tenant === 'portugal' ? 'Subscrever' : 'Subscribe to news')}
                                </button>
                            </form>

                            <div className="flex flex-wrap items-center justify-center gap-8 text-xs text-gray-500 font-bold uppercase tracking-widest">
                                <div className="flex items-center gap-2">
                                    <Shield size={14} className="text-[#007F00]" />
                                    {isSpanish ? 'Sin Spam Nunca' : tenant === 'portugal' ? 'Sem Spam' : 'No Spam Ever'}
                                </div>
                                <div className="flex items-center gap-2">
                                    <ZapIcon size={14} className="text-[#007F00]" />
                                    {isSpanish ? 'Descarga Instantánea' : tenant === 'portugal' ? 'Download Instantâneo' : 'Instant Download'}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>}

            {/* Promo Banner (Sticky Bottom) */}
            {promo?.is_enabled && !isDismissed && (
                <div className="fixed bottom-0 left-0 right-0 bg-[#007F00] text-white py-4 px-6 text-center z-[100] group overflow-hidden border-t border-white/10 shadow-[0_-10px_40px_rgba(0,127,0,0.2)] animate-slide-up">
                    <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out skew-x-[-45deg]"></div>

                    <div className="container mx-auto relative">
                        <a
                            href='https://solarquotesireland.com/'
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2 sm:gap-4 flex-wrap pr-8"
                        >
                            <span className="bg-white text-[#007F00] px-2 py-0.5 rounded text-[10px] sm:text-xs font-black uppercase tracking-wider">Promo</span>
                            <span className="font-bold text-base sm:text-lg">{promo.headline}</span>
                            <span className="hidden md:inline-block opacity-80 text-sm">—</span>
                            <span className="text-sm sm:text-base font-medium opacity-90">{promo.sub_text}</span>
                            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                        </a>

                        <button
                            onClick={() => setIsDismissed(true)}
                            className="absolute right-0 top-1/2 -translate-y-1/2 p-2 hover:bg-white/20 rounded-full transition-colors z-10"
                            title="Close"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>
            )}
            </>
            )}
            <InternalLinks page="home" />
        </div >
    );
};

export default HomePage;
