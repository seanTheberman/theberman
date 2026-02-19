
import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2, Check } from 'lucide-react';
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

const CERTIFICATIONS = ['SafePass', 'SEAI Registered', 'RECI Certified', 'NSAI Certified', 'FQAI Registered', 'Safe Electric'];

const BusinessOnboarding = () => {
    const { user, profile } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const userIdParam = searchParams.get('userId');
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);
    const [locations, setLocations] = useState<Location[]>([]);

    // Consolidated form state
    const [formData, setFormData] = useState({
        companyName: '',
        tradingName: '',
        email: '',
        phone: '',
        businessAddress: '',
        county: '',
        website: '',
        description: '',
        companyNumber: '',
        vatNumber: '',
        insuranceExpiry: '',
        certifications: [] as string[],
        selectedCategories: [] as string[],
        facebook: '',
        instagram: '',
        linkedin: '',
        twitter: '',
    });

    useEffect(() => {
        const initializeForm = async () => {
            if (userIdParam) {
                const { data: targetProfile } = await supabase
                    .from('profiles')
                    .select('full_name, email')
                    .eq('id', userIdParam)
                    .single();

                if (targetProfile) {
                    setFormData(prev => ({
                        ...prev,
                        companyName: targetProfile.full_name || '',
                        email: targetProfile.email || '',
                    }));
                }
            } else {
                setFormData(prev => ({
                    ...prev,
                    companyName: profile?.full_name || '',
                    email: user?.email || '',
                }));
            }
        };

        initializeForm();
        fetchCategories();
        fetchLocations();
    }, [profile, user, userIdParam]);

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
        setFormData(prev => ({
            ...prev,
            selectedCategories: prev.selectedCategories.includes(categoryId)
                ? prev.selectedCategories.filter(id => id !== categoryId)
                : [...prev.selectedCategories, categoryId]
        }));
    };

    const toggleCertification = (cert: string) => {
        setFormData(prev => ({
            ...prev,
            certifications: prev.certifications.includes(cert)
                ? prev.certifications.filter(c => c !== cert)
                : [...prev.certifications, cert]
        }));
    };

    const generateSlug = (name: string) => {
        return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        if (!formData.companyName.trim() || !formData.email.trim() || !formData.businessAddress.trim() || !formData.county) {
            toast.error('Please fill in all required fields');
            return;
        }

        if (formData.selectedCategories.length === 0) {
            toast.error('Please select at least one service category');
            return;
        }

        setLoading(true);
        try {
            const slug = generateSlug(formData.companyName) + '-' + Date.now().toString(36);
            const fullAddress = formData.businessAddress + (formData.county ? `, Co. ${formData.county}` : '');

            // 1. Create catalogue listing
            const { data: listing, error: listingError } = await supabase
                .from('catalogue_listings')
                .insert({
                    name: formData.companyName,
                    slug,
                    company_name: formData.companyName,
                    description: formData.description || `${formData.companyName} - Professional services provider.`,
                    email: formData.email,
                    phone: formData.phone,
                    address: fullAddress,
                    website: formData.website,
                    owner_id: user.id,
                    is_active: true,
                    social_media: {
                        facebook: formData.facebook || undefined,
                        instagram: formData.instagram || undefined,
                        linkedin: formData.linkedin || undefined,
                        twitter: formData.twitter || undefined,
                    },
                    latitude: null as number | null,
                    longitude: null as number | null,
                })
                .select('id')
                .single();

            if (listingError) throw listingError;

            // 1.1 Geocode address
            let coords = await geocodeAddress(fullAddress);
            if (!coords && formData.county) {
                coords = COUNTY_COORDINATES[formData.county];
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
            if (formData.selectedCategories.length > 0 && listing) {
                const categoryMappings = formData.selectedCategories.map(categoryId => ({
                    listing_id: listing.id,
                    category_id: categoryId,
                }));

                const { error: catError } = await supabase
                    .from('catalogue_listing_categories')
                    .insert(categoryMappings);

                if (catError) console.error('Category mapping error:', catError);
            }

            // 3. Map county location
            if (formData.county && listing) {
                const countyLocation = locations.find(
                    l => l.name.toLowerCase() === formData.county.toLowerCase()
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

            // 4. Store compliance data in user metadata
            const { error: metadataError } = await supabase.auth.updateUser({
                data: {
                    compliance_data: {
                        trading_name: formData.tradingName,
                        company_number: formData.companyNumber,
                        vat_number: formData.vatNumber,
                        insurance_expiry: formData.insuranceExpiry,
                        certifications: formData.certifications,
                    }
                }
            });

            if (metadataError) console.error('Metadata update error:', metadataError);

            toast.success('Business profile created successfully!');
            navigate('/dashboard/business', { replace: true });
        } catch (error: any) {
            console.error('Onboarding error:', error);
            toast.error(error.message || 'Failed to create business profile');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-extrabold text-gray-900 font-serif">
                        Business Registration
                    </h1>
                    <p className="mt-2 text-gray-600">
                        Complete your profile to appear in the Home Energy Catalogue.
                    </p>
                </div>

                <div className="bg-white py-8 px-4 shadow rounded-lg sm:px-10">
                    <form className="space-y-6" onSubmit={handleSubmit}>

                        {/* READ ONLY INFO */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-4 rounded-md border border-gray-100 mb-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Account Name</label>
                                <div className="mt-1 text-gray-900 font-medium">{user?.user_metadata?.full_name || '-'}</div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Email Address</label>
                                <div className="mt-1 text-gray-900 font-medium">{user?.email}</div>
                            </div>
                        </div>

                        {/* BUSINESS DETAILS */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="companyName" className="block text-sm font-bold text-gray-700">Full Business Name *</label>
                                <input
                                    type="text"
                                    id="companyName"
                                    required
                                    className="mt-1 block w-full border border-gray-200 rounded-xl shadow-sm py-3 px-4 focus:ring-[#007F00] focus:border-[#007F00] transition-colors"
                                    value={formData.companyName}
                                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                                    placeholder="Acme Energy Solutions"
                                />
                            </div>

                            <div>
                                <label htmlFor="tradingName" className="block text-sm font-bold text-gray-700">Trading Name <span className="text-gray-400 font-normal">(if different)</span></label>
                                <input
                                    type="text"
                                    id="tradingName"
                                    className="mt-1 block w-full border border-gray-200 rounded-xl shadow-sm py-3 px-4 focus:ring-[#007F00] focus:border-[#007F00] transition-colors"
                                    value={formData.tradingName}
                                    onChange={(e) => setFormData({ ...formData, tradingName: e.target.value })}
                                    placeholder="Acme Renewables"
                                />
                            </div>

                            <div>
                                <label htmlFor="email" className="block text-sm font-bold text-gray-700">Business Email *</label>
                                <input
                                    type="email"
                                    id="email"
                                    required
                                    className="mt-1 block w-full border border-gray-200 rounded-xl shadow-sm py-3 px-4 focus:ring-[#007F00] focus:border-[#007F00] transition-colors"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    placeholder="info@acme.ie"
                                />
                            </div>

                            <div>
                                <label htmlFor="phone" className="block text-sm font-bold text-gray-700">Phone Number</label>
                                <input
                                    type="tel"
                                    id="phone"
                                    className="mt-1 block w-full border border-gray-200 rounded-xl shadow-sm py-3 px-4 focus:ring-[#007F00] focus:border-[#007F00] transition-colors"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    placeholder="+353 1 234 5678"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label htmlFor="businessAddress" className="block text-sm font-bold text-gray-700">Business Address *</label>
                                <input
                                    type="text"
                                    id="businessAddress"
                                    required
                                    className="mt-1 block w-full border border-gray-200 rounded-xl shadow-sm py-3 px-4 focus:ring-[#007F00] focus:border-[#007F00] transition-colors"
                                    value={formData.businessAddress}
                                    onChange={(e) => setFormData({ ...formData, businessAddress: e.target.value })}
                                    placeholder="123 Main Street, Town"
                                />
                            </div>

                            <div>
                                <label htmlFor="county" className="block text-sm font-bold text-gray-700 mb-1">County *</label>
                                <select
                                    id="county"
                                    required
                                    className="mt-1 block w-full border border-gray-200 rounded-xl shadow-sm py-3 px-4 focus:ring-[#007F00] focus:border-[#007F00] transition-colors bg-white"
                                    value={formData.county}
                                    onChange={(e) => setFormData({ ...formData, county: e.target.value })}
                                >
                                    <option value="">Select County</option>
                                    {IRISH_COUNTIES.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>

                            <div>
                                <label htmlFor="website" className="block text-sm font-bold text-gray-700">Website</label>
                                <input
                                    type="url"
                                    id="website"
                                    className="mt-1 block w-full border border-gray-200 rounded-xl shadow-sm py-3 px-4 focus:ring-[#007F00] focus:border-[#007F00] transition-colors"
                                    value={formData.website}
                                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                                    placeholder="https://www.acme.ie"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label htmlFor="description" className="block text-sm font-bold text-gray-700">Business Description</label>
                                <textarea
                                    id="description"
                                    rows={4}
                                    className="mt-1 block w-full border border-gray-200 rounded-xl shadow-sm py-3 px-4 focus:ring-[#007F00] focus:border-[#007F00] transition-colors resize-none"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Describe your business and services..."
                                />
                            </div>
                        </div>

                        {/* COMPLIANCE DETAILS */}
                        <div className="pt-8 border-t border-gray-100">
                            <label className="block text-lg font-bold text-gray-900 mb-4">
                                Compliance Details
                            </label>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <label htmlFor="companyNumber" className="block text-sm font-bold text-gray-700 mb-1">Company Number</label>
                                    <input
                                        type="text"
                                        id="companyNumber"
                                        className="mt-1 block w-full border border-gray-200 rounded-xl shadow-sm py-3 px-4 focus:ring-[#007F00] focus:border-[#007F00] transition-colors"
                                        value={formData.companyNumber}
                                        onChange={(e) => setFormData({ ...formData, companyNumber: e.target.value })}
                                        placeholder="123456"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="vatNumber" className="block text-sm font-bold text-gray-700 mb-1">VAT Number</label>
                                    <input
                                        type="text"
                                        id="vatNumber"
                                        className="mt-1 block w-full border border-gray-200 rounded-xl shadow-sm py-3 px-4 focus:ring-[#007F00] focus:border-[#007F00] transition-colors"
                                        value={formData.vatNumber}
                                        onChange={(e) => setFormData({ ...formData, vatNumber: e.target.value })}
                                        placeholder="IE1234567A"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="insuranceExpiry" className="block text-sm font-bold text-gray-700 mb-1">Insurance Expiry</label>
                                    <input
                                        type="date"
                                        id="insuranceExpiry"
                                        className="mt-1 block w-full border border-gray-200 rounded-xl shadow-sm py-3 px-4 focus:ring-[#007F00] focus:border-[#007F00] transition-colors"
                                        value={formData.insuranceExpiry}
                                        onChange={(e) => setFormData({ ...formData, insuranceExpiry: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* CERTIFICATIONS */}
                        <div className="pt-6">
                            <label className="block text-sm font-bold text-gray-700 mb-3">Professional Certifications <span className="text-gray-400 font-normal">(optional)</span></label>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                {CERTIFICATIONS.map(cert => (
                                    <div
                                        key={cert}
                                        onClick={() => toggleCertification(cert)}
                                        className={`
                                            cursor-pointer p-3 rounded-xl border flex items-center justify-between transition-all select-none
                                            ${formData.certifications.includes(cert)
                                                ? 'bg-green-50/50 border-[#007F00] text-[#007F00] shadow-sm'
                                                : 'bg-white border-gray-200 hover:border-green-300 text-gray-600'}
                                        `}
                                    >
                                        <span className="font-medium text-sm">{cert}</span>
                                        {formData.certifications.includes(cert) && <Check size={16} className="text-[#007F00]" />}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* SERVICE CATEGORIES */}
                        <div className="pt-8 border-t border-gray-100">
                            <label className="block text-lg font-bold text-gray-900 mb-2">
                                Select the categories that best describe your services: *
                            </label>
                            <p className="text-sm text-gray-500 mb-6">These help customers find you in the catalogue.</p>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                {categories.map(cat => (
                                    <div
                                        key={cat.id}
                                        onClick={() => toggleCategory(cat.id)}
                                        className={`
                                            cursor-pointer p-3 rounded-xl border flex items-center justify-between transition-all select-none
                                            ${formData.selectedCategories.includes(cat.id)
                                                ? 'bg-green-50/50 border-[#007F00] text-[#007F00] shadow-sm'
                                                : 'bg-white border-gray-200 hover:border-green-300 text-gray-600'}
                                        `}
                                    >
                                        <span className="font-medium text-sm">{cat.name}</span>
                                        {formData.selectedCategories.includes(cat.id) && <Check size={16} className="text-[#007F00]" />}
                                    </div>
                                ))}
                            </div>
                            <p className="text-xs text-gray-500 mt-2 text-right">{formData.selectedCategories.length} categor{formData.selectedCategories.length === 1 ? 'y' : 'ies'} selected</p>
                        </div>

                        {/* SOCIAL MEDIA */}
                        <div className="pt-6">
                            <label className="block text-sm font-bold text-gray-700 mb-3">Social Media <span className="text-gray-400 font-normal">(optional)</span></label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs text-gray-500 mb-1 ml-1">Facebook</label>
                                    <input
                                        type="url"
                                        className="block w-full border border-gray-200 rounded-xl shadow-sm py-3 px-4 focus:ring-[#007F00] focus:border-[#007F00] transition-colors text-sm"
                                        value={formData.facebook}
                                        onChange={(e) => setFormData({ ...formData, facebook: e.target.value })}
                                        placeholder="https://facebook.com/..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-500 mb-1 ml-1">Instagram</label>
                                    <input
                                        type="url"
                                        className="block w-full border border-gray-200 rounded-xl shadow-sm py-3 px-4 focus:ring-[#007F00] focus:border-[#007F00] transition-colors text-sm"
                                        value={formData.instagram}
                                        onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                                        placeholder="https://instagram.com/..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-500 mb-1 ml-1">LinkedIn</label>
                                    <input
                                        type="url"
                                        className="block w-full border border-gray-200 rounded-xl shadow-sm py-3 px-4 focus:ring-[#007F00] focus:border-[#007F00] transition-colors text-sm"
                                        value={formData.linkedin}
                                        onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                                        placeholder="https://linkedin.com/company/..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-500 mb-1 ml-1">Twitter / X</label>
                                    <input
                                        type="url"
                                        className="block w-full border border-gray-200 rounded-xl shadow-sm py-3 px-4 focus:ring-[#007F00] focus:border-[#007F00] transition-colors text-sm"
                                        value={formData.twitter}
                                        onChange={(e) => setFormData({ ...formData, twitter: e.target.value })}
                                        placeholder="https://x.com/..."
                                    />
                                </div>
                            </div>
                        </div>

                        {/* SUBMIT */}
                        <div className="pt-8">
                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-lg text-lg font-bold text-white bg-[#007F00] hover:bg-[#006600] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#007F00] transition-all transform active:scale-95 ${loading ? 'opacity-75 cursor-not-allowed' : ''}`}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 size={20} className="animate-spin mr-2" />
                                        Creating Profile...
                                    </>
                                ) : (
                                    'Create Business Profile'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default BusinessOnboarding;
