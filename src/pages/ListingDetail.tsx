import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import ListingLayout, { type CatalogueListing } from '../components/ListingLayout';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabase';

const ListingDetail = () => {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();
    const [listing, setListing] = useState<CatalogueListing | null>(null);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [enquiry, setEnquiry] = useState({
        name: '',
        email: '',
        phone: '',
        message: ''
    });

    useEffect(() => {
        fetchListing();
    }, [slug]);

    const fetchListing = async () => {
        if (!slug) return;
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('catalogue_listings')
                .select(`
                    *,
                    categories:catalogue_listing_categories(catalogue_categories(*)),
                    locations:catalogue_listing_locations(catalogue_locations(*)),
                    images:catalogue_listing_images(id, url, display_order)
                `)
                .eq('slug', slug)
                .single();

            if (error) throw error;
            if (!data) {
                toast.error('Listing not found');
                navigate('/catalogue');
                return;
            }

            setListing({
                ...data,
                categories: data.categories.map((c: any) => c.catalogue_categories),
                locations: data.locations.map((l: any) => l.catalogue_locations)
            });
        } catch (error) {
            console.error('Error fetching listing:', error);
            toast.error('Failed to load listing details');
        } finally {
            setLoading(false);
        }
    };

    const handleEnquiry = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!listing) return;
        setIsSubmitting(true);
        try {
            const { error } = await supabase
                .from('catalogue_enquiries')
                .insert([{
                    listing_id: listing.id,
                    name: enquiry.name,
                    email: enquiry.email,
                    phone: enquiry.phone,
                    message: enquiry.message
                }]);

            if (error) throw error;

            toast.success('Your message has been sent!', {
                icon: '✉️',
                duration: 5000
            });
            setEnquiry({ name: '', email: '', phone: '', message: '' });
        } catch (error: any) {
            toast.error(error.message || 'Failed to send message');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen pt-24 flex items-center justify-center bg-white">
                <Loader2 className="animate-spin text-[#007F00]" size={48} />
            </div>
        );
    }

    if (!listing) return null;



    return (
        <ListingLayout
            listing={listing}
            enquiry={enquiry}
            setEnquiry={setEnquiry}
            onEnquirySubmit={handleEnquiry}
            isSubmitting={isSubmitting}
        />
    );
};

export default ListingDetail;
