
import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { useNavigate, Link } from 'react-router-dom';
import { Loader2, Building2, CheckCircle, ArrowRight, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { geocodeAddress, COUNTY_COORDINATES } from '../lib/geocoding';

interface Category {
    id: string;
    name: string;
}

interface Location {
    id: string;
    name: string;
    slug: string;
    parent_id: string | null;
}

const IRISH_COUNTIES = [
    'Carlow', 'Cavan', 'Clare', 'Cork', 'Donegal', 'Dublin', 'Galway',
    'Kerry', 'Kildare', 'Kilkenny', 'Laois', 'Leitrim', 'Limerick',
    'Longford', 'Louth', 'Mayo', 'Meath', 'Monaghan', 'Offaly',
    'Roscommon', 'Sligo', 'Tipperary', 'Waterford', 'Westmeath',
    'Wexford', 'Wicklow'
];

const BusinessOnboarding = () => {
    const { user, profile } = useAuth();
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);
    const [locations, setLocations] = useState<Location[]>([]);

    // Form state
    const [companyName, setCompanyName] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [businessAddress, setBusinessAddress] = useState('');
    const [county, setCounty] = useState('');
    const [website, setWebsite] = useState('');
    const [description, setDescription] = useState('');
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [facebook, setFacebook] = useState('');
    const [instagram, setInstagram] = useState('');
    const [linkedin, setLinkedin] = useState('');
    const [twitter, setTwitter] = useState('');

    useEffect(() => {
        if (profile?.full_name) {
            setCompanyName(profile.full_name);
        }
        if (user?.email) {
            setEmail(user.email);
        }
        fetchCategories();
        fetchLocations();
    }, [profile, user]);

    const fetchCategories = async () => {
        const { data } = await supabase
            .from('catalogue_categories')
            .select('id, name')
            .order('name');
        if (data) setCategories(data);
    };

    const fetchLocations = async () => {
        const { data } = await supabase
            .from('catalogue_locations')
            .select('id, name, slug, parent_id')
            .order('name');
        if (data) setLocations(data);
    };

    const toggleCategory = (categoryId: string) => {
        setSelectedCategories(prev =>
            prev.includes(categoryId)
                ? prev.filter(id => id !== categoryId)
                : [...prev, categoryId]
        );
    };

    const generateSlug = (name: string) => {
        return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    };

    const handleSubmit = async () => {
        if (!user) return;

        setIsSubmitting(true);
        try {
            const slug = generateSlug(companyName) + '-' + Date.now().toString(36);
            const fullAddress = businessAddress + (county ? `, Co. ${county}` : '');

            // 1. Create catalogue listing
            const { data: listing, error: listingError } = await supabase
                .from('catalogue_listings')
                .insert({
                    name: companyName,
                    slug,
                    company_name: companyName,
                    description: description || `${companyName} - Professional services provider.`,
                    email,
                    phone,
                    address: fullAddress,
                    website,
                    owner_id: user.id,
                    is_active: true,
                    social_media: {
                        facebook: facebook || undefined,
                        instagram: instagram || undefined,
                        linkedin: linkedin || undefined,
                        twitter: twitter || undefined,
                    },
                    latitude: null as number | null,
                    longitude: null as number | null,
                })
                .select('id')
                .single();

            if (listingError) throw listingError;

            // 1.1 Geocode address
            let coords = await geocodeAddress(fullAddress);
            if (!coords && county) {
                coords = COUNTY_COORDINATES[county];
            }

            if (coords && listing) {
                await supabase
                    .from('catalogue_listings')
                    .update({
                        latitude: coords.latitude,
                        longitude: coords.longitude
                    })
                    .eq('id', listing.id);
            }

            // 2. Map selected categories
            if (selectedCategories.length > 0 && listing) {
                const categoryMappings = selectedCategories.map(categoryId => ({
                    listing_id: listing.id,
                    category_id: categoryId,
                }));

                const { error: catError } = await supabase
                    .from('catalogue_listing_categories')
                    .insert(categoryMappings);

                if (catError) console.error('Category mapping error:', catError);
            }

            // 3. Map county location
            if (county && listing) {
                const countyLocation = locations.find(
                    l => l.name.toLowerCase() === county.toLowerCase()
                );
                if (countyLocation) {
                    await supabase
                        .from('catalogue_listing_locations')
                        .insert({
                            listing_id: listing.id,
                            location_id: countyLocation.id,
                        });
                }
            }

            toast.success('Business profile created successfully!');
            navigate('/dashboard/business', { replace: true });
        } catch (error: any) {
            console.error('Onboarding error:', error);
            toast.error(error.message || 'Failed to create business profile');
        } finally {
            setIsSubmitting(false);
        }
    };

    const canProceedStep1 = companyName.trim() && email.trim() && businessAddress.trim() && county;
    const canProceedStep2 = selectedCategories.length > 0;

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
            <div className="w-full max-w-2xl">
                {/* Header */}
                <div className="text-center mb-8">
                    <Link to="/" className="inline-block mb-6">
                        <img src="/logo.svg" alt="The Berman" className="h-8 w-auto mx-auto" />
                    </Link>
                    <div className="w-16 h-16 bg-[#007F00]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Building2 size={32} className="text-[#007F00]" />
                    </div>
                    <h1 className="text-3xl font-black text-gray-900 mb-2">Set Up Your Business Profile</h1>
                    <p className="text-gray-500 font-medium">Complete your profile to appear in the Business Catalogue.</p>
                </div>

                {/* Progress */}
                <div className="flex items-center justify-center gap-3 mb-10">
                    {[1, 2, 3].map(s => (
                        <div key={s} className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-black transition-all ${step > s ? 'bg-[#007F00] text-white' :
                                step === s ? 'bg-[#007F00] text-white shadow-lg shadow-green-200' :
                                    'bg-gray-200 text-gray-500'
                                }`}>
                                {step > s ? <CheckCircle size={18} /> : s}
                            </div>
                            {s < 3 && <div className={`w-16 h-1 rounded-full ${step > s ? 'bg-[#007F00]' : 'bg-gray-200'}`} />}
                        </div>
                    ))}
                </div>

                <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
                    <div className="p-8 md:p-10">

                        {/* Step 1: Business Details */}
                        {step === 1 && (
                            <div className="space-y-6">
                                <div>
                                    <h2 className="text-xl font-black text-gray-900 mb-1">Business Details</h2>
                                    <p className="text-sm text-gray-500">Tell us about your business.</p>
                                </div>

                                <div className="grid md:grid-cols-2 gap-5">
                                    <div className="md:col-span-2">
                                        <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">Full Business Name *</label>
                                        <input
                                            type="text"
                                            value={companyName}
                                            onChange={e => setCompanyName(e.target.value)}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-5 py-3.5 font-medium text-gray-900 focus:ring-2 focus:ring-[#007F00] focus:border-transparent outline-none transition-all"
                                            placeholder="Acme Energy Solutions"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">Business Email *</label>
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={e => setEmail(e.target.value)}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-5 py-3.5 font-medium text-gray-900 focus:ring-2 focus:ring-[#007F00] focus:border-transparent outline-none transition-all"
                                            placeholder="info@acme.ie"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">Phone Number</label>
                                        <input
                                            type="tel"
                                            value={phone}
                                            onChange={e => setPhone(e.target.value)}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-5 py-3.5 font-medium text-gray-900 focus:ring-2 focus:ring-[#007F00] focus:border-transparent outline-none transition-all"
                                            placeholder="+353 1 234 5678"
                                        />
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">Business Address *</label>
                                        <input
                                            type="text"
                                            value={businessAddress}
                                            onChange={e => setBusinessAddress(e.target.value)}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-5 py-3.5 font-medium text-gray-900 focus:ring-2 focus:ring-[#007F00] focus:border-transparent outline-none transition-all"
                                            placeholder="123 Main Street, Town"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">County *</label>
                                        <select
                                            value={county}
                                            onChange={e => setCounty(e.target.value)}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-5 py-3.5 font-medium text-gray-900 focus:ring-2 focus:ring-[#007F00] focus:border-transparent outline-none transition-all"
                                        >
                                            <option value="">Select County</option>
                                            {IRISH_COUNTIES.map(c => (
                                                <option key={c} value={c}>{c}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">Website</label>
                                        <input
                                            type="url"
                                            value={website}
                                            onChange={e => setWebsite(e.target.value)}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-5 py-3.5 font-medium text-gray-900 focus:ring-2 focus:ring-[#007F00] focus:border-transparent outline-none transition-all"
                                            placeholder="https://www.acme.ie"
                                        />
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">Business Description</label>
                                        <textarea
                                            value={description}
                                            onChange={e => setDescription(e.target.value)}
                                            rows={4}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-5 py-3.5 font-medium text-gray-900 focus:ring-2 focus:ring-[#007F00] focus:border-transparent outline-none transition-all resize-none"
                                            placeholder="Describe your business and services..."
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end pt-4">
                                    <button
                                        onClick={() => setStep(2)}
                                        disabled={!canProceedStep1}
                                        className="bg-[#007F00] text-white px-8 py-4 rounded-xl font-black text-sm uppercase tracking-wider shadow-lg shadow-green-900/10 hover:bg-green-800 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Next: Service Categories <ArrowRight size={18} />
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Step 2: Service Categories */}
                        {step === 2 && (
                            <div className="space-y-6">
                                <div>
                                    <h2 className="text-xl font-black text-gray-900 mb-1">Service Categories</h2>
                                    <p className="text-sm text-gray-500">Select the categories that best describe your services.</p>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    {categories.map(cat => (
                                        <button
                                            key={cat.id}
                                            type="button"
                                            onClick={() => toggleCategory(cat.id)}
                                            className={`p-4 rounded-xl border-2 text-left text-sm font-bold transition-all ${selectedCategories.includes(cat.id)
                                                ? 'border-[#007F00] bg-[#007F00]/5 text-[#007F00]'
                                                : 'border-gray-100 bg-gray-50 text-gray-700 hover:border-gray-300'
                                                }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${selectedCategories.includes(cat.id)
                                                    ? 'border-[#007F00] bg-[#007F00]'
                                                    : 'border-gray-300'
                                                    }`}>
                                                    {selectedCategories.includes(cat.id) && (
                                                        <CheckCircle size={14} className="text-white" />
                                                    )}
                                                </div>
                                                {cat.name}
                                            </div>
                                        </button>
                                    ))}
                                </div>

                                <div className="flex justify-between pt-4">
                                    <button
                                        onClick={() => setStep(1)}
                                        className="text-gray-500 font-bold text-sm flex items-center gap-2 hover:text-gray-700 transition-all"
                                    >
                                        <ArrowLeft size={18} /> Back
                                    </button>
                                    <button
                                        onClick={() => setStep(3)}
                                        disabled={!canProceedStep2}
                                        className="bg-[#007F00] text-white px-8 py-4 rounded-xl font-black text-sm uppercase tracking-wider shadow-lg shadow-green-900/10 hover:bg-green-800 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Next: Social Media <ArrowRight size={18} />
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Step 3: Social Media & Submit */}
                        {step === 3 && (
                            <div className="space-y-6">
                                <div>
                                    <h2 className="text-xl font-black text-gray-900 mb-1">Social Media</h2>
                                    <p className="text-sm text-gray-500">Add your social media links (optional).</p>
                                </div>

                                <div className="grid md:grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">Facebook</label>
                                        <input
                                            type="url"
                                            value={facebook}
                                            onChange={e => setFacebook(e.target.value)}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-5 py-3.5 font-medium text-gray-900 focus:ring-2 focus:ring-[#007F00] focus:border-transparent outline-none transition-all"
                                            placeholder="https://facebook.com/..."
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">Instagram</label>
                                        <input
                                            type="url"
                                            value={instagram}
                                            onChange={e => setInstagram(e.target.value)}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-5 py-3.5 font-medium text-gray-900 focus:ring-2 focus:ring-[#007F00] focus:border-transparent outline-none transition-all"
                                            placeholder="https://instagram.com/..."
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">LinkedIn</label>
                                        <input
                                            type="url"
                                            value={linkedin}
                                            onChange={e => setLinkedin(e.target.value)}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-5 py-3.5 font-medium text-gray-900 focus:ring-2 focus:ring-[#007F00] focus:border-transparent outline-none transition-all"
                                            placeholder="https://linkedin.com/..."
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">Twitter / X</label>
                                        <input
                                            type="url"
                                            value={twitter}
                                            onChange={e => setTwitter(e.target.value)}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-5 py-3.5 font-medium text-gray-900 focus:ring-2 focus:ring-[#007F00] focus:border-transparent outline-none transition-all"
                                            placeholder="https://x.com/..."
                                        />
                                    </div>
                                </div>

                                {/* Summary */}
                                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 mt-6">
                                    <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-4">Summary</h3>
                                    <div className="grid grid-cols-2 gap-y-3 text-sm">
                                        <span className="text-gray-500 font-bold">Business Name</span>
                                        <span className="text-gray-900 font-medium">{companyName}</span>
                                        <span className="text-gray-500 font-bold">Address</span>
                                        <span className="text-gray-900 font-medium">{businessAddress}, Co. {county}</span>
                                        <span className="text-gray-500 font-bold">Categories</span>
                                        <span className="text-gray-900 font-medium">
                                            {selectedCategories.map(id => categories.find(c => c.id === id)?.name).join(', ')}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex justify-between pt-4">
                                    <button
                                        onClick={() => setStep(2)}
                                        className="text-gray-500 font-bold text-sm flex items-center gap-2 hover:text-gray-700 transition-all"
                                    >
                                        <ArrowLeft size={18} /> Back
                                    </button>
                                    <button
                                        onClick={handleSubmit}
                                        disabled={isSubmitting}
                                        className="bg-[#007F00] text-white px-10 py-4 rounded-xl font-black text-sm uppercase tracking-wider shadow-lg shadow-green-900/10 hover:bg-green-800 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 size={18} className="animate-spin" />
                                                Creating Profile...
                                            </>
                                        ) : (
                                            'Create Business Profile'
                                        )}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BusinessOnboarding;
