import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Loader2, ArrowRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import SEOHead from '../components/SEOHead';

interface Location {
    id: string;
    name: string;
    slug: string;
    image_url?: string;
    description?: string;
}

const Locations = () => {
    const [locations, setLocations] = useState<Location[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLocations();
    }, []);

    const fetchLocations = async () => {
        try {
            const { data, error } = await supabase
                .from('catalogue_locations')
                .select('*')
                .order('name');

            if (error) throw error;
            setLocations(data || []);
        } catch (error) {
            console.error('Error fetching locations:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen pt-24 flex items-center justify-center bg-white">
                <Loader2 className="animate-spin text-[#007EA7]" size={48} />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white pt-24 pb-20 font-sans">
            <SEOHead
                title="BER Assessors by Location"
                description="Find BER assessors and energy upgrade professionals in your area across Ireland. Browse by county and region."
                canonical="/locations"
            />
            {/* Header */}
            <div className="container mx-auto px-6 mb-16 text-center">
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Browse by Location</h1>
                <p className="text-xl text-gray-500 max-w-2xl mx-auto font-light">
                    Find top-rated professionals and suppliers in your area. Select a region to see available listings.
                </p>
            </div>

            {/* Locations Grid */}
            <div className="container mx-auto px-6 max-w-7xl">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {locations.map((location) => (
                        <Link
                            key={location.id}
                            to={`/region/${location.slug}`}
                            className="group block bg-gray-50 hover:bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-[#007EA7]/30 hover:shadow-xl transition-all duration-300 relative"
                        >
                            <div className="h-48 bg-gray-200 overflow-hidden relative">
                                {location.image_url ? (
                                    <img
                                        src={location.image_url}
                                        alt={location.name}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                                        <MapPin size={48} className="text-gray-300 group-hover:text-[#007EA7] transition-colors" />
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
                                <div className="absolute bottom-4 left-6">
                                    <h3 className="text-2xl font-bold text-white group-hover:translate-x-2 transition-transform">{location.name}</h3>
                                </div>
                            </div>

                            <div className="p-6">
                                <p className="text-gray-500 text-sm mb-6 line-clamp-2">
                                    {location.description || `Browse listings available in ${location.name}.`}
                                </p>
                                <div className="flex items-center text-[#007EA7] font-bold text-sm uppercase tracking-wide group-hover:gap-2 transition-all">
                                    View Listings
                                    <ArrowRight size={16} className="ml-2 group-hover:ml-0 transition-all" />
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                {locations.length === 0 && (
                    <div className="text-center py-20 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                        <MapPin size={48} className="mx-auto text-gray-300 mb-4" />
                        <h3 className="text-xl font-bold text-gray-900 mb-2">No Locations Found</h3>
                        <p className="text-gray-500">We couldn't find any active locations at the moment.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Locations;
