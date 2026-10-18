import { Globe, ArrowRight, Shield, Zap, Euro, Clock, CheckCircle, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import SEOHead from '../components/SEOHead';
import InternalLinks from '../components/InternalLinks';
import { getTenantFromDomain } from '../lib/tenant';
import { usePageContent, cmsValue } from '../hooks/usePageContent';

const About = () => {
    const tenant = getTenantFromDomain();
    const isSpanish = tenant === 'spain';
    const isFrance = tenant === 'france';
    const isPortugal = tenant === 'portugal';
    const isEngland = tenant === 'england';
    const brand = isSpanish ? 'Certificado Energético' : isEngland ? 'EPC Cert' : isFrance ? 'DPE Cert France' : isPortugal ? 'Certificado Energia' : 'The Berman';
    const regAuthority = isSpanish ? 'CEE CAT' : isEngland ? 'accredited' : isFrance ? 'DPE' : isPortugal ? 'SCE' : 'SEAI';

    const { content: cms, loading: cmsLoading } = usePageContent('about');
    const c = (section: string, key: string, fallback: string) => cmsValue(cms, section, key, fallback);

    const tr = isPortugal ? {
        seoTitle: 'Sobre Nós - Especialistas em Certificação Energética',
        seoDesc: 'Conheça a Certificado Energia, a plataforma de confiança para certificação energética em Portugal. Peritos qualificados, avaliações rápidas e profissionais.',
        missionTag: 'A Nossa Missão',
        title1: 'Precisão em cada',
        title2: 'Certificação.',
        heroP: 'Ajudamos os proprietários em Portugal a compreender, melhorar e certificar o desempenho energético dos seus imóveis, com apoio dos melhores profissionais do setor.',
        storyH: 'A Nossa História',
        story: [
            `A ${brand} nasceu com um objetivo claro: trazer clareza profissional e rigor técnico ao setor da certificação energética em Portugal.`,
            'O que começou como uma pequena equipa cresceu para uma rede nacional de peritos qualificados.',
            `Hoje, a ${brand} é uma plataforma de confiança para avaliações energéticas em todo o Portugal. Já facilitámos milhares de Certificados Energéticos.`,
            'Olhando para o futuro, o nosso foco mantém-se na inovação, na conformidade e em ajudar os proprietários a cumprir a legislação energética mais recente.',
        ],
        stats: [
            { n: '1k+', l1: 'Avaliações Energéticas', l2: 'Concluídas' },
            { n: '100+', l1: 'Peritos Qualificados', l2: 'em Todo o País' },
            { n: 'SCE', l1: 'Peritos', l2: 'Certificados' },
        ],
        howH: 'Como Trabalhamos',
        howSub: `Princípios da ${brand}`,
        values: [
            { icon: <Zap size={24} />, title: 'Serviço Profissional', desc: 'Os nossos peritos oferecem avaliações precisas com foco em tempos de resposta rápidos.' },
            { icon: <Shield size={24} />, title: 'Consultores Credenciados', desc: 'Todas as certificações são realizadas por profissionais certificados e comprometidos com um trabalho honesto e transparente.' },
            { icon: <Globe size={24} />, title: 'Foco em Eficiência Energética', desc: 'Oferecemos recomendações orientadas para a poupança energética a longo prazo e a redução do impacto ambiental.' },
        ],
        faqH: 'Perguntas Frequentes',
        faqSub: 'Tudo o que precisa de saber',
        faqs: [
            { q: 'O que é um Certificado Energético?', a: 'O Certificado Energético indica o nível de eficiência energética de um imóvel, classificando-o de A (mais eficiente) a G (menos eficiente), de forma semelhante ao etiquetagem dos eletrodomésticos.' },
            { q: 'O Certificado Energético é obrigatório em Portugal?', a: 'Sim. É obrigatório por lei para vender, arrendar ou anunciar um imóvel, com exceções muito limitadas.' },
            { q: 'Quanto custa um Certificado Energético?', a: 'O preço depende do tamanho e tipo do imóvel. Comparar orçamentos de vários peritos ajuda a conseguir o melhor preço.' },
            { q: 'Quanto tempo dura a avaliação?', a: 'A avaliação no imóvel costuma durar entre 1 e 3 horas, consoante o tamanho.' },
            { q: 'Qual a validade do Certificado Energético?', a: 'É válido por 10 anos, salvo se forem efetuadas alterações significativas que afetem o desempenho energético do imóvel.' },
            { q: 'Como obtenho um Certificado Energético?', a: 'Marca com um perito certificado, este visita e avalia o imóvel, e o certificado é emitido e registado.' },
            { q: 'Posso escolher a data e hora da avaliação?', a: 'Sim. Pode selecionar a data e hora preferidas ao reservar através da plataforma.' },
            { q: 'Os peritos estão qualificados e são de confiança?', a: 'Sim. Todas as avaliações são realizadas por peritos qualificados que seguem um código oficial de boas práticas.' },
            { q: 'O que acontece se obtiver uma classificação baixa?', a: 'Uma classificação baixa não impede a venda do imóvel; apenas informa o comprador. O nosso relatório de recomendações indicará como melhorar.' },
        ],
        joinH: 'Junte-se à',
        joinH2: `${brand}`,
        joinP: 'Pronto para uma avaliação energética profissional? A nossa rede nacional de peritos qualificados está pronta para o ajudar hoje.',
        cta: 'Pedir o Meu Orçamento',
    } : isSpanish ? {
        seoTitle: 'Sobre Nosotros - Certificadores Energéticos Expertos',
        seoDesc: 'Conoce Certificado Energético, la principal consultora energética de España. Certificaciones rápidas, precisas y profesionales.',
        missionTag: 'Nuestra Misión',
        title1: 'Precisión en cada',
        title2: 'Certificación.',
        heroP: 'le ayudamos a entender, mejorar y ahorrar dinero con una certificación de eficiencia energética que le será explicada por los mejores profesionales del sector.',
        storyH: 'Nuestra Historia',
        story: [
            `${brand} se fundó con un objetivo claro: aportar claridad profesional y rigor técnico al sector de la certificación energética en España. Detectamos que los propietarios y las empresas no solo buscaban un certificado; buscaban una hoja de ruta hacia un futuro más sostenible y rentable.`,
            'Lo que comenzó como un equipo especializado en Madrid se ha convertido en una red nacional de certificadores acreditados. Nuestro crecimiento se apoya en la precisión, la integridad y un profundo conocimiento del parque edificado español. No solo medimos el rendimiento energético: lo interpretamos y ofrecemos recomendaciones prácticas que generan ahorros reales.',
            `Hoy, ${brand} es una referencia en consultoría energética en España. Hemos realizado con éxito más de 10.000 certificaciones, ayudando a familias y empresas a gestionar la complejidad de los certificados energéticos y las subvenciones de rehabilitación. Nuestra misión sigue siendo la misma: dar a nuestros clientes el conocimiento necesario para tomar decisiones informadas sobre la eficiencia energética de su propiedad.`,
            `Mirando al futuro, nos centramos en la innovación y la excelencia. Mejoramos continuamente nuestros procesos y nos mantenemos a la vanguardia de la tecnología energética para ofrecer el máximo nivel de servicio. En ${brand} creemos que una propiedad eficiente es la base de una España moderna y sostenible.`,
        ],
        stats: [
            { n: '10k+', l1: 'Certificaciones', l2: 'Energéticas Emitidas' },
            { n: '1000+', l1: 'Red Nacional de', l2: 'Certificadores' },
            { n: 'CEE', l1: 'Certificadores', l2: 'Acreditados' },
        ],
        howH: 'Cómo Trabajamos',
        howSub: `Principios de ${brand}`,
        values: [
            { icon: <Zap size={24} />, title: 'Rapidez y Precisión', desc: 'Sabemos que tu tiempo es valioso. Nuestros certificadores ofrecen calificaciones precisas con un enfoque en tiempos de respuesta rápidos.' },
            { icon: <Shield size={24} />, title: 'Integridad Profesional', desc: 'Todas las certificaciones las realizan profesionales acreditados y asegurados, comprometidos con un trabajo honesto y transparente.' },
            { icon: <Globe size={24} />, title: 'Futuro Verde', desc: 'Ofrecemos recomendaciones orientadas al ahorro energético a largo plazo y a la reducción del impacto ambiental.' },
        ],
        faqH: 'Preguntas Frecuentes',
        faqSub: 'Todo lo que necesitas saber',
        faqs: [
            { q: '¿Qué es un Certificado Energético?', a: 'El Certificado de Eficiencia Energética (CEE) indica el nivel de eficiencia energética de una propiedad. Califica los edificios de la A (más eficiente) a la G (menos eficiente), de forma similar al etiquetado energético de los electrodomésticos.' },
            { q: '¿Es obligatorio el Certificado Energético en España?', a: 'Sí. El certificado energético es obligatorio por ley para vender, alquilar o anunciar una propiedad en venta o en alquiler, con excepciones muy limitadas.' },
            { q: '¿Cuánto cuesta un Certificado Energético?', a: 'El precio depende del tamaño y el tipo de propiedad. Los precios varían, por lo que comparar presupuestos de varios certificadores te ayuda a conseguir el mejor precio.' },
            { q: '¿Cuánto dura la inspección?', a: 'La inspección en la propiedad suele durar entre 1 y 3 horas, según su tamaño.' },
            { q: '¿Cuánto tiempo es válido el Certificado Energético?', a: 'Tiene una validez de 10 años, salvo que se realicen cambios importantes en la propiedad que afecten a su rendimiento energético.' },
            { q: '¿Cómo obtengo un Certificado Energético?', a: 'Reservas con un certificador acreditado, visita y evalúa tu propiedad, y el certificado se emite y se registra en el organismo competente de tu comunidad autónoma.' },
            { q: '¿Puedo elegir la fecha y la hora de la inspección?', a: 'Sí. Puedes seleccionar la fecha y hora que prefieras al reservar a través de la plataforma.' },
            { q: '¿Los certificadores están acreditados y son de confianza?', a: 'Sí. Todas las certificaciones las realizan técnicos acreditados que siguen un código oficial de buenas prácticas.' },
            { q: '¿Qué pasa si obtengo una calificación baja?', a: 'Una calificación baja no impide vender tu propiedad; simplemente informa al comprador. Nuestro informe de recomendaciones te indicará cómo mejorarla.' },
        ],
        joinH: 'Únete a la familia',
        joinH2: `${brand}`,
        joinP: '¿Preparado para tu certificación energética profesional? Nuestro equipo nacional está listo para ayudarte hoy mismo.',
        cta: 'Pedir mi Presupuesto',
    } : isFrance ? {
        seoTitle: 'À Propos - Experts en Diagnostic de Performance Énergétique',
        seoDesc: 'Découvrez DPE Cert France, la plateforme de confiance pour le diagnostic de performance énergétique en France. Diagnostiqueurs certifiés, évaluations rapides et professionnelles.',
        ogTitle: 'À Propos | DPE Cert France',
        ogDescription: 'Découvrez comment DPE Cert France connecte les propriétaires avec des diagnostiqueurs certifiés partout en France.',
        twitterTitle: 'À Propos | DPE Cert France',
        twitterDescription: 'En savoir plus sur DPE Cert France, votre plateforme de confiance pour les diagnostics de performance énergétique.',
        missionTag: 'Qui Sommes-Nous',
        title1: 'Précision dans chaque',
        title2: 'Certification.',
        heroP: 'Nous aidons les propriétaires en France à comprendre, améliorer et certifier la performance énergétique de leurs biens, avec l\'accompagnement des meilleurs professionnels du secteur.',
        storyH: 'Notre Histoire',
        story: [
            `${brand} est né avec un objectif clair : apporter clarté professionnelle et rigueur technique au secteur du diagnostic de performance énergétique en France.`,
            'Ce qui a commencé comme une petite équipe est devenu un réseau national de diagnostiqueurs certifiés.',
            `Aujourd'hui, ${brand} est une plateforme de confiance pour les diagnostics énergétiques dans toute la France. Nous avons facilité des milliers de certificats DPE.`,
            'En regardant vers l\'avenir, nous restons concentrés sur l\'innovation, la conformité et l\'aide aux propriétaires pour respecter les dernières réglementations énergétiques.',
        ],
        stats: [
            { n: '1k+', l1: 'Diagnostics', l2: 'Réalisés' },
            { n: '100+', l1: 'Diagnostiqueurs', l2: 'Certifiés' },
            { n: 'DPE', l1: 'Experts', l2: 'Certifiés' },
        ],
        howH: 'Comment Nous Travaillons',
        howSub: `Principes de ${brand}`,
        values: [
            { icon: <Zap size={24} />, title: 'Rapidité et Précision', desc: 'Nos diagnostiqueurs offrent des évaluations précises avec des délais de réponse rapides.' },
            { icon: <Shield size={24} />, title: 'Intégrité Professionnelle', desc: 'Toutes les certifications sont réalisées par des professionnels certifiés, engagés dans un travail honnête et transparent.' },
            { icon: <Globe size={24} />, title: 'Avenir Vert', desc: 'Nous proposons des recommandations orientées vers les économies d\'énergie à long terme et la réduction de l\'impact environnemental.' },
        ],
        faqH: 'Questions Fréquentes',
        faqSub: 'Tout ce que vous devez savoir',
        faqs: [
            { q: 'Qu\'est-ce qu\'un DPE ?', a: 'Le Diagnostic de Performance Énergétique (DPE) indique le niveau de performance énergétique d\'un bien. Il classe les bâtiments de A (plus efficace) à G (moins efficace).' },
            { q: 'Le DPE est-il obligatoire en France ?', a: 'Oui. Le DPE est obligatoire par loi pour vendre, louer ou annoncer un bien, avec des exceptions très limitées.' },
            { q: 'Combien coûte un DPE ?', a: 'Le prix dépend de la taille et du type de bien. Comparer les devis de plusieurs diagnostiqueurs vous aide à obtenir le meilleur prix.' },
            { q: 'Combien de temps dure le diagnostic ?', a: 'La visite sur place dure généralement entre 1 et 3 heures, selon la taille du bien.' },
            { q: 'Quelle est la validité du DPE ?', a: 'Le DPE est valide 10 ans, sauf si des travaux importants modifient la performance énergétique du bien.' },
            { q: 'Comment obtenir un DPE ?', a: 'Vous réservez avec un diagnostiqueur certifié, il visite et évalue votre bien, puis le certificat est émis et enregistré.' },
            { q: 'Puis-je choisir la date et l\'heure ?', a: 'Oui. Vous pouvez sélectionner la date et l\'heure de votre choix lors de la réservation.' },
            { q: 'Les diagnostiqueurs sont-ils certifiés ?', a: 'Oui. Tous les diagnostics sont réalisés par des diagnostiqueurs certifiés qui suivent un code officiel de bonnes pratiques.' },
            { q: 'Que se passe-t-il si j\'obtiens une mauvaise note ?', a: 'Une mauvaise note ne vous empêche pas de vendre. Elle informe simplement l\'acheteur. Notre rapport de recommandations vous indiquera comment l\'améliorer.' },
        ],
        joinH: 'Besoin d\'un',
        joinH2: 'Diagnostic DPE ?',
        joinP: 'Comparez les devis de diagnostiqueurs certifiés au service des propriétaires, bailleurs et entreprises dans toute la France.',
        cta: 'Obtenir un Devis Gratuit',
    } : {
        seoTitle: isEngland ? 'About EPCCert | Trusted EPC Certificate Experts in England' : 'About The Berman | Ireland\'s BER Certificate Platform',
        seoDesc: isEngland ? 'Trusted EPC Certificate providers in England. EPCCert offers fast, affordable energy assessments for residential & commercial properties.' : "Learn about The Berman, Ireland's trusted platform connecting homeowners with 100+ SEAI-registered BER assessors nationwide for fast, reliable certificates.",
        ogTitle: isEngland ? 'About EPCCert | Professional EPC Certificate Services England' : 'The Berman | SEAI registered BER assessor',
        ogDescription: isEngland ? 'Get certified Energy Performance Certificates across England. EPCCert offers reliable EPC assessments for homeowners, landlords, and businesses.' : 'Discover how The Berman connects homeowners and businesses with qualified SEAI-registered BER assessors across Ireland.',
        twitterTitle: isEngland ? "About EPCCert | England's Trusted EPC Certificate Provider" : 'About The Berman | Trusted BER Assessor Network',
        twitterDescription: isEngland ? 'Get fast, accurate, and affordable EPC Certificates across England. Contact EPCCert\'s team of certified energy assessors today.' : 'Find out how The Berman connects Irish homeowners with SEAI-registered BER assessors nationwide.',
        missionTag: 'Who We Are',
        title1: isEngland ? 'Helping Property Owners' : 'About The BER',
        title2: isEngland ? 'Arrange EPC Assessments Across England' : 'Man',
        heroP: isEngland ? 'Expand to homeowners, landlords and businesses' : "The Berman is Ireland's largest BER website, built to make finding a BER certificate simple, fast and affordable. Whether you need an energy certificate for a house sale, a rental property, a new build, or an SEAI grant application, we connect you directly with qualified, SEAI registered assessors across every county in the country.",
        storyH: isEngland ? 'Our Story' : 'Connecting Property Owners with Qualified BER Assessors',
        story: isEngland ? [
            "EPC Cert was established to receive Energy Performance Certificate (EPC) assessments easier for property owners, landlords, estate agents and businesses across England.",
            "We understand that obtaining an EPC is often a necessary part of selling, renting or managing a property, yet finding a qualified assessor and arranging an appointment can be time-consuming. Our platform was created to simplify the process by connecting customers with accredited EPC assessors through a trusted nationwide network.",
            "From residential homes and rental properties to commercial buildings, EPC Cert helps customers access professional EPC assessment services with greater convenience and confidence. We focus on providing a straightforward booking experience, flexible appointment availability and access to qualified assessors who operate in accordance with current EPC regulations and industry standards.",
            "As energy efficiency continues to play an important role in the property sector, our commitment remains the same: helping customers across England access reliable EPC assessment services while making the process clear, efficient and stress-free.",
        ] : [
            "The BER Man was created to make arranging BER assessments simpler, more transparent, and easier to manage for property owners.",
            `What started as a specialist service has grown into a trusted network of ${regAuthority}-registered BER Assessors, helping homeowners, landlords, estate agents, and businesses access professional energy rating services through one convenient platform.`,
            "Today, the BER Man helps connect property owners with qualified assessors while making BER assessments easier to arrange and understand.",
            "Our focus remains simple: helping people make informed decisions about their property's energy performance with confidence.",
        ],
        stats: isEngland ? [
            { n: '1k+', l1: 'Completed', l2: 'EPC Assessments' },
            { n: '100+', l1: 'Accredited EPC Assessors', l2: 'Across England' },
            { n: 'Level 3', l1: 'Qualified', l2: 'Energy Assessors' },
        ] : [
            { n: '1,000+', l1: 'BER Assessments', l2: 'Completed' },
            { n: '100+', l1: 'Qualified', l2: 'Assessors' },
            { n: regAuthority.toUpperCase(), l1: 'Registered', l2: 'BER Assessors' },
        ],
        howH: 'How We Work',
        howSub: isEngland ? 'Our Core Principles' : 'The BER Man combines local expertise with a streamlined online process, helping property owners arrange BER assessments with confidence.',
        values: [
            { icon: <Zap size={24} />, title: isEngland ? 'Professional Service' : 'Speed & Accuracy', desc: isEngland ? "Accredited assessors deliver reliable EPC assessments with clear reporting and efficient turnaround times." : 'Arrange BER assessments through a streamlined process designed to save time while maintaining professional standards.' },
            { icon: <Shield size={24} />, title: isEngland ? 'Accredited Assessors' : 'Qualified Professionals', desc: isEngland ? 'We work with qualified EPC assessors committed to professional standards and impartial assessments.' : 'Connect with experienced assessors who meet recognised industry requirements and deliver reliable property assessments.' },
            { icon: <Globe size={24} />, title: isEngland ? 'Energy Efficiency Focus' : 'Better Energy Decisions', desc: isEngland ? 'EPC assessments help property owners understand energy performance and identify improvement opportunities.' : 'Gain valuable insights into your property\'s energy performance and identify opportunities for improvement.' },
        ],
        faqH: 'Frequently Asked Questions',
        faqSub: 'Everything you need to know',
        faqs: isEngland ? [
            { q: 'What is an EPC Certificate?', a: 'An EPC (Energy Performance Certificate) shows how energy efficient a property is. It rates buildings from A (most efficient) to G (least efficient), similar to appliance energy labels.' },
            { q: 'Is an EPC Certificate mandatory in England?', a: 'Yes. An EPC certificate is legally required when a property is sold, rented, or advertised for sale or rent, with limited exemptions.' },
            { q: 'How much does an EPC Certificate cost?', a: 'The cost depends on the size and type of the property. Prices vary, which is why comparing quotes from multiple assessors helps you get the best price.' },
            { q: 'How long does an EPC assessment take?', a: 'The on-site assessment usually takes 1–3 hours, depending on the property size.' },
            { q: 'How long is an EPC Certificate valid for?', a: 'An EPC certificate is valid for 10 years, unless major changes are made to the property that affect energy performance.' },
            { q: 'How do I get an EPC Certificate?', a: 'You book an accredited EPC assessor, they visit and assess your property, and your certificate is issued and registered.' },
            { q: 'Can I choose my assessment date and time?', a: 'Yes. You can select a preferred date and time when booking through the platform.' },
            { q: 'Are EPC assessors registered and trusted?', a: 'Yes. All EPC assessments are carried out by accredited assessors who follow an official code of practice.' },
            { q: 'What happens if I get a bad rating?', a: 'A bad rating does not prevent you from selling. It simply informs the buyer. Our advisory report will suggest ways to improve it.' },
        ] : [
            { q: 'What is a BER Certificate?', a: 'A BER (Building Energy Rating) Certificate shows how energy efficient a property is. It rates buildings from A (most efficient) to G (least efficient), similar to appliance energy labels.' },
            { q: 'Is a BER Certificate mandatory in Ireland?', a: 'Yes. A BER certificate is legally required when a property is sold, rented, or advertised for sale or rent, with limited exemptions.' },
            { q: 'How much does a BER Certificate cost?', a: 'The cost depends on the size and type of the property. Prices vary, which is why comparing quotes from multiple assessors helps you get the best price.' },
            { q: 'How long does a BER assessment take?', a: 'The on-site assessment usually takes 1–3 hours, depending on the property size.' },
            { q: 'How long is a BER Certificate valid for?', a: 'A BER certificate is valid for 10 years, unless major changes are made to the property that affect energy performance.' },
            { q: 'How do I get a BER Certificate?', a: `You book a ${regAuthority}-registered BER assessor, they visit and assess your property, and your certificate is issued and registered with ${regAuthority}.` },
            { q: 'Can I choose my assessment date and time?', a: 'Yes. You can select a preferred date and time when booking through the platform.' },
            { q: 'Are BER assessors registered and trusted?', a: `Yes. All BER assessments are carried out by ${regAuthority}-registered assessors who follow an official code of practice.` },
            { q: 'What happens if I get a bad rating?', a: 'A bad rating does not prevent you from selling. It simply informs the buyer. Our advisory report will suggest ways to improve it.' },
        ],
        joinH: isEngland ? 'Need an EPC Certificate?' : 'Ready to Arrange Your',
        joinH2: isEngland ? '' : 'BER Assessment?',
        joinP: isEngland ? 'Compare quotes from accredited EPC assessors serving homeowners, landlords and businesses across England.' : 'Connect with qualified BER assessors and compare options for your property through one simple platform.',
        cta: isEngland ? 'Get a Free Quote' : 'Get My BER Quote',
    };

    const baseUrl = tenant === 'england' ? 'https://www.epccert.com' : isSpanish ? 'https://www.xn--certificadoenergtico-q2b.eu' : tenant === 'france' ? 'https://www.dpecert.fr' : tenant === 'portugal' ? 'https://www.certificadoenergia.com' : 'https://www.theberman.eu';

    const orgSchema = {
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
                        ? []
                        : ['https://www.facebook.com/people/The-Berman/61578159843471/', 'https://www.instagram.com/thebermanireland'],
    };

    const breadcrumbSchema = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
            { '@type': 'ListItem', position: 1, name: isPortugal ? 'Início' : 'Home', item: `${baseUrl}/` },
            { '@type': 'ListItem', position: 2, name: isPortugal ? 'Sobre Nós' : isSpanish ? 'Sobre Nosotros' : isFrance ? 'À Propos' : 'About Us', item: `${baseUrl}${isSpanish ? '/sobre-nosotros' : '/about-us'}` },
        ],
    };

    return (
        <div className="font-sans text-gray-900 bg-white min-h-screen">
            <SEOHead
                title={tr.seoTitle}
                description={tr.seoDesc}
                canonical={isSpanish ? '/sobre-nosotros' : '/about-us'}
                ogTitle={tr.ogTitle}
                ogDescription={tr.ogDescription}
                twitterTitle={tr.twitterTitle}
                twitterDescription={tr.twitterDescription}
                skipSiteNameSuffix={!isSpanish && !isPortugal && !isFrance}
                jsonLd={[
                    breadcrumbSchema,
                    orgSchema,
                ]}
            />

            {cmsLoading ? (
                <div className="min-h-screen bg-white" />
            ) : (
            <>
            {/* 1. SIMPLE CENTERED HERO */}
            <section className="pt-32 pb-16 bg-white">
                <div className="container mx-auto px-6 text-center max-w-4xl">
                    <span className="inline-block mb-4 px-4 py-1.5 rounded-full bg-green-50 text-[#007F00] text-xs font-black tracking-widest uppercase border border-green-100">
                        {c('hero', 'tag', tr.missionTag)}
                    </span>
                    <h1 className="text-4xl md:text-6xl font-black text-gray-900 mb-6 leading-tight">
                        {isEngland ? <Link to="/services" className="hover:underline">{tr.title1}</Link> : c('hero', 'heading_line1', tr.title1)} <br className="hidden md:block" />
                        <span className="text-[#007F00]">{isEngland ? <Link to="/services" className="hover:underline">{tr.title2}</Link> : c('hero', 'heading_line2', tr.title2)}</span>
                    </h1>
                    <p className="text-lg md:text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed">
                        {isSpanish ? (
                            <>le ayudamos a entender, mejorar y ahorrar dinero con una <Link to="/services" className="text-[#007F00] font-bold hover:underline">certificación de eficiencia energética</Link> que le será explicada por los mejores <Link to="/energy-advisor" className="text-[#007F00] font-bold hover:underline">profesionales del sector</Link>.</>
                        ) : (isEngland ? (
                            <>Expand to homeowners, landlords and businesses</>
                        ) : (tenant === 'ireland' ? <>The Berman is Ireland's largest BER website, built to make finding a BER certificate simple, fast and affordable. Whether you need an energy certificate for a house sale, a rental property, a new build, or an SEAI grant application, we connect you directly with qualified, <Link to="/services" className="text-[#007F00] font-bold hover:underline">SEAI registered assessors</Link> across every county in the country.</> : (isPortugal ? <>Ajudamos os proprietários em Portugal a obter o seu <Link to="/faq" className="text-[#007F00] font-bold hover:underline">certificado energético</Link> com apoio dos melhores <Link to="/energy-advisor" className="text-[#007F00] font-bold hover:underline">peritos qualificados</Link>.</> : c('hero', 'description', tr.heroP))))}
                    </p>
                </div>
            </section>

            {/* 2. STRUCTURED STORY SECTION */}
            <section className="py-24 bg-gray-50 border-y border-gray-100">
                <div className="container mx-auto px-6 max-w-6xl">
                    <div className="grid lg:grid-cols-12 gap-16 items-start">
                        {/* Left Side: Story Text */}
                        <div className="lg:col-span-8 space-y-8 text-gray-600 leading-relaxed font-sans text-lg text-left">
                            <div className="mb-8">
                                <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tight">{isSpanish ? <Link to="/about-us" className="hover:underline">{c('story', 'heading', tr.storyH)}</Link> : (tenant === 'ireland' ? <>Connecting Property Owners with <Link to="/services" className="hover:underline">Qualified BER Assessors</Link></> : c('story', 'heading', tr.storyH))}</h2>
                            </div>
                            <p>{isSpanish ? <>{brand} se fundó con un objetivo claro: aportar claridad profesional y rigor técnico al sector de la <Link to="/services" className="text-[#007F00] font-bold hover:underline">certificación energética en España</Link>. Detectamos que los propietarios y las empresas no solo buscaban un certificado; buscaban una hoja de ruta hacia un futuro más sostenible y rentable.</> : (isEngland ? <><Link to="/" className="text-[#007F00] font-bold hover:underline">EPC Cert</Link> was established to receive Energy Performance Certificate (EPC) assessments easier for property owners, landlords, estate agents and businesses across England.</> : (tenant === 'ireland' ? <>The BER Man was created to make arranging <Link to="/services" className="text-[#007F00] font-bold hover:underline">BER assessments</Link> simpler, more transparent, and easier to manage for property owners.</> : (isPortugal ? <>A <Link to="/" className="text-[#007F00] font-bold hover:underline">{brand}</Link> nasceu com um objetivo claro: trazer clareza profissional e rigor técnico ao setor da <Link to="/services" className="text-[#007F00] font-bold hover:underline">certificação energética em Portugal</Link>.</> : c('story', 'paragraph1', tr.story[0]))))}</p>
                            <p>{isSpanish ? <>Lo que comenzó como un equipo especializado en Madrid se ha convertido en una <Link to="/locations" className="text-[#007F00] font-bold hover:underline">red nacional de certificadores acreditados</Link>. Nuestro crecimiento se apoya en la precisión, la integridad y un profundo conocimiento del parque edificado español. No solo medimos el rendimiento energético: lo interpretamos y ofrecemos recomendaciones prácticas que generan ahorros reales.</> : (isEngland ? <>We understand that obtaining an EPC is often a necessary part of <Link to="/contact-us" className="text-[#007F00] font-bold hover:underline">selling, renting or managing a property</Link>, yet finding a qualified assessor and arranging an appointment can be time-consuming. Our platform was created to simplify the process by connecting customers with accredited EPC assessors through a trusted nationwide network.</> : (tenant === 'ireland' ? <>What started as a specialist service has grown into a trusted network of <Link to="/services" className="text-[#007F00] font-bold hover:underline">SEAI-registered BER Assessors</Link>, helping homeowners, landlords, estate agents, and businesses access professional energy rating services through one convenient platform.</> : (isPortugal ? <>O que começou como uma pequena equipa cresceu para uma rede nacional de <Link to="/energy-advisor" className="text-[#007F00] font-bold hover:underline">peritos qualificados</Link>.</> : c('story', 'paragraph2', tr.story[1]))))}</p>
                            <p>{isSpanish ? <>Hoy, {brand} es una referencia en <Link to="/services" className="text-[#007F00] font-bold hover:underline">consultoría energética en España</Link>. Hemos realizado con éxito más de 10.000 certificaciones, ayudando a familias y empresas a gestionar la complejidad de los certificados energéticos y las <Link to="/catalogue" className="text-[#007F00] font-bold hover:underline">subvenciones de rehabilitación</Link>. Nuestra misión sigue siendo la misma: dar a nuestros clientes el conocimiento necesario para tomar decisiones informadas sobre la eficiencia energética de su propiedad.</> : (isEngland ? <>From residential homes and rental properties to commercial buildings, <Link to="/energy-advisor" className="text-[#007F00] font-bold hover:underline">EPC Cert helps customers</Link> access professional <Link to="/services" className="text-[#007F00] font-bold hover:underline">EPC assessment services</Link> with greater convenience and confidence. We focus on providing a straightforward booking experience, flexible appointment availability and access to qualified assessors who operate in accordance with current EPC regulations and industry standards.</> : (isPortugal ? <>Hoje, a {brand} é uma plataforma de confiança para <Link to="/services" className="text-[#007F00] font-bold hover:underline">serviços de certificação energética</Link> em todo o Portugal.</> : c('story', 'paragraph3', tr.story[2])))}</p>
                            <p>{isSpanish ? <>Mirando al futuro, nos centramos en la innovación y la excelencia. Mejoramos continuamente nuestros procesos y nos mantenemos a la vanguardia de la <Link to="/energy-advisor" className="text-[#007F00] font-bold hover:underline">tecnología energética</Link> para ofrecer el máximo nivel de servicio. En {brand} creemos que una propiedad eficiente es la base de una España moderna y sostenible.</> : (isEngland ? tr.story[3] : (isPortugal ? <>Olhando para o futuro, o nosso foco mantém-se na inovação, na conformidade e em <Link to="/energy-advisor" className="text-[#007F00] font-bold hover:underline">apoio aos proprietários</Link>.</> : c('story', 'paragraph4', tr.story[3])))}</p>
                        </div>

                        {/* Right Side: Stats / Impact */}
                        <div className="lg:col-span-4 lg:pl-12 lg:border-l border-gray-200">
                            <div className="sticky top-12 grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-8 lg:space-y-12">
                                <div>
                                    <p className="text-4xl md:text-5xl font-black text-[#007F00] mb-2">{isEngland ? tr.stats[0].n : c('story', 'stat1_value', tr.stats[0].n)}</p>
                                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest leading-tight">{isEngland ? `${tr.stats[0].l1} ${tr.stats[0].l2}` : c('story', 'stat1_label', `${tr.stats[0].l1} ${tr.stats[0].l2}`)}</p>
                                </div>
                                <div>
                                    <p className="text-4xl md:text-5xl font-black text-[#007F00] mb-2">{isEngland ? tr.stats[1].n : c('story', 'stat2_value', tr.stats[1].n)}</p>
                                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest leading-tight">{isEngland ? `${tr.stats[1].l1} ${tr.stats[1].l2}` : c('story', 'stat2_label', `${tr.stats[1].l1} ${tr.stats[1].l2}`)}</p>
                                </div>
                                <div>
                                    <p className="text-4xl md:text-5xl font-black text-[#007F00] mb-2">{isEngland ? tr.stats[2].n : c('story', 'stat3_value', tr.stats[2].n)}</p>
                                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest leading-tight">{isEngland ? `${tr.stats[2].l1} ${tr.stats[2].l2}` : c('story', 'stat3_label', `${tr.stats[2].l1} ${tr.stats[2].l2}`)}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 3. WHY CHOOSE THE BERMAN - moved from homepage */}
            {!isSpanish && !isEngland && !isFrance && !isPortugal && (
                <section className="py-24 bg-white">
                    <div className="container mx-auto px-6 max-w-7xl">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-5xl font-black text-[#007F00] mb-6 uppercase tracking-tight">Why Choose The Berman?</h2>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                            {[
                                { icon: <Euro size={28} />, title: 'Best Value Rates', link: '/pricing' },
                                { icon: <Zap size={28} />, title: 'Quick Results', link: '/get-quote' },
                                { icon: <ShieldCheck size={28} />, title: `${regAuthority} Certified Experts`, link: '/services' },
                                { icon: <CheckCircle size={28} />, title: 'Smooth & Stress-Free' },
                                { icon: <Shield size={28} />, title: 'Satisfaction Guaranteed' },
                                { icon: <Clock size={28} />, title: 'Pick Your Schedule', link: '/get-quote' },
                            ].map((item, i) => (
                                <Link key={i} to={item.link || '#'} className="p-8 bg-white rounded-3xl border border-gray-100 hover:border-green-200 transition-all hover:shadow-lg text-center group cursor-pointer block">
                                    <div className="w-16 h-16 mx-auto rounded-2xl bg-green-50 text-[#007F00] flex items-center justify-center group-hover:bg-[#007F00] group-hover:text-white transition-all transform group-hover:scale-110 mb-6 shadow-sm">
                                        {item.icon}
                                    </div>
                                    <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">{item.title}</h3>
                                </Link>
                            ))}
                        </div>

                        <div className="text-center">
                            <Link to="/get-quote">
                                <button className="px-12 py-5 bg-[#007F00] text-white font-black text-sm uppercase tracking-widest rounded-full hover:bg-[#006400] transition-all shadow-xl shadow-green-100 transform hover:-translate-y-1 active:translate-y-0 cursor-pointer">
                                    Get BER Quotes Now
                                </button>
                            </Link>
                        </div>
                    </div>
                </section>
            )}

            {/* 3b. WHY CHOOSE - England only */}
            {isEngland && (
                <section className="py-24 bg-white">
                    <div className="container mx-auto px-6 max-w-7xl">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-5xl font-black text-[#007F00] mb-6 uppercase tracking-tight">
                                Why Choose EPC Cert?
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                            {[
                                { icon: <Euro size={28} />, title: 'Best Value Rates', link: '/pricing' },
                                { icon: <Zap size={28} />, title: 'Quick Results', link: '/get-quote' },
                                { icon: <ShieldCheck size={28} />, title: 'Accreditation Experts', link: '/services' },
                                { icon: <CheckCircle size={28} />, title: 'Smooth & Stress Free', link: '/catalogue' },
                                { icon: <Shield size={28} />, title: 'Satisfaction Guaranteed', link: '/contact-us' },
                                { icon: <Clock size={28} />, title: 'Pick Your Schedule', link: '/get-quote' },
                            ].map((item, i) => (
                                <Link key={i} to={item.link} className="p-8 bg-white rounded-3xl border border-gray-100 hover:border-green-200 transition-all hover:shadow-lg text-center group cursor-pointer block">
                                    <div className="w-16 h-16 mx-auto rounded-2xl bg-green-50 text-[#007F00] flex items-center justify-center group-hover:bg-[#007F00] group-hover:text-white transition-all transform group-hover:scale-110 mb-6 shadow-sm">
                                        {item.icon}
                                    </div>
                                    <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">{item.title}</h3>
                                </Link>
                            ))}
                        </div>

                        <div className="text-center">
                            <Link to="/get-quote">
                                <button className="px-12 py-5 bg-[#007F00] text-white font-black text-sm uppercase tracking-widest rounded-full hover:bg-[#006400] transition-all shadow-xl shadow-green-100 transform hover:-translate-y-1 active:translate-y-0 cursor-pointer">
                                    Contact Now
                                </button>
                            </Link>
                        </div>
                    </div>
                </section>
            )}

            {/* 3c. WHY CHOOSE - Spain only */}
            {isSpanish && (
                <section className="py-24 bg-white">
                    <div className="container mx-auto px-6 max-w-7xl">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-5xl font-black text-[#007F00] mb-6 uppercase tracking-tight">
                                <Link to="/services" className="hover:underline">¿Por qué elegir Certificado Energético?</Link>
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                            {[
                                { icon: <Euro size={28} />, title: 'Mejores Precios', link: '/pricing' },
                                { icon: <Zap size={28} />, title: 'Resultados Rápidos', link: '/services' },
                                { icon: <ShieldCheck size={28} />, title: 'Certificadores Acreditados', link: '/energy-advisor' },
                                { icon: <CheckCircle size={28} />, title: 'Proceso Sencillo', link: '/get-quote' },
                                { icon: <Shield size={28} />, title: 'Satisfacción Garantizada', link: '/contact-us' },
                                { icon: <Clock size={28} />, title: 'Elige tu Horario', link: '/get-quote' },
                            ].map((item, i) => (
                                <Link key={i} to={item.link} className="p-8 bg-white rounded-3xl border border-gray-100 hover:border-green-200 transition-all hover:shadow-lg text-center group cursor-pointer block">
                                    <div className="w-16 h-16 mx-auto rounded-2xl bg-green-50 text-[#007F00] flex items-center justify-center group-hover:bg-[#007F00] group-hover:text-white transition-all transform group-hover:scale-110 mb-6 shadow-sm">
                                        {item.icon}
                                    </div>
                                    <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">{item.title}</h3>
                                </Link>
                            ))}
                        </div>

                        <div className="text-center">
                            <Link to="/get-quote">
                                <button className="px-12 py-5 bg-[#007F00] text-white font-black text-sm uppercase tracking-widest rounded-full hover:bg-[#006400] transition-all shadow-xl shadow-green-100 transform hover:-translate-y-1 active:translate-y-0 cursor-pointer">
                                    Solicitar Presupuesto
                                </button>
                            </Link>
                        </div>
                    </div>
                </section>
            )}

            {/* 4. CORE VALUES GRID */}
            <section className="py-24 bg-gray-50">
                <div className="container mx-auto px-6 max-w-7xl">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-black text-gray-900 mb-2 uppercase tracking-tight">{tr.howH}</h2>
                        <p className="text-gray-400 text-xs font-black uppercase tracking-widest">{tr.howSub}</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {tr.values.map((v, i) => {
                            const englandLinks = ['/services', '/get-quote', '/energy-advisor'];
                            const irelandLinks = ['/pricing', '/energy-advisor', '/services'];
                            const portugalLinks = ['/services', '/get-quote', '/energy-advisor'];
                            return <ValueItem key={i} icon={v.icon} title={isEngland ? v.title : c('values', `value${i}_title`, v.title)} description={isEngland ? v.desc : c('values', `value${i}_desc`, v.desc)} link={isEngland ? englandLinks[i] : (tenant === 'ireland' ? irelandLinks[i] : isPortugal ? portugalLinks[i] : undefined)} />;
                        })}
                    </div>
                </div>
            </section>

            {/* 5. FINISH CTA SECTION */}
            <section className="py-2">
                <div className="container max-w-full">
                    <div className="bg-gray-50 p-12 md:p-20 text-center relative overflow-hidden border border-gray-100">
                        <div className="relative z-10">
                            <h2 className="text-3xl md:text-5xl font-black text-gray-900 mb-6 uppercase tracking-tight">{isSpanish ? <Link to="/get-quote" className="hover:underline">{c('cta', 'heading', tr.joinH)}</Link> : (isEngland ? tr.joinH : c('cta', 'heading', tr.joinH))} <br />{isSpanish ? <Link to="/get-quote" className="hover:underline">{c('cta', 'heading_highlight', tr.joinH2)}</Link> : (isEngland ? tr.joinH2 : (tenant === 'ireland' ? <Link to="/contact-us" className="hover:underline">{c('cta', 'heading_highlight', tr.joinH2)}</Link> : (isPortugal ? <Link to="/" className="hover:underline">{c('cta', 'heading_highlight', tr.joinH2)}</Link> : c('cta', 'heading_highlight', tr.joinH2))))}</h2>
                            <p className="text-gray-500 text-lg mb-10 max-w-xl mx-auto font-medium">
                                {isEngland ? tr.joinP : (tenant === 'ireland' ? <>Connect with qualified <Link to="/energy-advisor" className="text-[#007F00] font-bold hover:underline">BER assessors</Link> and compare options for your property through one simple platform.</> : c('cta', 'description', tr.joinP))}
                            </p>
                            <Link to={isSpanish || tenant === 'ireland' || isPortugal ? '/get-quote' : '/contact-us'}>
                                <button className="bg-[#007F00] text-white font-black px-12 py-5 rounded-2xl hover:bg-[#006400] transition-all shadow-xl flex items-center gap-3 mx-auto transform hover:-translate-y-1 active:translate-y-0">
                                    {isEngland ? 'Get a Free Quote' : c('cta', 'button_text', tr.cta)} <ArrowRight size={20} />
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
            </>
            )}
            <InternalLinks page="about" />
        </div>
    );
};

const ValueItem = ({ icon, title, description, link }: { icon: React.ReactNode, title: string, description: string, link?: string }) => (
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

export default About;
