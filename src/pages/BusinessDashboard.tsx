
import { useEffect, useState, useRef, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import {
    Building2,
    Image as ImageIcon,
    LogOut,
    Loader2,
    Facebook,
    Instagram,
    Linkedin,
    Twitter,
    MapPin,
    Tags,
    CheckCircle,
    Menu,
    X,
    AlertCircle,
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { geocodeAddress } from '../lib/geocoding';

const IRISH_COUNTIES = [
    'Carlow', 'Cavan', 'Clare', 'Cork', 'Donegal', 'Dublin', 'Galway',
    'Kerry', 'Kildare', 'Kilkenny', 'Laois', 'Leitrim', 'Limerick',
    'Longford', 'Louth', 'Mayo', 'Meath', 'Monaghan', 'Offaly',
    'Roscommon', 'Sligo', 'Tipperary', 'Waterford', 'Westmeath',
    'Wexford', 'Wicklow'
];

interface CatalogueListing {
    id: string;
    name: string;
    slug: string;
    company_name: string;
    email: string;
    phone: string;
    description: string;
    address: string;
    website: string | null;
    logo_url: string | null;
    additional_addresses?: string[];
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
    images?: { id: string, url: string, description: string, display_order: number }[];
    banner_url?: string;
}



interface Category {
    id: string;
    name: string;
}

const useDebounce = (callback: Function, delay: number) => {
    const timeoutRef = useRef<any>(null);

    const debouncedCallback = useCallback((...args: any[]) => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = setTimeout(() => {
            callback(...args);
        }, delay);
    }, [callback, delay]);

    return debouncedCallback;
};

const BusinessDashboard = () => {
    const { user, profile, signOut } = useAuth();
    const navigate = useNavigate();
    const [listing, setListing] = useState<CatalogueListing | null>(null);
    const [loading, setLoading] = useState(true);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [listingImages, setListingImages] = useState<{ url: string, description: string }[]>([
        { url: '', description: '' },
        { url: '', description: '' },
        { url: '', description: '' },
        { url: '', description: '' },
        { url: '', description: '' },
        { url: '', description: '' }
    ]);

    // Categories state
    const [allCategories, setAllCategories] = useState<Category[]>([]);
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [isSavingCategories, setIsSavingCategories] = useState(false);
    const [isSavingProfile, setIsSavingProfile] = useState(false);
    const [isSavingGallery, setIsSavingGallery] = useState(false);
    const [isUploadingGallery, setIsUploadingGallery] = useState<{ [key: number]: boolean }>({});
    const [isUploadingBanner, setIsUploadingBanner] = useState(false);

    useEffect(() => {
        if (user) {
            fetchBusinessData();
            fetchAllCategories();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    const fetchBusinessData = async () => {
        try {
            setLoading(true);

            // 1. Fetch listing owned by this user
            const { data: listingData, error: listingError } = await supabase
                .from('catalogue_listings')
                .select(`
                    *,
                    images:catalogue_listing_images(id, url, description, display_order)
                `)
                .eq('owner_id', user?.id)
                .maybeSingle();

            if (listingError) throw listingError;

            if (listingData) {
                // Initialize categories first to avoid scope issues
                const { data: catData } = await supabase
                    .from('catalogue_listing_categories')
                    .select('category_id')
                    .eq('listing_id', listingData.id);

                // Set images state
                const imgs = Array(6)
                    .fill(null)
                    .map(() => ({ url: '', description: '' }));
                (listingData.images || []).forEach((img: { display_order: number, url: string, description: string | null }) => {
                    if (img.display_order < 6) {
                        imgs[img.display_order] = { url: img.url, description: img.description || '' };
                    }
                });
                setListingImages(imgs);

                if (catData) {
                    setSelectedCategories(catData.map(c => c.category_id));
                }

                // Normalize additional addresses (counties only)
                let normalizedAddrs: string[] = [];
                if (listingData.additional_addresses) {
                    normalizedAddrs = listingData.additional_addresses.map((a: string) =>
                        a.includes('|||') ? a.split('|||')[1] : a
                    ).filter(Boolean);
                }

                setListing({
                    ...listingData,
                    additional_addresses: normalizedAddrs
                });
            }
        } catch (error) {
            console.error('Error fetching business data:', error);
            toast.error('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    const fetchAllCategories = async () => {
        const { data } = await supabase
            .from('catalogue_categories')
            .select('id, name')
            .order('name');
        if (data) setAllCategories(data);
    };

    const saveProfileData = async (updates: any) => {
        if (!listing) return;
        setIsSavingProfile(true);
        try {
            const { error } = await supabase
                .from('catalogue_listings')
                .update(updates)
                .eq('id', listing.id);

            if (error) throw error;

            // Update coordinates if address changed
            if (updates.address) {
                const coords = await geocodeAddress(updates.address);
                if (coords) {
                    await supabase
                        .from('catalogue_listings')
                        .update({
                            latitude: coords.latitude,
                            longitude: coords.longitude
                        })
                        .eq('id', listing.id);
                }
            }
            toast.success('Saved changes', { id: 'profile-save' });
        } catch (error) {
            console.error('Error autosaving profile:', error);
        } finally {
            setIsSavingProfile(false);
        }
    };

    const debouncedSaveProfile = useDebounce(saveProfileData, 1000);

    const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        if (!listing) return;
        const { name, value } = e.target;

        let updates: any = {};
        if (name.startsWith('social_')) {
            const platform = name.replace('social_', '');
            updates = {
                social_media: {
                    ...listing.social_media,
                    [platform]: value || undefined
                }
            };
        } else {
            updates = { [name]: value };
        }

        setListing({ ...listing, ...updates });
        debouncedSaveProfile(updates);
    };

    const handleSaveCategories = async (newCategories: string[]) => {
        if (!listing) return;

        setIsSavingCategories(true);
        try {
            // Delete existing
            await supabase.from('catalogue_listing_categories').delete().eq('listing_id', listing.id);

            // Insert new
            if (newCategories.length > 0) {
                const mappings = newCategories.map(categoryId => ({
                    listing_id: listing.id,
                    category_id: categoryId,
                }));
                const { error } = await supabase.from('catalogue_listing_categories').insert(mappings);
                if (error) throw error;
            }

            toast.success('Categories updated', { id: 'cat-save' });
        } catch (error) {
            console.error('Error saving categories:', error);
            toast.error('Failed to update categories');
        } finally {
            setIsSavingCategories(false);
        }
    };

    const toggleCategory = (categoryId: string) => {
        const newCategories = selectedCategories.includes(categoryId)
            ? selectedCategories.filter(id => id !== categoryId)
            : [...selectedCategories, categoryId];

        setSelectedCategories(newCategories);
        handleSaveCategories(newCategories);
    };

    const saveGalleryData = async (newImages: { url: string, description: string }[]) => {
        if (!listing) return;
        setIsSavingGallery(true);
        try {
            // Delete existing
            await supabase.from('catalogue_listing_images').delete().eq('listing_id', listing.id);

            // Insert new
            const finalImages = newImages
                .map((img, index) => ({
                    listing_id: listing.id,
                    url: img.url.trim(),
                    description: img.description.trim(),
                    display_order: index,
                }))
                .filter(img => img.url);

            if (finalImages.length > 0) {
                const { error } = await supabase.from('catalogue_listing_images').insert(finalImages);
                if (error) throw error;
            }

            toast.success('Gallery updated', { id: 'gallery-save' });
        } catch (error) {
            console.error('Error autosaving gallery:', error);
        } finally {
            setIsSavingGallery(false);
        }
    };

    const debouncedSaveGallery = useDebounce(saveGalleryData, 1500);

    const handleGalleryDescriptionChange = (index: number, description: string) => {
        const newImages = [...listingImages];
        newImages[index].description = description;
        setListingImages(newImages);
        debouncedSaveGallery(newImages);
    };

    const handleGalleryUpload = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            toast.error('Please upload an image file');
            return;
        }

        if (file.size > 2 * 1024 * 1024) {
            toast.error('Image must be less than 2MB');
            return;
        }

        try {
            setIsUploadingGallery(prev => ({ ...prev, [index]: true }));
            setIsSavingGallery(true);
            const { uploadImageToCloudinary } = await import('../lib/cloudinary');
            const publicUrl = await uploadImageToCloudinary(file);

            const newImages = [...listingImages];
            newImages[index].url = publicUrl;
            setListingImages(newImages);
            saveGalleryData(newImages);
            toast.success('Image uploaded successfully');
        } catch (error: any) {
            console.error('Error uploading gallery image:', error);
            toast.error(error.message || 'Failed to upload image');
        } finally {
            setIsSavingGallery(false);
            setIsUploadingGallery(prev => ({ ...prev, [index]: false }));
            e.target.value = '';
        }
    };

    const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            toast.error('Please upload an image file');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            toast.error('Banner image must be less than 5MB');
            return;
        }

        try {
            setIsUploadingBanner(true);
            const { uploadImageToCloudinary } = await import('../lib/cloudinary');
            const publicUrl = await uploadImageToCloudinary(file);

            setListing(prev => {
                const updated = { ...prev!, banner_url: publicUrl };
                saveProfileData({ banner_url: publicUrl });
                return updated;
            });
            toast.success('Banner uploaded successfully');
        } catch (error: any) {
            console.error('Error uploading banner:', error);
            toast.error(error.message || 'Failed to upload banner');
        } finally {
            setIsUploadingBanner(false);
            e.target.value = '';
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

    // Suspended or Pending — show website-style blocking page instead of dashboard
    const isSuspended = profile?.stripe_payment_id === 'SUSPENDED';
    const hasPaid = !!profile?.stripe_payment_id && profile.stripe_payment_id !== 'SUSPENDED';

    // Business pending + no payment yet → redirect to payment page
    if (profile?.registration_status === 'pending' && !hasPaid) {
        navigate('/business-membership', { replace: true });
        return null;
    }

    if (isSuspended || profile?.registration_status === 'pending') {
        const suspended = isSuspended;
        return (
            <div className="min-h-screen bg-gray-50 font-sans">
                <header className="bg-white border-b border-gray-200 sticky top-0 z-[9999] shadow-sm">
                    <div className="max-w-7xl mx-auto px-6 h-16 flex justify-between items-center">
                        <Link to="/" className="flex-shrink-0">
                            <img src="/logo.svg" alt="The Berman Logo" className="h-9 w-auto" />
                        </Link>
                        <nav className="hidden md:flex items-center gap-6">
                            <Link to="/" className="text-sm font-medium text-gray-600 hover:text-[#007F00] transition-colors">Home</Link>
                            <Link to="/catalogue" className="text-sm font-medium text-gray-600 hover:text-[#007F00] transition-colors">Catalogue</Link>
                            <Link to="/news" className="text-sm font-medium text-gray-600 hover:text-[#007F00] transition-colors">News</Link>
                            <Link to="/contact" className="text-sm font-medium text-gray-600 hover:text-[#007F00] transition-colors">Contact</Link>
                        </nav>
                        <button onClick={handleSignOut} className="text-sm font-bold text-gray-500 hover:text-red-500 transition-colors flex items-center gap-2">
                            <LogOut size={16} /> Sign Out
                        </button>
                    </div>
                </header>
                <main className="flex items-center justify-center min-h-[calc(100vh-4rem)] px-4 py-16">
                    <div className="max-w-lg w-full bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                        <div className={`h-2 ${suspended ? 'bg-red-500' : 'bg-[#007F00]'}`} />
                        <div className="p-10 text-center">
                            <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${suspended ? 'bg-red-50' : 'bg-green-50'}`}>
                                <AlertCircle size={40} className={`${suspended ? 'text-red-500' : 'text-[#007F00]'} animate-pulse`} />
                            </div>
                            <h1 className="text-2xl font-black text-gray-900 mb-3">
                                {suspended ? 'Account Suspended' : 'Account Pending Approval'}
                            </h1>
                            <p className="text-gray-500 mb-2 font-medium leading-relaxed">
                                {suspended
                                    ? 'Your account has been suspended by an administrator.'
                                    : 'Your profile has been submitted and is waiting to be reviewed by our team.'}
                            </p>
                            <p className="text-gray-400 text-sm mb-8">
                                {suspended
                                    ? 'If you believe this is a mistake, please contact our support team.'
                                    : 'Once approved, you will have full access to the Business Portal.'}
                            </p>
                            <div className={`border rounded-xl p-4 mb-8 text-left ${suspended ? 'bg-red-50 border-red-100' : 'bg-green-50 border-green-100'}`}>
                                <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${suspended ? 'text-red-600' : 'text-[#007F00]'}`}>
                                    {suspended ? 'Suspended account' : 'Registered as'}
                                </p>
                                <p className="text-sm font-semibold text-gray-800">{user?.user_metadata?.full_name || user?.email}</p>
                                <p className="text-xs text-gray-500">{user?.email}</p>
                            </div>
                            <p className="text-xs text-gray-400 mb-6">
                                Questions? Contact us at{' '}
                                <a href="mailto:hello@theberman.eu" className={`font-semibold hover:underline ${suspended ? 'text-red-500' : 'text-[#007F00]'}`}>
                                    hello@theberman.eu
                                </a>
                            </p>
                            <div className="flex flex-col sm:flex-row gap-3">
                                <Link to="/" className={`flex-1 py-3 px-6 text-white rounded-xl font-bold text-sm transition-colors text-center ${suspended ? 'bg-red-500 hover:bg-red-600' : 'bg-[#007F00] hover:bg-[#006600]'}`}>
                                    Explore Website
                                </Link>
                                <button onClick={handleSignOut} className="flex-1 py-3 px-6 border border-gray-200 text-gray-600 rounded-xl font-bold text-sm hover:bg-gray-50 transition-colors">
                                    Sign Out
                                </button>
                            </div>
                        </div>
                    </div>
                </main>
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
                    <p className="text-gray-500 mb-8 font-medium">Your account hasn't been linked to a business listing yet. Please complete your onboarding.</p>
                    <Link to="/business-onboarding" className="block w-full bg-[#007F00] text-white py-4 rounded-2xl font-black uppercase tracking-wider text-sm hover:bg-green-800 transition-all mb-3">
                        Complete Onboarding
                    </Link>
                    <button onClick={handleSignOut} className="w-full bg-gray-100 text-gray-700 py-4 rounded-2xl font-black uppercase tracking-wider text-sm hover:bg-gray-200 transition-all">
                        Sign Out
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Header */}
            <header className="fixed w-full top-0 z-[9999] bg-[#0c121d] backdrop-blur-md border-b border-white/5 shadow-lg transition-all duration-300">
                <div className="absolute top-full left-0 right-0 h-px bg-white/5 pointer-events-none"></div>
                <div className="container mx-auto px-6 h-20 flex justify-between items-center">
                    <div className="flex items-center gap-4 md:gap-8">
                        <Link to="/" className="hover:opacity-80 transition-opacity shrink-0">
                            <img src="/logo.svg" alt="The Berman" className="h-16 w-auto relative z-10" />
                        </Link>

                        <div className="h-10 w-px bg-white/10 hidden lg:block"></div>

                        <div className="hidden sm:block">
                            <div className="flex items-center gap-3">
                                <h1 className="text-xl font-black text-white uppercase tracking-tight leading-none">
                                    Manage Profile
                                </h1>
                                <span className="px-2 py-0.5 bg-[#007F00]/20 text-[#007F00] text-[9px] font-black rounded uppercase tracking-widest border border-[#007F00]/30">
                                    Business Portal
                                </span>
                            </div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mt-1">{listing.company_name}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 relative">
                        <Link
                            to={`/catalogue/${listing.slug}`}
                            target="_blank"
                            className="hidden md:flex items-center gap-3 px-6 py-2 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 transition-all group"
                        >
                            <div className="w-2 h-2 rounded-full bg-[#9ACD32] group-hover:animate-pulse"></div>
                            <span className="text-sm font-black text-white uppercase tracking-wider">
                                View <span className="text-[#9ACD32]">Public Page</span>
                            </span>
                        </Link>

                        <button
                            className="bg-white/5 p-2.5 rounded-xl hover:bg-white/10 transition-all border border-white/10"
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                        >
                            {isMenuOpen ? (
                                <X size={20} className="text-white" />
                            ) : (
                                <Menu size={20} className="text-white" />
                            )}
                        </button>
                    </div>

                    {/* Dropdown Menu Content */}
                    <div className={`absolute right-6 top-full mt-4 w-64 bg-white shadow-[0_20px_50px_rgba(0,0,0,0.1)] rounded-3xl border border-gray-100 overflow-hidden transform origin-top transition-all duration-300 ease-out ${isMenuOpen ? 'scale-y-100 opacity-100' : 'scale-y-95 opacity-0 pointer-events-none'}`}>
                        <div className="py-2">
                            <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/50">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Logged in as</p>
                                <p className="text-xs font-bold text-gray-900 truncate">{user?.email}</p>
                            </div>
                            <button
                                onClick={handleSignOut}
                                className="w-full px-6 py-4 text-left text-sm font-black uppercase tracking-widest text-red-500 hover:bg-red-50 flex items-center gap-3 transition-colors"
                            >
                                <LogOut size={16} />
                                Sign Out
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Subscription Expired Overlay (active accounts only) */}
            {(profile?.subscription_status === 'expired' || profile?.is_active === false) &&
                profile?.registration_status === 'active' &&
                profile?.stripe_payment_id !== 'MANUAL_BY_ADMIN' && (
                <div className="fixed inset-0 z-[10001] bg-[#0c121d]/95 backdrop-blur-2xl flex items-center justify-center p-6 text-center">
                    <div className="max-w-md w-full bg-white rounded-3xl p-10 shadow-2xl border-t-8 border-red-500">
                        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <AlertCircle size={40} className="text-red-500 animate-pulse" />
                        </div>
                        <h2 className="text-2xl font-black text-gray-900 mb-2">Subscription Expired</h2>
                        <p className="text-gray-500 mb-8 font-medium">
                            Your subscription has ended and your account is currently disabled. Please renew your subscription to reactivate your listing and access the portal.
                        </p>
                        <Link
                            to="/pricing"
                            className="block w-full bg-red-600 text-white py-4 rounded-2xl font-black uppercase tracking-wider text-sm hover:bg-red-700 transition-all mb-4 shadow-lg shadow-red-500/20"
                        >
                            Renew Subscription
                        </Link>
                        <button onClick={handleSignOut} className="w-full text-gray-400 hover:text-gray-600 font-bold uppercase tracking-widest text-[10px] transition-colors">
                            Sign Out
                        </button>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <main className="flex-grow pt-20">
                <div className="max-w-7xl mx-auto px-6 py-10">
                    {/* Quick Navigation Sticky Bar */}
                    <div className="sticky top-24 z-[100] mb-12 bg-gray-50/80 backdrop-blur-xl p-2 rounded-2xl border border-gray-200/50 shadow-sm overflow-x-auto no-scrollbar flex items-center gap-2">
                        <button
                            onClick={() => document.getElementById('basic-info')?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
                            className="flex items-center gap-2 px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest text-gray-600 hover:bg-white hover:text-[#007F00] hover:shadow-sm transition-all whitespace-nowrap"
                        >
                            <Building2 size={14} /> Basic Details
                        </button>
                        <button
                            onClick={() => document.getElementById('visuals')?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
                            className="flex items-center gap-2 px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest text-[#007EA7] bg-[#007EA7]/5 border border-[#007EA7]/10 hover:bg-[#007EA7] hover:text-white transition-all whitespace-nowrap shadow-sm"
                        >
                            <ImageIcon size={14} /> Catalogue Media
                        </button>
                        <button
                            onClick={() => document.getElementById('categories')?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
                            className="flex items-center gap-2 px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest text-gray-600 hover:bg-white hover:text-orange-600 transition-all whitespace-nowrap"
                        >
                            <Tags size={14} /> Categories
                        </button>
                        <button
                            onClick={() => document.getElementById('locations')?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
                            className="flex items-center gap-2 px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest text-gray-600 hover:bg-white hover:text-red-600 transition-all whitespace-nowrap"
                        >
                            <MapPin size={14} /> Locations
                        </button>
                    </div>

                    <div className="space-y-16 pb-20">
                        {/* Section 1: Basic Info */}
                        <section id="basic-info" className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
                            <div className="px-10 py-8 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-[#007F00]/10 text-[#007F00] flex items-center justify-center">
                                        <Building2 size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-black text-gray-900 uppercase tracking-widest text-sm">Profile Details</h3>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Main Business Information</p>
                                    </div>
                                </div>
                                {isSavingProfile && (
                                    <div className="flex items-center gap-2 text-[#007F00] text-xs font-black uppercase tracking-widest bg-white px-4 py-2 rounded-full border border-green-100 shadow-sm">
                                        <Loader2 size={12} className="animate-spin" /> Saving...
                                    </div>
                                )}
                            </div>
                            <div className="p-10 space-y-10">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="md:col-span-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 block">Display Business Name</label>
                                        <input
                                            name="company_name"
                                            value={listing.company_name || ''}
                                            onChange={handleProfileChange}
                                            placeholder="e.g. Berman Energy Services"
                                            className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-5 font-bold text-gray-900 focus:ring-2 focus:ring-[#007F00] focus:bg-white focus:border-[#007F00] transition-all outline-none text-lg shadow-inner"
                                        />
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 block">Business Bio / About Us</label>
                                        <textarea
                                            name="description"
                                            value={listing.description || ''}
                                            onChange={handleProfileChange}
                                            rows={6}
                                            placeholder="Describe your services and expertise..."
                                            className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-5 font-bold text-gray-900 focus:ring-2 focus:ring-[#007F00] focus:bg-white focus:border-[#007F00] transition-all outline-none shadow-inner resize-none mb-6"
                                        />

                                        <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                                            <div className="flex items-center justify-between mb-4">
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Key Features / Highlights</label>
                                                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tight">Appears in "Features" tab</span>
                                            </div>
                                            <div className="space-y-3">
                                                {(listing.features || []).map((feature, idx) => (
                                                    <div key={idx} className="flex gap-2">
                                                        <input
                                                            value={feature}
                                                            onChange={(e) => {
                                                                const newFeatures = [...(listing.features || [])];
                                                                newFeatures[idx] = e.target.value;
                                                                setListing({ ...listing, features: newFeatures });
                                                                debouncedSaveProfile({ features: newFeatures });
                                                            }}
                                                            placeholder="e.g. 24/7 Emergency Support"
                                                            className="flex-grow bg-white border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold text-gray-700 focus:ring-2 focus:ring-[#007F00] focus:outline-none transition-all"
                                                        />
                                                        <button
                                                            onClick={() => {
                                                                const newFeatures = (listing.features || []).filter((_, i) => i !== idx);
                                                                setListing({ ...listing, features: newFeatures });
                                                                saveProfileData({ features: newFeatures });
                                                            }}
                                                            className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition-colors"
                                                        >
                                                            <X size={18} />
                                                        </button>
                                                    </div>
                                                ))}
                                                <button
                                                    onClick={() => {
                                                        const newFeatures = [...(listing.features || []), ''];
                                                        setListing({ ...listing, features: newFeatures });
                                                    }}
                                                    className="w-full py-3 border-2 border-dashed border-gray-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-400 hover:border-[#007F00] hover:text-[#007F00] transition-all bg-white/50"
                                                >
                                                    + Add New Highlight
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 block">Public Contact Phone</label>
                                        <input
                                            name="phone"
                                            value={listing.phone || ''}
                                            onChange={handleProfileChange}
                                            placeholder="e.g. +353 1 234 5678"
                                            className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 font-bold text-gray-900 focus:ring-2 focus:ring-[#007F00] focus:bg-white transition-all shadow-inner"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 block">Public Contact Email</label>
                                        <input
                                            name="email"
                                            value={listing.email || ''}
                                            onChange={handleProfileChange}
                                            placeholder="e.g. welcome@business.com"
                                            className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 font-bold text-gray-900 focus:ring-2 focus:ring-[#007F00] focus:bg-white transition-all shadow-inner"
                                        />
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 block">Business Headquarters Address</label>
                                        <input
                                            name="address"
                                            value={listing.address || ''}
                                            onChange={handleProfileChange}
                                            placeholder="Full address for map placement..."
                                            className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 font-bold text-gray-900 focus:ring-2 focus:ring-[#007F00] focus:bg-white transition-all shadow-inner"
                                        />
                                    </div>

                                    <div className="md:col-span-2">
                                        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6 border-b border-gray-100 pb-2">Social Connect Links</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-4">
                                                <div>
                                                    <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2"><Facebook size={12} /> Facebook</label>
                                                    <input name="social_facebook" value={listing.social_media?.facebook || ''} onChange={handleProfileChange} placeholder="https://facebook.com/yourpage" className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold shadow-inner" />
                                                </div>
                                                <div>
                                                    <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2"><Instagram size={12} /> Instagram</label>
                                                    <input name="social_instagram" value={listing.social_media?.instagram || ''} onChange={handleProfileChange} placeholder="https://instagram.com/yourprofile" className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold shadow-inner" />
                                                </div>
                                            </div>
                                            <div className="space-y-4">
                                                <div>
                                                    <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2"><Linkedin size={12} /> LinkedIn</label>
                                                    <input name="social_linkedin" value={listing.social_media?.linkedin || ''} onChange={handleProfileChange} placeholder="https://linkedin.com/company/handle" className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold shadow-inner" />
                                                </div>
                                                <div>
                                                    <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2"><Twitter size={12} /> Twitter / X</label>
                                                    <input name="social_twitter" value={listing.social_media?.twitter || ''} onChange={handleProfileChange} placeholder="https://twitter.com/handle" className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold shadow-inner" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Section 2: Visuals & Media */}
                        <section id="visuals" className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
                            <div className="px-10 py-8 border-b border-gray-100 bg-[#007EA7]/5 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-[#007EA7]/10 text-[#007EA7] flex items-center justify-center">
                                        <ImageIcon size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-black text-gray-900 uppercase tracking-widest text-sm">Catalogue Media</h3>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Banner and Image Slider</p>
                                    </div>
                                </div>
                                {(isSavingGallery || isUploadingBanner) && (
                                    <div className="flex items-center gap-2 text-[#007EA7] text-xs font-black uppercase tracking-widest bg-white px-4 py-2 rounded-full border border-sky-100 shadow-sm">
                                        <Loader2 size={12} className="animate-spin" /> SYNCING...
                                    </div>
                                )}
                            </div>
                            <div className="p-10 space-y-16">
                                {/* Large Banner Hero */}
                                <div>
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                                        <div>
                                            <h4 className="text-sm font-black text-gray-900 uppercase tracking-tight mb-1">Main Heritage Banner</h4>
                                            <p className="text-xs text-gray-500 font-medium">This is the premium wide-screen image at the top of your profile.</p>
                                        </div>
                                        <div className="flex-shrink-0">
                                            <input type="file" id="hero-up" className="hidden" accept="image/*" onChange={handleBannerUpload} disabled={isUploadingBanner} />
                                            <label htmlFor="hero-up" className="inline-flex items-center gap-2 px-8 py-3.5 bg-gray-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-black cursor-pointer transition-all shadow-xl shadow-gray-200">
                                                {isUploadingBanner ? <Loader2 size={14} className="animate-spin" /> : <ImageIcon size={14} />}
                                                {isUploadingBanner ? 'Uploading...' : 'Replace Master Banner'}
                                            </label>
                                        </div>
                                    </div>
                                    <div className="relative h-80 w-full rounded-[2rem] overflow-hidden bg-gray-100 border-4 border-white shadow-2xl group ring-1 ring-gray-100">
                                        {listing.banner_url ? (
                                            <>
                                                <img src={listing.banner_url} alt="Master Banner" className="w-full h-full object-cover" />
                                                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-all duration-500"></div>
                                                <button onClick={() => { setListing(p => ({ ...p!, banner_url: '' })); saveProfileData({ banner_url: null }); }} className="absolute top-6 right-6 bg-red-600 text-white p-3 rounded-full opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0 shadow-lg">
                                                    <X size={24} />
                                                </button>
                                            </>
                                        ) : (
                                            <div className="w-full h-full flex flex-col items-center justify-center text-gray-300">
                                                <ImageIcon size={64} className="mb-4 opacity-10" />
                                                <span className="font-black text-[10px] uppercase tracking-[0.3em]">Design Empty Section</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Slider Gallery */}
                                <div>
                                    <div className="mb-10">
                                        <h4 className="text-sm font-black text-gray-900 uppercase tracking-tight mb-1">Hero Slider Portfolio</h4>
                                        <p className="text-xs text-gray-500 font-medium">Add up to 6 photos that showcase your best work in the profile slider.</p>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                        {listingImages.map((img, idx) => (
                                            <div key={idx} className="group bg-gray-50 rounded-[2rem] border border-gray-100 overflow-hidden hover:border-[#007EA7]/30 transition-all hover:bg-white hover:shadow-2xl hover:shadow-[#007EA7]/10 flex flex-col h-full">
                                                <div className="relative aspect-video bg-white overflow-hidden border-b border-gray-100">
                                                    {img.url ? (
                                                        <>
                                                            <img src={img.url} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                                            <button onClick={() => { const n = [...listingImages]; n[idx] = { url: '', description: '' }; setListingImages(n); saveGalleryData(n); }} className="absolute top-3 right-3 bg-red-500 text-white p-2 rounded-xl opacity-0 group-hover:opacity-100 transition-all translate-y-1 group-hover:translate-y-0 shadow-lg">
                                                                <X size={16} />
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <div className="w-full h-full flex flex-col items-center justify-center gap-4 py-10">
                                                            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-gray-200 border border-gray-100 shadow-sm group-hover:border-[#007EA7]/30 transition-all">
                                                                {isUploadingGallery[idx] ? <Loader2 size={24} className="animate-spin text-[#007EA7]" /> : <ImageIcon size={24} />}
                                                            </div>
                                                            <input type="file" id={`gallery-${idx}`} className="hidden" accept="image/*" onChange={(e) => handleGalleryUpload(idx, e)} disabled={isUploadingGallery[idx]} />
                                                            <label htmlFor={`gallery-${idx}`} className="px-5 py-2.5 bg-white border border-[#007EA7]/20 text-[#007EA7] rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-[#007EA7] hover:text-white cursor-pointer transition-all shadow-sm">
                                                                Upload Image {idx + 1}
                                                            </label>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="p-6 flex-grow ">
                                                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-3 block">Photo Context / Caption</label>
                                                    <textarea
                                                        value={img.description}
                                                        onChange={(e) => handleGalleryDescriptionChange(idx, e.target.value)}
                                                        placeholder="Add a caption..."
                                                        rows={2}
                                                        className="w-full bg-transparent border-none p-0 text-sm font-bold text-gray-900 focus:ring-0 placeholder:text-gray-300 resize-none leading-relaxed"
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Section 3: Categories */}
                        <section id="categories" className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
                            <div className="px-10 py-8 border-b border-gray-100 bg-orange-50/20 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center">
                                        <Tags size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-black text-gray-900 uppercase tracking-widest text-sm">Service Categories</h3>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Catalogue Visibility</p>
                                    </div>
                                </div>
                                {isSavingCategories && (
                                    <div className="flex items-center gap-2 text-orange-600 text-xs font-black uppercase tracking-widest bg-white px-4 py-2 rounded-full border border-orange-100 shadow-sm">
                                        <Loader2 size={12} className="animate-spin" /> SYNCING...
                                    </div>
                                )}
                            </div>
                            <div className="p-10">
                                <p className="text-gray-500 text-sm font-medium mb-10 max-w-2xl leading-relaxed">Select the categories that define your business. This determines where you appear when users filter by service in our directory.</p>
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                    {allCategories.map(cat => (
                                        <button
                                            key={cat.id}
                                            onClick={() => toggleCategory(cat.id)}
                                            className={`group p-6 rounded-[2rem] border-2 text-left transition-all duration-300 relative overflow-hidden ${selectedCategories.includes(cat.id)
                                                ? 'border-orange-500 bg-orange-50/50 shadow-xl shadow-orange-100/50'
                                                : 'border-gray-50 bg-gray-50 hover:border-gray-200 hover:bg-white'
                                                }`}
                                        >
                                            <div className="flex flex-col gap-6 relative z-10">
                                                <div className={`w-8 h-8 rounded-xl border-2 flex items-center justify-center transition-all duration-500 ${selectedCategories.includes(cat.id) ? 'bg-orange-500 border-orange-500 rotate-[360deg]' : 'bg-white border-gray-200 group-hover:border-orange-200'}`}>
                                                    {selectedCategories.includes(cat.id) && <CheckCircle size={16} className="text-white" />}
                                                </div>
                                                <span className={`text-[11px] font-black uppercase tracking-tight leading-4 ${selectedCategories.includes(cat.id) ? 'text-orange-900' : 'text-gray-500 group-hover:text-gray-700'}`}>{cat.name}</span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </section>

                        {/* Section 4: Locations */}
                        <section id="locations" className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
                            <div className="px-10 py-8 border-b border-gray-100 bg-red-50/20 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center">
                                        <MapPin size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-black text-gray-900 uppercase tracking-widest text-sm">Service Coverage</h3>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Regional Targeting</p>
                                    </div>
                                </div>
                            </div>
                            <div className="p-10">
                                <p className="text-gray-500 text-sm font-medium mb-10 max-w-2xl leading-relaxed">Choose every county where you are active. You will be matched with inquiries and appear in searches for these specific areas.</p>
                                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
                                    {IRISH_COUNTIES.map(county => {
                                        const isSelected = (listing.additional_addresses || []).includes(county);
                                        return (
                                            <button
                                                key={county}
                                                onClick={() => {
                                                    const cur = listing.additional_addresses || [];
                                                    const next = isSelected ? cur.filter(c => c !== county) : [...cur, county];
                                                    setListing({ ...listing, additional_addresses: next });
                                                    saveProfileData({ additional_addresses: next });
                                                }}
                                                className={`px-4 py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border text-center ${isSelected ? 'bg-red-600 text-white border-red-600 shadow-xl shadow-red-100' : 'bg-white text-gray-400 border-gray-100 hover:border-red-200 hover:text-red-500 hover:shadow-lg'}`}
                                            >
                                                {county}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default BusinessDashboard;
