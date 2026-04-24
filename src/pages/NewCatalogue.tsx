import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, MapPin, Star, Loader2, ChevronDown, Zap, Sparkles, ArrowRight, Building2, HardHat } from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabase';
import { getTenantFromDomain } from '../lib/tenant';
import SEOHead from '../components/SEOHead';
import { TOWNS_BY_COUNTY } from '../data/irishTowns';

type CatalogueViewType = 'businesses' | 'assessors';

const HERO_SLIDES = [
    { image: 'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?q=80&w=1600' },
    { image: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?q=80&w=1600' },
    { image: 'https://images.unsplash.com/photo-1613665813446-82a78c468a1d?q=80&w=1600' }
];

const IRELAND_COUNTIES = Object.keys(TOWNS_BY_COUNTY).sort();

interface Category {
    id: string;
    name: string;
    slug: string;
}

interface Location {
    id: string;
    name: string;
    slug: string;
}

interface CatalogueListing {
    id: string;
    name: string;
    company_name?: string;
    slug: string;
    description: string;
    long_description: string | null;
    logo_url: string | null;
    banner_url: string | null;
    phone: string | null;
    email: string | null;
    website: string | null;
    address: string;
    additional_addresses?: string[];
    featured: boolean;
    rating: number;
    created_at: string;
    categories?: Category[];
    locations?: Location[];
    social_media?: {
        facebook?: string;
        instagram?: string;
        linkedin?: string;
        twitter?: string;
    };
}

const getDailySpotlight = (listings: CatalogueListing[]): CatalogueListing | null => {
    if (!listings || listings.length === 0) return null;
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = now.getTime() - start.getTime();
    const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
    return listings[dayOfYear % listings.length];
};

const NewCatalogue = () => {
    const [listings, setListings] = useState<CatalogueListing[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchParams, setSearchParams] = useSearchParams();

    // Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('');
    const [selectedLocation, setSelectedLocation] = useState<string>('');
    const [selectedCounty, setSelectedCounty] = useState<string>(searchParams.get('county') || '');
    const [sortBy, setSortBy] = useState('Featured');
    
    // View toggle - Businesses vs BER Assessors
    const [activeView, setActiveView] = useState<CatalogueViewType>('businesses');

    // Carousel State
    const [currentSlide, setCurrentSlide] = useState(0);

    useEffect(() => {
        fetchInitialData();
    }, []);

    useEffect(() => {
        fetchListings();
    }, [searchQuery, selectedCategory, selectedLocation, selectedCounty, activeView]);

    useEffect(() => {
        const county = searchParams.get('county');
        if (county && county !== selectedCounty) {
            setSelectedCounty(county);
        }
    }, [searchParams]);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide(prev => (prev + 1) % HERO_SLIDES.length);
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    const fetchInitialData = async () => {
        const [catRes] = await Promise.all([
            supabase.from('catalogue_categories').select('*').order('name')
        ]);
        if (catRes.data) setCategories(catRes.data);
    };

    const tenant = getTenantFromDomain();
    const isSpanish = tenant === 'spain';
    const t = {
        catalogueBadge: isSpanish ? 'El Catálogo' : 'The Catalogue',
        heroLine1: isSpanish ? 'Catálogo de Negocios de' : 'The Berman Home Energy',
        heroLine2: isSpanish ? 'Eficiencia Energética.' : 'Businesses Catalogue.',
        upgradeType: isSpanish ? 'Tipo de Mejora' : 'Upgrade Type',
        selectUpgrade: isSpanish ? 'Seleccionar Mejora...' : 'Select Upgrade...',
        location: isSpanish ? 'Ubicación' : 'Location',
        allLocations: isSpanish ? 'Todas las Ubicaciones' : 'All Locations',
        search: isSpanish ? 'Buscar' : 'Search',
        todaysSpotlight: isSpanish ? 'Destacado de Hoy' : "Today's Spotlight",
        viewProfile: isSpanish ? 'Ver Perfil' : 'View Profile',
        businesses: isSpanish ? 'Negocios' : 'Businesses',
        berAssessors: isSpanish ? 'Certificadores Energéticos' : 'BER Assessors',
        businessesHeading: isSpanish ? 'Negocios y Consultores Energéticos' : 'Businesses and Energy Consultants',
        businessesSub: isSpanish ? 'Encuentra Negocios y Consultores Energéticos en tu Zona Hoy' : 'Find Businesses and Energy Consultants in Your Local Area Today',
        assessorsSub: isSpanish ? 'Encuentra Certificadores Energéticos Acreditados en tu Zona Hoy' : 'Find Certified BER Assessors in Your Local Area Today',
        sortBy: isSpanish ? 'Ordenar Por:' : 'Sort By:',
        loadingPartners: isSpanish ? 'Cargando Socios...' : 'Loading Partners...',
        featured: isSpanish ? 'Destacado' : 'Featured',
        noPartnersFound: isSpanish ? 'No se encontraron socios' : 'No partners found',
        tryAdjusting: isSpanish ? 'Intenta ajustar tus filtros o términos de búsqueda.' : 'Try adjusting your filters or search terms.',
        resetSearch: isSpanish ? 'Restablecer Búsqueda' : 'Reset Search',
        hireAgent: isSpanish ? 'Contrata un Asesor Energético Gratis' : 'Hire An Energy Agent For Free',
        defaultLocation: isSpanish ? 'España' : 'Ireland',
    };
    const sortLabels: Record<string, string> = isSpanish
        ? { 'Default Order': 'Orden Predeterminado', 'Highest Rated': 'Mejor Valorados', 'Newest Listings': 'Más Recientes', 'Oldest Listings': 'Más Antiguos', 'Alphabetically': 'Alfabéticamente', 'Featured': 'Destacados' }
        : { 'Default Order': 'Default Order', 'Highest Rated': 'Highest Rated', 'Newest Listings': 'Newest Listings', 'Oldest Listings': 'Oldest Listings', 'Alphabetically': 'Alphabetically', 'Featured': 'Featured' };

    const fetchListings = async () => {
        setLoading(true);
        try {
            let query = supabase
                .from('catalogue_listings')
                .select(`
                    *,
                    categories:catalogue_listing_categories(catalogue_categories(*)),
                    locations:catalogue_listing_locations(catalogue_locations(*))
                `)
                .eq('tenant', tenant)
                .is('deleted_at', null);

            if (searchQuery) {
                query = query.ilike('name', `%${searchQuery}%`);
            }

            query = query.order('featured', { ascending: false }).order('created_at', { ascending: false });

            const { data, error } = await query;
            if (error) throw error;

            let filteredData = (data as any[]) || [];
            
            // Fetch owner profiles separately to determine role
            const ownerIds = [...new Set(filteredData.map(item => item.owner_id).filter(Boolean))];
            let ownerRoles: Record<string, string> = {};
            
            if (ownerIds.length > 0) {
                const { data: profilesData } = await supabase
                    .from('profiles')
                    .select('id, role')
                    .in('id', ownerIds);
                
                profilesData?.forEach((profile: any) => {
                    ownerRoles[profile.id] = profile.role;
                });
            }
            
            // Filter by view type (businesses vs assessors)
            filteredData = filteredData.filter(item => {
                const ownerRole = ownerRoles[item.owner_id];
                if (activeView === 'businesses') {
                    return ownerRole === 'business';
                } else {
                    return ownerRole === 'contractor';
                }
            });

            if (selectedCategory) {
                filteredData = filteredData.filter(item =>
                    (item.categories || []).some((c: any) => c.catalogue_categories?.id === selectedCategory)
                );
            }

            if (selectedLocation) {
                filteredData = filteredData.filter(item =>
                    (item.locations || []).some((l: any) => l.catalogue_locations?.id === selectedLocation)
                );
            } else if (selectedCounty) {
                const searchStr = selectedCounty.toLowerCase().trim();
                const coSearchStr = `co. ${searchStr}`;

                filteredData = filteredData.filter(item => {
                    const matchesLocation = (item.locations || []).some((l: any) => {
                        const locName = l.catalogue_locations?.name?.toLowerCase() || '';
                        return locName === searchStr || locName === coSearchStr || locName.includes(searchStr);
                    });

                    const matchesAddress = item.address && (
                        item.address.toLowerCase().includes(searchStr) ||
                        item.address.toLowerCase().includes(coSearchStr)
                    );
                    const matchesAdditional = (item.additional_addresses || []).some((addr: string) =>
                        addr.toLowerCase().includes(searchStr) ||
                        addr.toLowerCase().includes(coSearchStr)
                    );

                    return matchesLocation || matchesAddress || matchesAdditional;
                });
            }

            const mappedData = filteredData.map(item => ({
                ...item,
                categories: (item.categories || []).map((c: any) => c.catalogue_categories).filter(Boolean),
                locations: (item.locations || []).map((l: any) => l.catalogue_locations).filter(Boolean)
            })) as CatalogueListing[];

            setListings(mappedData);
        } catch (error) {
            console.error('Error fetching listings:', error);
            toast.error('Failed to load listings');
        } finally {
            setLoading(false);
        }
    };

    const getSortedListings = () => {
        const sorted = [...listings];
        switch (sortBy) {
            case 'Highest Rated':
                return sorted.sort((a, b) => b.rating - a.rating);
            case 'Newest Listings':
                return sorted.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
            case 'Oldest Listings':
                return sorted.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
            case 'Alphabetically':
                return sorted.sort((a, b) => a.name.localeCompare(b.name));
            case 'Featured':
                return sorted.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
            default:
                return sorted;
        }
    };

    return (
        <div className="font-sans text-gray-900 bg-white min-h-screen pt-28 md:pt-24 pb-12">
            <SEOHead
                title="Business Catalogue"
                description="Browse The Berman's catalogue of verified home energy businesses. Find insulation, heat pumps, solar, and more."
                canonical="/catalogue"
            />

            <section className="relative min-h-[70vh] md:min-h-[80vh] overflow-hidden flex items-center md:m-10 md:rounded-2xl">
                <div className="absolute inset-0 w-full h-full">
                    {HERO_SLIDES.map((slide, index) => (
                        <div
                            key={index}
                            className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${currentSlide === index ? 'opacity-100' : 'opacity-0'}`}
                        >
                            <img src={slide.image} alt="" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/50" />
                        </div>
                    ))}
                </div>

                <div className="relative z-10 container mx-auto px-6 text-center max-w-5xl py-16">
                    <span className="inline-block mb-4 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-sm text-white text-xs font-black tracking-widest uppercase border border-white/20">
                        {t.catalogueBadge}
                    </span>
                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white mb-6 leading-tight">
                        {t.heroLine1} <br />
                        <span className="text-[#9ACD32]">{t.heroLine2}</span>
                    </h1>
                   

                    <div className="max-w-4xl mx-auto">
                        <div className="bg-white/95 backdrop-blur-md border border-white/20 p-2 rounded-3xl md:rounded-full shadow-2xl flex flex-col md:flex-row items-center gap-2">
                            <div className="flex-1 w-full flex items-center gap-4 pl-6 md:pl-8 py-2 md:py-0 border-b md:border-b-0 md:border-r border-gray-200">
                                <Search className="text-[#007F00] shrink-0" size={20} />
                                <div className="flex-1 relative">
                                    <p className="absolute -top-1.5 left-0 text-[8px] font-black uppercase tracking-widest text-[#007F00] opacity-60">{t.upgradeType}</p>
                                    <select
                                        value={selectedCategory}
                                        onChange={(e) => setSelectedCategory(e.target.value)}
                                        className="w-full bg-transparent border-none focus:ring-0 font-black text-sm md:text-base text-gray-800 appearance-none cursor-pointer pr-10 pt-2"
                                    >
                                        <option value="">{t.selectUpgrade}</option>
                                        {categories.map(cat => (
                                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                                        ))}
                                    </select>
                                    <ChevronDown size={14} className="absolute right-2 bottom-3 text-gray-400 pointer-events-none" />
                                </div>
                            </div>

                            <div className="flex-1 w-full flex items-center gap-4 pl-6 md:pl-8 py-2 md:py-0">
                                <MapPin className="text-[#007F00] shrink-0" size={20} />
                                <div className="flex-1 relative">
                                    <p className="absolute -top-1.5 left-0 text-[8px] font-black uppercase tracking-widest text-[#007F00] opacity-60">{t.location}</p>
                                    <select
                                        value={selectedCounty}
                                        onChange={(e) => {
                                            setSelectedCounty(e.target.value);
                                            setSearchParams(e.target.value ? { county: e.target.value } : {});
                                        }}
                                        className="w-full bg-transparent border-none focus:ring-0 font-black text-sm md:text-base text-gray-800 appearance-none cursor-pointer pr-10 pt-2"
                                    >
                                        <option value="">{t.allLocations}</option>
                                        {IRELAND_COUNTIES.map(county => (
                                            <option key={county} value={county}>{county}</option>
                                        ))}
                                    </select>
                                    <ChevronDown size={14} className="absolute right-2 bottom-3 text-gray-400 pointer-events-none" />
                                </div>
                            </div>

                            <button
                                onClick={() => fetchListings()}
                                className="w-full md:w-auto bg-[#007F00] hover:bg-[#006400] text-white px-10 py-4 md:py-5 rounded-2xl md:rounded-full font-black text-xs md:text-sm uppercase tracking-widest transition-all active:scale-95 shadow-lg shrink-0"
                            >
                                {t.search}
                            </button>
                        </div>
                    </div>

                    <div className="flex justify-center gap-2 m-10">
                        {HERO_SLIDES.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentSlide(index)}
                                className={`w-2 h-2 rounded-full transition-all ${currentSlide === index ? 'bg-white w-6' : 'bg-white/40'}`}
                            />
                        ))}
                    </div>
                </div>
            </section>

            {(() => {
                const spotlight = getDailySpotlight(listings);
                if (!spotlight || loading) return null;
                return (
                    <div className="container mx-auto px-0 md:px-6 max-w-7xl md:-mt-8 relative md:z-20 mb-6">
                        <Link
                            to={`/catalogue/${spotlight.slug}`}
                            className="group block relative overflow-hidden md:rounded-2xl shadow-2xl border border-white/10"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-[#0c121d] via-[#1a2a3a] to-[#007F00]/90" />
                            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_30%_50%,rgba(255,255,255,0.3),transparent_70%)]" />

                            <div className="relative z-10 flex flex-col md:flex-row items-center gap-4 md:gap-8 px-6 md:px-10 py-6 md:py-6">
                                {/* Mobile: logo + spotlight badge row */}
                                <div className="flex items-center gap-4 w-full md:contents">
                                    <div className="w-14 h-14 md:w-16 md:h-16 rounded-xl overflow-hidden border-2 border-white/20 shadow-lg shrink-0 bg-white/10">
                                        <img
                                            src={spotlight.logo_url || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=200'}
                                            alt={spotlight.company_name || spotlight.name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className="flex items-center gap-2 bg-yellow-400/15 backdrop-blur-sm border border-yellow-400/30 px-4 py-1.5 rounded-full shrink-0 md:hidden">
                                        <Sparkles size={12} className="text-yellow-400" />
                                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-yellow-300">{t.todaysSpotlight}</span>
                                    </div>
                                </div>

                                {/* Desktop only spotlight badge */}
                                <div className="hidden md:flex items-center gap-2 bg-yellow-400/15 backdrop-blur-sm border border-yellow-400/30 px-4 py-1.5 rounded-full shrink-0">
                                    <Sparkles size={14} className="text-yellow-400" />
                                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-yellow-300">Today's Spotlight</span>
                                </div>

                                <div className="flex-1 text-center md:text-left w-full md:min-w-0">
                                    <h3 className="text-base md:text-xl font-black text-white leading-snug mb-1">
                                        {spotlight.company_name || spotlight.name}
                                    </h3>
                                    <p className="text-white/60 text-xs md:text-sm font-medium line-clamp-2 md:truncate md:max-w-lg">
                                        {spotlight.description}
                                    </p>
                                </div>

                                <div className="flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/15 px-6 py-3 rounded-xl transition-all duration-300 group-hover:bg-[#007F00] group-hover:border-[#007F00] group-hover:shadow-lg shrink-0 w-full md:w-auto justify-center">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-white">{t.viewProfile}</span>
                                    <ArrowRight size={14} className="text-white transition-transform duration-300 group-hover:translate-x-1" />
                                </div>
                            </div>
                        </Link>
                    </div>
                );
            })()}

            <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
                {/* View Toggle Buttons - Businesses vs BER Assessors */}
                <div className="flex justify-center my-6 md:my-8">
                    <div className="bg-white p-2 rounded-xl shadow-sm border border-gray-100 inline-flex">
                        <button
                            onClick={() => setActiveView('businesses')}
                            className={`flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-bold transition-all ${
                                activeView === 'businesses'
                                    ? 'bg-[#007F00] text-white shadow-md'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                        >
                            <Building2 size={18} />
                            {t.businesses}
                        </button>
                        <button
                            onClick={() => setActiveView('assessors')}
                            className={`flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-bold transition-all ${
                                activeView === 'assessors'
                                    ? 'bg-[#007F00] text-white shadow-md'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                        >
                            <HardHat size={18} />
                            {t.berAssessors}
                        </button>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row justify-between items-center my-8 md:my-12 gap-6 md:gap-8">
                    <div className="text-center md:text-left">
                        <h2 className="text-2xl md:text-4xl font-black text-gray-900 uppercase tracking-tight mb-2">
                            {activeView === 'businesses' ? t.businessesHeading : t.berAssessors}
                        </h2>
                        <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px] md:text-xs">
                            {activeView === 'businesses' ? t.businessesSub : t.assessorsSub}
                        </p>
                    </div>

                    <div className="relative group/sort min-w-[200px]">
                        <div className="flex items-center justify-between bg-white border border-gray-100 px-6 py-3 rounded-md shadow-sm cursor-pointer hover:border-[#007F00] transition-all">
                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 mr-4">{t.sortBy}</span>
                            <span className="text-sm font-black text-gray-900">{sortLabels[sortBy] || sortBy}</span>
                            <ChevronDown size={14} className="ml-4 text-gray-400" />
                        </div>

                        <div className="absolute right-0 top-full mt-2 w-full bg-white border border-gray-50 rounded-2xl shadow-2xl opacity-0 invisible group-hover/sort:opacity-100 group-hover/sort:visible transition-all z-50 overflow-hidden">
                            {['Default Order', 'Highest Rated', 'Newest Listings', 'Oldest Listings', 'Alphabetically', 'Featured'].map((option) => (
                                <button
                                    key={option}
                                    onClick={() => setSortBy(option)}
                                    className={`w-full text-left px-6 py-4 text-[10px] md:text-xs font-black uppercase tracking-widest hover:bg-gray-50 transition-colors ${sortBy === option ? 'bg-blue-50/50 text-[#007EA7]' : 'text-gray-500'}`}
                                >
                                    {sortLabels[option] || option}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div>
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <Loader2 className="animate-spin text-[#007F00] mb-4" size={48} />
                            <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">{t.loadingPartners}</p>
                        </div>
                    ) : getSortedListings().length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {getSortedListings().map((listing) => (
                                <Link
                                    to={`/catalogue/${listing.slug}`}
                                    key={listing.id}
                                    className="block group"
                                >
                                    <div className="relative aspect-[4/5] md:aspect-square lg:aspect-[4/5] overflow-hidden border border-gray-100 transform transition-transform duration-300 ease-out hover:-translate-y-2">
                                        <img
                                            src={listing.banner_url || listing.logo_url || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=400'}
                                            alt={listing.company_name || listing.name}
                                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                                        <div className="absolute top-6 left-6 flex flex-col gap-2">
                                            {listing.featured && (
                                                <div className="bg-white/95 backdrop-blur-md px-4 py-1.5 rounded-full flex items-center gap-2 shadow-lg scale-90 md:scale-100 origin-left">
                                                    <Star size={12} fill="#FACC15" className="text-yellow-400" />
                                                    <span className="text-[9px] font-black uppercase tracking-widest text-gray-900">{t.featured}</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between gap-4">
                                            <div className="flex flex-col gap-1 flex-1 min-w-0">
                                                <h3 className="text-xl md:text-2xl font-black text-white uppercase tracking-tight flex flex-wrap items-center gap-2 drop-shadow-lg leading-tight">
                                                    {listing.company_name || listing.name}
                                                </h3>
                                                <div className="flex items-center gap-2 text-white/70">
                                                    <span className="text-xs font-medium drop-shadow-md truncate">
                                                        {listing.locations?.[0]?.name || t.defaultLocation}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-100">
                            <Search size={48} className="mx-auto text-gray-200 mb-6" />
                            <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight mb-2">{t.noPartnersFound}</h3>
                            <p className="text-gray-400 font-medium mb-8">{t.tryAdjusting}</p>
                            <button
                                onClick={() => {
                                    setSearchQuery('');
                                    setSelectedCategory('');
                                    setSelectedLocation('');
                                    setSelectedCounty('');
                                    setSearchParams({});
                                }}
                                className="bg-gray-900 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all"
                            >
                                {t.resetSearch}
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <Link
                to="/hire-agent"
                className="fixed bottom-8 right-8 z-50 bg-[#007F00] hover:bg-[#006400] text-white px-8 py-4 rounded-full font-black text-xs uppercase tracking-widest shadow-2xl flex items-center gap-3 transition-all hover:-translate-y-1 active:scale-95 border-4 border-white/20"
            >
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                    <Zap size={16} fill="currentColor" />
                </div>
                {t.hireAgent}
            </Link>
        </div>
    );
};

export default NewCatalogue;
