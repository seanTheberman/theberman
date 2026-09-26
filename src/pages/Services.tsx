
import { Truck, BarChart3, Cpu, Globe2, AlertTriangle, ArrowRight, Zap, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import SEOHead from '../components/SEOHead';
import InternalLinks from '../components/InternalLinks';
import { getTenantFromDomain } from '../lib/tenant';

const Services = () => {
    const tenant = getTenantFromDomain();
    const isSpanish = tenant === 'spain';
    const isEngland = tenant === 'england';
    const isFrance = tenant === 'france';
    const isPortugal = tenant === 'portugal';
    const brand = isSpanish ? 'Certificado Energ\u00e9tico' : isEngland ? 'EPC Cert' : isFrance ? 'DPE Cert France' : isPortugal ? 'Certificado Energia' : 'The Berman';
    const serviceName = isSpanish ? 'Certificado Energ\u00e9tico' : isEngland ? 'EPC Certificate' : isFrance ? 'DPE' : isPortugal ? 'Certificado Energético' : 'BER Certificate';
    const baseUrl = isEngland ? 'https://www.epccert.com' : isSpanish ? 'https://www.xn--certificadoenergtico-q2b.eu' : isFrance ? 'https://www.dpecert.fr' : isPortugal ? 'https://www.certificadoenergia.com' : 'https://www.theberman.eu';
    const locale = isEngland ? 'Blackburn' : isSpanish ? 'Madrid' : isFrance ? 'Paris' : isPortugal ? 'Portugal' : 'Dublin';
    const country = isEngland ? 'GB' : isSpanish ? 'ES' : isFrance ? 'FR' : isPortugal ? 'PT' : 'IE';

    const title = isSpanish ? 'Nuestros Servicios - Certificados Energ\u00e9ticos Expertos' : isEngland ? 'EPC Certificates | Domestic & Commercial EPC Assessments' : isFrance ? 'Nos Services - DPE Experts' : isPortugal ? 'Os nossos Serviços - Certificados Energéticos' : 'BER Services Ireland | Certificates, Ratings & Assessors';
    const description = isSpanish
        ? 'Servicios integrales de certificaci\u00f3n energ\u00e9tica incluyendo certificados CEE, calificaciones provisionales y auditor\u00edas energ\u00e9ticas.'
        : isEngland
            ? 'We provide fast, affordable Domestic and Commercial Energy Performance Certificates by certified energy assessors. Book your EPC online today.'
            : isFrance
                ? 'Services complets de diagnostic de performance énergétique incluant DPE, audits énergétiques et certifications pour logements et bâtiments commerciaux.'
                : isPortugal
                    ? 'Serviços completos de certificação energética incluindo certificados, avaliações e auditorias para propriedades residenciais e comerciais.'
                    : "The Berman covers every step of the BER process — instant quotes, verified SEAI assessors, rating lookups and nationwide booking, all in one place.";

    const irelandOgTitle = !isSpanish && !isEngland && !isFrance && !isPortugal ? 'What We Offer | BER Certs, Ratings & Assessor Network' : undefined;
    const irelandOgDesc = !isSpanish && !isEngland && !isFrance && !isPortugal ? 'One platform, every BER service — get quotes, connect with SEAI-registered assessors, and book your energy assessment without the hassle.' : undefined;
    const irelandTwitterTitle = !isSpanish && !isEngland && !isFrance && !isPortugal ? 'Everything You Need for Your BER, In One Place' : undefined;
    const irelandTwitterDesc = !isSpanish && !isEngland && !isFrance && !isPortugal ? 'One platform, every BER service — get quotes, connect with SEAI-registered assessors, and book your energy assessment without the hassle.' : undefined;

    const englandOgTitle = isEngland ? 'Professional EPC Certificate Services Across England | EPCCert' : undefined;
    const englandOgDesc = isEngland ? 'EPC Certificate services for residential and commercial properties across England. Qualified assessors, competitive prices, fast appointments, and reliable.' : undefined;
    const englandTwitterTitle = isEngland ? 'EPC Certificate Services England | Fast & Trusted EPC Assessment' : undefined;
    const englandTwitterDesc = isEngland ? 'Get Domestic and Commercial EPC Certificates across England with certified energy assessors. Fast booking, best pricing, and reliable nationwide service.' : undefined;

    const tr = isEngland ? {
        badge: 'What We Do', heroTitle1: 'Precision Energy', heroTitle2: 'Solutions.',
        heroDesc: 'Comprehensive assessments and expert advice to help you meet regulations and improve efficiency.',
        complianceTitle: 'Do I need an EPC Certificate?',
        complianceDesc: 'Required by law for selling, renting, or grant applications. We provide the certification you need with fast turnaround and expert accuracy.',
        complianceCta: 'Book Now',
        servicesTitle: 'Our Core Offerings', servicesSubtitle: 'Expertise Across All Sectors',
        services: [
            { title: 'Domestic EPC', description: 'Full registered assessments for homeowners and landlords. Required for all sales, rentals, and grant applications.', link: '/get-quote' },
            { title: 'Commercial EPC', description: 'Non-Domestic energy ratings for businesses and retail units. Ensure compliance and optimize operational costs.', link: '/get-quote' },
            { title: 'Energy Audits', description: 'Detailed analysis of energy usage with actionable insights on where to save and how to modernize your property.', link: '/catalogue' },
            { title: 'Grant Advisory', description: 'Navigate the grant system with expert guidance. We help you qualify for the maximum funding available.', link: '/energy-advisor' },
            { title: 'Technical Analysis', description: 'Specialized surveys for heat pump suitability, insulation upgrades, and solar PV potential calculations.', link: '/catalogue' },
            { title: 'Support Services', description: 'Continuous advisory for property portfolios, new build provisional ratings, and final compliance checks.', link: '/energy-advisor' },
        ],
        howTitle: 'How It Works', howSubtitle: 'A simple 3-step process',
        steps: [
            { title: 'Schedule', description: 'Contact us to book your on-site assessment at a time that suits you.', link: '/get-quote' },
            { title: 'Survey', description: 'Our registered assessor visits your property for a comprehensive technical survey.', link: '/locations' },
            { title: 'Finalize', description: 'Receive your EPC certificate and detailed advisory report within 48 hours.', link: '/get-quote' },
        ],
        ctaTitle: 'Need expert energy advice?', ctaDesc: 'Our team is ready to help you optimize your property and ensure full regulatory compliance.', ctaButton: 'Get Started'
    } : isSpanish ? {
        badge: 'Qué hacemos', heroTitle1: 'Soluciones de', heroTitle2: 'Energía Precisas.',
        heroDesc: 'Valoraciones integrales y asesoramiento experto para ayudarle a cumplir con la normativa y mejorar la eficiencia.',
        complianceTitle: '¿Necesito un certificado energético?',
        complianceDesc: 'Obligatorio por ley para la venta, alquiler o solicitud de subvenciones. Le proporcionamos el certificado que necesita con entrega rápida y precisión técnica.',
        complianceCta: 'Reservar',
        servicesTitle: 'Nuestros servicios principales', servicesSubtitle: 'Experiencia en todos los sectores',
        services: [
            { title: 'Certificado Energético Vivienda', description: 'Valoraciones registradas completas para propietarios e inquilinos. Requerido para ventas, alquileres y solicitudes de subvenciones.', link: '/get-quote' },
            { title: 'Certificado Comercial', description: 'Calificaciones energéticas no domésticas para empresas y locales comerciales. Garantice el cumplimiento y optimice los costes operativos.', link: '/get-quote' },
            { title: 'Auditorías Energéticas', description: 'Análisis detallado del consumo energético con recomendaciones prácticas para ahorrar y modernizar su propiedad.', link: '/catalogue' },
            { title: 'Asesoría de Subvenciones', description: 'Navegue por el sistema de subvenciones con orientación experta. Le ayudamos a calificar para la máxima financiación disponible.', link: '/energy-advisor' },
            { title: 'Análisis Técnico', description: 'Estudios especializados de idoneidad de aerotermia, mejoras de aislamiento y cálculo de potencial fotovoltaico.', link: '/catalogue' },
            { title: 'Servicios de Soporte', description: 'Asesoramiento continuo para carteras inmobiliarias, calificaciones provisionales de obra nueva y comprobaciones finales de cumplimiento.', link: '/energy-advisor' },
        ],
        howTitle: 'Cómo funciona', howSubtitle: 'Un proceso sencillo en 3 pasos',
        steps: [
            { title: 'Cronograma', description: 'Contacte con nosotros para reservar su valoración presencial en el momento que le convenga.', link: '/get-quote' },
            { title: 'Inspección', description: 'Nuestro evaluador registrado visita su propiedad para realizar un estudio técnico exhaustivo.', link: '/locations' },
            { title: 'Finalizar', description: 'Reciba su certificado energético y el informe asesor detallado en un plazo de 48 horas.', link: '/get-quote' },
        ],
        ctaTitle: '¿Necesita asesoramiento energético experto?', ctaDesc: 'Nuestro equipo está listo para ayudarle a optimizar su propiedad y garantizar el cumplimiento normativo.', ctaButton: 'Empezar'
    } : isFrance ? {
        badge: 'Nos services', heroTitle1: 'Solutions', heroTitle2: 'Énergie Précises.',
        heroDesc: 'Diagnostics complets et conseils d’experts pour vous aider à respecter les réglementations et améliorer l’efficacité énergétique.',
        complianceTitle: 'Ai-je besoin d’un DPE ?',
        complianceDesc: 'Obligatoire par la loi pour la vente, la location ou les demandes d’aides. Nous fournissons le diagnostic dont vous avez besoin avec une livraison rapide et une précision technique.',
        complianceCta: 'Réserver',
        servicesTitle: 'Nos prestations clés', servicesSubtitle: 'Expertise dans tous les secteurs',
        services: [
            { title: 'DPE Logement', description: 'Diagnostics complets certifiés pour les propriétaires et locataires. Obligatoire pour les ventes, locations et demandes d’aides.' },
            { title: 'DPE Tertiaire', description: 'Diagnostics de performance énergétique non résidentiels pour entreprises et commerces. Assurez la conformité et optimisez les coûts.' },
            { title: 'Audits Énergétiques', description: 'Analyse détaillée de la consommation énergétique avec recommandations actionnables pour économiser et moderniser votre bien.' },
            { title: 'Conseil Aides', description: 'Naviguez dans le système d’aides avec un accompagnement expert. Nous vous aidons à obtenir le maximum de financements disponibles.' },
            { title: 'Études Techniques', description: 'Études spécialisées pour pompe à chaleur, isolation et calcul du potentiel photovoltaïque.' },
            { title: 'Services d’Accompagnement', description: 'Conseil continu pour les parcs immobiliers, DPE provisoires pour neuf et contrôles de conformité.' },
        ],
        howTitle: 'Comment ça marche', howSubtitle: 'Un processus simple en 3 étapes',
        steps: [
            { title: 'Planifier', description: 'Contactez-nous pour planifier le rendez-vous de diagnostic à l’heure qui vous convient.' },
            { title: 'Visite', description: 'Notre diagnostiqueur certifié visite votre bien pour effectuer un diagnostic technique complet.' },
            { title: 'Finaliser', description: 'Recevez votre DPE et le rapport complet sous 48 heures.' },
        ],
        ctaTitle: 'Besoin de conseils énergétiques ?', ctaDesc: 'Notre équipe est prête à vous aider à optimiser votre bien et assurer la conformité réglementaire.', ctaButton: 'Commencer'
    } : isPortugal ? {
        badge: 'O que fazemos', heroTitle1: 'Soluções de', heroTitle2: 'Energia Precisas.',
        heroDesc: <>Avaliações abrangentes e aconselhamento especializado para o ajudar a cumprir a <Link to="/catalogue" className="text-[#007F00] font-bold hover:underline">legislação</Link> e melhorar a <Link to="/energy-advisor" className="text-[#007F00] font-bold hover:underline">eficiência energética</Link>.</>,
        complianceTitle: 'Preciso de um certificado energético?',
        complianceDesc: <><Link to="/energy-advisor" className="text-[#007F00] font-bold hover:underline">Aconselhamento especializado</Link> para venda, arrendamento ou candidaturas a subsídios. Fornecemos o <Link to="/get-quote" className="text-[#007F00] font-bold hover:underline">certificado de que precisa</Link> com entrega rápida e precisão técnica.</>,
        complianceCta: 'Reservar',
        servicesTitle: 'Os nossos serviços principais', servicesSubtitle: 'Experiência em todos os setores',
        services: [
            { title: 'Certificado Residencial', description: 'Avaliações completas acreditadas para proprietários e senhorios. Obrigatório para vendas, arrendamentos e candidaturas a subsídios.', link: '/get-quote' },
            { title: 'Certificado Comercial', description: 'Avaliações energéticas não residenciais para empresas e lojas. Garanta a conformidade e otimize os custos operacionais.', link: '/get-quote' },
            { title: 'Auditorias Energéticas', description: 'Análise detalhada do consumo energético com recomendações práticas para poupar e modernizar a sua propriedade.', link: '/catalogue' },
            { title: 'Aconselhamento de Subsídios', description: 'Orientação especializada no sistema de subsídios. Ajudamos a qualificar para o máximo de financiamento disponível.', link: '/energy-advisor' },
            { title: 'Análise Técnica', description: 'Estudos especializados sobre idoneidade de bomba de calor, melhorias de isolamento e cálculo do potencial fotovoltaico.', link: '/catalogue' },
            { title: 'Serviços de Suporte', description: 'Aconselhamento contínuo para carteiras imobiliárias, certificados provisórios para imóveis novos e verificações finais de conformidade.', link: '/energy-advisor' },
        ],
        howTitle: 'Como funciona', howSubtitle: 'Um processo simples em 3 passos',
        steps: [
            { title: 'Agendar', description: 'Contacte-nos para agendar a sua avaliação presencial numa altura que lhe seja conveniente.', link: '/get-quote' },
            { title: 'Vistoria', description: 'O nosso perito acreditado visita a sua propriedade para realizar um estudo técnico completo.', link: '/locations' },
            { title: 'Finalizar', description: 'Receba o seu certificado energético e o relatório de aconselhamento detalhado num prazo de 48 horas.', link: '/get-quote' },
        ],
        ctaTitle: <>Precisa de <Link to="/energy-advisor" className="text-[#007F00] font-bold hover:underline">aconselhamento energético especializado</Link>?</>, ctaDesc: 'A nossa equipa está pronta para o ajudar a otimizar a sua propriedade e garantir o cumprimento da legislação.', ctaButton: 'Começar'
    } : {
        badge: 'What We Do', heroTitle1: 'Precision Energy', heroTitle2: 'Solutions.',
        heroDesc: <>Comprehensive assessments and <Link to="/energy-advisor" className="text-[#007F00] font-bold hover:underline">expert advice</Link> to help you meet regulations and improve efficiency.</>,
        complianceTitle: 'Do I need a BER Certificate?',
        complianceDesc: <><Link to="/get-quote" className="text-[#007F00] font-bold hover:underline">Required by law for selling, renting, or grant applications</Link>. We provide the certification you need with fast turnaround and expert accuracy.</>,
        complianceCta: 'Book Now',
        servicesTitle: 'Our Core Offerings', servicesSubtitle: 'Expertise Across All Sectors',
        services: [
            { title: 'Domestic BER', description: 'Full registered assessments for homeowners and landlords. Required for all sales, rentals, and grant applications.', link: '/get-quote' },
            { title: 'Commercial BER', description: 'Non-Domestic energy ratings for businesses and retail units. Ensure compliance and optimize operational costs.', link: '/get-quote' },
            { title: 'Energy Audits', description: 'Detailed analysis of energy usage with actionable insights on where to save and how to modernize your property.', link: '/catalogue' },
            { title: 'Grant Advisory', description: <>Navigate the grant system with expert guidance. We help you qualify for the <Link to="/news" className="text-[#007F00] font-bold hover:underline">maximum funding available</Link>.</>, link: '/energy-advisor' },
            { title: 'Technical Analysis', description: 'Specialized surveys for heat pump suitability, insulation upgrades, and solar PV potential calculations.', link: '/catalogue' },
            { title: 'Support Services', description: 'Continuous advisory for property portfolios, new build provisional ratings, and final compliance checks.', link: '/energy-advisor' },
        ],
        howTitle: 'How It Works', howSubtitle: 'A simple 3-step process',
        steps: [
            { title: 'Schedule', description: <>Contact us to <Link to="/get-quote" className="text-[#007F00] font-bold hover:underline">book your on-site assessment</Link> at a time that suits you.</>, link: '/get-quote' },
            { title: 'Survey', description: <>Our <Link to="/locations" className="text-[#007F00] font-bold hover:underline">registered assessor</Link> visits your property for a comprehensive technical survey.</>, link: '/locations' },
            { title: 'Finalize', description: <>Receive your <Link to="/get-quote" className="text-[#007F00] font-bold hover:underline">BER certificate</Link> and detailed advisory report within 48 hours.</>, link: '/get-quote' },
        ],
        ctaTitle: <>Need <Link to="/energy-advisor" className="text-[#007F00] font-bold hover:underline">expert energy advice</Link>?</>, ctaDesc: 'Our team is ready to help you optimize your property and ensure full regulatory compliance.', ctaButton: 'Get Started'
    };

    const serviceSchema = {
        '@context': 'https://schema.org',
        '@type': 'Service',
        name: `${brand} - ${serviceName} Services`,
        provider: {
            '@type': 'LocalBusiness',
            name: brand,
            url: baseUrl,
            address: isEngland
                ? { '@type': 'PostalAddress', streetAddress: 'Kings Court, 33 King Street', addressLocality: 'Blackburn', postalCode: 'BB2 2DH', addressCountry: 'GB' }
                : { '@type': 'PostalAddress', addressCountry: country, addressLocality: locale },
            telephone: isEngland ? '+44 1217260031' : undefined,
        },
        areaServed: { '@type': 'Country', name: isEngland ? 'United Kingdom' : isSpanish ? 'Spain' : isFrance ? 'France' : isPortugal ? 'Portugal' : 'Ireland' },
        serviceType: serviceName,
        url: `${baseUrl}/services`,
    };

    return (
        <div className="font-sans text-gray-900 bg-white min-h-screen">
            <SEOHead
                title={title}
                description={description}
                canonical="/services"
                ogTitle={irelandOgTitle || englandOgTitle}
                ogDescription={irelandOgDesc || englandOgDesc}
                twitterTitle={irelandTwitterTitle || englandTwitterTitle}
                twitterDescription={irelandTwitterDesc || englandTwitterDesc}
                skipSiteNameSuffix={!isSpanish && !isFrance && !isPortugal}
                jsonLd={[
                    serviceSchema,
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

            {/* 1. COMPACT HERO SECTION */}
            <section className="pt-32 pb-16 bg-white">
                <div className="container mx-auto px-6 text-center max-w-4xl">
                    <span className="inline-block mb-4 px-4 py-1.5 rounded-full bg-green-50 text-[#007F00] text-xs font-black tracking-widest uppercase border border-green-100">
                        {tr.badge}
                    </span>
                    <h1 className="text-4xl md:text-6xl font-black text-gray-900 mb-6 leading-tight">
                        {tr.heroTitle1} <br className="hidden md:block" />
                        <span className="text-[#007F00]">{tr.heroTitle2}</span>
                    </h1>
                    <p className="text-lg md:text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed">
                        {isSpanish ? (
                            <><Link to="/energy-advisor" className="text-[#007F00] font-bold hover:underline">Valoraciones integrales y asesoramiento experto</Link> para ayudarle a cumplir con la <Link to="/catalogue" className="text-[#007F00] font-bold hover:underline">normativa y mejorar la eficiencia</Link>.</>
                        ) : isEngland ? (
                            <><Link to="/energy-advisor" className="text-[#007F00] font-bold hover:underline">Comprehensive assessments and expert advice</Link> to help you meet <Link to="/catalogue" className="text-[#007F00] font-bold hover:underline">regulations and improve efficiency</Link>.</>
                        ) : tr.heroDesc}
                    </p>
                </div>
            </section>

            {/* 2. COMPLIANCE INFO SECTION */}
            <section className="py-12 bg-gray-50 border-y border-gray-100">
                <div className="container mx-auto px-6 max-w-5xl">
                    <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8 text-center md:text-left">
                        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex-shrink-0">
                            <AlertTriangle size={32} className="text-[#007F00]" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg md:text-xl font-black text-gray-900 mb-2 uppercase tracking-tight">{tr.complianceTitle}</h3>
                            <p className="text-gray-500 font-bold text-sm leading-relaxed max-w-2xl">
                                {isSpanish ? (
                                    <>Obligatorio por ley para la venta, alquiler o solicitud de subvenciones. <Link to="/get-quote" className="text-[#007F00] font-bold hover:underline">Le proporcionamos el certificado que necesita</Link> con entrega rápida y precisión técnica.</>
                                ) : isEngland ? (
                                    <>Required by law for selling, renting, or grant applications. <Link to="/get-quote" className="text-[#007F00] font-bold hover:underline">We provide the certification you need</Link> with fast turnaround and expert accuracy.</>
                                ) : tr.complianceDesc}
                            </p>
                        </div>
                        <div className="w-full md:w-auto mt-4 md:mt-0">
                            <Link to="/contact-us">
                                <button className="w-full md:w-auto bg-white text-[#007F00] font-black px-8 py-4 rounded-xl border border-green-100 hover:bg-green-50 transition-all text-xs uppercase tracking-widest shadow-sm cursor-pointer active:scale-95">
                                    {tr.complianceCta}
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* 3. CORE SERVICES GRID */}
            <section className="py-24 bg-white">
                <div className="container mx-auto px-6 max-w-7xl">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-black text-gray-900 mb-2 uppercase tracking-tight">{tr.servicesTitle}</h2>
                        <p className="text-gray-400 text-xs font-black uppercase tracking-widest">{tr.servicesSubtitle}</p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {tr.services.map((svc, i) => (
                            <ServiceItem key={i} icon={serviceIcons[i]} title={svc.title} description={svc.description} link={(svc as any).link} />
                        ))}
                    </div>
                </div>
            </section>

            {/* 4. STRUCTURED PROCESS */}
            <section className="py-24 bg-gray-50 border-y border-gray-100">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-black text-gray-900 mb-2 uppercase tracking-tight">{tr.howTitle}</h2>
                        <p className="text-gray-400 text-xs font-black uppercase tracking-widest">{tr.howSubtitle}</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-12 max-w-5xl mx-auto">
                        {tr.steps.map((step, i) => (
                            <ProcessStep key={i} number={`0${i + 1}`} title={step.title} description={step.description} link={(step as any).link} />
                        ))}
                    </div>
                </div>
            </section>

            {/* 5. FINISH CTA SECTION */}
            <section className="py-2">
                <div className="container max-w-full">
                    <div className="bg-gray-50 p-12 md:p-20 text-center relative overflow-hidden border border-gray-100">
                        <div className="relative z-10">
                            <h2 className="text-3xl md:text-5xl font-black text-gray-900 mb-6 uppercase tracking-tight">{isSpanish ? <Link to="/energy-advisor" className="hover:underline">¿Necesita asesoramiento energético experto?</Link> : (isEngland ? <Link to="/energy-advisor" className="hover:underline">{tr.ctaTitle}</Link> : tr.ctaTitle)}</h2>
                            <p className="text-gray-500 text-lg mb-10 max-w-xl mx-auto font-medium">
                                {tr.ctaDesc}
                            </p>
                            <Link to={!isFrance ? '/energy-advisor' : '/contact-us'}>
                                <button className="bg-[#007F00] text-white font-black px-12 py-5 rounded-2xl hover:bg-[#006400] transition-all shadow-xl flex items-center gap-3 mx-auto transform hover:-translate-y-1 active:translate-y-0 cursor-pointer">
                                    {tr.ctaButton} <ArrowRight size={20} />
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
            <InternalLinks page="services" />
        </div>
    );
};

const serviceIcons = [
    <Zap size={24} />,
    <Shield size={24} />,
    <BarChart3 size={24} />,
    <Globe2 size={24} />,
    <Cpu size={24} />,
    <Truck size={24} />,
];

const ServiceItem = ({ icon, title, description, link }: { icon: React.ReactNode, title: string, description: React.ReactNode, link?: string }) => (
    <Link to={link || '#'} className="p-10 bg-white rounded-[2.5rem] border border-gray-100 hover:border-green-100 transition-all hover:shadow-lg group cursor-pointer block">
        <div className="w-14 h-14 rounded-2xl bg-green-50 text-[#007F00] flex items-center justify-center group-hover:bg-[#007F00] group-hover:text-white transition-all transform group-hover:scale-110 mb-8 shadow-sm">
            {icon}
        </div>
        <h3 className="text-xl font-black text-gray-900 mb-4 uppercase tracking-tight">{title}</h3>
        <p className="text-gray-500 leading-relaxed font-bold text-sm">
            {description}
        </p>
    </Link>
);

const ProcessStep = ({ number, title, description, link }: { number: string, title: string, description: React.ReactNode, link?: string }) => (
    <Link to={link || '#'} className="text-center group cursor-pointer block">
        <div className="w-20 h-20 bg-white border border-gray-100 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-sm group-hover:border-[#007F00] transition-all group-hover:shadow-lg transform group-hover:-translate-y-1">
            <span className="text-2xl font-black text-[#007F00]">{number}</span>
        </div>
        <h3 className="text-xl font-black text-gray-900 mb-4 uppercase tracking-tight">{title}</h3>
        <p className="text-gray-500 font-bold text-sm leading-relaxed">
            {description}
        </p>
    </Link>
);

export default Services;
