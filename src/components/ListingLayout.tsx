import { useState, useEffect } from 'react';
import {
    ArrowLeft, MapPin, Mail, Phone, Globe, Loader2,
    CheckCircle2, Facebook, Instagram,
    Check, ChevronLeft, ChevronRight
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
    images?: { id: string, url: string, display_order: number }[];
    features?: string[];
    social_media?: {
        facebook?: string;
        instagram?: string;
        linkedin?: string;
        twitter?: string;
    };
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

const HERO_SLIDES = [
    {
        title: "The New Way To Measure Aluminium Window Cills",
        subtitle: "Ireland's Only Digital Platform for Aluminium Fabrication",
        description: "Measure, Order, Deliver. Cills.ie provides engineered aluminium window cills, flashings & cappings on-site using your phone. Accuracy — zero errors, zero delays.",
        cta: "CREATE FREE ACCOUNT",
        bg: "bg-[#2A3B45]",
        image: "https://images.unsplash.com/photo-1590069230002-70cc3bc432bb?q=80&w=1200",
        type: "intro"
    },
    {
        title: "Ordering cills used to be complicated",
        subtitle: "Not anymore - Cills.ie makes it simple.",
        image: "https://images.unsplash.com/photo-1556740758-90de374c12ad?q=80&w=800",
        bg: "bg-[#E3E7E9]",
        type: "mockup"
    },
    {
        title: "Stop losing money on preventable mistakes",
        subtitle: "Download the CILL5 app today and start working with precision.",
        bg: "bg-[#C4CDD2]",
        type: "app",
        stores: true
    }
];

const DEFAULT_HERO_IMAGE = "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2000";

const ListingLayout = ({ listing, enquiry, setEnquiry, onEnquirySubmit, isSubmitting }: ListingLayoutProps) => {
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

    useEffect(() => {
        const slideCount = (listing?.images?.length || 0) > 0
            ? listing!.images!.length
            : (listing.slug === 'cills-ie' ? HERO_SLIDES.length : 0);

        if (slideCount > 1) {
            const timer = setInterval(() => {
                setCurrentSlide(prev => (prev + 1) % slideCount);
            }, 6000);
            return () => clearInterval(timer);
        }
    }, [listing]);

    return (
        <div className="font-sans text-gray-900 bg-white min-h-screen pb-20">
            <title>{displayName} | The Berman Catalogue</title>

            {/* Partner Hero Carousel */}
            <div className="relative h-[450px] md:h-[600px] w-full overflow-hidden mb-12 group">
                {/* Database Images Slides */}
                {listing.images && listing.images.length > 0 && listing.images.sort((a, b) => a.display_order - b.display_order).map((img, index) => (
                    <div
                        key={img.id}
                        className={`absolute inset-0 transition-opacity duration-1000 ${index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
                    >
                        <img
                            src={img.url}
                            className="w-full h-full object-cover"
                            alt={`${displayName} hero ${index + 1}`}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                    </div>
                ))}

                {/* Hardcoded Cills.ie Slides (Legacy Fallback) */}
                {(!listing.images || listing.images.length === 0) && listing.slug === 'cills-ie' && HERO_SLIDES.map((slide, index) => (
                    <div
                        key={index}
                        className={`absolute inset-0 transition-opacity duration-1000 flex items-center ${index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'} ${slide.bg}`}
                    >
                        {slide.type === 'intro' && (
                            <>
                                <div className="absolute inset-0">
                                    <img src={slide.image} className="w-full h-full object-cover opacity-40 mix-blend-overlay" alt="" />
                                    <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />
                                </div>
                                <div className="container mx-auto px-6 relative z-10 text-white max-w-7xl">
                                    <div className="max-w-2xl">
                                        <h2 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight leading-tight uppercase">
                                            {slide.title}
                                        </h2>
                                        <div className="bg-[#1b6cb5]/30 backdrop-blur-sm px-4 py-2 rounded-sm inline-block mb-6 border border-white/10">
                                            <p className="text-sm font-medium tracking-wide uppercase">{slide.subtitle}</p>
                                        </div>
                                        <p className="text-lg md:text-xl text-white/80 mb-8 font-light leading-relaxed">
                                            {slide.description}
                                        </p>
                                        <button className="flex items-center gap-3 bg-[#1b6cb5] hover:bg-[#155a96] text-white px-8 py-4 rounded-sm font-bold tracking-widest text-xs transition-all">
                                            {slide.cta}
                                            <ArrowLeft className="rotate-180" size={16} />
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}

                        {slide.type === 'mockup' && (
                            <div className="container mx-auto px-6 relative z-10 max-w-7xl h-full flex items-center justify-between gap-12">
                                <div className="max-w-lg mb-12">
                                    <h2 className="text-4xl md:text-6xl font-normal text-gray-400 mb-8 leading-tight">
                                        {slide.title}
                                    </h2>
                                    <div className="bg-white px-6 py-4 rounded-full shadow-lg inline-block">
                                        <p className="text-lg font-medium text-gray-800">{slide.subtitle}</p>
                                    </div>
                                </div>
                                <div className="hidden lg:block relative h-full w-1/2 overflow-hidden py-12">
                                    <div className="bg-white rounded-[2.5rem] shadow-2xl h-full w-[300px] mx-auto border-[8px] border-black/5 flex flex-col items-center justify-center p-8 text-center gap-6">
                                        <div className="text-4xl font-black text-[#007EA7]">C</div>
                                        <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Ireland's Only Digital Platform</p>
                                        <div className="w-full h-1 bg-gray-100 rounded-full" />
                                        <p className="text-[10px] text-gray-500">Measure, Order, Deliver. Accuracy on every site.</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {slide.type === 'app' && (
                            <div className="container mx-auto px-6 relative z-10 max-w-7xl text-center md:text-left">
                                <div className="flex flex-col md:flex-row items-center justify-between gap-12">
                                    <div className="flex-1">
                                        <h2 className="text-4xl md:text-6xl font-light text-white mb-6 leading-tight">
                                            {slide.title}
                                        </h2>
                                        <p className="text-xl text-white/70 mb-10">{slide.subtitle}</p>
                                        <div className="flex flex-wrap justify-center md:justify-start gap-4">
                                            <div className="flex items-center gap-3 bg-black text-white px-6 py-3 rounded-xl border border-white/20 hover:scale-105 transition-transform cursor-pointer">
                                                <div className="text-2xl"></div>
                                                <div className="text-left">
                                                    <p className="text-[8px] font-medium opacity-60">Download on the</p>
                                                    <p className="text-sm font-bold">App Store</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 bg-black text-white px-6 py-3 rounded-xl border border-white/20 hover:scale-105 transition-transform cursor-pointer">
                                                <div className="text-2xl text-green-500">▶</div>
                                                <div className="text-left">
                                                    <p className="text-[8px] font-medium opacity-60">GET IT ON</p>
                                                    <p className="text-sm font-bold">Google Play</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="hidden md:block w-1/3">
                                        <div className="text-[240px] font-black text-white/5 select-none text-center">C</div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                ))}

                {/* Navigation Dots */}
                {((listing.images && listing.images.length > 1) || (!listing.images?.length && listing.slug === 'cills-ie' && HERO_SLIDES.length > 1)) && (
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 z-20">
                        {Array.from({ length: (listing.images && listing.images.length > 0) ? listing.images.length : HERO_SLIDES.length }).map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setCurrentSlide(i)}
                                className={`h-2 rounded-full transition-all duration-300 ${i === currentSlide
                                    ? 'w-8 bg-white'
                                    : 'w-2 bg-white/40 hover:bg-white/60'
                                    }`}
                            />
                        ))}
                    </div>
                )}

                {/* Arrow Navigation */}
                {((listing.images && listing.images.length > 1) || (!listing.images?.length && listing.slug === 'cills-ie' && HERO_SLIDES.length > 1)) && (
                    <>
                        <button
                            onClick={() => setCurrentSlide(prev => (prev - 1 + ((listing.images && listing.images.length > 0) ? listing.images.length : HERO_SLIDES.length)) % ((listing.images && listing.images.length > 0) ? listing.images.length : HERO_SLIDES.length))}
                            className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/20 hover:bg-black/40 text-white backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100 z-20"
                        >
                            <ChevronLeft size={24} />
                        </button>
                        <button
                            onClick={() => setCurrentSlide(prev => (prev + 1) % ((listing.images && listing.images.length > 0) ? listing.images.length : HERO_SLIDES.length))}
                            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/20 hover:bg-black/40 text-white backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100 z-20"
                        >
                            <ChevronRight size={24} />
                        </button>
                    </>
                )}

                {/* Default Fallback Image */}
                {(!listing.images || listing.images.length === 0) && listing.slug !== 'cills-ie' && (
                    <div className="absolute inset-0 z-10">
                        <img
                            src={DEFAULT_HERO_IMAGE}
                            className="w-full h-full object-cover"
                            alt="The Berman Catalogue"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12 bg-gradient-to-t from-black/60 to-transparent">
                            <div className="container mx-auto max-w-7xl text-center md:text-left">
                                <h1 className="text-4xl md:text-6xl font-black text-white mb-2 shadow-sm drop-shadow-lg uppercase tracking-tight">{displayName}</h1>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="container mx-auto px-6 max-w-7xl">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* Left Column */}
                    <div className="lg:col-span-8">
                        {/* Header Area */}
                        <div className="mb-10">
                            <div className="flex flex-wrap gap-2 mb-4">
                                {listing.categories?.map(cat => (
                                    <span key={cat.id} className="px-4 py-1.5 bg-[#E8F4FD] text-[#007EA7] text-xs font-medium rounded-full">
                                        {cat.name}
                                    </span>
                                ))}
                            </div>
                            {/* Title moved to Hero for default layout, kept here for structure but maybe hidden if default? Keeping consistent.*/}
                            {/* If default hero is used, title is in hero. If custom images used, title is here. Refinement: keeping it simple for now, maybe duplicate title isn't bad if styled right or we hide this one when default is active. Let's hide this H1 if default hero is active to avoid duplication. */}
                            {listing.images && listing.images.length > 0 && (
                                <h1 className="text-4xl md:text-5xl font-bold text-[#333] mb-2">{displayName}</h1>
                            )}
                            {listing.slug === 'cills-ie' && (
                                <h1 className="text-4xl md:text-5xl font-bold text-[#333] mb-2">{displayName}</h1>
                            )}
                            <div className="flex items-center gap-1.5 text-gray-400">
                                <MapPin size={18} />
                                <span className="text-sm font-medium">{listing.locations?.[0]?.name || 'Co. Dublin'}</span>
                            </div>
                        </div>

                        {/* Tabs */}
                        <div className="mb-12">
                            <div className="flex gap-8 border-b border-gray-100">
                                <button className="pb-4 border-b-4 border-[#007EA7] text-[#007EA7] font-bold text-sm">Overview</button>
                            </div>
                        </div>

                        {/* Description Content */}
                        <div className="mb-12">
                            {listing.long_description ? (
                                <div className="space-y-6">
                                    <h2 className="text-2xl font-bold text-[#333] leading-snug">
                                        {listing.description}
                                    </h2>
                                    <div className="text-gray-600 font-normal leading-relaxed text-base whitespace-pre-wrap">
                                        {listing.long_description}
                                    </div>
                                </div>
                            ) : listing.description ? (
                                <div className="text-gray-600">
                                    <h2 className="text-2xl font-bold text-[#333] mb-4">{listing.description}</h2>
                                </div>
                            ) : null}
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
        </div>
    );
};

export default ListingLayout;
