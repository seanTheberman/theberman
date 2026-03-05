import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    MapPin, Mail, Phone, Globe, Loader2,
    Facebook, Instagram, X, Building2,
    Check, ChevronRight, ChevronLeft, Linkedin, Twitter,
    LayoutDashboard
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
    const [currentSlide, setCurrentSlide] = useState(0);
    const displayName = listing.company_name || listing.name;

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

    // Combine banner and gallery images for the slider
    const sliderImages = [
        listing.banner_url,
        ...(listing.images?.sort((a, b) => a.display_order - b.display_order).map(img => img.url) || [])
    ].filter(Boolean) as string[];

    const finalSliderImages = sliderImages.length > 0 ? sliderImages : [DEFAULT_HERO_IMAGE];

    const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % finalSliderImages.length);
    const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + finalSliderImages.length) % finalSliderImages.length);

    return (
        <div className="font-sans text-gray-900 bg-white min-h-screen pb-20">
            <title>{displayName} | The Berman Catalogue</title>

            {/* Slider Hero */}
            <div className="relative h-[350px] md:h-[550px] w-full bg-gray-900 overflow-hidden group">
                <div
                    className="flex transition-transform duration-700 ease-in-out h-full"
                    style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                >
                    {finalSliderImages.map((img, idx) => (
                        <div key={idx} className="min-w-full h-full relative">
                            <img
                                src={img}
                                className="w-full h-full object-cover"
                                alt={`${displayName} slide ${idx + 1}`}
                            />
                            <div className="absolute inset-0 bg-black/20" />
                        </div>
                    ))}
                </div>

                {/* Edit Button for Owner */}
                {isOwner && (
                    <Link
                        to="/dashboard/business"
                        className="absolute top-8 right-8 z-30 bg-white/90 backdrop-blur-md text-[#007EA7] px-6 py-3 rounded-full font-black text-[10px] uppercase tracking-[0.2em] flex items-center gap-2 shadow-2xl hover:bg-[#007EA7] hover:text-white transition-all transform hover:scale-105 border border-white/50"
                    >
                        <LayoutDashboard size={14} />
                        Manage Profile
                    </Link>
                )}

                {/* Slider Controls */}
                {finalSliderImages.length > 1 && (
                    <>
                        <button
                            onClick={prevSlide}
                            className="absolute left-6 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-all z-20 group"
                        >
                            <ChevronLeft size={32} className="group-hover:-translate-x-0.5 transition-transform" />
                        </button>
                        <button
                            onClick={nextSlide}
                            className="absolute right-6 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-all z-20 group"
                        >
                            <ChevronRight size={32} className="group-hover:translate-x-0.5 transition-transform" />
                        </button>
                    </>
                )}

                {/* Dots */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20">
                    {finalSliderImages.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => setCurrentSlide(idx)}
                            className={`w-2 h-2 rounded-full transition-all ${currentSlide === idx ? 'bg-[#9ACD32] w-6' : 'bg-white/50 hover:bg-white'}`}
                        />
                    ))}
                </div>
            </div>

            <div className="container mx-auto px-6 max-w-7xl pt-12 md:pt-16">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* Left Column */}
                    <div className="lg:col-span-8">
                        {/* Categories/Tags */}
                        <div className="flex flex-wrap gap-2 mb-6">
                            {listing.categories?.map(cat => (
                                <span key={cat.id} className="px-5 py-1.5 bg-[#E8F4FD] text-[#007EA7] text-[10px] font-black uppercase tracking-wider rounded-md">
                                    {cat.name}
                                </span>
                            ))}
                        </div>

                        {/* Title & Address */}
                        <div className="mb-6">
                            <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4 tracking-tight">{displayName}</h1>
                            <div className="flex items-center gap-2 text-gray-500 font-medium font-bold text-sm">
                                <MapPin size={18} className="text-[#007EA7]" />
                                <span>{formatAddress(listing.address) || 'Address not provided'}</span>
                            </div>
                        </div>

                        {/* Contact Info Row */}
                        {(listing.phone || listing.email || listing.website) && (
                            <div className="flex flex-wrap gap-3 mb-10">
                                <div className="inline-flex flex-wrap items-center bg-[#F5F5F5] rounded-full border border-gray-200 divide-x divide-gray-200 overflow-hidden">
                                    {listing.phone && (
                                        <a href={`tel:${listing.phone}`} className="flex items-center gap-2.5 px-6 py-3 hover:bg-gray-100 transition-colors">
                                            <Phone size={16} className="text-gray-600" />
                                            <span className="text-[14px] font-bold text-gray-700">{listing.phone}</span>
                                        </a>
                                    )}
                                    {listing.email && (
                                        <a href={`mailto:${listing.email}`} className="flex items-center gap-2.5 px-6 py-3 hover:bg-gray-100 transition-colors">
                                            <Mail size={16} className="text-gray-600" />
                                            <span className="text-[14px] font-bold text-gray-700">{listing.email}</span>
                                        </a>
                                    )}
                                    {listing.website && (
                                        <a href={listing.website.startsWith('http') ? listing.website : `https://${listing.website}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 px-6 py-3 hover:bg-gray-100 transition-colors">
                                            <Globe size={16} className="text-gray-600" />
                                            <span className="text-[14px] font-bold text-gray-700">{listing.website.replace(/^https?:\/\/(www\.)?/, '')}</span>
                                        </a>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Tabs */}
                        <div className="border-b border-gray-100 flex gap-8 mb-8">
                            <button
                                onClick={() => setActiveTab('overview')}
                                className={`pb-4 text-sm font-bold uppercase tracking-widest transition-all relative ${activeTab === 'overview' ? 'text-[#007EA7]' : 'text-gray-400 hover:text-gray-600'}`}
                            >
                                Overview
                                {activeTab === 'overview' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#007EA7]" />}
                            </button>
                            <button
                                onClick={() => setActiveTab('location')}
                                className={`pb-4 text-sm font-bold uppercase tracking-widest transition-all relative ${activeTab === 'location' ? 'text-[#007EA7]' : 'text-gray-400 hover:text-gray-600'}`}
                            >
                                Location
                                {activeTab === 'location' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#007EA7]" />}
                            </button>
                        </div>

                        {/* Tab Content */}
                        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 min-h-[300px]">
                            {activeTab === 'overview' ? (
                                <div className="space-y-12">
                                    <div className="prose prose-blue max-w-none">
                                        {listing.long_description ? (
                                            <div className="text-gray-600 leading-relaxed text-[16px] whitespace-pre-wrap">
                                                {listing.long_description}
                                            </div>
                                        ) : (
                                            <div className="text-gray-600 leading-relaxed text-[16px]">
                                                {listing.description}
                                            </div>
                                        )}
                                    </div>

                                    {/* Features section */}
                                    <div>
                                        <h2 className="text-2xl font-black text-gray-900 mb-8 uppercase tracking-tight">Features</h2>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-5 gap-x-8">
                                            {displayFeatures.map((feature) => (
                                                <div key={feature} className="flex items-center gap-3">
                                                    <div className="bg-[#007EA7] p-1 rounded-sm flex items-center justify-center shrink-0">
                                                        <Check size={12} className="text-white" strokeWidth={4} />
                                                    </div>
                                                    <span className="text-[14px] font-bold text-gray-700">{feature}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    <h3 className="text-2xl font-black text-gray-900 mb-6 uppercase tracking-tight">Preferred Locations</h3>
                                    <p className="text-gray-500 font-medium mb-8">We provide our energy services in the following counties throughout Ireland:</p>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {(listing.additional_addresses && listing.additional_addresses.length > 0) ? (
                                            listing.additional_addresses.map((addr, idx) => {
                                                const county = addr.includes('|||') ? addr.split('|||')[1]?.trim() : addr.trim();
                                                if (!county) return null;
                                                return (
                                                    <div
                                                        key={idx}
                                                        className="flex items-center gap-3 p-4 bg-gray-50 border border-gray-100 rounded-2xl hover:border-[#007EA7]/30 hover:bg-white transition-all group"
                                                    >
                                                        <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-[#007EA7] border border-gray-100 group-hover:bg-[#007EA7] group-hover:text-white transition-all shadow-sm">
                                                            <MapPin size={16} />
                                                        </div>
                                                        <span className="text-sm font-black text-gray-700 uppercase tracking-tight">{county}</span>
                                                    </div>
                                                );
                                            })
                                        ) : (
                                            <div className="col-span-full py-12 text-center bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                                                <MapPin size={32} className="mx-auto text-gray-300 mb-3" />
                                                <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">No specific locations listed</p>
                                            </div>
                                        )}
                                    </div>
                                    <div className="mt-8 p-8 bg-[#E8F4FD]/30 rounded-3xl flex items-start gap-4 border border-[#007EA7]/10">
                                        <div className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 text-[#007EA7]">
                                            <Building2 size={24} />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-1">Business Headquarters</h4>
                                            <p className="text-gray-600 font-bold">{formatAddress(listing.address)}</p>
                                        </div>
                                    </div>
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

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {listing.images.sort((a, b) => a.display_order - b.display_order).map((img) => (
                                            <div
                                                key={img.id}
                                                onClick={() => setSelectedImage(img.url)}
                                                className="group relative rounded-2xl overflow-hidden shadow-sm aspect-[4/3] bg-gray-50 border border-gray-100 cursor-zoom-in transition-all hover:shadow-xl hover:-translate-y-1"
                                            >
                                                <img
                                                    src={img.url}
                                                    alt={img.description || `Work sample ${img.display_order + 1}`}
                                                    className="w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-110"
                                                />
                                                {img.description && (
                                                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-6 pt-16 opacity-0 group-hover:opacity-100 transition-all duration-500">
                                                        <p className="text-xs font-bold text-white leading-relaxed line-clamp-2">
                                                            {img.description}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Social Buttons */}
                            <div className="flex flex-wrap gap-2 pt-8 border-t border-gray-100">
                                {listing.social_media?.facebook && (
                                    <a href={listing.social_media.facebook} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-6 py-2.5 bg-[#3b5998] text-white text-[10px] font-black uppercase tracking-widest rounded-lg transition-all hover:scale-105 active:scale-95 shadow-sm">
                                        <Facebook size={14} />
                                        <span>Facebook</span>
                                    </a>
                                )}
                                {listing.social_media?.instagram && (
                                    <a href={listing.social_media.instagram} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-6 py-2.5 bg-[#e4405f] text-white text-[10px] font-black uppercase tracking-widest rounded-lg transition-all hover:scale-105 active:scale-95 shadow-sm">
                                        <Instagram size={14} />
                                        <span>Instagram</span>
                                    </a>
                                )}
                                {listing.social_media?.linkedin && (
                                    <a href={listing.social_media.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-6 py-2.5 bg-[#0077b5] text-white text-[10px] font-black uppercase tracking-widest rounded-lg transition-all hover:scale-105 active:scale-95 shadow-sm">
                                        <Linkedin size={14} />
                                        <span>LinkedIn</span>
                                    </a>
                                )}
                                {listing.social_media?.twitter && (
                                    <a href={listing.social_media.twitter} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-6 py-2.5 bg-[#1da1f2] text-white text-[10px] font-black uppercase tracking-widest rounded-lg transition-all hover:scale-105 active:scale-95 shadow-sm">
                                        <Twitter size={14} />
                                        <span>Twitter</span>
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column (Sidebar) */}
                    <div className="lg:col-span-4">
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
                </div>
            </div>
            {/* Main Location Map at the very end */}
            {listing.address && (
                <div className="container mx-auto px-6 max-w-7xl mt-24 mb-12">
                    <div className="flex flex-col items-center justify-center text-center mb-12">
                        <span className="text-[10px] font-black text-[#007EA7] uppercase tracking-[0.3em] mb-4">Location</span>
                        <h3 className="text-4xl font-black text-gray-900 tracking-tight mb-4 uppercase">Find Us Here</h3>
                        <div className="w-16 h-1.5 bg-[#007EA7] rounded-full" />
                    </div>

                    <div className="rounded-[40px] overflow-hidden border border-gray-100 shadow-2xl h-[500px] relative group">
                        <iframe
                            width="100%"
                            height="100%"
                            style={{ border: 0 }}
                            loading="lazy"
                            src={`https://www.google.com/maps?q=${encodeURIComponent(listing.address + ', Ireland')}&output=embed`}
                            allowFullScreen
                            className="grayscale-[0.2] contrast-[1.1]"
                        />
                        <div className="absolute inset-0 pointer-events-none border-[12px] border-white/10 rounded-[40px]" />
                    </div>
                </div>
            )}

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
