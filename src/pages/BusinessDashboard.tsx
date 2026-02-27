
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
    CreditCard
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { geocodeAddress } from '../lib/geocoding';

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
    images?: { id: string, url: string, description: string, display_order: number }[];
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
        { url: '', description: '' }
    ]);

    // Categories state
    const [allCategories, setAllCategories] = useState<Category[]>([]);
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [isSavingCategories, setIsSavingCategories] = useState(false);
    const [isSavingProfile, setIsSavingProfile] = useState(false);
    const [isSavingGallery, setIsSavingGallery] = useState(false);

    useEffect(() => {
        if (user) {
            fetchBusinessData();
            fetchAllCategories();
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
                    images:catalogue_listing_images(id, url, description, display_order)
                `)
                .eq('owner_id', user?.id)
                .maybeSingle();

            if (listingError) throw listingError;

            if (listingData) {
                setListing(listingData);
                // Set images state
                const imgs = [
                    { url: '', description: '' },
                    { url: '', description: '' },
                    { url: '', description: '' }
                ];
                (listingData.images || []).forEach((img: any) => {
                    if (img.display_order < 3) {
                        imgs[img.display_order] = { url: img.url, description: img.description || '' };
                    }
                });
                setListingImages(imgs);

                // Initialize categories
                const { data: catData } = await supabase
                    .from('catalogue_listing_categories')
                    .select('category_id')
                    .eq('listing_id', listingData.id);

                if (catData) {
                    setSelectedCategories(catData.map(c => c.category_id));
                }
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
        } catch (error: any) {
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
            setIsSavingGallery(true);
            const fileExt = file.name.split('.').pop();
            const fileName = `gallery/${listing?.id}-${Date.now()}-${index}.${fileExt}`;

            const { error: uploadError } = await supabase.storage
                .from('uploads')
                .upload(fileName, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('uploads')
                .getPublicUrl(fileName);

            const newImages = [...listingImages];
            newImages[index].url = publicUrl;
            setListingImages(newImages);
            saveGalleryData(newImages);
            toast.success('Image uploaded successfully');
        } catch (error: any) {
            console.error('Error uploading gallery image:', error);
            toast.error(error.message || 'Failed to upload image');
            setIsSavingGallery(false);
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
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            {/* Header */}
            <header className="fixed w-full top-0 z-[9999] bg-[#0c121d] backdrop-blur-md border-b border-white/5 shadow-lg transition-all duration-300">
                <div className="absolute top-full left-0 right-0 h-px bg-white/5 pointer-events-none"></div>
                <div className="container mx-auto px-6 h-20 flex justify-between items-center">
                    <div className="flex items-center gap-4 md:gap-8">
                        <Link to="/" className="hover:opacity-80 transition-opacity shrink-0">
                            <img src="/logo.svg" alt="The Berman" className="h-18 w-auto relative z-10" />
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
                            className="hidden md:flex items-center gap-3 px-6 py-2 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 transition-all group"
                        >
                            <div className="w-2 h-2 rounded-full bg-[#9ACD32] group-hover:animate-pulse"></div>
                            <span className="text-sm font-black text-white uppercase tracking-wider">
                                View <span className="text-[#9ACD32]">Public Page</span>
                            </span>
                        </Link>

                        <button
                            className="bg-gray-200 p-2 rounded-md hover:bg-gray-300 transition-colors"
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                        >
                            {isMenuOpen ? (
                                <X size={28} className="text-green-600" />
                            ) : (
                                <Menu size={28} className="text-green-600" />
                            )}
                        </button>
                    </div>
                </div>

                {/* Dropdown Menu Overlay */}
                {isMenuOpen && (
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsMenuOpen(false)}
                    ></div>
                )}

                {/* Dropdown Menu Content */}
                <div className={`absolute right-6 md:right-12 top-full mt-2 w-64 bg-white shadow-2xl rounded-b-3xl border-t border-gray-50 overflow-hidden transform origin-top transition-all duration-300 ease-out z-50 ${isMenuOpen ? 'scale-y-100 opacity-100' : 'scale-y-95 opacity-0 pointer-events-none'
                    }`}>
                    <div className="py-2">
                        <div className="w-full px-5 py-4 text-left text-xs font-black text-gray-400 uppercase tracking-widest border-b border-gray-50">
                            My Business account
                        </div>
                        <button
                            onClick={handleSignOut}
                            className="w-full px-5 py-5 text-left text-sm font-bold uppercase tracking-wide text-red-500 hover:bg-red-50 flex items-center gap-3 transition-colors"
                        >
                            <LogOut size={18} />
                            Sign Out
                        </button>
                    </div>
                </div>
            </header>

            {/* Registration Blocker Overlay */}
            {profile?.registration_status === 'pending' && (
                <div className="fixed inset-0 z-[10000] bg-[#0c121d]/90 backdrop-blur-xl flex items-center justify-center p-6 text-center">
                    <div className="max-w-md w-full bg-white rounded-3xl p-10 shadow-2xl">
                        <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CreditCard size={40} className="text-amber-500" />
                        </div>
                        <h2 className="text-2xl font-black text-gray-900 mb-2">Catalogue Subscription Required</h2>
                        <p className="text-gray-500 mb-8 font-medium">To activate your business profile and appear in the catalogue, please complete your subscription payment.</p>
                        <Link
                            to="/business-membership"
                            className="block w-full bg-[#007F00] text-white py-4 rounded-2xl font-black uppercase tracking-wider text-sm hover:bg-green-800 transition-all mb-4 shadow-lg shadow-green-500/20"
                        >
                            Complete Subscription Payment
                        </Link>
                        <button
                            onClick={handleSignOut}
                            className="w-full text-gray-400 font-bold uppercase tracking-widest text-[10px] hover:text-gray-600 transition-colors"
                        >
                            Sign Out
                        </button>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <main className="pt-20 min-h-screen">
                <div className="p-6 md:p-10 max-w-7xl mx-auto">
                    <div className="space-y-10">
                        {/* 1. Basic Info */}
                        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="px-10 py-6 border-b border-gray-100 bg-gray-50/50">
                                <h3 className="font-black text-gray-900 uppercase tracking-widest text-sm flex items-center gap-2">
                                    <Building2 size={16} /> Basic Profile Details
                                </h3>
                            </div>
                            <div className="p-10 space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                                    <div>
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Company Name</label>
                                        <input
                                            name="company_name"
                                            value={listing.company_name || ''}
                                            onChange={handleProfileChange}
                                            placeholder="e.g. Berman Energy Services"
                                            className="w-full bg-gray-100 border-none rounded-2xl px-6 py-4 font-bold text-gray-900 focus:ring-2 focus:ring-[#007F00] transition-all"
                                        />
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">About Business</label>
                                        <textarea
                                            name="description"
                                            value={listing.description || ''}
                                            onChange={handleProfileChange}
                                            rows={6}
                                            placeholder="Describe your services, experience, and what makes your business unique..."
                                            className="w-full bg-gray-100 border-none rounded-2xl px-6 py-4 font-bold text-gray-900 focus:ring-2 focus:ring-[#007F00] transition-all"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Public Phone</label>
                                        <input
                                            name="phone"
                                            value={listing.phone || ''}
                                            onChange={handleProfileChange}
                                            placeholder="e.g. +353 1 234 5678"
                                            className="w-full bg-gray-100 border-none rounded-2xl px-6 py-4 font-bold text-gray-900 focus:ring-2 focus:ring-[#007F00] transition-all"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Business Address</label>
                                        <input
                                            name="address"
                                            value={listing.address || ''}
                                            onChange={handleProfileChange}
                                            placeholder="e.g. 13/14 Aungier Street, Dublin 2, Co. Dublin"
                                            className="w-full bg-gray-100 border-none rounded-2xl px-6 py-4 font-bold text-gray-900 focus:ring-2 focus:ring-[#007F00] transition-all"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Website URL</label>
                                        <input
                                            name="website"
                                            value={listing.website || ''}
                                            onChange={handleProfileChange}
                                            placeholder="e.g. https://www.yourbusiness.com"
                                            className="w-full bg-gray-100 border-none rounded-2xl px-6 py-4 font-bold text-gray-900 focus:ring-2 focus:ring-[#007F00] transition-all"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Logo URL</label>
                                        <input
                                            name="logo_url"
                                            value={listing.logo_url || ''}
                                            onChange={handleProfileChange}
                                            placeholder="e.g. https://your-logo-link.com/logo.png"
                                            className="w-full bg-gray-100 border-none rounded-2xl px-6 py-4 font-bold text-gray-900 focus:ring-2 focus:ring-[#007F00] transition-all"
                                        />
                                    </div>

                                    <div className="md:col-span-2">
                                        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6 block border-b border-gray-100 pb-2">Social Media Links</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                                                    <Facebook size={12} /> Facebook
                                                </label>
                                                <input
                                                    name="social_facebook"
                                                    value={listing.social_media?.facebook || ''}
                                                    onChange={handleProfileChange}
                                                    placeholder="https://facebook.com/..."
                                                    className="w-full bg-gray-100 border-none rounded-xl px-4 py-3 text-sm font-bold text-gray-900"
                                                />
                                            </div>
                                            <div>
                                                <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                                                    <Instagram size={12} /> Instagram
                                                </label>
                                                <input
                                                    name="social_instagram"
                                                    value={listing.social_media?.instagram || ''}
                                                    onChange={handleProfileChange}
                                                    placeholder="https://instagram.com/..."
                                                    className="w-full bg-gray-100 border-none rounded-xl px-4 py-3 text-sm font-bold text-gray-900"
                                                />
                                            </div>
                                            <div>
                                                <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                                                    <Linkedin size={12} /> LinkedIn
                                                </label>
                                                <input
                                                    name="social_linkedin"
                                                    value={listing.social_media?.linkedin || ''}
                                                    onChange={handleProfileChange}
                                                    placeholder="https://linkedin.com/company/..."
                                                    className="w-full bg-gray-100 border-none rounded-xl px-4 py-3 text-sm font-bold text-gray-900"
                                                />
                                            </div>
                                            <div>
                                                <label className="flex items-center gap-2 text-[10px) font-black text-gray-400 uppercase tracking-widest mb-2">
                                                    <Twitter size={12} /> Twitter / X
                                                </label>
                                                <input
                                                    name="social_twitter"
                                                    value={listing.social_media?.twitter || ''}
                                                    onChange={handleProfileChange}
                                                    placeholder="https://twitter.com/..."
                                                    className="w-full bg-gray-100 border-none rounded-xl px-4 py-3 text-sm font-bold text-gray-900"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-between items-center bg-[#007F00]/5 px-8 ps-10 py-4 rounded-2xl border border-[#007F00]/10">
                                    <div className="flex items-center gap-3 text-[#007F00] font-bold text-sm">
                                        <CheckCircle size={18} />
                                        Changes save automatically
                                    </div>
                                    {isSavingProfile && (
                                        <div className="flex items-center gap-2 text-[#007F00] text-sm font-bold">
                                            <Loader2 size={16} className="animate-spin" />
                                            Saving...
                                        </div>
                                    )}
                                </div>

                                {/* Map Preview */}
                                {listing.address && (
                                    <div className="pt-4">
                                        <h4 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                                            <MapPin size={16} /> Location Preview
                                        </h4>
                                        <div className="rounded-2xl overflow-hidden border border-gray-100">
                                            <iframe
                                                width="100%"
                                                height="250"
                                                style={{ border: 0 }}
                                                loading="lazy"
                                                src={`https://www.google.com/maps?q=${encodeURIComponent(listing.address + ', Ireland')}&output=embed`}
                                                allowFullScreen
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* 2. Service Categories */}
                        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="px-10 py-6 border-b border-gray-100 bg-gray-100/50">
                                <div className="flex items-center justify-between gap-4">
                                    <h3 className="font-black text-gray-900 uppercase tracking-widest text-sm flex items-center gap-2">
                                        <Tags size={16} /> Service Categories
                                    </h3>
                                    {isSavingCategories && (
                                        <div className="flex items-center gap-2 text-[#007F00] text-sm font-bold">
                                            <Loader2 size={14} className="animate-spin" />
                                            Saving...
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="p-10">
                                <div className="mb-8">
                                    <p className="text-gray-500 font-medium">Select the categories that best describe your services. These help customers find you in the catalogue.</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {allCategories.map(cat => (
                                        <button
                                            key={cat.id}
                                            type="button"
                                            onClick={() => toggleCategory(cat.id)}
                                            className={`p-5 rounded-2xl border-2 text-left font-bold transition-all ${selectedCategories.includes(cat.id)
                                                ? 'border-[#007F00] bg-[#007F00]/5 text-[#007F00]'
                                                : 'border-gray-100 bg-gray-100 text-gray-700 hover:border-gray-300'
                                                }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${selectedCategories.includes(cat.id) ? 'bg-[#007F00] border-[#007F00]' : 'border-gray-300'}`}>
                                                    {selectedCategories.includes(cat.id) && <CheckCircle size={14} className="text-white" />}
                                                </div>
                                                {cat.name}
                                            </div>
                                        </button>
                                    ))}
                                </div>

                                <div className="flex justify-between items-center bg-[#007F00]/5 px-8 ps-10 py-4 rounded-2xl border border-[#007F00]/10 mt-10">
                                    <div className="flex items-center gap-3 text-[#007F00] font-bold text-sm">
                                        <CheckCircle size={18} />
                                        Categories save automatically
                                    </div>
                                    <p className="text-sm text-gray-500 font-bold">
                                        {selectedCategories.length} categor{selectedCategories.length === 1 ? 'y' : 'ies'} selected
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* 3. Photo Gallery */}
                        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="px-10 py-6 border-b border-gray-100 bg-gray-100/50 flex items-center justify-between">
                                <h3 className="font-black text-gray-900 uppercase tracking-widest text-sm flex items-center gap-2">
                                    <ImageIcon size={16} /> Manage Gallery Photos
                                </h3>
                                {isSavingGallery && (
                                    <div className="flex items-center gap-2 text-[#007F00] text-sm font-bold">
                                        <Loader2 size={14} className="animate-spin" />
                                        Saving...
                                    </div>
                                )}
                            </div>
                            <div className="p-10">
                                <div className="mb-8">
                                    <p className="text-gray-500 font-medium">Add up to 3 high-quality photos for your profile carousel.</p>
                                </div>

                                <div className="space-y-6">
                                    {listingImages.map((img, index) => (
                                        <div key={index} className="flex gap-4 items-start border border-gray-100 p-6 rounded-2xl bg-gray-50/50">
                                            <div className="flex-grow space-y-4">
                                                <div>
                                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Upload Photo {index + 1}</label>
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={(e) => handleGalleryUpload(index, e)}
                                                        className="block w-full text-sm text-gray-500
                                                        file:mr-4 file:py-2 file:px-4
                                                        file:rounded-full file:border-0
                                                        file:text-sm file:font-semibold
                                                        file:bg-[#007F00]/10 file:text-[#007F00]
                                                        hover:file:bg-[#007F00]/20
                                                        transition-all"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Short Description</label>
                                                    <textarea
                                                        value={img.description}
                                                        onChange={(e) => handleGalleryDescriptionChange(index, e.target.value)}
                                                        placeholder="What's happening in this photo? (e.g. Recently completed solar panel installation in Dublin)"
                                                        rows={2}
                                                        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium text-gray-900 focus:ring-2 focus:ring-[#007F00] transition-all"
                                                    />
                                                </div>
                                            </div>
                                            {img.url ? (
                                                <div className="w-32 h-32 rounded-xl overflow-hidden border border-gray-200 bg-gray-100 flex-shrink-0 shadow-sm relative group">
                                                    <img src={img.url} alt={`Gallery ${index + 1}`} className="w-full h-full object-cover" />
                                                    <button
                                                        onClick={() => {
                                                            const newImages = [...listingImages];
                                                            newImages[index] = { url: '', description: '' };
                                                            setListingImages(newImages);
                                                            saveGalleryData(newImages);
                                                        }}
                                                        className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        <X size={14} />
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="w-32 h-32 rounded-xl border border-dashed border-gray-300 bg-white flex flex-col items-center justify-center flex-shrink-0 text-gray-400">
                                                    <ImageIcon size={24} className="mb-2 opacity-50" />
                                                    <span className="text-[10px] font-bold uppercase tracking-widest">No Image</span>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                <div className="flex items-center gap-3 text-[#007F00] font-bold text-sm bg-[#007F00]/5 px-8 ps-10 py-4 rounded-2xl border border-[#007F00]/10 mt-12">
                                    <CheckCircle size={18} />
                                    Gallery saves automatically
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default BusinessDashboard;
