import { useParams, Link } from 'react-router-dom';
import { MapPin, CheckCircle2, Star, Users, ArrowRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getTenantFromDomain } from '../lib/tenant';
import { getTownsForTenant } from '../lib/tenantData';
import { supabase } from '../lib/supabase';
import NotFound from './NotFound';

interface LocationPageData {
    hero_title: string;
    hero_subtitle: string;
    intro_text: string;
    seo_title: string;
    seo_description: string;
    meta_keywords: string;
    is_active: boolean;
}

const LocationPage = () => {
    const { county, town } = useParams<{ county: string; town: string }>();
    const tenant = getTenantFromDomain();
    const isSpanish = tenant === 'spain';
    const isEngland = tenant === 'england';
    const isFrance = tenant === 'france';
    const isPortugal = tenant === 'portugal';
    const [customData, setCustomData] = useState<LocationPageData | null>(null);
    const [dbChecked, setDbChecked] = useState(false);

    // Get the correct location data based on tenant
    const locationData = getTownsForTenant(tenant);
    const rawCountyName = county ? county.replace(/^epc-assessment-/, '').replace(/^certificado-energetico-/, '').replace(/-/g, ' ') : '';

    // Map popular England city slugs to their actual county names in the data
    const englandCityMap: Record<string, string> = {
        'london': 'Greater London',
        'manchester': 'Greater Manchester',
        'birmingham': 'West Midlands',
        'leeds': 'West Yorkshire',
        'liverpool': 'Merseyside',
        'sheffield': 'South Yorkshire',
        'nottingham': 'Nottinghamshire',
        'leicester': 'Leicestershire',
        'newcastle': 'Northumberland',
        'southampton': 'Hampshire',
        'oxford': 'Oxfordshire',
    };
    const mappedCountyName = isEngland && englandCityMap[rawCountyName.toLowerCase()]
        ? englandCityMap[rawCountyName.toLowerCase()]
        : rawCountyName;

    // Normalize slugs by removing diacritics (important for Spanish locations)
    const normalizeSlug = (v: string) =>
        v.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

    // Find real county name from the slug
    const countyKey = mappedCountyName
        ? Object.keys(locationData).find(k => normalizeSlug(k) === normalizeSlug(mappedCountyName))
        : undefined;
    const countyName = countyKey || mappedCountyName;
    const townsInCounty = countyKey ? (locationData[countyKey] || []) : [];

    let townName = town
        ? town.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
        : '';
    const townKey = town ? townsInCounty.find(t => normalizeSlug(t) === normalizeSlug(town)) : undefined;
    if (townKey) townName = townKey;

    // Display name for England popular cities (show 'London' not 'Greater London')
    // Maps from the URL slug to the friendly display name
    const englandDisplayMap: Record<string, string> = {
        'london': 'London',
        'manchester': 'Manchester',
        'birmingham': 'Birmingham',
        'leeds': 'Leeds',
        'liverpool': 'Liverpool',
        'sheffield': 'Sheffield',
        'nottingham': 'Nottingham',
        'leicester': 'Leicester',
        'newcastle': 'Newcastle',
        'southampton': 'Southampton',
        'oxford': 'Oxford',
    };
    const displayName = isEngland && !townName && englandDisplayMap[rawCountyName.toLowerCase()]
        ? englandDisplayMap[rawCountyName.toLowerCase()]
        : countyName.replace(/\b\w/g, c => c.toUpperCase());

    // Load custom location page content from DB
    useEffect(() => {
        const fetchLocationPage = async () => {
            if (!countyName) return;
            try {
                const { data } = await supabase
                    .from('location_pages')
                    .select('*')
                    .eq('tenant', tenant)
                    .eq('location_name', countyName)
                    .maybeSingle();
                if (data) setCustomData(data);
            } catch {
                // Ignore errors, fallback to generated content
            } finally {
                setDbChecked(true);
            }
        };
        fetchLocationPage();
    }, [countyName, tenant]);

    // Tenant-specific labels
    const labels = {
        assessor: isSpanish ? 'Técnicos Certificados' : isEngland ? 'DEA/EPC Assessors' : isFrance ? 'Diagnostiqueurs Certifiés' : isPortugal ? 'Peritos Qualificados' : 'BER Assessors',
        certificate: isSpanish ? 'Certificado de Eficiencia Energética' : isEngland ? 'EPC Certificate' : isFrance ? 'DPE' : isPortugal ? 'Certificado Energético' : 'BER Certificate',
        in: isSpanish ? 'en' : isFrance ? 'à' : isPortugal ? 'em' : 'in',
        find: isSpanish ? 'Encuentra' : isFrance ? 'Trouvez' : isPortugal ? 'Encontre' : 'Find',
        topRated: isSpanish ? 'Mejor valorados' : isFrance ? 'Mieux notés' : isPortugal ? 'Mais bem avaliados' : 'Top Rated',
        available: isSpanish ? 'Disponibles' : isFrance ? 'Disponibles' : isPortugal ? 'Disponíveis' : 'Available',
        getQuote: isSpanish ? 'Obtener cotización' : isFrance ? 'Obtenir un devis' : isPortugal ? 'Pedir orçamento' : 'Get Quote',
        viewAll: isSpanish ? 'Ver todos' : isFrance ? 'Voir tout' : isPortugal ? 'Ver todos' : 'View All',
        townsIn: isSpanish ? 'Localidades en' : isFrance ? 'Communes de' : isPortugal ? 'Localidades em' : 'Towns in',
        serviceAreas: isSpanish ? 'Áreas de servicio' : isFrance ? 'Zones d\'intervention' : isPortugal ? 'Áreas de serviço' : 'Service Areas',
    };

    const brandName = isSpanish ? 'Certificado Energético' : isEngland ? 'EPC Cert' : isFrance ? 'DPE France' : isPortugal ? 'Certificado Energético' : 'The Berman';

    // Generate meta title and description (use custom data if available)
    const defaultPageTitle = townName
        ? `${labels.assessor} ${labels.in} ${townName}, ${countyName} | ${isSpanish ? 'Certificado Energético' : isEngland ? 'EPC Certificates' : isFrance ? 'DPE' : isPortugal ? 'Certificado Energético' : 'BER Certificates'}`
        : `${labels.assessor} ${labels.in} ${displayName} | ${isSpanish ? 'Certificado Energético' : isEngland ? 'EPC Certificates' : isFrance ? 'DPE' : isPortugal ? 'Certificado Energético' : 'BER Certificates'}`;

    const defaultPageDescription = townName
        ? `${labels.find} ${labels.assessor.toLowerCase()} ${labels.in} ${townName}, ${countyName}. ${isSpanish ? 'Obtenga su certificado de eficiencia energética con técnicos certificados locales.' : isFrance ? 'Obtenez votre DPE avec des diagnostiqueurs certifiés locaux.' : isPortugal ? 'Obtenha o seu certificado energético com peritos qualificados locais.' : 'Get your energy certificate with local certified assessors.'}`
        : `${labels.find} ${labels.assessor.toLowerCase()} ${labels.in} ${displayName}. ${isSpanish ? 'Obtenga su certificado de eficiencia energética con técnicos certificados locales.' : isFrance ? 'Obtenez votre DPE avec des diagnostiqueurs certifiés locaux.' : isPortugal ? 'Obtenha o seu certificado energético com peritos qualificados locais.' : 'Get your energy certificate with local certified assessors.'}`;

    const pageTitle = customData?.seo_title || defaultPageTitle;
    const pageDescription = customData?.seo_description || defaultPageDescription;

    // Update document title and meta description, removing any middleware-injected duplicates
    useEffect(() => {
        document.title = pageTitle;
        const descMetas = document.querySelectorAll('meta[name="description"]');
        if (descMetas.length > 0) {
            descMetas.forEach(el => el.remove());
        }
        const meta = document.createElement('meta');
        meta.name = 'description';
        meta.content = pageDescription;
        document.head.appendChild(meta);
    }, [pageTitle, pageDescription]);

    // Unknown location → real 404. Prevents random URLs (via the :county catch-all
    // route) from rendering an auto-generated location page instead of Not Found.
    const isKnownCounty = !!countyKey;
    const isKnownTown = !town || !!townKey;
    if (!isKnownCounty || !isKnownTown) {
        // A custom location page saved in the DB is still allowed to render
        if (!dbChecked) return null;
        if (!customData) return <NotFound />;
    }

    const heroTitle = customData?.hero_title || `${labels.assessor} ${labels.in} ${townName || displayName}`;
    const heroSubtitle = customData?.hero_subtitle || (isSpanish
        ? `Su Certificado de Eficiencia Energética en ${countyName}.`
        : isFrance
            ? `Trouvez des diagnostiqueurs certifiés à ${townName || displayName}. Comparez les devis et réservez en ligne.`
            : isPortugal
                ? `Encontre peritos qualificados em ${townName || displayName}. Compare orçamentos e reserve online.`
                : (townName
                    ? `Find ${labels.assessor.toLowerCase()} ${labels.in} ${townName}, ${countyName}. Certified assessors ready to help with your energy certificate.`
                    : `Find ${labels.assessor.toLowerCase()} ${labels.in} ${displayName}. Certified assessors ready to help with your energy certificate.`)
    );

    const introText = customData?.intro_text || (isSpanish
        ? `Su Certificado de Eficiencia Energética en ${countyName}.`
        : isFrance
            ? `DPE Cert France connecte les propriétaires avec des diagnostiqueurs certifiés à ${townName || displayName}. Nos experts sont prêts à fournir des diagnostics de performance énergétique de haute qualité.`
            : isPortugal
                ? `A Certificado Energia conecta proprietários com peritos qualificados em ${townName || displayName}. Os nossos peritos estão prontos a fornecer certificados de eficiência energética de alta qualidade.`
                : `${brandName} connects homeowners with ${isEngland ? 'certified assessors' : 'BER assessors'} in ${townName || displayName}. Our expert assessors are ready to provide high-quality ${isEngland ? 'Energy Performance Certificates' : 'Building Energy Ratings'}.`
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-[#007F00] to-[#007EA7] text-white py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <nav className="flex items-center gap-2 text-sm opacity-80 mb-4">
                        <Link to="/" className="hover:underline">{isPortugal ? 'Início' : 'Home'}</Link>
                        <span>/</span>
                        {townName ? (
                            <>
                                <Link to={`/${county}`} className="hover:underline">{countyName}</Link>
                                <span>/</span>
                                <span className="font-semibold">{townName}</span>
                            </>
                        ) : (
                            <span className="font-semibold">{countyName}</span>
                        )}
                    </nav>
                    <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
                        {heroTitle}
                    </h1>
                    <p className="text-xl opacity-90 max-w-3xl">
                        {heroSubtitle}
                    </p>
                </div>
            </div>

            {/* Stats Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
                <div className="bg-white rounded-2xl shadow-xl p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="text-center">
                        <div className="flex items-center justify-center gap-2 text-3xl font-bold text-[#007F00] mb-2">
                            <Users size={32} />
                            <span>100+</span>
                        </div>
                        <p className="text-gray-600">{labels.assessor}</p>
                    </div>
                    <div className="text-center">
                        <div className="flex items-center justify-center gap-2 text-3xl font-bold text-[#007EA7] mb-2">
                            <Star size={32} className="fill-yellow-400 text-yellow-400" />
                            <span>4.8/5</span>
                        </div>
                        <p className="text-gray-600">{labels.topRated}</p>
                    </div>
                    <div className="text-center">
                        <div className="flex items-center justify-center gap-2 text-3xl font-bold text-[#007F00] mb-2">
                            <CheckCircle2 size={32} />
                            <span>{labels.available}</span>
                        </div>
                        <p className="text-gray-600">{isPortugal ? 'Hoje' : isFrance ? 'Aujourd\'hui' : 'Today'}</p>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Left Column - Content */}
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">
                            {labels.find} {labels.assessor} {labels.in} {townName || countyName}
                        </h2>
                        <div className="prose prose-lg text-gray-700 mb-8">
                            <p>{introText}</p>
                            <p>
                                {isSpanish
                                    ? `Todos nuestros técnicos están debidamente certificados y tienen experiencia en la evaluación de eficiencia energética de propiedades en ${countyName}.`
                                    : isFrance
                                        ? `Tous nos diagnostiqueurs sont pleinement certifiés et expérimentés dans le diagnostic de performance énergétique des propriétés en ${countyName}.`
                                        : isPortugal
                                            ? `Todos os nossos peritos são plenamente qualificados e experientes na avaliação energética de imóveis em ${countyName}.`
                                            : `All our assessors are fully certified and experienced in energy rating properties in ${countyName}.`
                                }
                            </p>
                        </div>

                        <Link
                            to="/get-quote"
                            className="inline-flex items-center gap-2 bg-[#007F00] text-white px-8 py-4 rounded-xl font-bold hover:bg-[#006400] transition-all shadow-lg hover:shadow-xl"
                        >
                            {labels.getQuote}
                            <ArrowRight size={20} />
                        </Link>
                    </div>

                    {/* Right Column - Towns in County */}
                    {townsInCounty.length > 0 && (
                        <div className="bg-gray-50 rounded-2xl p-8">
                            <h3 className="text-xl font-bold text-gray-900 mb-6">
                                {labels.townsIn} {countyName}
                            </h3>
                            <div className="grid grid-cols-2 gap-3">
                                {townsInCounty.map((town) => (
                                    <Link
                                        key={town}
                                        to={`/${county}/${town.replace(/\s+/g, '-').toLowerCase()}`}
                                        className="flex items-center gap-2 text-gray-700 hover:text-[#007F00] transition-colors p-2 rounded-lg hover:bg-white"
                                    >
                                        <MapPin size={16} />
                                        <span className="text-sm">{town}</span>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* CTA Section */}
            <div className="bg-gray-900 text-white py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl font-bold mb-4">
                        {isSpanish ? '¿Listo para obtener su certificado?' : isFrance ? 'Prêt à obtenir votre DPE ?' : isPortugal ? 'Pronto para obter o seu certificado?' : 'Ready to Get Your Certificate?'}
                    </h2>
                    <p className="text-xl opacity-90 mb-8">
                        {isSpanish
                            ? 'Compare precios de técnicos certificados en minutos'
                            : isFrance
                                ? 'Comparez les devis de diagnostiqueurs certifiés en quelques minutes'
                                : isPortugal
                                    ? 'Compare orçamentos de peritos qualificados em minutos'
                                    : 'Compare prices from certified assessors in minutes'
                        }
                    </p>
                    <Link
                        to="/get-quote"
                        className="inline-flex items-center gap-2 bg-[#007F00] text-white px-8 py-4 rounded-xl font-bold hover:bg-[#006400] transition-all shadow-lg hover:shadow-xl"
                    >
                        {labels.getQuote}
                        <ArrowRight size={20} />
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default LocationPage;
