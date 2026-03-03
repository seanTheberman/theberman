import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    MapPin, Mail, Phone, Globe, Loader2,
    CheckCircle2, Facebook, Instagram, X,
    Check
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
}

interface ListingLayoutProps {
    listing: CatalogueListing;
    enquiry: {
        name: string;
        email: string;
        phone: string;
        message: string;
    };
    setEnquiry: (enquiry: any) => void;
    onEnquirySubmit: (e: React.FormEvent) => void;
    isSubmitting: boolean;
}



const DEFAULT_HERO_IMAGE = "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2000";

const ListingLayout = ({ listing, enquiry, setEnquiry, onEnquirySubmit, isSubmitting }: ListingLayoutProps) => {
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
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

    return (
        <div className="font-sans text-gray-900 bg-white min-h-screen pb-20">
            <title>{displayName} | The Berman Catalogue</title>

            {/* Single Banner Hero */}
            <div className="relative h-[350px] md:h-[500px] w-full mb-12 bg-gray-900 border-b border-gray-100 shadow-sm">
                <img
                    src={listing.banner_url || DEFAULT_HERO_IMAGE}
                    className="w-full h-full object-cover opacity-80"
                    alt={`${displayName} banner cover`}
                />
            </div>

            <div className="container mx-auto px-6 max-w-7xl">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* Left Column */}
                    <div className="lg:col-span-8">
                        {/* Header Area */}
                        <div className="mb-10">
                            <div className="flex flex-wrap gap-2 mb-6">
                                {listing.categories?.map(cat => (
                                    <span key={cat.id} className="px-4 py-1.5 bg-[#E8F4FD] text-[#007EA7] text-xs font-medium rounded-full">
                                        {cat.name}
                                    </span>
                                ))}
                            </div>

                            <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-5 tracking-tight leading-tight">{displayName}</h1>

                            {/* Description Content */}
                            {listing.description && (
                                <div className="mb-6">
                                    <h2 className="text-xl md:text-2xl font-medium text-gray-600 leading-snug">
                                        {listing.description}
                                    </h2>
                                </div>
                            )}
                            {listing.long_description && (
                                <div className="text-gray-600 font-normal leading-relaxed text-[15px] whitespace-pre-wrap mb-10">
                                    {listing.long_description}
                                </div>
                            )}

                            {/* Addresses Content */}
                            <div className="bg-white border border-gray-100/80 rounded-2xl p-6 md:p-8 mb-10 shadow-[0_2px_20px_rgba(0,0,0,0.03)]">
                                <div className="flex items-start gap-4 md:gap-5">
                                    <div className="mt-0.5 bg-[#E8F4FD]/50 text-[#007EA7] p-2.5 rounded-xl flex-shrink-0">
                                        <MapPin size={22} className="stroke-[2]" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-[10px] font-black text-[#007EA7] uppercase tracking-[0.15em] mb-2 opacity-80">Primary Location</h3>
                                        <div className="text-base font-bold text-gray-800 leading-relaxed mb-3">
                                            {formatAddress(listing.address) || 'Address not provided'}
                                        </div>
                                        {listing.locations?.[0]?.name && (
                                            <div className="inline-flex items-center px-2.5 py-1 bg-gray-50 text-gray-500 rounded-md text-xs font-semibold border border-gray-100">
                                                {listing.locations[0].name}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {listing.additional_addresses && listing.additional_addresses.length > 0 && (
                                    <div className="mt-8 pt-8 border-t border-gray-100/60">
                                        <div className="flex items-center gap-2 mb-4">
                                            <div className="w-1.5 h-1.5 rounded-full bg-[#007EA7]"></div>
                                            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.15em]">Preferred Locations</h3>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                            {listing.additional_addresses.map((addr, idx) => {
                                                const county = addr.includes('|||') ? addr.split('|||')[1]?.trim() : addr.trim();
                                                if (!county) return null;
                                                return (
                                                    <Link
                                                        to={`/catalogue?county=${encodeURIComponent(county)}`}
                                                        key={idx}
                                                        className="flex items-center gap-3 p-4 bg-gray-50/50 border border-gray-100 rounded-2xl hover:border-[#007EA7]/50 hover:bg-[#E8F4FD]/20 hover:shadow-md transition-all duration-300 group"
                                                    >
                                                        <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-[#007EA7] border border-gray-100 group-hover:bg-[#007EA7] group-hover:text-white group-hover:border-[#007EA7] transition-all">
                                                            <MapPin size={16} />
                                                        </div>
                                                        <span className="text-sm font-bold text-gray-700 group-hover:text-[#007EA7]">{county}</span>
                                                    </Link>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                            {(listing.company_number || listing.vat_number || listing.registration_no) && (
                                <div className="mb-8 pt-4 border-t border-gray-100 flex flex-wrap gap-x-6 gap-y-2 text-xs text-gray-500">
                                    {listing.company_number && (
                                        <div className="flex items-center gap-1.5"><span className="font-semibold text-gray-700">Company No:</span> {listing.company_number}</div>
                                    )}
                                    {listing.vat_number && (
                                        <div className="flex items-center gap-1.5"><span className="font-semibold text-gray-700">VAT Reg:</span> {listing.vat_number}</div>
                                    )}
                                    {listing.registration_no && (
                                        <div className="flex items-center gap-1.5"><span className="font-semibold text-gray-700">BER Reg:</span> {listing.registration_no}</div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Additional Info Tab for overview */}
                        <div className="mb-8">
                            <div className="border-b border-gray-100 mb-6">
                                <h2 className="text-[#007EA7] font-bold text-[15px] inline-block border-b-2 border-[#007EA7] pb-3">Contact & Details</h2>
                            </div>
                        </div>

                        {/* Quick Contact Info specifically for Cills as per image */}
                        {listing.slug === 'cills-ie' && (
                            <div className="mb-8 border-t border-gray-100 pt-8">
                                <h3 className="text-xl font-bold text-[#333] mb-4">Contact Us Or Get a Quote</h3>
                                <p className="text-gray-600 mb-6">Contact Cills.ie for a fast, no-obligation quotation. Whether you need custom window cills, flashings, trims, capppings or full aluminium fabrication, our team will give you clear guidance and fair pricing based on your exact measurements.</p>
                            </div>
                        )}

                        {/* Contact Pills */}
                        <div className="flex flex-wrap gap-3 mb-8">
                            {listing.phone && (
                                <a href={`tel:${listing.phone}`} className="flex items-center gap-2 px-4 py-2 bg-[#F1F1F1] rounded-full text-xs font-medium text-gray-600 hover:bg-gray-200 transition-colors">
                                    <Phone size={14} />
                                    <span>{listing.phone}</span>
                                </a>
                            )}
                            {listing.email && (
                                <a href={`mailto:${listing.email}`} className="flex items-center gap-2 px-4 py-2 bg-[#F1F1F1] rounded-full text-xs font-medium text-gray-600 hover:bg-gray-200 transition-colors">
                                    <Mail size={14} />
                                    <span>{listing.email}</span>
                                </a>
                            )}
                            {listing.website && (
                                <a href={listing.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-[#F1F1F1] rounded-full text-xs font-medium text-gray-600 hover:bg-gray-200 transition-colors">
                                    <Globe size={14} />
                                    <span>{listing.website.replace('https://', '').replace('www.', '')}</span>
                                </a>
                            )}
                        </div>

                        {/* Social Buttons */}
                        {listing.social_media && (
                            <div className="flex flex-wrap gap-1 mb-16">
                                {listing.social_media.facebook && (
                                    <a href={listing.social_media.facebook} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-1.5 bg-[#3b5998] text-white text-xs font-medium rounded-md shadow-sm hover:opacity-90 transition-opacity">
                                        <Facebook size={14} />
                                        <span>Facebook</span>
                                    </a>
                                )}
                                {listing.social_media.instagram && (
                                    <a href={listing.social_media.instagram} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-1.5 bg-[#e4405f] text-white text-xs font-medium rounded-md shadow-sm hover:opacity-90 transition-opacity">
                                        <Instagram size={14} />
                                        <span>Instagram</span>
                                    </a>
                                )}
                                {listing.social_media.linkedin && (
                                    <a href={listing.social_media.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-1.5 bg-[#0077b5] text-white text-xs font-medium rounded-md shadow-sm hover:opacity-90 transition-opacity">
                                        <Globe size={14} />
                                        <span>LinkedIn</span>
                                    </a>
                                )}
                                {listing.social_media.twitter && (
                                    <a href={listing.social_media.twitter} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-1.5 bg-[#1da1f2] text-white text-xs font-medium rounded-md shadow-sm hover:opacity-90 transition-opacity">
                                        <Globe size={14} />
                                        <span>Twitter</span>
                                    </a>
                                )}
                            </div>
                        )}

                        {/* Features */}
                        <div>
                            <h2 className="text-xl font-bold text-[#333] mb-8">Features</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-4 gap-x-8">
                                {displayFeatures.map((feature) => (
                                    <div key={feature} className="flex items-center gap-2">
                                        <div className="bg-[#007EA7] p-0.5 rounded-sm">
                                            <Check size={14} className="text-white" />
                                        </div>
                                        <span className="text-sm font-medium text-gray-600">{feature}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Column (Sidebar) */}
                    <div className="lg:col-span-4">
                        <div className="sticky top-32 space-y-6">
                            {/* Verified Button */}
                            <div className="w-full bg-[#28a745] hover:bg-[#218838] text-white py-4 rounded-md flex items-center justify-center gap-2 shadow-sm transition-colors cursor-default">
                                <CheckCircle2 size={24} className="fill-white text-[#28a745]" />
                                <span className="text-lg font-medium">Verified Listing</span>
                            </div>

                            {/* Form Card */}
                            <div className="bg-[#F9F9F9] rounded-sm p-8 border border-gray-100 shadow-sm">
                                <div className="flex items-center gap-2 mb-6">
                                    <Mail size={20} className="text-gray-700" />
                                    <h3 className="text-xl font-medium text-[#333]">Message Directly</h3>
                                </div>

                                <form onSubmit={onEnquirySubmit} className="space-y-6">
                                    <div className="space-y-1.5">
                                        <label className="text-sm text-gray-500 font-normal">Your name</label>
                                        <input
                                            required
                                            type="text"
                                            value={enquiry.name}
                                            onChange={e => setEnquiry({ ...enquiry, name: e.target.value })}
                                            className="w-full px-4 py-2 bg-white border border-gray-200 rounded-sm focus:border-blue-500 outline-none transition-all"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-sm text-gray-500 font-normal">Your email</label>
                                        <input
                                            required
                                            type="email"
                                            value={enquiry.email}
                                            onChange={e => setEnquiry({ ...enquiry, email: e.target.value })}
                                            className="w-full px-4 py-2 bg-white border border-gray-200 rounded-sm focus:border-blue-500 outline-none transition-all"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-sm text-gray-500 font-normal">Mobile Number</label>
                                        <input
                                            type="tel"
                                            value={enquiry.phone}
                                            onChange={e => setEnquiry({ ...enquiry, phone: e.target.value })}
                                            className="w-full px-4 py-2 bg-white border border-gray-200 rounded-sm focus:border-blue-500 outline-none transition-all"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-sm text-gray-500 font-normal">Your message (optional)</label>
                                        <textarea
                                            rows={8}
                                            value={enquiry.message}
                                            onChange={e => setEnquiry({ ...enquiry, message: e.target.value })}
                                            className="w-full px-4 py-2 bg-white border border-gray-200 rounded-sm focus:border-blue-500 outline-none transition-all resize-none"
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full bg-[#1b6cb5] hover:bg-[#155a96] text-white py-3 rounded-full font-bold text-sm shadow-sm transition-all focus:ring-2 focus:ring-blue-100 disabled:opacity-70 flex items-center justify-center gap-2"
                                    >
                                        {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : null}
                                        Submit
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Works Gallery - Full Width Outside Main Context */}
            {listing.images && listing.images.length > 0 && (
                <div className="container mx-auto px-6 max-w-7xl mt-16 border-t border-gray-100 pt-16">
                    <div className="flex flex-col items-center justify-center text-center mb-10">
                        <h3 className="text-3xl font-black text-gray-900 tracking-tight mb-4">Our Work Gallery</h3>
                        <div className="w-20 h-1.5 bg-[#007EA7] rounded-full mx-auto" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {listing.images.sort((a, b) => a.display_order - b.display_order).map((img) => (
                            <div
                                key={img.id}
                                onClick={() => setSelectedImage(img.url)}
                                className="group relative rounded-2xl overflow-hidden shadow-sm aspect-[4/3] bg-gray-50 border border-gray-100 cursor-zoom-in"
                            >
                                <img
                                    src={img.url}
                                    alt={img.description || `Work sample ${img.display_order + 1}`}
                                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                                />
                                {img.description && (
                                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-6 pt-16 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                                        <p className="text-sm font-medium text-white line-clamp-2 leading-relaxed opacity-90">
                                            {img.description}
                                        </p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Lightbox Modal */}
            {selectedImage && (
                <div
                    className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 md:p-8"
                    onClick={() => setSelectedImage(null)}
                >
                    <button
                        className="absolute top-6 right-6 md:top-10 md:right-10 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors z-[10000]"
                        onClick={(e) => {
                            e.stopPropagation();
                            setSelectedImage(null);
                        }}
                    >
                        <X size={24} />
                    </button>

                    <img
                        src={selectedImage}
                        className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg shadow-2xl scale-100 animate-in fade-in zoom-in duration-300"
                        alt="Gallery HD Preview"
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            )}
        </div>
    );
};

export default ListingLayout;
