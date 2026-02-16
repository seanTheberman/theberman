import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';
import { Check, Plus, X } from 'lucide-react';

import { TOWNS_BY_COUNTY } from '../data/irishTowns';
import { geocodeAddress } from '../lib/geocoding';

const COUNTIES = Object.keys(TOWNS_BY_COUNTY).sort();

const ContractorOnboarding = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        phone: '',
        homeCounty: '',
        homeTown: '',
        seaiNumber: '',
        seaiYear: new Date().getFullYear().toString(),
        insuranceHolder: false,
        vatRegistered: false,
        assessorTypes: ['Domestic Assessor'] as string[],
        serviceAreas: [] as string[],
        wantsCatalogueListing: true, // Default to true as per simplified requirement
        companyName: '',
        website: '',
        socialFacebook: '',
        socialInstagram: '',
        socialLinkedin: '',
        features: [] as string[]
    });

    const [featureInput, setFeatureInput] = useState('');


    const handleServiceAreaToggle = (county: string) => {
        setFormData(prev => {
            const areas = [...prev.serviceAreas];
            if (areas.includes(county)) {
                return { ...prev, serviceAreas: areas.filter(c => c !== county) };
            } else {
                return { ...prev, serviceAreas: [...areas, county] };
            }
        });
    };

    const handleAssessorTypeToggle = (type: string) => {
        setFormData(prev => {
            const types = [...prev.assessorTypes];
            if (types.includes(type)) {
                // Prevent deselecting if it's the only one left
                if (types.length === 1) return prev;
                return { ...prev, assessorTypes: types.filter(t => t !== type) };
            } else {
                return { ...prev, assessorTypes: [...types, type] };
            }
        });
    };

    const setWantsCatalogueListing = (val: boolean) => {
        setFormData(prev => ({ ...prev, wantsCatalogueListing: val }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.phone || !formData.homeCounty || !formData.seaiNumber) {
            toast.error('Please fill in all required fields');
            return;
        }

        if (formData.serviceAreas.length === 0) {
            toast.error('Please select at least one service area');
            return;
        }

        setLoading(true);
        try {
            // Fetch coordinates silently
            let latitude = null;
            let longitude = null;

            const fullAddress = `${formData.homeTown}, Co. ${formData.homeCounty}`;
            const coords = await geocodeAddress(fullAddress);
            if (coords) {
                latitude = coords.latitude;
                longitude = coords.longitude;
            }

            // Store registration data in sessionStorage for later persistence (after payment)
            const registrationData = {
                ...formData,
                latitude,
                longitude,
                user_id: user?.id,
                user_email: user?.email,
                user_full_name: user?.user_metadata?.full_name
            };

            sessionStorage.setItem('pending_assessor_registration', JSON.stringify(registrationData));

            window.location.href = '/assessor-membership';

        } catch (error: any) {
            console.error('Onboarding Processing Error:', error);
            toast.error('Failed to process information. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const years = Array.from({ length: 30 }, (_, i) => (new Date().getFullYear() - i).toString());

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-extrabold text-gray-900 font-serif">
                        BER Assessor Registration
                    </h1>
                    <p className="mt-2 text-gray-600">
                        Complete your profile to get more BER jobs in your area.
                    </p>
                </div>

                <div className="bg-white py-8 px-4 shadow rounded-lg sm:px-10">
                    <form className="space-y-6" onSubmit={handleSubmit}>

                        {/* READ ONLY INFO */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-4 rounded-md border border-gray-100 mb-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">First Name</label>
                                <div className="mt-1 text-gray-900 font-medium">{user?.user_metadata?.full_name?.split(' ')[0] || '-'}</div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Last Name</label>
                                <div className="mt-1 text-gray-900 font-medium">{user?.user_metadata?.full_name?.split(' ').slice(1).join(' ') || '-'}</div>
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700">Email Address</label>
                                <div className="mt-1 text-gray-900 font-medium">{user?.email}</div>
                            </div>
                        </div>

                        {/* NEW FIELDS */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="phone" className="block text-sm font-bold text-gray-700">Mobile Phone</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    id="phone"
                                    required
                                    className="mt-1 block w-full border border-gray-200 rounded-xl shadow-sm py-3 px-4 focus:ring-[#007F00] focus:border-[#007F00] transition-colors"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                />
                            </div>

                            <div>
                                <label htmlFor="homeCounty" className="block text-sm font-bold text-gray-700 mb-1">Home County</label>
                                <select
                                    id="homeCounty"
                                    name="homeCounty"
                                    required
                                    className="mt-1 block w-full border border-gray-200 rounded-xl shadow-sm py-3 px-4 focus:ring-[#007F00] focus:border-[#007F00] transition-colors bg-white"
                                    value={formData.homeCounty}
                                    onChange={(e) => setFormData({ ...formData, homeCounty: e.target.value, homeTown: '' })}
                                >
                                    <option value="">Select County</option>
                                    {COUNTIES.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>

                            <div>
                                <label htmlFor="homeTown" className="block text-sm font-bold text-gray-700 mb-1">Home Town</label>
                                <select
                                    id="homeTown"
                                    name="homeTown"
                                    required
                                    disabled={!formData.homeCounty}
                                    className={`mt-1 block w-full border border-gray-200 rounded-xl shadow-sm py-3 px-4 focus:ring-[#007F00] focus:border-[#007F00] transition-colors bg-white ${!formData.homeCounty ? 'bg-gray-50 opacity-50 cursor-not-allowed' : ''}`}
                                    value={formData.homeTown}
                                    onChange={(e) => setFormData({ ...formData, homeTown: e.target.value })}
                                >
                                    <option value="">{formData.homeCounty ? 'Select Town' : 'Select County First'}</option>
                                    {formData.homeCounty && TOWNS_BY_COUNTY[formData.homeCounty]?.map(town => (
                                        <option key={town} value={town}>{town}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label htmlFor="seaiNumber" className="block text-sm font-bold text-gray-700 mb-1">SEAI Registration #</label>
                                <input
                                    type="text"
                                    name="seaiNumber"
                                    id="seaiNumber"
                                    required
                                    placeholder="e.g. 10XXX"
                                    className="mt-1 block w-full border border-gray-200 rounded-xl shadow-sm py-3 px-4 focus:ring-[#007F00] focus:border-[#007F00] transition-colors"
                                    value={formData.seaiNumber}
                                    onChange={(e) => setFormData({ ...formData, seaiNumber: e.target.value })}
                                />
                            </div>

                            <div>
                                <label htmlFor="seaiYear" className="block text-sm font-bold text-gray-700 mb-1">SEAI Assessor since</label>
                                <select
                                    id="seaiYear"
                                    name="seaiYear"
                                    className="mt-1 block w-full border border-gray-200 rounded-xl shadow-sm py-3 px-4 focus:ring-[#007F00] focus:border-[#007F00] transition-colors bg-white"
                                    value={formData.seaiYear}
                                    onChange={(e) => setFormData({ ...formData, seaiYear: e.target.value })}
                                >
                                    {years.map(y => <option key={y} value={y}>{y}</option>)}
                                </select>
                            </div>
                        </div>

                        {/* BUSINESS DETAILS */}
                        <div className="pt-8 border-t border-gray-100">
                            <label className="block text-lg font-bold text-gray-900 mb-4">
                                Business Details
                            </label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label htmlFor="companyName" className="block text-sm font-bold text-gray-700 mb-1">Company Name</label>
                                    <input
                                        type="text"
                                        name="companyName"
                                        id="companyName"
                                        className="mt-1 block w-full border border-gray-200 rounded-xl shadow-sm py-3 px-4 focus:ring-[#007F00] focus:border-[#007F00] transition-colors"
                                        value={formData.companyName}
                                        onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                                        placeholder="e.g. ABC Energy Assessments"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="website" className="block text-sm font-bold text-gray-700 mb-1">Website</label>
                                    <input
                                        type="url"
                                        name="website"
                                        id="website"
                                        className="mt-1 block w-full border border-gray-200 rounded-xl shadow-sm py-3 px-4 focus:ring-[#007F00] focus:border-[#007F00] transition-colors"
                                        value={formData.website}
                                        onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                                        placeholder="https://www.example.com"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* SOCIAL MEDIA */}
                        <div className="pt-6">
                            <label className="block text-sm font-bold text-gray-700 mb-3">Social Media <span className="text-gray-400 font-normal">(optional)</span></label>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-xs text-gray-500 mb-1 ml-1">Facebook</label>
                                    <input
                                        type="url"
                                        className="block w-full border border-gray-200 rounded-xl shadow-sm py-3 px-4 focus:ring-[#007F00] focus:border-[#007F00] transition-colors text-sm"
                                        value={formData.socialFacebook}
                                        onChange={(e) => setFormData({ ...formData, socialFacebook: e.target.value })}
                                        placeholder="https://facebook.com/..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-500 mb-1 ml-1">Instagram</label>
                                    <input
                                        type="url"
                                        className="block w-full border border-gray-200 rounded-xl shadow-sm py-3 px-4 focus:ring-[#007F00] focus:border-[#007F00] transition-colors text-sm"
                                        value={formData.socialInstagram}
                                        onChange={(e) => setFormData({ ...formData, socialInstagram: e.target.value })}
                                        placeholder="https://instagram.com/..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-500 mb-1 ml-1">LinkedIn</label>
                                    <input
                                        type="url"
                                        className="block w-full border border-gray-200 rounded-xl shadow-sm py-3 px-4 focus:ring-[#007F00] focus:border-[#007F00] transition-colors text-sm"
                                        value={formData.socialLinkedin}
                                        onChange={(e) => setFormData({ ...formData, socialLinkedin: e.target.value })}
                                        placeholder="https://linkedin.com/in/..."
                                    />
                                </div>
                            </div>
                        </div>

                        {/* FEATURES */}
                        <div className="pt-6">
                            <label className="block text-sm font-bold text-gray-700 mb-1">Features / Services <span className="text-gray-400 font-normal">(optional)</span></label>
                            <p className="text-xs text-gray-500 mb-3">Add key services or features to highlight on your listing (e.g. "Fast Turnaround", "24hr E-certs").</p>
                            <div className="flex gap-2 mb-3">
                                <input
                                    type="text"
                                    className="flex-1 border border-gray-200 rounded-xl shadow-sm py-2 px-4 focus:ring-[#007F00] focus:border-[#007F00] transition-colors text-sm"
                                    value={featureInput}
                                    onChange={(e) => setFeatureInput(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            if (featureInput.trim() && !formData.features.includes(featureInput.trim())) {
                                                setFormData({ ...formData, features: [...formData.features, featureInput.trim()] });
                                                setFeatureInput('');
                                            }
                                        }
                                    }}
                                    placeholder="Type a feature and press Enter"
                                />
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (featureInput.trim() && !formData.features.includes(featureInput.trim())) {
                                            setFormData({ ...formData, features: [...formData.features, featureInput.trim()] });
                                            setFeatureInput('');
                                        }
                                    }}
                                    className="px-4 py-2 bg-[#007F00] text-white rounded-xl text-sm font-bold hover:bg-[#006600] transition-colors flex items-center gap-1"
                                >
                                    <Plus size={16} /> Add
                                </button>
                            </div>
                            {formData.features.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    {formData.features.map((feature, i) => (
                                        <span key={i} className="inline-flex items-center gap-1 bg-green-50 border border-[#007F00] text-[#007F00] px-3 py-1.5 rounded-full text-xs font-bold">
                                            {feature}
                                            <button type="button" onClick={() => setFormData({ ...formData, features: formData.features.filter((_, idx) => idx !== i) })} className="hover:text-red-500 transition-colors">
                                                <X size={12} />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* BOOLEANS */}
                        <div className="space-y-4 pt-4">
                            <div className={`flex items-center justify-between border p-4 rounded-xl transition-all ${formData.insuranceHolder ? 'border-[#007F00] bg-green-50/30' : 'border-gray-200 bg-white'}`}>
                                <div>
                                    <span className={`block text-sm font-bold ${formData.insuranceHolder ? 'text-[#007F00]' : 'text-gray-900'}`}>Professional insurance policy holder</span>
                                    <span className="text-xs text-gray-500">Do you hold valid professional indemnity insurance?</span>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, insuranceHolder: !formData.insuranceHolder })}
                                        className={`relative inline-flex flex-shrink-0 h-7 w-12 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#007F00] ${formData.insuranceHolder ? 'bg-[#007F00]' : 'bg-gray-200'}`}
                                    >
                                        <span className={`pointer-events-none inline-block h-6 w-6 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200 ${formData.insuranceHolder ? 'translate-x-5' : 'translate-x-0'}`} />
                                    </button>
                                    <span className={`text-sm font-bold w-8 ${formData.insuranceHolder ? 'text-[#007F00]' : 'text-gray-700'}`}>{formData.insuranceHolder ? 'Yes' : 'No'}</span>
                                </div>
                            </div>

                            <div className={`flex items-center justify-between border p-4 rounded-xl transition-all ${formData.vatRegistered ? 'border-[#007F00] bg-green-50/30' : 'border-gray-200 bg-white'}`}>
                                <div>
                                    <span className={`block text-sm font-bold ${formData.vatRegistered ? 'text-[#007F00]' : 'text-gray-900'}`}>VAT Registered</span>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, vatRegistered: !formData.vatRegistered })}
                                        className={`relative inline-flex flex-shrink-0 h-7 w-12 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#007F00] ${formData.vatRegistered ? 'bg-[#007F00]' : 'bg-gray-200'}`}
                                    >
                                        <span className={`pointer-events-none inline-block h-6 w-6 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200 ${formData.vatRegistered ? 'translate-x-5' : 'translate-x-0'}`} />
                                    </button>
                                    <span className={`text-sm font-bold w-8 ${formData.vatRegistered ? 'text-[#007F00]' : 'text-gray-700'}`}>{formData.vatRegistered ? 'Yes' : 'No'}</span>
                                </div>
                            </div>
                        </div>

                        <div className="pt-6">
                            <label className="block text-sm font-bold text-gray-700 mb-3">Domestic or Commercial</label>
                            <div className="flex flex-wrap gap-4">
                                {['Domestic Assessor', 'Commercial Assessor'].map((type) => (
                                    <button
                                        key={type}
                                        type="button"
                                        onClick={() => handleAssessorTypeToggle(type)}
                                        className={`px-6 py-3 rounded-xl border-2 font-bold transition-all flex items-center gap-2 ${formData.assessorTypes.includes(type) ? 'border-[#007F00] bg-green-50 text-[#007F00]' : 'border-gray-200 bg-white text-gray-400'}`}
                                    >
                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${formData.assessorTypes.includes(type) ? 'border-[#007F00]' : 'border-gray-300'}`}>
                                            {formData.assessorTypes.includes(type) && <div className="w-2.5 h-2.5 rounded-full bg-[#007F00]" />}
                                        </div>
                                        {type}
                                    </button>
                                ))}
                            </div>
                            <p className="text-xs text-gray-500 mt-2">You can select both if you provide both services.</p>
                        </div>


                        {/* Service Selection Simplified */}
                        <div className="pt-8 border-t border-gray-100">
                            <label className="block text-sm font-bold text-gray-900 mb-2">
                                Would you like to be listed in our Home Energy catalogue as a 'BER ASSESSOR'?
                            </label>
                            <p className="text-sm text-gray-500 mb-6">This will help homeowners find you directly for BER assessments in your area.</p>

                            <div className="flex gap-4">
                                <button
                                    type="button"
                                    onClick={() => setWantsCatalogueListing(true)}
                                    className={`flex-1 py-4 px-6 rounded-xl border-2 font-bold transition-all flex items-center justify-center gap-2 ${formData.wantsCatalogueListing ? 'border-[#007F00] bg-green-50 text-[#007F00]' : 'border-gray-200 bg-white text-gray-400'}`}
                                >
                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${formData.wantsCatalogueListing ? 'border-[#007F00]' : 'border-gray-300'}`}>
                                        {formData.wantsCatalogueListing && <div className="w-2.5 h-2.5 rounded-full bg-[#007F00]" />}
                                    </div>
                                    YES
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setWantsCatalogueListing(false)}
                                    className={`flex-1 py-4 px-6 rounded-xl border-2 font-bold transition-all flex items-center justify-center gap-2 ${!formData.wantsCatalogueListing ? 'border-red-500 bg-red-50 text-red-600' : 'border-gray-200 bg-white text-gray-400'}`}
                                >
                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${!formData.wantsCatalogueListing ? 'border-red-500' : 'border-gray-300'}`}>
                                        {!formData.wantsCatalogueListing && <div className="w-2.5 h-2.5 rounded-full bg-red-500" />}
                                    </div>
                                    NO
                                </button>
                            </div>
                        </div>

                        {/* Service Areas */}
                        <div className="pt-8">
                            <label className="block text-lg font-bold text-gray-900 mb-4">
                                Select the counties you would like to receive jobs in:
                            </label>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                {COUNTIES.map(county => (
                                    <div
                                        key={county}
                                        onClick={() => handleServiceAreaToggle(county)}
                                        className={`
                                                cursor-pointer p-3 rounded-xl border flex items-center justify-between transition-all select-none
                                                ${formData.serviceAreas.includes(county)
                                                ? 'bg-green-50/50 border-[#007F00] text-[#007F00] shadow-sm'
                                                : 'bg-white border-gray-200 hover:border-green-300 text-gray-600'}
                                            `}
                                    >
                                        <span className="font-medium text-sm">Co. {county}</span>
                                        {formData.serviceAreas.includes(county) && <Check size={16} className="text-[#007F00]" />}
                                    </div>
                                ))}
                            </div>
                            <p className="text-xs text-gray-500 mt-2 text-right">{formData.serviceAreas.length} counties selected</p>
                        </div>

                        <div className="pt-8">
                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-lg text-lg font-bold text-white bg-[#007F00] hover:bg-[#006600] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#007F00] transition-all transform active:scale-95 ${loading ? 'opacity-75 cursor-not-allowed' : ''}`}
                            >
                                {loading ? 'Saving Profile...' : 'Proceed'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ContractorOnboarding;
