import { Link } from 'react-router-dom';
import { MapPin, ArrowRight } from 'lucide-react';
import SEOHead from '../components/SEOHead';
import InternalLinks from '../components/InternalLinks';
import { getTenantFromDomain } from '../lib/tenant';
import { getCountiesForTenant } from '../lib/tenantData';

const makeSlug = (name: string) =>
    name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const Locations = () => {
    const tenant = getTenantFromDomain();
    const isSpanish = tenant === 'spain';
    const isEngland = tenant === 'england';
    const isFrance = tenant === 'france';
    const isPortugal = tenant === 'portugal';
    const counties = getCountiesForTenant(tenant);
    const baseUrl = tenant === 'england' ? 'https://www.epccert.com' : isSpanish ? 'https://certificadoenerg\u00e9tico.eu' : tenant === 'france' ? 'https://dpefrance.eu' : tenant === 'portugal' ? 'https://certificadopt.eu' : 'https://www.theberman.eu';
    const brand = isSpanish ? 'Certificado Energético' : isEngland ? 'EPC Cert' : isFrance ? 'DPE France' : isPortugal ? 'Certificado Energético' : 'The BER Man';
    const tr = isSpanish ? {
        seoTitle: 'Certificadores Energéticos por Ubicación',
        seoDesc: 'Encuentra certificadores energéticos y profesionales de eficiencia en tu zona por toda España. Busca por comunidad autónoma.',
        heading: 'Selecciona tu Comunidad Autónoma',
        subtitle: 'Encuentra profesionales y proveedores mejor valorados en tu zona. Selecciona una comunidad autónoma para ver los listados disponibles.',
        viewListings: 'Ver Listados',
    } : isFrance ? {
        seoTitle: 'Diagnostiqueurs par Localisation',
        seoDesc: 'Trouvez des diagnostiqueurs certifiés près de chez vous en France. Parcourez par région.',
        heading: 'Parcourir par Localisation',
        subtitle: 'Trouvez des professionnels certifiés dans votre région. Sélectionnez une région pour voir les listes disponibles.',
        viewListings: 'Voir les Listes',
    } : isPortugal ? {
        seoTitle: 'Peritos por Localização',
        seoDesc: 'Encontre peritos certificados na sua zona em Portugal. Navegue por região.',
        heading: 'Navegar por Localização',
        subtitle: 'Encontre profissionais certificados na sua área. Selecione uma região para ver os listados disponíveis.',
        viewListings: 'Ver Listados',
    } : isEngland ? {
        seoTitle: 'EPC Assessors Across England | Service Areas',
        seoDesc: 'Connect with accredited EPC assessors serving homeowners, landlords and businesses across England. View local service areas and coverage.',
        heading: 'EPC Assessors Across England',
        subtitle: 'Compare quotes from accredited EPC assessors serving homeowners, landlords and businesses across England.',
        viewListings: 'View EPC Assessors',
    } : {
        seoTitle: 'BER Assessors by Location',
        seoDesc: 'Find BER assessors and energy upgrade professionals in your area across Ireland. Browse by county and region.',
        heading: 'Browse by Location',
        subtitle: 'Find top-rated professionals and suppliers in your area. Select a region to see available listings.',
        viewListings: 'View Listings',
    };

    return (
        <div className="min-h-screen bg-white pt-24 pb-20 font-sans">
            <SEOHead
                title={tr.seoTitle}
                description={tr.seoDesc}
                canonical="/locations"
                skipSiteNameSuffix={isEngland}
                jsonLd={[
                    {
                        '@context': 'https://schema.org',
                        '@type': 'BreadcrumbList',
                        itemListElement: [
                            { '@type': 'ListItem', position: 1, name: 'Home', item: `${baseUrl}/` },
                            { '@type': 'ListItem', position: 2, name: 'Locations', item: `${baseUrl}/locations` },
                        ],
                    },
                    {
                        '@context': 'https://schema.org',
                        '@type': 'Organization',
                        name: brand,
                        url: baseUrl,
                        logo: `${baseUrl}/logo.svg`,
                        sameAs: tenant === 'england'
                            ? ['https://www.facebook.com/epccert', 'https://www.instagram.com/epccert']
                            : isSpanish
                                ? ['https://www.facebook.com/certificadoenergetico', 'https://www.instagram.com/certificadoenergetico']
                                : tenant === 'france'
                                    ? ['https://www.facebook.com/dpefrance', 'https://www.instagram.com/dpefrance']
                                    : tenant === 'portugal'
                                        ? ['https://www.facebook.com/certificadoenergeticopt', 'https://www.instagram.com/certificadoenergeticopt']
                                        : ['https://www.facebook.com/people/The-Berman/61578159843471/', 'https://www.instagram.com/thebermanireland'],
                    },
                ]}
            />
            {/* Header */}
            <div className="container mx-auto px-6 mb-16 text-center">
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">{tr.heading}</h1>
                <p className="text-xl text-gray-500 max-w-2xl mx-auto font-light">
                    {tr.subtitle}
                </p>
            </div>

            {/* Counties Grid */}
            <div className="container mx-auto px-6 max-w-7xl">
                {isEngland && (
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8 text-center">Browse EPC Assessment Locations by Region</h2>
                )}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {counties.map((county) => (
                        <Link
                            key={county}
                            to={isEngland ? `/epc-assessment-${makeSlug(county)}/` : `/${makeSlug(county)}`}
                            className="group flex flex-col items-center gap-3 bg-gray-50 hover:bg-white rounded-2xl border border-gray-100 hover:border-[#007F00]/30 hover:shadow-lg transition-all duration-200 p-6 text-center"
                        >
                            <div className="w-12 h-12 rounded-full bg-[#007F00]/10 flex items-center justify-center group-hover:bg-[#007F00]/20 transition-colors">
                                <MapPin size={22} className="text-[#007F00]" />
                            </div>
                            <h3 className="text-sm font-bold text-gray-800 group-hover:text-[#007F00] transition-colors leading-tight">
                                {isEngland ? `EPC Assessment ${county}` : county}
                            </h3>
                            <div className="flex items-center gap-1 text-[10px] font-bold text-[#007EA7] uppercase tracking-wide">
                                {tr.viewListings}
                                <ArrowRight size={11} />
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
            <InternalLinks page="locations" />
        </div>
    );
};

export default Locations;
