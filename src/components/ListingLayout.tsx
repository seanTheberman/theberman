import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
    MapPin, Mail, Phone, Globe, Loader2,
    Facebook, Instagram, X,
    Check, ChevronRight, ChevronLeft, Linkedin, Twitter, Youtube,
    MessageCircle, LayoutDashboard
} from 'lucide-react';

export interface Category {
    id: string;
    name: string;
}

export interface Location {
    id: string;
    name: string;
}

export interface CatalogueListing {
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
    categories?: Category[];
    locations?: Location[];
    images?: { id: string, url: string, description?: string, display_order: number }[];
    features?: string[];
    social_media?: {
        facebook?: string;
        instagram?: string;
        linkedin?: string;
        twitter?: string;
        whatsapp?: string;
        youtube?: string;
        snapchat?: string;
        tiktok?: string;
    };
    banner_url?: string;
    address?: string;
    additional_addresses?: string[];
    company_number?: string;
    vat_number?: string;
    registration_no?: string;
    owner_id?: string;
}

export interface EnquiryData {
    name: string;
    email: string;
    phone: string;
    message: string;
}

interface ListingLayoutProps {
    listing: CatalogueListing;
    enquiry: EnquiryData;
    setEnquiry: (enquiry: EnquiryData) => void;
    onEnquirySubmit: (e: React.FormEvent) => void;
    isSubmitting: boolean;
    isOwner?: boolean;
}



const DEFAULT_HERO_IMAGE = "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2000";

const ListingLayout = ({ listing, enquiry, setEnquiry, onEnquirySubmit, isSubmitting, isOwner = false }: ListingLayoutProps) => {
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'overview' | 'location'>('overview');

    const [heroSlide, setHeroSlide] = useState(0);
    const galleryScrollRef = useRef<HTMLDivElement>(null);
    const displayName = listing.company_name || listing.name;

    const scrollGallery = (dir: 'left' | 'right') => {
        if (galleryScrollRef.current) {
            galleryScrollRef.current.scrollBy({ left: dir === 'left' ? -320 : 320, behavior: 'smooth' });
        }
    };

    const dummyFeatures = [
        "Professional Service",
        "Expert Team",
        "Quality Guaranteed",
        "Dublin Based",
        "Verified Partner"
    ];

    const displayFeatures = (listing.features && listing.features.length > 0)
        ? listing.features
        : (listing.categories && listing.categories.length > 0)
            ? listing.categories.map(c => c.name)
            : dummyFeatures;

    const formatAddress = (addressStr?: string) => {
        if (!addressStr) return '';
        const cleanAddressStr = addressStr.includes('|||')
            ? addressStr.replace('|||', ', ')
            : addressStr;
        const parts = cleanAddressStr.split(',').map(s => s.trim()).filter(Boolean);
        return [...new Set(parts)].join(', ');
    };

    const galleryImages = listing.images?.sort((a, b) => a.display_order - b.display_order) || [];
    const heroImages = galleryImages.length > 0 ? galleryImages.map(i => i.url) : listing.logo_url ? [listing.logo_url] : [DEFAULT_HERO_IMAGE];

    return (
        <div className="font-sans text-gray-900 bg-white min-h-screen pb-20">
            <title>{displayName} | The Berman Catalogue</title>

            {/* Hero Banner — mobile: 1 image slider | desktop: up to 4 side-by-side */}
            {(() => {
                const DESKTOP_VISIBLE = 4;
                const mobileMax = heroImages.length - 1;
                const desktopMax = Math.max(0, heroImages.length - DESKTOP_VISIBLE);
                const canPrev = heroSlide > 0;
                const canNext = heroSlide < Math.max(mobileMax, desktopMax);
                return (
                    <>
                        {/* Mobile banner — full-width square, 1 image at a time */}
                        <div className="relative block md:hidden w-full aspect-square bg-gray-900 overflow-hidden">
                            <img
                                src={heroImages[Math.min(heroSlide, mobileMax)]}
                                alt={`${displayName} ${heroSlide + 1}`}
                                className="w-full h-full object-cover"
                            />
                            {canPrev && (
                                <button onClick={() => setHeroSlide(s => s - 1)} className="absolute left-3 top-1/2 -translate-y-1/2 z-10 bg-black/50 text-white rounded-full p-2">
                                    <ChevronLeft size={18} />
                                </button>
                            )}
                            {heroSlide < mobileMax && (
                                <button onClick={() => setHeroSlide(s => s + 1)} className="absolute right-3 top-1/2 -translate-y-1/2 z-10 bg-black/50 text-white rounded-full p-2">
                                    <ChevronRight size={18} />
                                </button>
                            )}
                            {heroImages.length > 1 && (
                                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                                    {heroImages.map((_, i) => (
                                        <button key={i} onClick={() => setHeroSlide(i)}
                                            className={`h-1.5 rounded-full transition-all ${i === heroSlide ? 'bg-white w-4' : 'bg-white/50 w-1.5'}`} />
                                    ))}
                                </div>
                            )}
                            {isOwner && (
                                <Link to="/dashboard/business" className="absolute top-4 right-4 z-10 bg-white/90 text-[#007EA7] px-3 py-1.5 rounded-full font-black text-[10px] uppercase tracking-widest flex items-center gap-1.5 shadow-lg">
                                    <LayoutDashboard size={12} />Manage Profile
                                </Link>
                            )}
                        </div>

                        {/* Desktop banner — multi-image strip, 4 visible, slider when >4 */}
                        <div className="relative hidden md:block w-full bg-gray-900 overflow-hidden h-[340px] lg:h-[420px]">
                            <div
                                className="flex h-full transition-transform duration-500 ease-in-out"
                                style={{
                                    transform: heroImages.length > DESKTOP_VISIBLE
                                        ? `translateX(-${Math.min(heroSlide, desktopMax) * (100 / DESKTOP_VISIBLE)}%)`
                                        : 'translateX(0)',
                                    width: heroImages.length > DESKTOP_VISIBLE
                                        ? `${heroImages.length / DESKTOP_VISIBLE * 100}%`
                                        : '100%'
                                }}
                            >
                                {heroImages.map((img, idx) => (
                                    <div
                                        key={idx}
                                        className="relative h-full overflow-hidden border-r border-white/10 last:border-0"
                                        style={{ width: `${100 / heroImages.length}%` }}
                                    >
                                        <img src={img} alt={`${displayName} ${idx + 1}`} className="w-full h-full object-cover" />
                                    </div>
                                ))}
                            </div>
                            {canPrev && (
                                <button onClick={() => setHeroSlide(s => s - 1)} className="absolute left-3 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-all">
                                    <ChevronLeft size={20} />
                                </button>
                            )}
                            {heroSlide < desktopMax && (
                                <button onClick={() => setHeroSlide(s => s + 1)} className="absolute right-3 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-all">
                                    <ChevronRight size={20} />
                                </button>
                            )}
                            {isOwner && (
                                <Link to="/dashboard/business" className="absolute top-4 right-4 z-10 bg-white/90 backdrop-blur-sm text-[#007EA7] px-3 py-1.5 rounded-full font-black text-[10px] uppercase tracking-widest flex items-center gap-1.5 shadow-lg hover:bg-[#007EA7] hover:text-white transition-all">
                                    <LayoutDashboard size={12} />Manage Profile
                                </Link>
                            )}
                        </div>
                    </>
                );
            })()}

            <div className="container mx-auto px-4 sm:px-8 md:px-26 max-w-7xl pt-10 md:pt-14">

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* Left Column */}
                    <div className="order-1 lg:col-span-8 lg:row-start-1 lg:col-start-1">

                        {/* Company Header */}
                        <div className="mb-6">
                            {listing.categories && listing.categories.length > 0 && (
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {listing.categories.map(c => (
                                        <span key={c.id} className="text-[10px] font-bold uppercase tracking-widest border border-[#007EA7]/30 text-[#007EA7] px-3 py-1 rounded-full">{c.name}</span>
                                    ))}
                                </div>
                            )}
                            <h1 className="text-2xl md:text-4xl font-black text-gray-900 tracking-tight leading-tight mb-2">{displayName}</h1>
                            {(listing.address || (listing.locations && listing.locations.length > 0)) && (
                                <div className="flex items-center gap-1.5 text-gray-500 text-[14px]">
                                    <MapPin size={14} className="text-gray-400 shrink-0" />
                                    <span>{listing.address || listing.locations?.map(l => l.name).join(', ')}</span>
                                </div>
                            )}
                        </div>

                        {/* Tabs */}
                        <div className="border-b border-gray-100 flex gap-8 mb-8">
                            <button
                                onClick={() => setActiveTab('overview')}
                                className={`pb-4 text-sm font-bold uppercase tracking-widest transition-all relative ${activeTab === 'overview' ? 'text-[#007EA7]' : 'text-gray-400 hover:text-gray-600'}`}
                            >
                                Overview
                                {activeTab === 'overview' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#007EA7]" />}
                            </button>
                            {listing.address && (
                                <button
                                    onClick={() => document.getElementById('location-section')?.scrollIntoView({ behavior: 'smooth' })}
                                    className="pb-4 text-sm font-bold uppercase tracking-widest transition-all relative text-gray-400 hover:text-gray-600"
                                >
                                    Location
                                </button>
                            )}
                        </div>

                        {/* Tab Content */}
                        <div>
                            {activeTab === 'overview' ? (
                                <div className="space-y-8">
                                    {/* Description */}
                                    <div className="text-gray-600 leading-relaxed text-[15px]">
                                        {listing.long_description || listing.description}
                                    </div>

                                    {/* Contact bar */}
                                    {(listing.phone || listing.email || listing.website) && (
                                        <div className="flex flex-wrap items-center gap-2">
                                            {listing.phone && (
                                                <a href={`tel:${listing.phone}`} className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-full text-gray-600 hover:bg-gray-50 transition-colors text-[11px] font-semibold">
                                                    <Phone size={11} className="text-gray-400" />{listing.phone}
                                                </a>
                                            )}
                                            {listing.email && (
                                                <a href={`mailto:${listing.email}`} className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-full text-gray-600 hover:bg-gray-50 transition-colors text-[11px] font-semibold">
                                                    <Mail size={11} className="text-gray-400" />{listing.email}
                                                </a>
                                            )}
                                            {listing.website && (
                                                <a href={listing.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-full text-gray-600 hover:bg-gray-50 transition-colors text-[11px] font-semibold">
                                                    <Globe size={11} className="text-gray-400" />{listing.website.replace(/^https?:\/\//, '')}
                                                </a>
                                            )}
                                        </div>
                                    )}

                                    {/* Social Media */}
                                    {listing.social_media && Object.values(listing.social_media).some(Boolean) && (
                                        <div className="flex flex-wrap gap-2">
                                            {listing.social_media.facebook && (
                                                <a href={listing.social_media.facebook} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-4 py-2 bg-[#1877F2] text-white text-[11px] font-bold rounded-full transition-all hover:opacity-90 shadow-sm">
                                                    <Facebook size={13} /><span>Facebook</span>
                                                </a>
                                            )}
                                            {listing.social_media.instagram && (
                                                <a href={listing.social_media.instagram} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-br from-[#f09433] via-[#e6683c] via-[#dc2743] via-[#cc2366] to-[#bc1888] text-white text-[11px] font-bold rounded-full transition-all hover:opacity-90 shadow-sm">
                                                    <Instagram size={13} /><span>Instagram</span>
                                                </a>
                                            )}
                                            {listing.social_media.linkedin && (
                                                <a href={listing.social_media.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-4 py-2 bg-[#0A66C2] text-white text-[11px] font-bold rounded-full transition-all hover:opacity-90 shadow-sm">
                                                    <Linkedin size={13} /><span>LinkedIn</span>
                                                </a>
                                            )}
                                            {listing.social_media.twitter && (
                                                <a href={listing.social_media.twitter} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-4 py-2 bg-black text-white text-[11px] font-bold rounded-full transition-all hover:opacity-90 shadow-sm">
                                                    <Twitter size={13} /><span>X / Twitter</span>
                                                </a>
                                            )}
                                            {listing.social_media.whatsapp && (
                                                <a href={`https://wa.me/${listing.social_media.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-4 py-2 bg-[#25D366] text-white text-[11px] font-bold rounded-full transition-all hover:opacity-90 shadow-sm">
                                                    <MessageCircle size={13} /><span>WhatsApp</span>
                                                </a>
                                            )}
                                            {listing.social_media.youtube && (
                                                <a href={listing.social_media.youtube} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-4 py-2 bg-[#FF0000] text-white text-[11px] font-bold rounded-full transition-all hover:opacity-90 shadow-sm">
                                                    <Youtube size={13} /><span>YouTube</span>
                                                </a>
                                            )}
                                            {listing.social_media.snapchat && (
                                                <a href={listing.social_media.snapchat} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-4 py-2 bg-[#FFFC00] text-black text-[11px] font-bold rounded-full transition-all hover:opacity-90 shadow-sm">
                                                    <span className="font-black text-[12px]">👻</span><span>Snapchat</span>
                                                </a>
                                            )}
                                            {listing.social_media.tiktok && (
                                                <a href={listing.social_media.tiktok} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-4 py-2 bg-black text-white text-[11px] font-bold rounded-full transition-all hover:opacity-90 shadow-sm">
                                                    <span className="font-black">♪</span><span>TikTok</span>
                                                </a>
                                            )}
                                        </div>
                                    )}

                                    {/* Features */}
                                    {displayFeatures.length > 0 && (
                                        <div>
                                            <h2 className="text-xl font-black text-gray-900 mb-5 uppercase tracking-tight">Features</h2>
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-4 gap-x-6">
                                                {displayFeatures.map((feature) => (
                                                    <div key={feature} className="flex items-center gap-3">
                                                        <div className="bg-[#007EA7] p-1 rounded-sm flex items-center justify-center shrink-0">
                                                            <Check size={12} className="text-white" strokeWidth={4} />
                                                        </div>
                                                        <span className="text-[14px] font-semibold text-gray-700">{feature}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">Location</h3>
                                    {listing.address && (
                                        <div className="rounded-2xl overflow-hidden border border-gray-100 shadow-sm h-[400px]">
                                            <iframe
                                                width="100%" height="100%"
                                                style={{ border: 0 }}
                                                loading="lazy"
                                                src={`https://www.google.com/maps?q=${encodeURIComponent(listing.address + ', Ireland')}&output=embed`}
                                                allowFullScreen
                                            />
                                        </div>
                                    )}
                                    {listing.additional_addresses && listing.additional_addresses.length > 0 && (
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
                                            {listing.additional_addresses.map((addr, idx) => {
                                                const county = addr.includes('|||') ? addr.split('|||')[1]?.trim() : addr.trim();
                                                if (!county) return null;
                                                return (
                                                    <div key={idx} className="flex items-center gap-2 p-3 bg-gray-50 border border-gray-100 rounded-xl">
                                                        <MapPin size={13} className="text-[#007EA7] shrink-0" />
                                                        <span className="text-sm font-semibold text-gray-700">{county}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Global Content (Visible regardless of tab) */}
                        <div className="mt-16 space-y-16">
                            {/* Works Gallery */}
                            {listing.images && listing.images.length > 0 && (
                                <div className="pt-12 border-t border-gray-100">
                                    <div className="flex flex-col mb-10">
                                        <span className="text-[10px] font-black text-[#007EA7] uppercase tracking-[0.3em] mb-2 text-left">Portfolio</span>
                                        <h3 className="text-3xl font-black text-gray-900 tracking-tight">Our Work Gallery</h3>
                                        <div className="w-16 h-1.5 bg-[#007EA7] rounded-full mt-4" />
                                    </div>

                                    <div className="relative">
                                        <button onClick={() => scrollGallery('left')} className="hidden md:flex absolute -left-5 top-1/2 -translate-y-1/2 z-10 bg-white border border-gray-200 shadow-md text-gray-600 hover:text-[#007EA7] hover:border-[#007EA7] rounded-full p-2 transition-all">
                                            <ChevronLeft size={18} />
                                        </button>
                                        <button onClick={() => scrollGallery('right')} className="hidden md:flex absolute -right-5 top-1/2 -translate-y-1/2 z-10 bg-white border border-gray-200 shadow-md text-gray-600 hover:text-[#007EA7] hover:border-[#007EA7] rounded-full p-2 transition-all">
                                            <ChevronRight size={18} />
                                        </button>
                                    <div ref={galleryScrollRef} className="flex gap-4 overflow-x-auto pb-2 -mx-2 px-2 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                                        {listing.images.sort((a, b) => a.display_order - b.display_order).map((img) => (
                                            <div
                                                key={img.id}
                                                onClick={() => setSelectedImage(img.url)}
                                                className="group relative rounded-2xl overflow-hidden shadow-sm flex-shrink-0 w-72 h-56 bg-gray-50 border border-gray-100 cursor-zoom-in transition-all hover:shadow-xl snap-start"
                                            >
                                                <img
                                                    src={img.url}
                                                    alt={img.description || `Work sample ${img.display_order + 1}`}
                                                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                                                />
                                                {img.description && (
                                                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4 pt-10 opacity-0 group-hover:opacity-100 transition-all duration-300">
                                                        <p className="text-xs font-bold text-white leading-relaxed line-clamp-2">
                                                            {img.description}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                    </div>
                                </div>
                            )}

                        </div>
                    </div>

                    {/* Right Column (Sidebar) */}
                    <div className="order-3 lg:col-span-4 lg:row-start-1 lg:col-start-9">
                        <div className="sticky top-28 space-y-6">

                            {/* Verified Button - Matches Screenshot */}
                            <div className="w-full bg-[#1db954] text-white py-5 rounded-lg flex items-center justify-center gap-3 shadow-lg shadow-green-500/20 group">
                                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center shrink-0">
                                    <Check size={20} className="text-white" strokeWidth={3} />
                                </div>
                                <span className="text-xl font-bold tracking-tight">Verified Listing</span>
                            </div>

                            {/* Form Card */}
                            <div className="bg-[#f8f9fa] rounded-2xl p-8 border border-gray-100 shadow-sm relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                                    <Mail size={120} />
                                </div>

                                <div className="flex items-center gap-3 mb-8 relative z-10">
                                    <div className="w-10 h-10 bg-[#007EA7]/10 text-[#007EA7] rounded-xl flex items-center justify-center">
                                        <Mail size={20} />
                                    </div>
                                    <h3 className="text-2xl font-black text-gray-900 tracking-tight">Message Directly</h3>
                                </div>

                                <form onSubmit={onEnquirySubmit} className="space-y-5 relative z-10">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Your name</label>
                                        <input
                                            required
                                            type="text"
                                            placeholder="Enter your full name"
                                            value={enquiry.name}
                                            onChange={e => setEnquiry({ ...enquiry, name: e.target.value })}
                                            className="w-full px-6 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#007EA7]/20 focus:border-[#007EA7] outline-none transition-all font-medium text-gray-900"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Your email</label>
                                        <input
                                            required
                                            type="email"
                                            placeholder="Enter your email address"
                                            value={enquiry.email}
                                            onChange={e => setEnquiry({ ...enquiry, email: e.target.value })}
                                            className="w-full px-6 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#007EA7]/20 focus:border-[#007EA7] outline-none transition-all font-medium text-gray-900"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Mobile Number</label>
                                        <input
                                            type="tel"
                                            placeholder="Enter your phone number"
                                            value={enquiry.phone}
                                            onChange={e => setEnquiry({ ...enquiry, phone: e.target.value })}
                                            className="w-full px-6 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#007EA7]/20 focus:border-[#007EA7] outline-none transition-all font-medium text-gray-900"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Your message (optional)</label>
                                        <textarea
                                            rows={6}
                                            placeholder="Tell them what you're looking for..."
                                            value={enquiry.message}
                                            onChange={e => setEnquiry({ ...enquiry, message: e.target.value })}
                                            className="w-full px-6 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#007EA7]/20 focus:border-[#007EA7] outline-none transition-all font-medium text-gray-900 resize-none"
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full bg-[#1b6cb5] hover:bg-[#155a96] text-white py-4 rounded-xl font-black text-sm uppercase tracking-widest shadow-lg shadow-blue-500/20 transition-all hover:-translate-y-1 active:scale-95 disabled:opacity-70 flex items-center justify-center gap-3 mt-4"
                                    >
                                        {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <Mail size={18} />}
                                        Submit Request
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                    {/* Location Section — order-2 on mobile (above form), row-2 full width on desktop */}
                    {listing.address && (
                        <div
                            id="location-section"
                            className="order-2 lg:col-span-12 lg:row-start-2 lg:col-start-1"
                            style={{ scrollMarginTop: '6rem' }}
                        >
                            <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight mb-5">Location</h3>
                            <div className="rounded-2xl overflow-hidden border border-gray-100 shadow-sm h-[260px] md:h-[420px]">
                                <iframe
                                    width="100%" height="100%"
                                    style={{ border: 0 }}
                                    loading="lazy"
                                    src={`https://www.google.com/maps?q=${encodeURIComponent(listing.address + ', Ireland')}&output=embed`}
                                    allowFullScreen
                                />
                            </div>
                            {listing.additional_addresses && listing.additional_addresses.length > 0 && (
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mt-4">
                                    {listing.additional_addresses.map((addr, idx) => {
                                        const county = addr.includes('|||') ? addr.split('|||')[1]?.trim() : addr.trim();
                                        if (!county) return null;
                                        return (
                                            <div key={idx} className="flex items-center gap-2 p-3 bg-gray-50 border border-gray-100 rounded-xl">
                                                <MapPin size={13} className="text-[#007EA7] shrink-0" />
                                                <span className="text-sm font-semibold text-gray-700">{county}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Lightbox Modal */}
            {selectedImage && (
                <div
                    className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-md flex items-center justify-center p-4 md:p-8"
                    onClick={() => setSelectedImage(null)}
                >
                    <button
                        className="absolute top-6 right-6 md:top-10 md:right-10 w-14 h-14 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-all z-[10000] border border-white/20"
                        onClick={(e) => {
                            e.stopPropagation();
                            setSelectedImage(null);
                        }}
                    >
                        <X size={28} />
                    </button>

                    <img
                        src={selectedImage}
                        className="max-w-full max-h-full object-contain rounded-xl shadow-2xl scale-100 animate-in fade-in zoom-in duration-500"
                        alt="Gallery HD Preview"
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            )}
        </div>
    );
};

export default ListingLayout;
