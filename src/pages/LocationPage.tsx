import { useParams, Link } from 'react-router-dom';
import { MapPin, CheckCircle2, Star, Users, ArrowRight } from 'lucide-react';
import { getTenantFromDomain } from '../lib/tenant';
import { getTownsForTenant } from '../lib/tenantData';

const LocationPage = () => {
    const { county, town } = useParams<{ county: string; town: string }>();
    const tenant = getTenantFromDomain();
    const isSpanish = tenant === 'spain';
    const isEngland = tenant === 'england';
    const isFrance = tenant === 'france';
    const isPortugal = tenant === 'portugal';

    // Get the correct location data based on tenant
    const locationData = getTownsForTenant(tenant);
    const countyName = county ? county.replace(/-/g, ' ') : '';
    const townName = town ? town.replace(/-/g, ' ') : '';
    const townsInCounty = countyName ? (locationData[countyName] || []) : [];

    // Tenant-specific labels
    const labels = {
        assessor: isSpanish ? 'Técnicos Certificados' : isEngland ? 'DEA/EPC Assessors' : isFrance ? 'Diagnostiqueurs Certifiés' : isPortugal ? 'Peritos Certificados' : 'BER Assessors',
        certificate: isSpanish ? 'Certificado de Eficiencia Energética' : isEngland ? 'EPC Certificate' : isFrance ? 'DPE' : isPortugal ? 'Certificado Energético' : 'BER Certificate',
        in: isSpanish ? 'en' : isFrance ? 'à' : isPortugal ? 'em' : 'in',
        find: isSpanish ? 'Encuentra' : isFrance ? 'Trouvez' : isPortugal ? 'Encontre' : 'Find',
        topRated: isSpanish ? 'Mejor valorados' : isFrance ? 'Mieux notés' : isPortugal ? 'Mais bem avaliados' : 'Top Rated',
        available: isSpanish ? 'Disponibles' : isFrance ? 'Disponibles' : isPortugal ? 'Disponíveis' : 'Available',
        getQuote: isSpanish ? 'Obtener cotización' : isFrance ? 'Obtenir un devis' : isPortugal ? 'Pedir orçamento' : 'Get Quote',
        viewAll: isSpanish ? 'Ver todos' : isFrance ? 'Voir tout' : isPortugal ? 'Ver todos' : 'View All',
        townsIn: isSpanish ? 'Pueblos en' : isFrance ? 'Communes de' : isPortugal ? 'Localidades em' : 'Towns in',
        serviceAreas: isSpanish ? 'Áreas de servicio' : 'Service Areas',
    };

    // Generate meta title and description
    const pageTitle = townName
        ? `${labels.assessor} ${labels.in} ${townName}, ${countyName} | ${isSpanish ? 'Certificado Energético' : isEngland ? 'EPC Certificates' : 'BER Certificates'}`
        : `${labels.assessor} ${labels.in} ${countyName} | ${isSpanish ? 'Certificado Energético' : isEngland ? 'EPC Certificates' : 'BER Certificates'}`;

    const pageDescription = townName
        ? `Find ${labels.assessor.toLowerCase()} ${labels.in} ${townName}, ${countyName}. ${isSpanish ? 'Obtenga su certificado de eficiencia energética con técnicos certificados locales.' : 'Get your energy certificate with local certified assessors.'}`
        : `Find ${labels.assessor.toLowerCase()} ${labels.in} ${countyName}. ${isSpanish ? 'Obtenga su certificado de eficiencia energética con técnicos certificados locales.' : 'Get your energy certificate with local certified assessors.'}`;

    // Update document title
    document.title = pageTitle;
    document.querySelector('meta[name="description"]')?.setAttribute('content', pageDescription);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-[#007F00] to-[#007EA7] text-white py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <nav className="flex items-center gap-2 text-sm opacity-80 mb-4">
                        <Link to="/" className="hover:underline">Home</Link>
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
                        {labels.assessor} {labels.in} {townName || countyName}
                    </h1>
                    <p className="text-xl opacity-90 max-w-3xl">
                        {townName
                            ? `Find ${labels.assessor.toLowerCase()} ${labels.in} ${townName}, ${countyName}. ${isSpanish ? 'Técnicos certificados listos para ayudarle con su certificado de eficiencia energética.' : 'Certified assessors ready to help with your energy certificate.'}`
                            : `Find ${labels.assessor.toLowerCase()} ${labels.in} ${countyName}. ${isSpanish ? 'Técnicos certificados listos para ayudarle con su certificado de eficiencia energética.' : 'Certified assessors ready to help with your energy certificate.'}`
                        }
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
                        <p className="text-gray-600">Today</p>
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
                            <p>
                                {isSpanish
                                    ? `Certificado Energético conecta propietarios con técnicos certificados en ${townName || countyName}. Nuestros técnicos expertos están listos para proporcionar certificados de eficiencia energética de alta calidad.`
                                    : isEngland
                                    ? `The Berman connects homeowners with certified assessors in ${townName || countyName}. Our expert assessors are ready to provide high-quality energy performance certificates.`
                                    : `The Berman connects homeowners with BER assessors in ${townName || countyName}. Our expert assessors are ready to provide high-quality Building Energy Ratings.`
                                }
                            </p>
                            <p>
                                {isSpanish
                                    ? `Todos nuestros técnicos están debidamente certificados y tienen experiencia en la evaluación de eficiencia energética de propiedades en ${countyName}.`
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
                        {isSpanish ? '¿Listo para obtener su certificado?' : 'Ready to Get Your Certificate?'}
                    </h2>
                    <p className="text-xl opacity-90 mb-8">
                        {isSpanish
                            ? 'Compare precios de técnicos certificados en minutos'
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
