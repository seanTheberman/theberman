import { useState } from 'react';
import { X, Plus, Home, Briefcase } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import toast from 'react-hot-toast';
import { getTenantFromDomain } from '../../../lib/tenant';

const IRISH_COUNTIES = [
    'Carlow', 'Cavan', 'Clare', 'Cork', 'Donegal', 'Dublin', 'Galway',
    'Kerry', 'Kildare', 'Kilkenny', 'Laois', 'Leitrim', 'Limerick',
    'Longford', 'Louth', 'Mayo', 'Meath', 'Monaghan', 'Offaly',
    'Roscommon', 'Sligo', 'Tipperary', 'Waterford', 'Westmeath',
    'Wexford', 'Wicklow'
];

const PROPERTY_TYPES = ['Semi-Detached', 'Mid-Terrace', 'End-Terrace', 'Apartment', 'Piso', 'Duplex', 'Detached', 'Bungalow', 'Multi-Unit', 'Other'];
const PROPERTY_SIZES = [
    'Under 70 m²', '70 - 90 m²', '90 - 110 m²', '110 - 140 m²', '140 - 160 m²',
    '160 - 185 m²', '185 - 230 m²', '230 - 280 m²', '280 - 370 m²', 'Over 370 m²'
];
const TIME_SLOTS = ['Any time', '8am - 10am', '10am - 2pm', '2pm - 6pm', '6pm - 8pm'];
const ADDITIONAL_FEATURES = ['Attic/Garage conversion', 'Extensions', 'Conservatory', 'Multiple', 'None'];
const HEAT_PUMP_OPTIONS = ['No', 'Air Source', 'Ground Source'];
const BER_PURPOSES = ['Selling', 'Letting', 'Govt Grant', 'Mortgage', 'New Build', 'Personal Interest', 'Other'];
const BUILDING_TYPES = ['Office', 'Retail / Shop', 'Warehouse / Industrial', 'Hospitality', 'Healthcare', 'Education', 'Mixed-Use', 'Other'];
const BUILDING_COMPLEXITY = ['Single unit', 'Multi-unit building', 'Multi-floor building', 'Large complex site'];
const COMMERCIAL_FLOOR_AREAS = [
    'Under 100 m²', '100 - 250 m²', '250 - 500 m²', '500 - 1000 m²',
    '1000 - 2500 m²', '2500 - 5000 m²', '5000 - 10000 m²', 'Over 10000 m²'
];
const EXISTING_DOCS = ['Architectural drawings', 'Mechanical/electrical specs', 'Previous energy report', 'None available'];
const COMMERCIAL_PURPOSES = ['Compliance requirement', 'Selling property', 'Leasing property', 'ESG reporting', 'Grant / funding', 'Energy upgrade planning', 'Other'];
const HEATING_COOLING = ['Gas boiler', 'Oil boiler', 'Heat pump', 'Chillers', 'Air handling units', 'Unknown'];

interface Props {
    onClose: () => void;
    onJobCreated: () => void;
}

export const CreateJobModal = ({ onClose, onJobCreated }: Props) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [jobType, setJobType] = useState<'domestic' | 'commercial' | ''>('');
    const [step, setStep] = useState(1);

    // Contact / Homeowner Details
    const [contactName, setContactName] = useState('');
    const [contactEmail, setContactEmail] = useState('');
    const [contactPhone, setContactPhone] = useState('');

    // Location
    const [county, setCounty] = useState('');
    const [town, setTown] = useState('');
    const [eircode, setEircode] = useState('');

    // Domestic
    const [propertyType, setPropertyType] = useState('');
    const [propertySize, setPropertySize] = useState('');
    const [bedrooms, setBedrooms] = useState('');
    const [additionalFeatures, setAdditionalFeatures] = useState<string[]>([]);
    const [heatPump, setHeatPump] = useState('');
    const [berPurpose, setBerPurpose] = useState('');

    // Commercial
    const [buildingType, setBuildingType] = useState('');
    const [floorArea, setFloorArea] = useState('');
    const [buildingComplexity, setBuildingComplexity] = useState('');
    const [existingDocs, setExistingDocs] = useState<string[]>([]);
    const [assessmentPurpose, setAssessmentPurpose] = useState('');
    const [heatingCooling, setHeatingCooling] = useState<string[]>([]);

    // Shared
    const [preferredDate, setPreferredDate] = useState('');
    const [preferredTime, setPreferredTime] = useState('');
    const [notes, setNotes] = useState('');

    const resetForm = () => {
        setJobType('');
        setStep(1);
        setContactName(''); setContactEmail(''); setContactPhone('');
        setCounty(''); setTown(''); setEircode('');
        setPropertyType(''); setPropertySize(''); setBedrooms('');
        setAdditionalFeatures([]); setHeatPump(''); setBerPurpose('');
        setBuildingType(''); setFloorArea(''); setBuildingComplexity('');
        setExistingDocs([]); setAssessmentPurpose(''); setHeatingCooling([]);
        setPreferredDate(''); setPreferredTime(''); setNotes('');
    };

    const toggleFeature = (feature: string, current: string[], setter: (v: string[]) => void) => {
        if (feature === 'None' || feature === 'None available' || feature === 'Unknown') {
            setter([feature]);
        } else {
            const cleaned = current.filter(f => f !== 'None' && f !== 'None available' && f !== 'Unknown');
            if (cleaned.includes(feature)) {
                setter(cleaned.filter(f => f !== feature));
            } else {
                setter([...cleaned, feature]);
            }
        }
    };

    const handleSubmit = async () => {
        if (!contactName || !contactEmail || !contactPhone || !county || !town) {
            toast.error('Please fill in all required fields');
            return;
        }
        setIsSubmitting(true);
        try {
            const tenant = getTenantFromDomain();
            const basePayload: any = {
                property_address: `${town}, ${county}`,
                town,
                county,
                preferred_date: preferredDate || null,
                preferred_time: preferredTime || null,
                status: 'live',
                contact_name: contactName,
                contact_email: contactEmail,
                contact_phone: contactPhone,
                eircode: eircode || null,
                user_id: null,
                job_type: jobType || 'domestic',
                tenant,
                posted_by: 'admin',
                payer_type: 'homeowner',
                notes: notes || null,
            };

            let insertPayload;
            if (jobType === 'commercial') {
                insertPayload = {
                    ...basePayload,
                    building_type: buildingType || null,
                    floor_area: floorArea || null,
                    building_complexity: buildingComplexity || null,
                    existing_docs: existingDocs.length > 0 ? existingDocs : null,
                    assessment_purpose: assessmentPurpose || null,
                    heating_cooling_systems: heatingCooling.length > 0 ? heatingCooling : null,
                };
            } else {
                insertPayload = {
                    ...basePayload,
                    property_type: propertyType || null,
                    property_size: propertySize || null,
                    bedrooms: bedrooms ? parseInt(bedrooms) : null,
                    additional_features: additionalFeatures.length > 0 ? additionalFeatures : null,
                    heat_pump: heatPump || null,
                    ber_purpose: berPurpose || null,
                };
            }

            const { data, error } = await supabase
                .from('assessments')
                .insert(insertPayload)
                .select()
                .single();

            if (error) throw error;

            // Notify assessors
            try {
                await supabase.functions.invoke('send-job-live-email', {
                    body: {
                        email: contactEmail,
                        customerName: contactName,
                        county,
                        town,
                        assessmentId: data.id,
                        jobType: jobType || 'domestic',
                        customerPhone: contactPhone,
                        tenant,
                    }
                });
            } catch (emailErr) {
                console.error('Failed to send notification:', emailErr);
            }

            toast.success('Job created and assessors notified!');
            resetForm();
            onJobCreated();
            onClose();
        } catch (error: any) {
            console.error('Error creating job:', error);
            toast.error(error.message || 'Failed to create job');
        } finally {
            setIsSubmitting(false);
        }
    };

    const isStepValid = () => {
        if (step === 1) return !!jobType;
        if (step === 2) return !!contactName && !!contactEmail && !!contactPhone;
        if (step === 3) return !!county && !!town;
        if (jobType === 'domestic') {
            if (step === 4) return !!propertyType && !!propertySize && !!bedrooms;
            if (step === 5) return !!berPurpose;
        }
        if (jobType === 'commercial') {
            if (step === 4) return !!buildingType && !!floorArea && !!buildingComplexity;
            if (step === 5) return !!assessmentPurpose;
        }
        return true;
    };

    const totalSteps = jobType === 'commercial' ? 6 : 6;

    return (
        <div className="fixed inset-0 z-[10001] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
                <div className="bg-gradient-to-r from-[#007F00] to-green-600 p-6 flex justify-between items-center shrink-0">
                    <div>
                        <h2 className="text-xl font-bold text-white">Create Job for Homeowner</h2>
                        <p className="text-green-100 text-sm mt-1">Register a job on behalf of a homeowner</p>
                    </div>
                    <button onClick={onClose} className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors">
                        <X size={22} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    {/* Step 1: Job Type */}
                    {step === 1 && (
                        <div className="space-y-4">
                            <h3 className="text-lg font-bold text-gray-800">What type of job?</h3>
                            <div className="grid grid-cols-2 gap-3">
                                <button onClick={() => setJobType('domestic')} className={`p-4 rounded-xl border-2 text-left transition-all ${jobType === 'domestic' ? 'border-[#007F00] bg-green-50' : 'border-gray-200 hover:border-green-300'}`}>
                                    <Home size={24} className="text-[#007F00] mb-2" />
                                    <div className="font-bold text-gray-900">Domestic</div>
                                    <div className="text-xs text-gray-500">Residential property</div>
                                </button>
                                <button onClick={() => setJobType('commercial')} className={`p-4 rounded-xl border-2 text-left transition-all ${jobType === 'commercial' ? 'border-[#007F00] bg-green-50' : 'border-gray-200 hover:border-green-300'}`}>
                                    <Briefcase size={24} className="text-[#007F00] mb-2" />
                                    <div className="font-bold text-gray-900">Commercial</div>
                                    <div className="text-xs text-gray-500">Business property</div>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Contact Details */}
                    {step === 2 && (
                        <div className="space-y-4">
                            <h3 className="text-lg font-bold text-gray-800">Homeowner Contact Details</h3>
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                                    <input value={contactName} onChange={e => setContactName(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#007F00]" placeholder="John Smith" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                                    <input type="email" value={contactEmail} onChange={e => setContactEmail(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#007F00]" placeholder="john@example.com" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                                    <input value={contactPhone} onChange={e => setContactPhone(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#007F00]" placeholder="+353 85 123 4567" />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Location */}
                    {step === 3 && (
                        <div className="space-y-4">
                            <h3 className="text-lg font-bold text-gray-800">Property Location</h3>
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">County *</label>
                                    <select value={county} onChange={e => setCounty(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#007F00]">
                                        <option value="">Select county</option>
                                        {IRISH_COUNTIES.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Town *</label>
                                    <input value={town} onChange={e => setTown(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#007F00]" placeholder="e.g. Dundrum" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Eircode / Postcode</label>
                                    <input value={eircode} onChange={e => setEircode(e.target.value.toUpperCase())} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#007F00]" placeholder="e.g. D14 AB12" />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 4: Property Details */}
                    {step === 4 && jobType === 'domestic' && (
                        <div className="space-y-4">
                            <h3 className="text-lg font-bold text-gray-800">Property Details</h3>
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Property Type</label>
                                    <select value={propertyType} onChange={e => setPropertyType(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#007F00]">
                                        <option value="">Select type</option>
                                        {PROPERTY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Property Size</label>
                                    <select value={propertySize} onChange={e => setPropertySize(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#007F00]">
                                        <option value="">Select size</option>
                                        {PROPERTY_SIZES.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Bedrooms</label>
                                    <select value={bedrooms} onChange={e => setBedrooms(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#007F00]">
                                        <option value="">Select</option>
                                        {[1,2,3,4,5,6,7,8].map(n => <option key={n} value={n}>{n}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Additional Features</label>
                                    <div className="flex flex-wrap gap-2">
                                        {ADDITIONAL_FEATURES.map(f => (
                                            <button key={f} onClick={() => toggleFeature(f, additionalFeatures, setAdditionalFeatures)} className={`px-3 py-1.5 rounded-lg text-sm border transition-all ${additionalFeatures.includes(f) ? 'bg-green-100 border-[#007F00] text-[#007F00] font-medium' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>{f}</button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Heat Pump</label>
                                    <select value={heatPump} onChange={e => setHeatPump(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#007F00]">
                                        <option value="">Select</option>
                                        {HEAT_PUMP_OPTIONS.map(h => <option key={h} value={h}>{h}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 4 && jobType === 'commercial' && (
                        <div className="space-y-4">
                            <h3 className="text-lg font-bold text-gray-800">Building Details</h3>
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Building Type</label>
                                    <select value={buildingType} onChange={e => setBuildingType(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#007F00]">
                                        <option value="">Select type</option>
                                        {BUILDING_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Floor Area</label>
                                    <select value={floorArea} onChange={e => setFloorArea(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#007F00]">
                                        <option value="">Select area</option>
                                        {COMMERCIAL_FLOOR_AREAS.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Building Complexity</label>
                                    <select value={buildingComplexity} onChange={e => setBuildingComplexity(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#007F00]">
                                        <option value="">Select</option>
                                        {BUILDING_COMPLEXITY.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Existing Docs</label>
                                    <div className="flex flex-wrap gap-2">
                                        {EXISTING_DOCS.map(f => (
                                            <button key={f} onClick={() => toggleFeature(f, existingDocs, setExistingDocs)} className={`px-3 py-1.5 rounded-lg text-sm border transition-all ${existingDocs.includes(f) ? 'bg-green-100 border-[#007F00] text-[#007F00] font-medium' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>{f}</button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Heating / Cooling</label>
                                    <div className="flex flex-wrap gap-2">
                                        {HEATING_COOLING.map(f => (
                                            <button key={f} onClick={() => toggleFeature(f, heatingCooling, setHeatingCooling)} className={`px-3 py-1.5 rounded-lg text-sm border transition-all ${heatingCooling.includes(f) ? 'bg-green-100 border-[#007F00] text-[#007F00] font-medium' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>{f}</button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 5: Purpose & Schedule */}
                    {step === 5 && (
                        <div className="space-y-4">
                            <h3 className="text-lg font-bold text-gray-800">Purpose & Schedule</h3>
                            <div className="space-y-3">
                                {jobType === 'domestic' && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">BER Purpose</label>
                                        <select value={berPurpose} onChange={e => setBerPurpose(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#007F00]">
                                            <option value="">Select purpose</option>
                                            {BER_PURPOSES.map(p => <option key={p} value={p}>{p}</option>)}
                                        </select>
                                    </div>
                                )}
                                {jobType === 'commercial' && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Assessment Purpose</label>
                                        <select value={assessmentPurpose} onChange={e => setAssessmentPurpose(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#007F00]">
                                            <option value="">Select purpose</option>
                                            {COMMERCIAL_PURPOSES.map(p => <option key={p} value={p}>{p}</option>)}
                                        </select>
                                    </div>
                                )}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Date</label>
                                    <input type="date" value={preferredDate} onChange={e => setPreferredDate(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#007F00]" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Time</label>
                                    <select value={preferredTime} onChange={e => setPreferredTime(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#007F00]">
                                        <option value="">Select time</option>
                                        {TIME_SLOTS.map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 6: Notes */}
                    {step === 6 && (
                        <div className="space-y-4">
                            <h3 className="text-lg font-bold text-gray-800">Additional Notes</h3>
                            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={5} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#007F00]" placeholder="Any special instructions or notes for assessors..." />
                            <div className="bg-blue-50 p-4 rounded-xl">
                                <h4 className="font-bold text-gray-800 mb-2">Summary</h4>
                                <div className="text-sm text-gray-600 space-y-1">
                                    <p><strong>Type:</strong> {jobType || 'N/A'}</p>
                                    <p><strong>Contact:</strong> {contactName} — {contactEmail} — {contactPhone}</p>
                                    <p><strong>Location:</strong> {town}, {county} {eircode && `(${eircode})`}</p>
                                    {jobType === 'domestic' && <p><strong>Property:</strong> {propertyType}, {propertySize}, {bedrooms} bed</p>}
                                    {jobType === 'commercial' && <p><strong>Building:</strong> {buildingType}, {floorArea}</p>}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="border-t border-gray-100 p-4 flex justify-between items-center shrink-0 bg-gray-50">
                    <div className="flex gap-2">
                        {step > 1 && (
                            <button onClick={() => setStep(s => s - 1)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-all">
                                Back
                            </button>
                        )}
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-xs text-gray-400 font-medium">Step {step} of {totalSteps}</span>
                        {step < totalSteps ? (
                            <button onClick={() => isStepValid() && setStep(s => s + 1)} disabled={!isStepValid()} className="px-5 py-2 bg-[#007F00] text-white rounded-lg text-sm font-bold hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
                                Next
                            </button>
                        ) : (
                            <button onClick={handleSubmit} disabled={isSubmitting} className="px-5 py-2 bg-[#007F00] text-white rounded-lg text-sm font-bold hover:bg-green-700 disabled:opacity-50 transition-all flex items-center gap-2">
                                {isSubmitting ? 'Creating...' : <><Plus size={16} /> Create Job</>}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
