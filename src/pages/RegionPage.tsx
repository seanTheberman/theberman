import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Loader2, ChevronRight, Search, ChevronDown, CheckCircle2, Star, Map, List } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import { supabase } from '../lib/supabase';

// Fix Leaflet marker icons icon issue
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Custom branded icon creator
const createBrandedIcon = (logoUrl: string | undefined, highlighted: boolean = false) => {
    const mainColor = highlighted ? '#007F00' : '#007EA7';
    return L.divIcon({
        className: 'custom-div-icon',
        html: `
            <div class="relative flex items-center justify-center w-10 h-10 bg-white rounded-full border-2 border-[${mainColor}] shadow-lg overflow-hidden transition-all duration-300 ${highlighted ? 'scale-110 z-[50]' : 'scale-100 opacity-70'} hover:scale-125 hover:opacity-100">
                <img src="${logoUrl || '/placeholder-business.png'}" class="w-full h-full object-cover" />
                ${highlighted ? '<div class="absolute inset-0 border-2 border-white rounded-full animate-ping opacity-20"></div>' : ''}
            </div>
            <div class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-[${mainColor}]"></div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 46],
        popupAnchor: [0, -40]
    });
};

interface Category {
    id: string;
    name: string;
}

interface Listing {
    id: string;
    name: string;
    company_name?: string;
    slug: string;
    description: string;
    category: string;
    region: string;
    address: string;
    latitude: number;
    longitude: number;
    phone: string;
    email: string;
    website: string;
    featured: boolean;
    status: string;
    logo_url?: string;
    rating?: number;
    categories?: Category[];
    locations?: any[];
}

const MapController = ({ center }: { center: [number, number] }) => {
    const map = useMap();
    useEffect(() => {
        map.setView(center, map.getZoom());
    }, [center, map]);
    return null;
};

const RegionPage = () => {
    const { slug } = useParams<{ slug: string }>();
    const [listings, setListings] = useState<Listing[]>([]);
    const [allListings, setAllListings] = useState<Listing[]>([]);
    const [loading, setLoading] = useState(true);
    const [regionName, setRegionName] = useState('');
    const [mapCenter, setMapCenter] = useState<[number, number]>([53.3498, -6.2603]);
    const [searchQuery, setSearchQuery] = useState('');
    const [mobileView, setMobileView] = useState<'list' | 'map'>('list');

    useEffect(() => {
        fetchRegionData();
    }, [slug]);

    const fetchRegionData = async () => {
        if (!slug) return;
        setLoading(true);
        try {
            const { data: regionData } = await supabase
                .from('catalogue_locations')
                .select('name')
                .eq('slug', slug)
                .single();

            if (regionData) setRegionName(regionData.name);

            const { data: listingsData, error } = await supabase
                .from('catalogue_listings')
                .select(`
                    *,
                    categories:catalogue_listing_categories(catalogue_categories(*)),
                    locations:catalogue_listing_locations(catalogue_locations(*))
                `)
                .eq('status', 'active');

            if (error) throw error;

            const allActive = (listingsData || []).map(listing => ({
                ...listing,
                categories: listing.categories.map((c: any) => c.catalogue_categories),
            }));

            const filtered = allActive.filter(listing =>
                listing.locations.some((loc: any) => loc.catalogue_locations?.slug === slug)
            );

            setAllListings(allActive);
            setListings(filtered);

            if (filtered.length > 0 && filtered[0].latitude && filtered[0].longitude) {
                setMapCenter([Number(filtered[0].latitude), Number(filtered[0].longitude)]);
            }
        } catch (err) {
            console.error('Error fetching region listings:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCardClick = (listing: Listing) => {
        if (listing.latitude && listing.longitude) {
            setMapCenter([Number(listing.latitude), Number(listing.longitude)]);
        }
    };


    if (loading) {
        return (
            <div className="min-h-screen pt-24 flex items-center justify-center">
                <Loader2 className="animate-spin text-green-600" size={48} />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white pt-20">
            <div className="flex flex-col lg:flex-row h-[calc(100vh-5rem)]">
                {/* Left Column: List and Filters */}
                <div className="flex-1 flex flex-col border-r border-gray-100 overflow-hidden">
                    {/* Search & Filter Bar */}
                    <div className="px-4 md:px-8 py-4 md:py-6 space-y-4">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1 relative">
                                <input
                                    type="text"
                                    placeholder="What are you looking for?"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-5 pr-12 py-3.5 bg-white border border-gray-200 rounded-lg outline-none focus:border-[#007EA7] focus:ring-1 focus:ring-[#007EA7]/10 transition-all text-sm shadow-sm"
                                />
                                <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            </div>
                            <div className="flex-1 relative">
                                <input
                                    type="text"
                                    placeholder="Location"
                                    defaultValue={regionName}
                                    className="w-full pl-5 pr-12 py-3.5 bg-white border border-gray-200 rounded-lg outline-none focus:border-[#007EA7] focus:ring-1 focus:ring-[#007EA7]/10 transition-all text-sm shadow-sm"
                                />
                                <MapPin className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-4 md:gap-6">
                            <button className="flex items-center gap-2 text-[11px] font-bold text-gray-600 hover:text-[#007EA7] transition-colors uppercase tracking-tight">
                                Categories
                                <ChevronDown size={14} />
                            </button>
                            <button className="flex items-center gap-2 text-[11px] font-bold text-gray-600 hover:text-[#007EA7] transition-colors uppercase tracking-tight">
                                More Filters
                                <ChevronDown size={14} />
                            </button>
                            <button className="flex items-center gap-2 text-[11px] font-bold text-gray-600 hover:text-[#007EA7] transition-colors uppercase tracking-tight">
                                Price Filter
                                <ChevronDown size={14} />
                            </button>

                            {/* Mobile View Toggle */}
                            <div className="lg:hidden ml-auto flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
                                <button
                                    onClick={() => setMobileView('list')}
                                    className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-[10px] font-bold uppercase transition-all ${mobileView === 'list' ? 'bg-white shadow-sm text-[#007EA7]' : 'text-gray-500'}`}
                                >
                                    <List size={14} />
                                    List
                                </button>
                                <button
                                    onClick={() => setMobileView('map')}
                                    className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-[10px] font-bold uppercase transition-all ${mobileView === 'map' ? 'bg-white shadow-sm text-[#007EA7]' : 'text-gray-500'}`}
                                >
                                    <Map size={14} />
                                    Map
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Listings List */}
                    <div className={`flex-1 overflow-y-auto px-4 md:px-8 pb-8 space-y-4 bg-gray-50/30 ${mobileView === 'map' ? 'hidden lg:block' : ''}`}>
                        {listings.length === 0 ? (
                            <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200 mt-4">
                                <p className="text-gray-400">No active listings found in this region.</p>
                            </div>
                        ) : (
                            listings.map((listing) => (
                                <div
                                    key={listing.id}
                                    onClick={() => handleCardClick(listing)}
                                    className="bg-white rounded-xl shadow-sm border border-gray-100/80 hover:border-[#007EA7]/20 hover:shadow-md transition-all cursor-pointer group flex flex-col sm:flex-row items-stretch sm:items-start p-1 relative"
                                >
                                    {/* Left: Product Image Area */}
                                    <div className="relative w-full sm:w-36 md:w-44 lg:w-52 h-48 sm:h-36 md:h-44 lg:h-52 overflow-hidden rounded-lg flex-shrink-0 bg-gray-50">
                                        <img
                                            src={listing.logo_url || '/placeholder-business.png'}
                                            alt={listing.company_name || listing.name}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                        />

                                        {/* Featured Star Badge */}
                                        {listing.featured && (
                                            <div className="absolute top-3 left-3 bg-white px-2 py-1 rounded-full flex items-center gap-1.5 shadow-sm border border-gray-100 z-10">
                                                <Star size={10} fill="#FACC15" className="text-yellow-400" />
                                                <span className="text-[9px] font-black uppercase text-gray-700">Featured</span>
                                            </div>
                                        )}

                                        {/* Category Over Bottom of Image */}
                                        {listing.categories?.[0] && (
                                            <div className="absolute bottom-3 left-3 right-3 z-10">
                                                <div className="bg-[#007EA7]/90 backdrop-blur-sm text-white px-3 py-2 rounded-xl text-[9px] font-black uppercase tracking-[0.05em] shadow-lg border border-white/10 w-full text-center truncate">
                                                    {listing.categories[0].name}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Right: Content Area */}
                                    <div className="flex-1 p-4 sm:p-6 flex flex-col justify-between self-stretch relative">
                                        <div>
                                            <div className="flex items-center justify-between">
                                                <h3 className="text-base sm:text-lg lg:text-xl font-black text-gray-900 group-hover:text-[#007EA7] transition-colors flex items-center gap-2">
                                                    {listing.company_name || listing.name}
                                                    <CheckCircle2 size={16} className="text-[#007F00] fill-[#007F00] hidden sm:block" />
                                                </h3>
                                            </div>
                                            <p className="text-xs font-bold text-gray-400 mt-1 uppercase tracking-wider">{regionName || 'Ireland'}</p>
                                        </div>

                                        <div className="flex flex-wrap gap-2 pt-4">
                                            <Link
                                                to={`/catalogue/${listing.slug}`}
                                                className="text-[10px] font-black text-gray-800 hover:text-[#007EA7] flex items-center gap-2 uppercase tracking-widest bg-white px-4 sm:px-5 py-2 sm:py-2.5 rounded-full transition-all border border-gray-200"
                                            >
                                                View Business
                                                <ChevronRight size={14} />
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Right Column: Map */}
                <div className={`flex-1 lg:flex-[1.3] relative ${mobileView === 'list' ? 'hidden lg:block' : 'block h-[60vh] lg:h-auto'}`}>
                    <MapContainer
                        center={mapCenter}
                        zoom={11}
                        style={{ height: '100%', width: '100%' }}
                        scrollWheelZoom={true}
                    >
                        <TileLayer
                            attribution='&copy; <a href="https://www.google.com/maps">Google Maps</a>'
                            url="https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
                        />
                        <MapController center={mapCenter} />

                        <MarkerClusterGroup
                            chunkedLoading
                            spiderfyOnMaxZoom={true}
                            showCoverageOnHover={false}
                            zoomToBoundsOnClick={true}
                        >
                            {allListings.map((listing) => {
                                const isHighlighted = listing.locations?.some((loc: any) => loc.catalogue_locations?.slug === slug);
                                return (
                                    listing.latitude && listing.longitude && (
                                        <Marker
                                            key={listing.id}
                                            position={[Number(listing.latitude), Number(listing.longitude)]}
                                            icon={createBrandedIcon(listing.logo_url, isHighlighted)}
                                            zIndexOffset={isHighlighted ? 1000 : 0}
                                        >
                                            <Popup className="custom-map-popup">
                                                <div className="p-3 w-48">
                                                    <div className="w-full h-24 rounded-lg overflow-hidden mb-3">
                                                        <img src={listing.logo_url || '/placeholder-business.png'} className="w-full h-full object-cover" />
                                                    </div>
                                                    <h4 className="font-black text-gray-900 mb-1 flex items-center gap-1">
                                                        {listing.company_name || listing.name}
                                                        <CheckCircle2 size={12} className="text-[#007F00]" />
                                                    </h4>
                                                    <p className="text-[10px] font-bold text-gray-500 mb-3 uppercase">{listing.categories?.[0]?.name || 'Service Provider'}</p>
                                                    <Link
                                                        to={`/catalogue/${listing.slug}`}
                                                        className={`block w-full text-center py-2 ${isHighlighted ? 'bg-[#007F00]' : 'bg-[#007EA7]'} !text-white text-[10px] font-black uppercase tracking-widest rounded-lg transition-colors`}
                                                    >
                                                        View Details
                                                    </Link>
                                                </div>
                                            </Popup>
                                        </Marker>
                                    )
                                );
                            })}
                        </MarkerClusterGroup>
                    </MapContainer>

                    {/* Map Overlays for specific pixel-perfect feel */}
                    <div className="absolute bottom-8 left-8 z-[10] flex flex-col gap-2">
                        <div className="bg-white/90 backdrop-blur-md p-2 rounded-xl shadow-2xl border border-white/20">
                            <img src="/logo.svg" className="h-8 w-auto grayscale opacity-50" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Global style for clustering override and branded icon alignment */}
            <style>{`
                .marker-cluster-small { background-color: rgba(0, 126, 167, 0.6); }
                .marker-cluster-small div { background-color: rgba(0, 126, 167, 1); color: white; font-weight: 900; }
                .marker-cluster-medium { background-color: rgba(0, 126, 167, 0.6); }
                .marker-cluster-medium div { background-color: rgba(0, 126, 167, 1); color: white; font-weight: 900; }
                .marker-cluster-large { background-color: rgba(0, 126, 167, 0.6); }
                .marker-cluster-large div { background-color: rgba(0, 126, 167, 1); color: white; font-weight: 900; }
                
                .leaflet-popup-content-wrapper { border-radius: 1rem; padding: 0; overflow: hidden; }
                .leaflet-popup-content { margin: 0; }
                .custom-map-popup .leaflet-popup-tip { display: none; }
                .custom-map-popup .leaflet-popup-content a { color: white !important; }
            `}</style>
        </div>
    );
};

export default RegionPage;
