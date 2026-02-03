import { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, Zap, Thermometer, Sun, Wind, Droplets, Search, MapPin, Star, ShieldCheck, ChevronRight, X, Info, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabase';


interface Provider {
    id: string;
    name: string;
    logo: string;
    description: string;
    longDescription?: string;
    location: string;
    serviceAreas: string[];
    categories: string[];
    rating: number;
    reviewCount: number;
    verified: boolean;
    certifications: string[];
    projects?: { title: string; image: string }[];
}

const CATEGORIES = [
    {
        id: 'insulation',
        title: 'Insulation',
        subtitle: 'Keep Heat In',
        description: 'Keep your home warm and reduce heat loss with attic, wall, and floor insulation.',
        icon: <Thermometer size={24} />,
        items: ['Premium Attic Insulation', 'External Wall Systems', 'Internal Dry Lining', 'Cavity Wall Solutions'],
        image: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?q=80&w=800&auto=format&fit=crop'
    },
    {
        id: 'heat-pumps',
        title: 'Heat Pumps',
        subtitle: 'Sustainable Heating',
        description: 'Transition away from fossil fuels with high-efficiency air-to-water systems.',
        icon: <Zap size={24} />,
        items: ['Air to Water Systems', 'Ground Source Pumps', 'Heat Pump Maintenance', 'Underfloor Heating'],
        image: 'https://images.unsplash.com/photo-1585338107529-13afc5f02586?q=80&w=800&auto=format&fit=crop'
    },
    {
        id: 'solar',
        title: 'Solar Energy',
        subtitle: 'Renewable Power',
        description: 'Harness the sun to power your home with complete PV and battery solutions.',
        icon: <Sun size={24} />,
        items: ['Solar PV Installations', 'Battery Storage', 'Solar Thermal', 'Smart EV Charging'],
        image: 'https://images.unsplash.com/photo-1509391300171-460911737e6d?q=80&w=800&auto=format&fit=crop'
    },
    {
        id: 'ventilation',
        title: 'Ventilation',
        subtitle: 'Air Quality',
        description: 'Ensure a healthy living environment with modern fresh air ventilation systems.',
        icon: <Wind size={24} />,
        items: ['Mechanical Ventilation', 'Extract Systems', 'Air Filtration', 'Humidity Control'],
        image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=800&auto=format&fit=crop'
    },
    {
        id: 'windows',
        title: 'Windows & Doors',
        subtitle: 'The Draught Check',
        description: 'Eliminate cold spots with A-rated triple and double glazing solutions.',
        icon: <Droplets size={24} />,
        items: ['Triple Glazing', 'Double Glazing', 'Composite Doors', 'A-Rated Frames'],
        image: 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?q=80&w=800&auto=format&fit=crop'
    },
    {
        id: 'ev-charging',
        title: 'EV Chargers',
        subtitle: 'Smart Charging',
        description: 'Future-proof your home with high-speed, smart electric vehicle charging points.',
        icon: <Zap size={24} />,
        items: ['Smart Home Chargers', 'Universal Sockets', 'App Integration', 'Grant Assistance'],
        image: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?q=80&w=800&auto=format&fit=crop'
    }
];

const MOCK_PROVIDERS: Provider[] = [
    {
        id: '1',
        name: 'EcoSmart Solar Systems',
        logo: 'https://images.unsplash.com/photo-1620288627223-53302f4e8c74?q=80&w=100&auto=format&fit=crop',
        description: 'Ireland\'s leading provider of solar PV and battery storage solutions with over 15 years experience.',
        longDescription: 'EcoSmart Solar Systems is dedicated to helping Irish homeowners reduce their carbon footprint and electricity bills. We specialize in high-efficiency solar PV installations and state-of-the-art battery storage. Our team of certified installers ensures every project is completed to the highest standards, maximizing your energy yield and grant eligibility.',
        location: 'Dublin',
        serviceAreas: ['Dublin', 'Meath', 'Kildare', 'Wicklow'],
        categories: ['solar', 'ev-charging'],
        rating: 4.9,
        reviewCount: 124,
        verified: true,
        certifications: ['SEAI Registered', 'Safe Electric', 'RECI'],
        projects: [
            { title: 'Residential Solar PV - Blackrock', image: 'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?q=80&w=400&auto=format&fit=crop' },
            { title: 'Battery Storage Retrofit - Malahide', image: 'https://images.unsplash.com/photo-1591115765373-520b7a612507?q=80&w=400&auto=format&fit=crop' }
        ]
    },
    {
        id: '2',
        name: 'Atlantic Heat Pumps Ltd.',
        logo: 'https://images.unsplash.com/photo-1584036561566-baf2418309a0?q=80&w=100&auto=format&fit=crop',
        description: 'Specialists in air-to-water heat pump transitions for modern and period Irish homes.',
        longDescription: 'Atlantic Heat Pumps specializes in the design, installation, and maintenance of energy-efficient heating systems. We help homeowners transition from fossil fuel boilers to sustainable air-to-water heat pumps. Our comprehensive service includes heat loss surveys and system integration for both underfloor and radiator heating.',
        location: 'Cork',
        serviceAreas: ['Cork', 'Kerry', 'Waterford', 'Limerick'],
        categories: ['heat-pumps'],
        rating: 4.8,
        reviewCount: 89,
        verified: true,
        certifications: ['SEAI Registered', 'F-Gas Certified'],
        projects: [
            { title: 'Heat Pump Transition - Douglas', image: 'https://images.unsplash.com/photo-1592595821034-71649852f551?q=80&w=400&auto=format&fit=crop' }
        ]
    },
    {
        id: '3',
        name: 'PureAir Ventilation',
        logo: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?q=80&w=100&auto=format&fit=crop',
        description: 'Mechanical Heat Recovery Ventilation (MHRV) experts ensuring clean air for well-insulated homes.',
        longDescription: 'PureAir Ventilation provides advanced air quality solutions for residential properties. As homes become better insulated, proper ventilation becomes critical. We design and install MHRV systems that eliminate moisture, mold, and radon while recovering up to 90% of heat energy from extracted air.',
        location: 'Galway',
        serviceAreas: ['Galway', 'Mayo', 'Sligo', 'Clare'],
        categories: ['ventilation'],
        rating: 4.7,
        reviewCount: 56,
        verified: true,
        certifications: ['HIA Member', 'BIA Registered'],
        projects: [
            { title: 'Whole-house MHRV - Salthill', image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=400&auto=format&fit=crop' }
        ]
    },
    {
        id: '4',
        name: 'Ireland West Insulation',
        logo: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?q=80&w=100&auto=format&fit=crop',
        description: 'Extensive insulation services including attic, cavity wall, and external envelope solutions.',
        longDescription: 'Ireland West Insulation is a family-run business with a reputation for excellence. We offer a full range of insulation services designed to stop heat loss and lower energy bills. From quick attic top-ups to complete external wall insulation projects, we provide tailored solutions for every budget.',
        location: 'Mayo',
        serviceAreas: ['Mayo', 'Galway', 'Roscommon', 'Sligo'],
        categories: ['insulation'],
        rating: 4.9,
        reviewCount: 215,
        verified: true,
        certifications: ['SEAI Registered', 'NSAI Agrement'],
        projects: [
            { title: 'External Wall Insulation - Castlebar', image: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?q=80&w=400&auto=format&fit=crop' }
        ]
    }
];

const Catalogue = () => {
    const [view, setView] = useState<'landing' | 'listing' | 'profile'>('landing');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [locationFilter, setLocationFilter] = useState('');
    const [showAgentModal, setShowAgentModal] = useState(false);

    // Scroll to top on view change
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [view, selectedCategory, selectedProvider]);

    const handleHireAgent = (provider?: Provider) => {
        if (provider) setSelectedProvider(provider);
        setShowAgentModal(true);
    };

    const handleBack = () => {
        if (view === 'profile') setView('listing');
        else if (view === 'listing') setView('landing');
    };

    return (
        <div className="font-sans text-gray-900 bg-[#F8FAFC] min-h-screen">
            <title>Energy Upgrade Catalogue | The Berman Concierge</title>

            {/* Header / Navigation placeholder if needed, otherwise uses global layout */}

            {view === 'landing' && (
                <LandingView
                    onSelectCategory={(catId) => {
                        setSelectedCategory(catId);
                        setView('listing');
                    }}
                    onSelectProvider={(p) => {
                        setSelectedProvider(p);
                        setView('profile');
                    }}
                    onSearch={(q, l) => {
                        setSearchQuery(q);
                        setLocationFilter(l);
                        setView('listing');
                    }}
                />
            )}

            {view === 'listing' && (
                <ListingView
                    category={selectedCategory}
                    searchQuery={searchQuery}
                    locationFilter={locationFilter}
                    onBack={handleBack}
                    onSelectProvider={(p) => {
                        setSelectedProvider(p);
                        setView('profile');
                    }}
                    onHireAgent={handleHireAgent}
                />
            )}

            {view === 'profile' && selectedProvider && (
                <ProfileView
                    provider={selectedProvider}
                    onBack={handleBack}
                    onHireAgent={handleHireAgent}
                />
            )}

            {/* Hire an Agent Modal */}
            {showAgentModal && (
                <AgentModal
                    provider={selectedProvider}
                    category={selectedCategory}
                    onClose={() => setShowAgentModal(false)}
                />
            )}
        </div>
    );
};


// --- SUB-COMPONENTS ---

const LandingView = ({ onSelectCategory, onSelectProvider, onSearch }: {
    onSelectCategory: (id: string) => void,
    onSelectProvider: (p: Provider) => void,
    onSearch: (q: string, l: string) => void
}) => {
    const [q, setQ] = useState('');
    const [l, setL] = useState('');

    const featuredProviders = MOCK_PROVIDERS.filter(p => p.rating >= 4.8);

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* 1. HERO & SEARCH */}
            <section className="pt-32 pb-20 bg-white border-b border-gray-100">
                <div className="container mx-auto px-6 text-center max-w-5xl">
                    <span className="inline-block mb-6 px-4 py-1.5 rounded-full bg-green-50 text-[#007F00] text-[10px] font-black tracking-widest uppercase border border-green-100">
                        The Berman Concierge
                    </span>
                    <h1 className="text-3xl md:text-5xl lg:text-7xl font-black text-gray-900 mb-8 leading-[1.1] tracking-tight">
                        The Berman Home Energy <br className="hidden md:block" />
                        <span className="text-[#007F00]">Businesses Catalogue</span>
                    </h1>
                    <p className="text-base md:text-lg lg:text-xl text-gray-500 max-w-2xl mx-auto mb-10 md:mb-12 font-medium px-4">
                        Search verified providers across Ireland. Our agents handle the negotiation and coordination for you.
                    </p>

                    {/* SEARCH BAR (IrishBuilders style) */}
                    <div className="bg-white p-2 rounded-2xl md:rounded-[2rem] shadow-2xl border border-gray-100 flex flex-col md:flex-row gap-2 max-w-4xl mx-auto mt-4 md:translate-y-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="What upgrade are you looking for?"
                                value={q}
                                onChange={(e) => setQ(e.target.value)}
                                className="w-full pl-11 pr-4 py-3 md:py-4 rounded-xl md:rounded-2xl border-none focus:ring-2 focus:ring-green-100 text-sm font-bold placeholder:text-gray-400"
                            />
                        </div>
                        <div className="w-px bg-gray-100 hidden md:block my-2"></div>
                        <div className="flex-1 relative">
                            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="County (e.g. Dublin)"
                                value={l}
                                onChange={(e) => setL(e.target.value)}
                                className="w-full pl-11 pr-4 py-3 md:py-4 rounded-xl md:rounded-2xl border-none focus:ring-2 focus:ring-green-100 text-sm font-bold placeholder:text-gray-400"
                            />
                        </div>
                        <button
                            onClick={() => onSearch(q, l)}
                            className="bg-[#007F00] text-white px-8 md:px-12 py-4 rounded-xl md:rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#006400] transition-all shadow-lg active:scale-95 w-full md:w-auto mt-2 md:mt-0"
                        >
                            Search
                        </button>
                    </div>
                </div>
            </section>

            {/* 2. CATEGORY TILES (Grid) */}
            <section className="py-24 bg-[#F8FAFC]">
                <div className="container mx-auto px-6 max-w-7xl">
                    <div className="flex justify-between items-end mb-12">
                        <div>
                            <h2 className="text-2xl md:text-3xl font-black text-gray-900 uppercase tracking-tight">Browse by Category</h2>
                            <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mt-2">Verified Professional Networks</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
                        {CATEGORIES.map((category) => (
                            <button
                                key={category.id}
                                onClick={() => onSelectCategory(category.id)}
                                className="group bg-white p-6 md:p-8 rounded-[2rem] border border-gray-100 hover:border-[#007F00] transition-all hover:shadow-xl hover:-translate-y-1 text-center"
                            >
                                <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-green-50 text-[#007F00] flex items-center justify-center mx-auto mb-4 group-hover:bg-[#007F00] group-hover:text-white transition-all">
                                    {category.icon}
                                </div>
                                <h3 className="text-xs md:text-sm font-black text-gray-900 uppercase tracking-tight leading-tight">{category.title}</h3>
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* 3. FEATURED PROVIDERS */}
            <section className="py-24 bg-white">
                <div className="container mx-auto px-6 max-w-7xl">
                    <div className="flex justify-between items-end mb-12">
                        <div>
                            <h2 className="text-2xl md:text-3xl font-black text-gray-900 uppercase tracking-tight">Featured Partners</h2>
                            <p className="text-gray-500 font-medium text-sm mt-2">Top-rated installers with verified success stories.</p>
                        </div>
                    </div>
                    <div className="space-y-6">
                        {featuredProviders.map((provider) => (
                            <div
                                key={provider.id}
                                onClick={() => onSelectProvider(provider)}
                                className="group bg-white rounded-[2rem] border border-gray-100 p-6 md:p-8 flex flex-col md:flex-row gap-8 hover:shadow-2xl hover:border-green-100 transition-all cursor-pointer items-center"
                            >
                                <div className="w-full md:w-48 aspect-[4/3] rounded-2xl overflow-hidden bg-gray-50 shrink-0 border border-gray-50">
                                    <img
                                        src={provider.logo}
                                        alt={provider.name}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                </div>

                                <div className="flex-1 text-center md:text-left">
                                    <div className="flex flex-col md:flex-row md:items-center gap-3 mb-3">
                                        <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight group-hover:text-[#007F00] transition-colors">{provider.name}</h3>
                                        {provider.verified && <ShieldCheck size={18} className="text-[#007F00] mx-auto md:mx-0" />}
                                    </div>
                                    <div className="flex flex-wrap justify-center md:justify-start items-center gap-4 mb-4">
                                        <div className="flex items-center gap-1">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} size={12} className={i < Math.floor(provider.rating) ? 'fill-[#FFD700] text-[#FFD700]' : 'text-gray-200'} />
                                            ))}
                                            <span className="text-xs font-black text-gray-900 ml-1">{provider.rating}</span>
                                        </div>
                                        <span className="text-gray-200 hidden md:block">|</span>
                                        <div className="flex items-center gap-1.5 text-gray-500">
                                            <MapPin size={14} />
                                            <span className="text-[10px] font-black uppercase tracking-widest">{provider.location}</span>
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-500 font-medium line-clamp-2 leading-relaxed">
                                        {provider.description}
                                    </p>
                                </div>

                                <div className="shrink-0 flex items-center md:self-stretch">
                                    <div className="w-10 h-10 rounded-full border border-gray-100 flex items-center justify-center text-gray-400 group-hover:bg-[#007F00] group-hover:text-white group-hover:border-[#007F00] transition-all">
                                        <ArrowRight size={20} />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
};

const ListingView = ({ category, searchQuery, locationFilter, onBack, onSelectProvider, onHireAgent }: {
    category: string | null;
    searchQuery: string;
    locationFilter: string;
    onBack: () => void;
    onSelectProvider: (p: Provider) => void;
    onHireAgent: (p: Provider) => void;
}) => {
    const selectedCategory = CATEGORIES.find(c => c.id === category);

    const filteredProviders = MOCK_PROVIDERS.filter(p => {
        const matchesCategory = category ? p.categories.includes(category) : true;
        const matchesSearch = searchQuery ? p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.description.toLowerCase().includes(searchQuery.toLowerCase()) : true;
        const matchesLocation = locationFilter ? p.location.toLowerCase().includes(locationFilter.toLowerCase()) || p.serviceAreas.some(s => s.toLowerCase().includes(locationFilter.toLowerCase())) : true;
        return matchesCategory && matchesSearch && matchesLocation;
    });

    return (
        <div className="animate-in fade-in slide-in-from-right-4 duration-500">
            {/* 1. LISTING HEADER */}
            <section className="pt-32 pb-12 bg-white border-b border-gray-100">
                <div className="container mx-auto px-6 max-w-7xl">
                    <button
                        onClick={onBack}
                        className="flex items-center gap-2 text-gray-400 hover:text-gray-900 transition-colors mb-8 group"
                    >
                        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Back to Directory</span>
                    </button>
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div>
                            <h1 className="text-3xl md:text-5xl font-black text-gray-900 uppercase tracking-tight">
                                {selectedCategory ? selectedCategory.title : 'All Partners'}
                            </h1>
                            <p className="text-gray-500 font-medium mt-2 max-w-2xl">
                                {selectedCategory ? selectedCategory.description : 'Discover our full network of verified home energy professionals.'}
                            </p>
                        </div>
                        <div className="bg-gray-50 px-6 py-3 rounded-2xl border border-gray-100 flex items-center gap-4">
                            <span className="text-xs font-black text-gray-400 uppercase tracking-widest">{filteredProviders.length} Partners Found</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* 2. LISTINGS GRID */}
            <section className="py-16">
                <div className="container mx-auto px-6 max-w-7xl">
                    <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
                        {filteredProviders.length > 0 ? (
                            filteredProviders.map((provider) => (
                                <div
                                    key={provider.id}
                                    className="bg-white rounded-[2.5rem] border border-gray-100 p-8 md:p-10 flex flex-col md:flex-row gap-10 hover:shadow-2xl hover:border-green-100 transition-all group"
                                >
                                    {/* Provider Image/Logo */}
                                    <div className="w-full md:w-72 aspect-[4/3] rounded-3xl overflow-hidden bg-gray-50 shrink-0 border border-gray-50">
                                        <img
                                            src={provider.logo}
                                            alt={provider.name}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        />
                                    </div>

                                    {/* Provider Info */}
                                    <div className="flex-1 flex flex-col">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h3 className="text-2xl md:text-3xl font-black text-gray-900 uppercase tracking-tight">{provider.name}</h3>
                                                    {provider.verified && <ShieldCheck size={20} className="text-[#007F00]" />}
                                                </div>
                                                <div className="flex items-center gap-3 mb-4">
                                                    <div className="flex items-center gap-1">
                                                        <Star size={14} className="fill-[#FFD700] text-[#FFD700]" />
                                                        <span className="text-xs font-black text-gray-900">{provider.rating}</span>
                                                    </div>
                                                    <span className="text-gray-300">|</span>
                                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{provider.reviewCount} Reviews</span>
                                                    <span className="text-gray-300">|</span>
                                                    <div className="flex items-center gap-1.5 text-gray-500">
                                                        <MapPin size={14} />
                                                        <span className="text-xs font-bold uppercase tracking-widest">{provider.location}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <p className="text-gray-500 font-medium text-lg leading-relaxed mb-8">
                                            {provider.description}
                                        </p>

                                        <div className="flex flex-wrap gap-2 mb-8 mt-auto">
                                            {provider.certifications.map((cert) => (
                                                <span key={cert} className="px-3 py-1 bg-green-50 text-[#007F00] text-[9px] font-black uppercase tracking-widest rounded-full border border-green-100/50">
                                                    {cert}
                                                </span>
                                            ))}
                                        </div>

                                        <div className="flex flex-col sm:flex-row gap-4">
                                            <button
                                                onClick={() => onHireAgent(provider)}
                                                className="flex-1 bg-[#007F00] text-white py-5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#006400] transition-all shadow-xl shadow-green-100 flex items-center justify-center gap-3 active:scale-[0.98]"
                                            >
                                                Hire an Agent
                                            </button>
                                            <button
                                                onClick={() => onSelectProvider(provider)}
                                                className="flex-1 bg-white text-gray-900 border-2 border-gray-900 py-5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-50 transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
                                            >
                                                View Profile <ArrowRight size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-20 bg-white rounded-[2.5rem] border border-dashed border-gray-200">
                                <Search size={48} className="text-gray-200 mx-auto mb-6" />
                                <h3 className="text-xl font-black text-gray-900 uppercase mb-2">No partners found</h3>
                                <p className="text-gray-400 font-medium">Try adjusting your search or location filters.</p>
                                <button
                                    onClick={onBack}
                                    className="mt-8 text-[#007F00] font-black text-xs uppercase tracking-widest hover:underline"
                                >
                                    Browse All Categories
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </section>
        </div>
    );
};

const ProfileView = ({ provider, onBack, onHireAgent }: {
    provider: Provider;
    onBack: () => void;
    onHireAgent: (p: Provider) => void;
}) => {
    return (
        <div className="animate-in fade-in slide-in-from-right-4 duration-500">
            {/* PROFILE HEADER/BANNER */}
            <div className="h-64 md:h-96 w-full relative bg-gray-900">
                <img
                    src={provider.logo}
                    alt={provider.name}
                    className="w-full h-full object-cover opacity-60"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>

                <div className="absolute top-32 left-0 right-0">
                    <div className="container mx-auto px-6 max-w-7xl">
                        <button
                            onClick={onBack}
                            className="flex items-center gap-2 text-white/70 hover:text-white transition-colors mb-8 group"
                        >
                            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Back to Listings</span>
                        </button>
                    </div>
                </div>

                <div className="absolute bottom-0 left-0 right-0 transform translate-y-1/2">
                    <div className="container mx-auto px-6 max-w-7xl">
                        <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-12 shadow-2xl border border-gray-100 flex flex-col md:flex-row gap-6 md:gap-8 items-center md:items-end">
                            <div className="w-24 h-24 md:w-48 md:h-48 rounded-[1.5rem] md:rounded-[2rem] bg-white border-4 border-white shadow-xl -mt-16 md:-mt-32 overflow-hidden shrink-0">
                                <img src={provider.logo} alt={provider.name} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1 text-center md:text-left">
                                <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 mb-3 md:mb-4">
                                    <h1 className="text-2xl md:text-5xl font-black text-gray-900 uppercase tracking-tight">{provider.name}</h1>
                                    {provider.verified && (
                                        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 text-[#007F00] rounded-full border border-green-100 self-center md:self-auto">
                                            <ShieldCheck size={14} className="md:size-4" />
                                            <span className="text-[9px] md:text-[10px] font-black uppercase">Verified Partner</span>
                                        </div>
                                    )}
                                </div>
                                <div className="flex flex-wrap justify-center md:justify-start gap-4 md:gap-6">
                                    <div className="flex items-center gap-2">
                                        <Star size={16} className="fill-[#FFD700] text-[#FFD700] md:size-[18px]" />
                                        <span className="text-sm md:text-base font-black text-gray-900">{provider.rating}</span>
                                        <span className="text-[10px] md:text-xs font-bold text-gray-400">({provider.reviewCount} Reviews)</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <MapPin size={16} className="text-gray-400 md:size-[18px]" />
                                        <span className="text-[10px] md:text-xs font-black uppercase text-gray-500 tracking-widest">{provider.location}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="shrink-0 w-full md:w-auto mt-2 md:mt-0">
                                <button
                                    onClick={() => onHireAgent(provider)}
                                    className="w-full md:w-auto bg-[#007F00] text-white px-10 md:px-12 py-4 md:py-5 rounded-xl md:rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#006400] transition-all shadow-xl active:scale-95"
                                >
                                    Hire an Agent
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* PROFILE CONTENT */}
            <section className="pt-48 pb-24">
                <div className="container mx-auto px-6 max-w-7xl">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                        {/* Main Info */}
                        <div className="lg:col-span-8 space-y-12">
                            <div>
                                <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight mb-6">About the Business</h2>
                                <p className="text-gray-600 font-medium text-lg leading-[1.8]">
                                    {provider.longDescription || provider.description}
                                </p>
                            </div>

                            <div className="grid md:grid-cols-2 gap-8">
                                <div className="bg-white p-8 rounded-[2rem] border border-gray-100">
                                    <div className="flex items-center gap-3 mb-6">
                                        <Zap className="text-[#007F00]" size={20} />
                                        <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">Core Services</h3>
                                    </div>
                                    <ul className="space-y-4">
                                        {provider.categories.map(catId => {
                                            const cat = CATEGORIES.find(c => c.id === catId);
                                            return (
                                                <li key={catId} className="flex items-center gap-3 text-sm font-bold text-gray-600">
                                                    <ChevronRight size={14} className="text-[#007F00]" />
                                                    {cat?.title}
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </div>
                                <div className="bg-white p-8 rounded-[2rem] border border-gray-100">
                                    <div className="flex items-center gap-3 mb-6">
                                        <ShieldCheck className="text-[#007F00]" size={20} />
                                        <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">Certifications</h3>
                                    </div>
                                    <ul className="space-y-4">
                                        {provider.certifications.map(cert => (
                                            <li key={cert} className="flex items-center gap-3 text-sm font-bold text-gray-600">
                                                <div className="w-1.5 h-1.5 bg-[#007F00] rounded-full"></div>
                                                {cert}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            {provider.projects && provider.projects.length > 0 && (
                                <div>
                                    <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight mb-8">Recent Projects</h2>
                                    <div className="grid md:grid-cols-2 gap-6">
                                        {provider.projects.map(project => (
                                            <div key={project.title} className="group rounded-3xl overflow-hidden bg-white border border-gray-100 hover:shadow-xl transition-all">
                                                <div className="aspect-video relative overflow-hidden">
                                                    <img src={project.image} alt={project.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                                </div>
                                                <div className="p-6">
                                                    <p className="font-bold text-gray-900 text-sm">{project.title}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Sidebar */}
                        <div className="lg:col-span-4 space-y-8">
                            <div className="bg-white p-8 rounded-[2rem] border border-gray-100 sticky top-32">
                                <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-6">Service Coverage</h3>
                                <div className="flex flex-wrap gap-2 mb-8">
                                    {provider.serviceAreas.map(area => (
                                        <span key={area} className="px-4 py-2 bg-gray-50 text-gray-600 text-xs font-black uppercase rounded-xl border border-gray-100">
                                            {area}
                                        </span>
                                    ))}
                                </div>

                                <div className="p-6 bg-blue-50/50 rounded-2xl border border-blue-100/50 mb-8">
                                    <div className="flex gap-3">
                                        <Info size={20} className="text-[#007EA7] shrink-0" />
                                        <div>
                                            <p className="text-[10px] font-black uppercase text-[#007EA7] tracking-widest mb-1">Our Process</p>
                                            <p className="text-xs font-medium text-blue-900 leading-relaxed">
                                                When you hire an agent, we contact {provider.name} and other providers on your behalf to negotiate the best possible rate.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={() => onHireAgent(provider)}
                                    className="w-full bg-[#007F00] text-white py-5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#006400] transition-all shadow-xl shadow-green-100 active:scale-95"
                                >
                                    Hire an Agent for this Partner
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

const AgentModal = ({ provider, category, onClose }: {
    provider: Provider | null,
    category: string | null,
    onClose: () => void
}) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        message: '',
        county: '',
        town: '',
        property_type: 'Detached'
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        const cat = CATEGORIES.find(c => c.id === category);
        const fullMessage = `
--- HIRED AN AGENT ---
Interested in: ${cat?.title || 'General Energy Upgrade'}
Target Provider: ${provider?.name || 'Any verified provider'}
User Message: ${formData.message}
        `.trim();

        try {
            const { error } = await supabase
                .from('leads')
                .insert([{
                    name: formData.name,
                    email: formData.email,
                    phone: formData.phone,
                    message: fullMessage,
                    status: 'new',
                    county: formData.county,
                    town: formData.town,
                    property_type: formData.property_type,
                    purpose: cat?.title || 'General'
                }]);

            if (error) throw error;

            toast.success('Agent request submitted! We will contact you shortly.', {
                duration: 5000,
                icon: '🚀'
            });
            onClose();
        } catch (error: any) {
            toast.error(error.message || 'Failed to submit request');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
                <div className="p-6 md:p-12 overflow-y-auto">
                    <div className="flex justify-between items-start mb-8">
                        <div>
                            <span className="inline-block px-3 py-1 bg-blue-50 text-[#007EA7] text-[10px] font-black uppercase tracking-widest rounded-full mb-3 border border-blue-100">Concierge Request</span>
                            <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tight">Hire your Agent</h2>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                            <X size={24} className="text-gray-400" />
                        </button>
                    </div>

                    <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100 mb-8 flex gap-4">
                        <div className="w-12 h-12 bg-white rounded-2xl border border-gray-100 flex items-center justify-center shrink-0">
                            <ShieldCheck size={24} className="text-[#007F00]" />
                        </div>
                        <div>
                            <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Expert Negotiation</p>
                            <p className="text-sm font-medium text-gray-600 leading-relaxed">
                                Our agent will handle the technical search and pricing negotiation with <span className="text-gray-900 font-bold">{provider?.name || 'our network of installers'}</span> for your project.
                            </p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
                                <input
                                    required
                                    type="text"
                                    placeholder="e.g. John Murphy"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-[#007F00] focus:bg-white rounded-2xl outline-none font-bold text-sm transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
                                <input
                                    required
                                    type="email"
                                    placeholder="john@example.com"
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-[#007F00] focus:bg-white rounded-2xl outline-none font-bold text-sm transition-all"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Phone Number</label>
                                <input
                                    required
                                    type="tel"
                                    placeholder="08X XXX XXXX"
                                    value={formData.phone}
                                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                    className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-[#007F00] focus:bg-white rounded-2xl outline-none font-bold text-sm transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">County</label>
                                <input
                                    required
                                    type="text"
                                    placeholder="e.g. Dublin"
                                    value={formData.county}
                                    onChange={e => setFormData({ ...formData, county: e.target.value })}
                                    className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-[#007F00] focus:bg-white rounded-2xl outline-none font-bold text-sm transition-all"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Tell us about your project</label>
                            <textarea
                                required
                                rows={4}
                                placeholder="I'm interested in solar panels and possibly a battery storage system..."
                                value={formData.message}
                                onChange={e => setFormData({ ...formData, message: e.target.value })}
                                className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-[#007F00] focus:bg-white rounded-2xl outline-none font-bold text-sm transition-all resize-none"
                            />
                        </div>

                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full bg-[#007F00] text-white py-5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#006400] transition-all shadow-2xl shadow-green-100 flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed active:scale-[0.98]"
                            >
                                {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : null}
                                {isSubmitting ? 'Submitting...' : 'Submit Agent Request'}
                            </button>
                            <p className="text-center text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-6 flex items-center justify-center gap-2">
                                <ShieldCheck size={14} className="text-[#007F00]" />
                                No upfront cost • No commitment • Expert advice
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Catalogue;
