
import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import {
    LayoutDashboard,
    Building2,
    Image as ImageIcon,
    MessageSquare,
    LogOut,
    ChevronRight,
    ExternalLink,
    Save,
    Loader2,
    Facebook,
    Instagram,
    Linkedin,
    Twitter,
    Mail,
    Phone
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';

interface CatalogueListing {
    id: string;
    name: string;
    slug: string;
    company_name: string;
    email: string;
    phone: string;
    description: string;
    address: string;
    website: string;
    logo_url: string;
    features: string[];
    is_verified: boolean;
    featured: boolean;
    is_active: boolean;
    social_media?: {
        facebook?: string;
        instagram?: string;
        linkedin?: string;
        twitter?: string;
    };
    images?: { id: string, url: string, display_order: number }[];
}

interface Enquiry {
    id: string;
    created_at: string;
    name: string;
    email: string;
    phone: string;
    message: string;
}

const BusinessDashboard = () => {
    const { user, signOut } = useAuth();
    const navigate = useNavigate();
    const [view, setView] = useState<'overview' | 'profile' | 'gallery' | 'enquiries'>('overview');
    const [listing, setListing] = useState<CatalogueListing | null>(null);
    const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [listingImages, setListingImages] = useState<string[]>(['', '', '']);

    useEffect(() => {
        if (user) {
            fetchBusinessData();
        }
    }, [user]);

    const fetchBusinessData = async () => {
        try {
            setLoading(true);

            // 1. Fetch listing owned by this user
            const { data: listingData, error: listingError } = await supabase
                .from('catalogue_listings')
                .select(`
                    *,
                    images:catalogue_listing_images(id, url, display_order)
                `)
                .eq('owner_id', user?.id)
                .maybeSingle();

            if (listingError) throw listingError;

            if (listingData) {
                setListing(listingData);
                // Set images state
                const imgs = ['', '', ''];
                (listingData.images || []).forEach((img: any) => {
                    if (img.display_order < 3) {
                        imgs[img.display_order] = img.url;
                    }
                });
                setListingImages(imgs);

                // 2. Fetch enquiries for this listing
                const { data: enquiryData, error: enquiryError } = await supabase
                    .from('catalogue_enquiries')
                    .select('*')
                    .eq('listing_id', listingData.id)
                    .order('created_at', { ascending: false });

                if (enquiryError) throw enquiryError;
                setEnquiries(enquiryData || []);
            }
        } catch (error) {
            console.error('Error fetching business data:', error);
            toast.error('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!listing) return;

        setIsSaving(true);
        try {
            const formData = new FormData(e.target as HTMLFormElement);
            const updates = {
                company_name: formData.get('company_name') as string,
                description: formData.get('description') as string,
                phone: formData.get('phone') as string,
                website: formData.get('website') as string,
                logo_url: formData.get('logo_url') as string,
                social_media: {
                    facebook: formData.get('social_facebook') as string || undefined,
                    instagram: formData.get('social_instagram') as string || undefined,
                    linkedin: formData.get('social_linkedin') as string || undefined,
                    twitter: formData.get('social_twitter') as string || undefined,
                }
            };

            const { error } = await supabase
                .from('catalogue_listings')
                .update(updates)
                .eq('id', listing.id);

            if (error) throw error;
            toast.success('Profile updated successfully');
            fetchBusinessData();
        } catch (error: any) {
            toast.error(error.message || 'Failed to update profile');
        } finally {
            setIsSaving(false);
        }
    };

    const handleSaveGallery = async () => {
        if (!listing) return;

        setIsSaving(true);
        try {
            // Delete existing images first
            await supabase.from('catalogue_listing_images').delete().eq('listing_id', listing.id);

            // Insert new images
            const imagesToInsert = listingImages
                .filter(url => url && url.trim() !== '')
                .map((url, index) => ({
                    listing_id: listing.id,
                    url,
                    display_order: index
                }));

            if (imagesToInsert.length > 0) {
                const { error } = await supabase.from('catalogue_listing_images').insert(imagesToInsert);
                if (error) throw error;
            }

            toast.success('Gallery updated successfully');
            fetchBusinessData();
        } catch (error: any) {
            toast.error(error.message || 'Failed to update gallery');
        } finally {
            setIsSaving(false);
        }
    };

    const handleSignOut = async () => {
        await signOut();
        navigate('/login');
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 size={40} className="text-[#007F00] animate-spin" />
                    <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Loading Portal...</p>
                </div>
            </div>
        );
    }

    if (!listing) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
                <div className="max-w-md w-full bg-white rounded-3xl p-10 text-center shadow-xl shadow-gray-200/50">
                    <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Building2 size={40} className="text-amber-500" />
                    </div>
                    <h2 className="text-2xl font-black text-gray-900 mb-2">No Listing Found</h2>
                    <p className="text-gray-500 mb-8 font-medium">Your account hasn't been linked to a business listing yet. Please contact support or your account manager.</p>
                    <button onClick={handleSignOut} className="w-full bg-gray-900 text-white py-4 rounded-2xl font-black uppercase tracking-wider text-sm hover:bg-gray-800 transition-all">
                        Sign Out
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar */}
            <aside className="w-80 bg-white border-r border-gray-100 flex flex-col sticky top-0 h-screen">
                <div className="p-8 border-b border-gray-50">
                    <Link to="/" className="block">
                        <img src="/logo.svg" alt="The Berman" className="h-8 w-auto mb-6" />
                    </Link>
                    <div className="p-4 bg-gray-50 rounded-2xl">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Business Portal</p>
                        <p className="text-sm font-bold text-gray-900 truncate">{listing.company_name}</p>
                    </div>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    {[
                        { id: 'overview', label: 'Overview', icon: LayoutDashboard },
                        { id: 'profile', label: 'Business Profile', icon: Building2 },
                        { id: 'gallery', label: 'Gallery Management', icon: ImageIcon },
                        { id: 'enquiries', label: 'Client Enquiries', icon: MessageSquare },
                    ].map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setView(item.id as any)}
                            className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-sm font-bold transition-all ${view === item.id
                                ? 'bg-[#007F00]/10 text-[#007F00]'
                                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                                }`}
                        >
                            <item.icon size={20} />
                            {item.label}
                            {view === item.id && <ChevronRight size={16} className="ml-auto" />}
                        </button>
                    ))}
                </nav>

                <div className="p-4 border-t border-gray-50">
                    <button
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-sm font-bold text-red-500 hover:bg-red-50 transition-all"
                    >
                        <LogOut size={20} />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto">
                <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-10 sticky top-0 z-10">
                    <h1 className="text-xl font-black text-gray-900 uppercase tracking-tight">
                        {view.replace('_', ' ')}
                    </h1>
                    <Link
                        to={`/catalogue/${listing.slug}`}
                        className="flex items-center gap-2 text-sm font-bold text-[#007F00] hover:underline"
                    >
                        View Public Page <ExternalLink size={14} />
                    </Link>
                </header>

                <div className="p-10 max-w-5xl mx-auto">
                    {view === 'overview' && (
                        <div className="space-y-8">
                            <div className="grid grid-cols-3 gap-6">
                                <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                                    <p className="text-xs font-black text-gray-400 uppercase tracking-[0.15em] mb-3">Total Enquiries</p>
                                    <p className="text-4xl font-black text-gray-900">{enquiries.length}</p>
                                </div>
                                <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                                    <p className="text-xs font-black text-gray-400 uppercase tracking-[0.15em] mb-3">Profile Status</p>
                                    <div className="flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${listing.is_active ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                        <p className="text-lg font-bold text-gray-900">{listing.is_active ? 'Active' : 'Inactive'}</p>
                                    </div>
                                </div>
                                <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                                    <p className="text-xs font-black text-gray-400 uppercase tracking-[0.15em] mb-3">Verification</p>
                                    <div className="flex items-center gap-2">
                                        <p className={`text-lg font-bold ${listing.is_verified ? 'text-blue-600' : 'text-gray-400'}`}>
                                            {listing.is_verified ? 'Verified Premium' : 'Pending Verification'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                                <div className="px-8 py-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                                    <h3 className="font-black text-gray-900 uppercase tracking-widest text-sm text-gray-500">Recent Enquiries</h3>
                                    <button onClick={() => setView('enquiries')} className="text-xs font-bold text-[#007F00] hover:underline">View All</button>
                                </div>
                                <div className="p-4">
                                    {enquiries.length === 0 ? (
                                        <div className="p-12 text-center">
                                            <p className="text-gray-400 font-medium">No enquiries yet.</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            {enquiries.slice(0, 5).map(e => (
                                                <div key={e.id} className="p-4 hover:bg-gray-50 rounded-2xl transition-all flex items-center justify-between group">
                                                    <div>
                                                        <p className="font-bold text-gray-900">{e.name}</p>
                                                        <p className="text-xs text-gray-500">{e.email} • {new Date(e.created_at).toLocaleDateString()}</p>
                                                    </div>
                                                    <button onClick={() => setView('enquiries')} className="p-2 bg-gray-100 rounded-full opacity-0 group-hover:opacity-100 transition-all">
                                                        <ChevronRight size={16} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {view === 'profile' && (
                        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                            <form onSubmit={handleSaveProfile} className="p-10 space-y-8">
                                <div className="grid grid-cols-2 gap-8">
                                    <div className="col-span-2">
                                        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Company Name</label>
                                        <input
                                            name="company_name"
                                            defaultValue={listing.company_name}
                                            required
                                            className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 font-bold text-gray-900 focus:ring-2 focus:ring-[#007F00] transition-all"
                                        />
                                    </div>

                                    <div className="col-span-2">
                                        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">About Business</label>
                                        <textarea
                                            name="description"
                                            defaultValue={listing.description}
                                            rows={6}
                                            className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 font-bold text-gray-900 focus:ring-2 focus:ring-[#007F00] transition-all"
                                            placeholder="Tell your potential clients about your services..."
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Public Phone</label>
                                        <input
                                            name="phone"
                                            defaultValue={listing.phone}
                                            className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 font-bold text-gray-900 focus:ring-2 focus:ring-[#007F00] transition-all"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Website URL</label>
                                        <input
                                            name="website"
                                            defaultValue={listing.website}
                                            className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 font-bold text-gray-900 focus:ring-2 focus:ring-[#007F00] transition-all"
                                        />
                                    </div>

                                    <div className="col-span-2">
                                        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Logo URL</label>
                                        <input
                                            name="logo_url"
                                            defaultValue={listing.logo_url}
                                            className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 font-bold text-gray-900 focus:ring-2 focus:ring-[#007F00] transition-all"
                                        />
                                    </div>

                                    <div className="col-span-2 pt-4">
                                        <h4 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-6 border-b border-gray-50 pb-4">Social Media Links</h4>
                                        <div className="grid grid-cols-2 gap-6">
                                            <div>
                                                <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                                                    <Facebook size={12} /> Facebook
                                                </label>
                                                <input name="social_facebook" defaultValue={listing.social_media?.facebook} className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm font-bold text-gray-900" />
                                            </div>
                                            <div>
                                                <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                                                    <Instagram size={12} /> Instagram
                                                </label>
                                                <input name="social_instagram" defaultValue={listing.social_media?.instagram} className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm font-bold text-gray-900" />
                                            </div>
                                            <div>
                                                <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                                                    <Linkedin size={12} /> LinkedIn
                                                </label>
                                                <input name="social_linkedin" defaultValue={listing.social_media?.linkedin} className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm font-bold text-gray-900" />
                                            </div>
                                            <div>
                                                <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                                                    <Twitter size={12} /> Twitter / X
                                                </label>
                                                <input name="social_twitter" defaultValue={listing.social_media?.twitter} className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm font-bold text-gray-900" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-end pt-8">
                                    <button
                                        type="submit"
                                        disabled={isSaving}
                                        className="bg-[#007F00] text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl shadow-green-900/10 hover:shadow-green-900/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-3 disabled:opacity-50"
                                    >
                                        {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                                        Save Changes
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {view === 'gallery' && (
                        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden p-10">
                            <div className="mb-8">
                                <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight mb-2">Manage Gallery Photos</h3>
                                <p className="text-gray-500 font-medium">Add up to 3 high-quality photos for your profile carousel.</p>
                            </div>

                            <div className="space-y-6">
                                {listingImages.map((url, index) => (
                                    <div key={index} className="flex gap-4 items-end">
                                        <div className="flex-1">
                                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Photo URL #{index + 1}</label>
                                            <input
                                                value={url}
                                                onChange={(e) => {
                                                    const newImages = [...listingImages];
                                                    newImages[index] = e.target.value;
                                                    setListingImages(newImages);
                                                }}
                                                placeholder="https://..."
                                                className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm font-bold text-gray-900 focus:ring-2 focus:ring-[#007F00] transition-all"
                                            />
                                        </div>
                                        {url && (
                                            <div className="w-20 h-20 rounded-xl overflow-hidden border border-gray-100 bg-gray-50 flex-shrink-0">
                                                <img src={url} alt={`Gallery ${index + 1}`} className="w-full h-full object-cover" />
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            <div className="flex justify-end pt-12">
                                <button
                                    onClick={handleSaveGallery}
                                    disabled={isSaving}
                                    className="bg-[#007F00] text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl shadow-green-900/10 hover:shadow-green-900/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-3 disabled:opacity-50"
                                >
                                    {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                                    Update Gallery
                                </button>
                            </div>
                        </div>
                    )}

                    {view === 'enquiries' && (
                        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="px-8 py-6 border-b border-gray-100 bg-gray-50/50">
                                <h3 className="font-black text-gray-900 uppercase tracking-widest text-sm text-gray-500">All Client Enquiries</h3>
                            </div>
                            <div className="p-0">
                                {enquiries.length === 0 ? (
                                    <div className="p-20 text-center">
                                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                                            <MessageSquare size={30} />
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-900 mb-1">No Enquiries Found</h3>
                                        <p className="text-gray-500">Clients who message you through the catalogue will appear here.</p>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-gray-50">
                                        {enquiries.map(e => (
                                            <div key={e.id} className="p-8 hover:bg-gray-50 transition-all">
                                                <div className="flex justify-between items-start mb-4">
                                                    <div>
                                                        <h4 className="text-lg font-black text-gray-900">{e.name}</h4>
                                                        <div className="flex items-center gap-4 mt-2">
                                                            <div className="flex items-center gap-1.5 text-sm font-bold text-gray-500">
                                                                <Mail size={14} className="text-[#007F00]" /> {e.email}
                                                            </div>
                                                            <div className="flex items-center gap-1.5 text-sm font-bold text-gray-500">
                                                                <Phone size={14} className="text-[#007F00]" /> {e.phone}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <span className="text-xs font-black text-gray-400 uppercase tracking-widest">
                                                        {new Date(e.created_at).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                                                    </span>
                                                </div>
                                                <div className="bg-white p-6 rounded-2xl border border-gray-100">
                                                    <p className="text-gray-700 font-medium leading-relaxed whitespace-pre-wrap">{e.message}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default BusinessDashboard;
