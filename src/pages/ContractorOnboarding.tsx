import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';
import { Check } from 'lucide-react';

const COUNTIES = [
    'Carlow', 'Cavan', 'Clare', 'Cork', 'Donegal', 'Dublin', 'Galway', 'Kerry',
    'Kildare', 'Kilkenny', 'Laois', 'Leitrim', 'Limerick', 'Longford', 'Louth',
    'Mayo', 'Meath', 'Monaghan', 'Offaly', 'Roscommon', 'Sligo', 'Tipperary',
    'Waterford', 'Westmeath', 'Wexford', 'Wicklow'
];

const ContractorOnboarding = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        phone: '',
        homeCounty: '',
        seaiNumber: '',
        seaiYear: new Date().getFullYear().toString(),
        insuranceHolder: false,
        vatRegistered: false,
        assessorType: 'Domestic Assessor',
        serviceAreas: [] as string[]
    });

    useEffect(() => {
        if (user) {
            // Provide basic fetch if profile already has partial data? 
            // For now, assume it's fresh.
        }
    }, [user]);

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
            const { error } = await supabase
                .from('profiles')
                .update({
                    phone: formData.phone,
                    home_county: formData.homeCounty,
                    seai_number: formData.seaiNumber,
                    seai_since_year: parseInt(formData.seaiYear),
                    insurance_holder: formData.insuranceHolder,
                    vat_registered: formData.vatRegistered,
                    assessor_type: formData.assessorType,
                    service_areas: formData.serviceAreas
                })
                .eq('id', user?.id);

            if (error) throw error;

            toast.success('Profile completed successfully!');
            // Force reload to update auth context with new profile data
            window.location.href = '/dashboard/contractor';
        } catch (error: any) {
            console.error('Error updating profile:', error);
            toast.error(error.message || 'Failed to update profile');
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
                                    onChange={(e) => setFormData({ ...formData, homeCounty: e.target.value })}
                                >
                                    <option value="">Select County</option>
                                    {COUNTIES.map(c => <option key={c} value={c}>{c}</option>)}
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

                        {/* BOOLEANS */}
                        <div className="space-y-4 pt-4">
                            <div className="flex items-center justify-between border border-gray-300 p-4 rounded-xl bg-white">
                                <div>
                                    <span className="block text-sm font-bold text-gray-900">Professional insurance policy holder</span>
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
                                    <span className="text-sm font-bold text-gray-700 w-8">{formData.insuranceHolder ? 'Yes' : 'No'}</span>
                                </div>
                            </div>

                            <div className="flex items-center justify-between border border-gray-300 p-4 rounded-xl bg-white">
                                <div>
                                    <span className="block text-sm font-bold text-gray-900">VAT Registered</span>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, vatRegistered: !formData.vatRegistered })}
                                        className={`relative inline-flex flex-shrink-0 h-7 w-12 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#007F00] ${formData.vatRegistered ? 'bg-[#007F00]' : 'bg-gray-200'}`}
                                    >
                                        <span className={`pointer-events-none inline-block h-6 w-6 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200 ${formData.vatRegistered ? 'translate-x-5' : 'translate-x-0'}`} />
                                    </button>
                                    <span className="text-sm font-bold text-gray-700 w-8">{formData.vatRegistered ? 'Yes' : 'No'}</span>
                                </div>
                            </div>
                        </div>

                        <div className="pt-6">
                            <label className="block text-sm font-bold text-gray-700 mb-3">Domestic or Commercial</label>
                            <div className="flex items-center space-x-6">
                                <label className="inline-flex items-center cursor-pointer">
                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mr-2 ${formData.assessorType === 'Domestic Assessor' ? 'border-[#007F00]' : 'border-gray-300'}`}>
                                        {formData.assessorType === 'Domestic Assessor' && <div className="w-2.5 h-2.5 rounded-full bg-[#007F00]" />}
                                    </div>
                                    <input
                                        type="radio"
                                        className="hidden"
                                        name="assessorType"
                                        value="Domestic Assessor"
                                        checked={formData.assessorType === 'Domestic Assessor'}
                                        onChange={(e) => setFormData({ ...formData, assessorType: e.target.value })}
                                    />
                                    <span className="text-gray-900 font-medium">Domestic Assessor</span>
                                </label>
                                <label className="inline-flex items-center cursor-pointer">
                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mr-2 ${formData.assessorType === 'Commercial Assessor' ? 'border-[#007F00]' : 'border-gray-300'}`}>
                                        {formData.assessorType === 'Commercial Assessor' && <div className="w-2.5 h-2.5 rounded-full bg-[#007F00]" />}
                                    </div>
                                    <input
                                        type="radio"
                                        className="hidden"
                                        name="assessorType"
                                        value="Commercial Assessor"
                                        checked={formData.assessorType === 'Commercial Assessor'}
                                        onChange={(e) => setFormData({ ...formData, assessorType: e.target.value })}
                                    />
                                    <span className="text-gray-900 font-medium">Commercial Assessor</span>
                                </label>
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
                                {loading ? 'Saving Profile...' : 'Complete Registration'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ContractorOnboarding;
