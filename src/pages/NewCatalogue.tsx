import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, Star, Loader2, ChevronDown, Zap, Sparkles, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabase';

const HERO_SLIDES = [
    { image: 'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?q=80&w=1600' },
    { image: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?q=80&w=1600' },
    { image: 'https://images.unsplash.com/photo-1613665813446-82a78c468a1d?q=80&w=1600' }
];

import { TOWNS_BY_COUNTY } from '../data/irishTowns';

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
    phone: string | null;
    email: string | null;
    website: string | null;
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

// Deterministic daily spotlight: picks one business per day based on day-of-year
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

    // Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('');
    const [selectedLocation, setSelectedLocation] = useState<string>('');
    const [selectedCounty, setSelectedCounty] = useState<string>('');
    const [sortBy, setSortBy] = useState('Featured');

    // Carousel State
    const [currentSlide, setCurrentSlide] = useState(0);





    useEffect(() => {
        fetchInitialData();
    }, []);

    useEffect(() => {
        fetchListings();
    }, [searchQuery, selectedCategory, selectedLocation, selectedCounty]);

    // Carousel Auto-play
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

    const fetchListings = async () => {
        setLoading(true);
        try {
            let query = supabase
                .from('catalogue_listings')
                .select(`
                    *,
                    categories:catalogue_listing_categories(catalogue_categories(*)),
                    locations:catalogue_listing_locations(catalogue_locations(*))
                `);

            if (searchQuery) {
                query = query.ilike('name', `%${searchQuery}%`);
            }

            // Featured first, then newest
            query = query.order('featured', { ascending: false }).order('created_at', { ascending: false });

            const { data, error } = await query;
            if (error) throw error;

            let filteredData = data as any[];

            // Post-fetch filtering
            if (selectedCategory) {
                filteredData = filteredData.filter(item =>
                    item.categories.some((c: any) => c.catalogue_categories.id === selectedCategory)
                );
            }

            // Filter by Location ID or County Name
            if (selectedLocation) {
                filteredData = filteredData.filter(item =>
                    item.locations.some((l: any) => l.catalogue_locations.id === selectedLocation)
                );
            } else if (selectedCounty) {
                filteredData = filteredData.filter(item =>
                    item.locations.some((l: any) => l.catalogue_locations.name.toLowerCase() === selectedCounty.toLowerCase())
                );
            }

            let sortedData = filteredData.map(item => ({
                ...item,
                categories: item.categories.map((c: any) => c.catalogue_categories),
                locations: item.locations.map((l: any) => l.catalogue_locations)
            }));

            setListings(sortedData);
        } catch (error) {
            console.error('Error fetching listings:', error);
            toast.error('Failed to load listings');
        } finally {
            setLoading(false);
        }
    };

    const getSortedListings = () => {
        let sorted = [...listings];
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
        <div className="font-sans text-gray-900 bg-white min-h-screen pt-24 pb-12">
            <title>Catalogue | The Berman</title>

            {/* Hero Section with Background Image Carousel */}
            <section className="relative min-h-[70vh] md:min-h-[80vh] overflow-hidden flex items-center m-10 rounded-2xl">
                {/* Background Image Slider */}
                <div className="absolute inset-0 w-full h-full">
                    {HERO_SLIDES.map((slide, index) => (
                        <div
                            key={index}
                            className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${currentSlide === index ? 'opacity-100' : 'opacity-0'
                                }`}
                        >
                            <img
                                src={slide.image}
                                alt=""
                                className="w-full h-full object-cover"
                            />
                            {/* Dark overlay for text readability */}
                            <div className="absolute inset-0 bg-black/50" />
                        </div>
                    ))}
                </div>

                {/* Hero Content */}
                <div className="relative z-10 container mx-auto px-6 text-center max-w-5xl py-16">
                    <span className="inline-block mb-4 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-sm text-white text-xs font-black tracking-widest uppercase border border-white/20">
                        The Catalogue
                    </span>
                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white mb-6 leading-tight">
                        The Berman Home Energy <br />
                        <span className="text-[#9ACD32]">Businesses Catalogue.</span>
                    </h1>
                    <p className="text-lg md:text-xl text-gray-200 max-w-2xl mx-auto leading-relaxed mb-10">
                        When businesses sign up they can click which parts they do and they will appear here on the catalogue for that type of service.
                    </p>

                    {/* Search Bar Inside Hero */}
                    <div className="max-w-4xl mx-auto">
                        <div className="bg-white/95 backdrop-blur-md border border-white/20 p-2 rounded-3xl md:rounded-full shadow-2xl flex flex-col md:flex-row items-center gap-2">
                            {/* Upgrade Type */}
                            <div className="flex-1 w-full flex items-center gap-4 pl-6 md:pl-8 py-2 md:py-0 border-b md:border-b-0 md:border-r border-gray-200">
                                <Search className="text-[#007F00] shrink-0" size={20} />
                                <div className="flex-1 relative">
                                    <p className="absolute -top-1.5 left-0 text-[8px] font-black uppercase tracking-widest text-[#007F00] opacity-60">Upgrade Type</p>
                                    <select
                                        value={selectedCategory}
                                        onChange={(e) => setSelectedCategory(e.target.value)}
                                        className="w-full bg-transparent border-none focus:ring-0 font-black text-sm md:text-base text-gray-800 appearance-none cursor-pointer pr-10 pt-2"
                                    >
                                        <option value="">Select Upgrade...</option>
                                        {categories.map(cat => (
                                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                                        ))}
                                    </select>
                                    <ChevronDown size={14} className="absolute right-2 bottom-3 text-gray-400 pointer-events-none" />
                                </div>
                            </div>

                            {/* County */}
                            <div className="flex-1 w-full flex items-center gap-4 pl-6 md:pl-8 py-2 md:py-0">
                                <MapPin className="text-[#007F00] shrink-0" size={20} />
                                <div className="flex-1 relative">
                                    <p className="absolute -top-1.5 left-0 text-[8px] font-black uppercase tracking-widest text-[#007F00] opacity-60">Location</p>
                                    <select
                                        value={selectedCounty}
                                        onChange={(e) => setSelectedCounty(e.target.value)}
                                        className="w-full bg-transparent border-none focus:ring-0 font-black text-sm md:text-base text-gray-800 appearance-none cursor-pointer pr-10 pt-2"
                                    >
                                        <option value="">All Ireland</option>
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
                                Search
                            </button>
                        </div>
                    </div>

                    {/* Slide Indicators */}
                    <div className="flex justify-center gap-2 m-10">
                        {HERO_SLIDES.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentSlide(index)}
                                className={`w-2 h-2 rounded-full transition-all ${currentSlide === index ? 'bg-white w-6' : 'bg-white/40'
                                    }`}
                            />
                        ))}
                    </div>
                </div>
            </section>

            {/* ============ FEATURED SPOTLIGHT BAR ============ */}
            {(() => {
                const spotlight = getDailySpotlight(listings);
                if (!spotlight || loading) return null;
                return (
                    <div className="container mx-auto px-6 max-w-7xl -mt-8 relative z-20 mb-6">
                        <Link
                            to={`/catalogue/${spotlight.slug}`}
                            className="group block relative overflow-hidden rounded-2xl shadow-2xl border border-white/10"
                        >
                            {/* Background gradient */}
                            <div className="absolute inset-0 bg-gradient-to-r from-[#0c121d] via-[#1a2a3a] to-[#007F00]/90" />
                            {/* Animated shine effect */}
                            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_30%_50%,rgba(255,255,255,0.3),transparent_70%)]" />

                            <div className="relative z-10 flex flex-col md:flex-row items-center gap-5 md:gap-8 px-6 md:px-10 py-5 md:py-6">
                                {/* Spotlight badge */}
                                <div className="flex items-center gap-2 bg-yellow-400/15 backdrop-blur-sm border border-yellow-400/30 px-4 py-1.5 rounded-full shrink-0">
                                    <Sparkles size={14} className="text-yellow-400" />
                                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-yellow-300">Today's Spotlight</span>
                                </div>

                                {/* Logo */}
                                <div className="w-14 h-14 md:w-16 md:h-16 rounded-xl overflow-hidden border-2 border-white/20 shadow-lg shrink-0 bg-white/10">
                                    <img
                                        src={spotlight.logo_url || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=200'}
                                        alt={spotlight.company_name || spotlight.name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>

                                {/* Business info */}
                                <div className="flex-1 text-center md:text-left min-w-0">
                                    <h3 className="text-lg md:text-xl font-black text-white truncate">
                                        {spotlight.company_name || spotlight.name}
                                    </h3>
                                    <p className="text-white/60 text-xs md:text-sm font-medium truncate max-w-lg">
                                        {spotlight.description}
                                    </p>
                                </div>

                                {/* CTA */}
                                <div className="flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/15 px-6 py-3 rounded-xl transition-all duration-300 group-hover:bg-[#007F00] group-hover:border-[#007F00] group-hover:shadow-lg shrink-0">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-white">View Profile</span>
                                    <ArrowRight size={14} className="text-white transition-transform duration-300 group-hover:translate-x-1" />
                                </div>
                            </div>
                        </Link>
                    </div>
                );
            })()}

            <div className="container mx-auto px-6 max-w-7xl">

                {/* Partners Section Header */}
                <div className="flex flex-col md:flex-row justify-between items-center my-12 gap-8">
                    <div className="text-center md:text-left">
                        <h2 className="text-3xl md:text-4xl font-black text-gray-900 uppercase tracking-tight mb-2">Operators and Energy Consultants</h2>
                        <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px] md:text-xs">Find Operators and Energy Consultants in Your Local Area Today</p>
                    </div>

                    <div className="relative group/sort min-w-[200px]">
                        <div className="flex items-center justify-between bg-white border border-gray-100 px-6 py-3 rounded-md shadow-sm cursor-pointer hover:border-[#007F00] transition-all">
                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 mr-4">Sort By:</span>
                            <span className="text-sm font-black text-gray-900">{sortBy}</span>
                            <ChevronDown size={14} className="ml-4 text-gray-400" />
                        </div>

                        <div className="absolute right-0 top-full mt-2 w-full bg-white border border-gray-50 rounded-2xl shadow-2xl opacity-0 invisible group-hover/sort:opacity-100 group-hover/sort:visible transition-all z-50 overflow-hidden">
                            {['Default Order', 'Highest Rated', 'Newest Listings', 'Oldest Listings', 'Alphabetically', 'Featured', 'Most Views', 'Verified'].map((option) => (
                                <button
                                    key={option}
                                    onClick={() => setSortBy(option)}
                                    className={`w-full text-left px-6 py-4 text-[10px] md:text-xs font-black uppercase tracking-widest hover:bg-gray-50 transition-colors ${sortBy === option ? 'bg-blue-50/50 text-[#007EA7]' : 'text-gray-500'
                                        }`}
                                >
                                    {option}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div>
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <Loader2 className="animate-spin text-[#007F00] mb-4" size={48} />
                            <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Loading Partners...</p>
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

                                        {/* Background Image/Logo */}
                                        <img
                                            src={listing.logo_url || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=400'}
                                            alt={listing.company_name || listing.name}
                                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700"
                                        />

                                        {/* Gradient Overlay */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

                                        {/* Badges Overlay */}
                                        <div className="absolute top-6 left-6 flex flex-col gap-2">
                                            {listing.featured && (
                                                <div className="bg-white/95 backdrop-blur-md px-4 py-1.5 rounded-full flex items-center gap-2 shadow-lg scale-90 md:scale-100 origin-left">
                                                    <Star size={12} fill="#FACC15" className="text-yellow-400" />
                                                    <span className="text-[9px] font-black uppercase tracking-widest text-gray-900">Featured</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Partner Info (Bottom) */}
                                        <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between gap-4">
                                            <div className="flex flex-col gap-1 flex-1 min-w-0">
                                                <h3 className="text-xl md:text-2xl font-black text-white uppercase tracking-tight flex flex-wrap items-center gap-2 drop-shadow-lg leading-tight">
                                                    {listing.company_name || listing.name}

                                                </h3>
                                                <div className="flex items-center gap-2 text-white/70">
                                                    <span className="text-xs font-medium drop-shadow-md truncate">
                                                        {listing.locations?.[0]?.name || 'Ireland'}
                                                    </span>
                                                </div>
                                            </div>
                                            {/* <button
                                                className="px-4 py-2 bg-[#007F00] hover:bg-[#006400] text-white text-[10px] font-black uppercase tracking-widest rounded-lg transition-colors shadow-lg shrink-0"
                                            >
                                                Hire Contractor
                                            </button> */}
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-100">
                            <Search size={48} className="mx-auto text-gray-200 mb-6" />
                            <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight mb-2">No partners found</h3>
                            <p className="text-gray-400 font-medium mb-8">Try adjusting your filters or search terms.</p>
                            <button
                                onClick={() => {
                                    setSearchQuery('');
                                    setSelectedCategory('');
                                    setSelectedLocation('');
                                    setSelectedCounty('');
                                }}
                                className="bg-gray-900 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all"
                            >
                                Reset Search
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
                Hire An Energy Agent For Free
            </Link>

            <style>{`
                .no-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .no-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
        </div>
    );
};



export default NewCatalogue;
