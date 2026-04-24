import { useState } from 'react';
import { ChevronRight, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { useTranslation } from '../hooks/useTranslation';
import { getTenantFromDomain } from '../lib/tenant';
import EmailVerification from './EmailVerification';
import IdentityAuth from './IdentityAuth';
import JobConfirmation from './JobConfirmation';
import { TOWNS_BY_COUNTY } from '../data/irishTowns';

// Irish Counties
const COUNTIES = [
    'Carlow', 'Cavan', 'Clare', 'Cork', 'Donegal', 'Dublin', 'Galway', 'Kerry',
    'Kildare', 'Kilkenny', 'Laois', 'Leitrim', 'Limerick', 'Longford', 'Louth',
    'Mayo', 'Meath', 'Monaghan', 'Offaly', 'Roscommon', 'Sligo', 'Tipperary',
    'Waterford', 'Westmeath', 'Wexford', 'Wicklow'
];

const ROUTING_KEYS: Record<string, string> = {
    'Carlow': 'R93', 'Cavan': 'H12', 'Clare': 'V95', 'Cork': 'T12', 'Donegal': 'F92',
    'Dublin': 'D', 'Galway': 'H91', 'Kerry': 'V92', 'Kildare': 'W91', 'Kilkenny': 'R95',
    'Laois': 'R32', 'Leitrim': 'N41', 'Limerick': 'V94', 'Longford': 'N39', 'Louth': 'A91',
    'Mayo': 'F23', 'Meath': 'C15', 'Monaghan': 'H18', 'Offaly': 'R35', 'Roscommon': 'F42',
    'Sligo': 'F91', 'Tipperary': 'E21', 'Waterford': 'X91', 'Westmeath': 'N37', 'Wexford': 'Y35',
    'Wicklow': 'A63'
};

// --- Domestic options ---
const PROPERTY_TYPES = ['Semi-Detached', 'Mid-Terrace', 'End-Terrace', 'Apartment', 'Duplex', 'Detached', 'Bungalow', 'Multi-Unit', 'Other'];
const PROPERTY_SIZES = [
    'Under 750 sq.ft',
    '750 - 1000 sq.ft',
    '1000 - 1250 sq.ft',
    '1250 - 1500 sq.ft',
    '1500 - 1750 sq.ft',
    '1750 - 2000 sq.ft',
    '2000 - 2500 sq.ft',
    '2500 - 3000 sq.ft',
    '3000 - 4000 sq.ft',
    'Over 4000 sq.ft'
];

const PROPERTY_SIZES_METRIC = [
    'Under 70 m²',
    '70 - 90 m²',
    '90 - 110 m²',
    '110 - 140 m²',
    '140 - 160 m²',
    '160 - 185 m²',
    '185 - 230 m²',
    '230 - 280 m²',
    '280 - 370 m²',
    'Over 370 m²'
];
const TIME_SLOTS = ['Any time', '8am - 10am', '10am - 2pm', '2pm - 6pm', '6pm - 8pm'];
const ADDITIONAL_FEATURES = ['Attic/Garage conversion', 'Extensions', 'Conservatory', 'Multiple', 'None'];
const HEAT_PUMP_OPTIONS = ['No', 'Air Source', 'Ground Source'];
const BER_PURPOSES = ['Selling', 'Letting', 'Govt Grant', 'Mortgage', 'New Build', 'Personal Interest', 'Other'];

// --- Commercial options ---
const BUILDING_TYPES = ['Office', 'Retail / Shop', 'Warehouse / Industrial', 'Hospitality', 'Healthcare', 'Education', 'Mixed-Use', 'Other'];
const BUILDING_COMPLEXITY_OPTIONS = ['Single unit', 'Multi-unit building', 'Multi-floor building', 'Large complex site'];
const EXISTING_DOCS_OPTIONS = ['Architectural drawings', 'Mechanical/electrical specs', 'Previous energy report', 'None available'];
const COMMERCIAL_PURPOSES = ['Compliance requirement', 'Selling property', 'Leasing property', 'ESG reporting', 'Grant / funding', 'Energy upgrade planning', 'Other'];
const HEATING_COOLING_OPTIONS = ['Gas boiler', 'Oil boiler', 'Heat pump', 'Chillers', 'Air handling units', 'Unknown'];

// --- Commercial Floor Area options ---
const COMMERCIAL_FLOOR_AREAS_METRIC = [
    'Under 100 m²',
    '100 - 250 m²',
    '250 - 500 m²',
    '500 - 1000 m²',
    '1000 - 2500 m²',
    '2500 - 5000 m²',
    '5000 - 10000 m²',
    'Over 10000 m²'
];
const COMMERCIAL_FLOOR_AREAS_IMPERIAL = [
    'Under 1,076 sq.ft',
    '1,076 - 2,690 sq.ft',
    '2,690 - 5,382 sq.ft',
    '5,382 - 10,764 sq.ft',
    '10,764 - 26,910 sq.ft',
    '26,910 - 53,820 sq.ft',
    '53,820 - 107,639 sq.ft',
    'Over 107,639 sq.ft'
];

interface FormData {
    // Shared
    jobType: 'domestic' | 'commercial' | '';
    preferredDate: string;
    preferredTime: string;
    county: string;
    town: string;
    fullName: string;
    email: string;
    phone: string;
    eircode: string;
    notes: string;
    // Domestic-specific
    propertyType: string;
    propertySize: string;
    bedrooms: string;
    additionalFeatures: string[];
    heatPump: string;
    berPurpose: string;
    // Commercial-specific
    buildingType: string;
    floorArea: string;
    buildingComplexity: string;
    existingDocs: string[];
    assessmentPurpose: string;
    heatingCoolingSystems: string[];
}

interface QuoteFormModuleProps {
    onClose?: () => void;
}

const QuoteFormModule = ({ onClose }: QuoteFormModuleProps) => {
    const { user } = useAuth();
    const { t, o, isSpanish } = useTranslation();
    const [currentStep, setCurrentStep] = useState(0); // Start at step 0 (Job Type)
    const [sizeUnit, setSizeUnit] = useState<'ft' | 'm'>('m'); // Default to m²
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [assessmentId, setAssessmentId] = useState<string | null>(null);
    const [emailError, _setEmailError] = useState<string | null>(null);

    const [formData, setFormData] = useState<FormData>({
        jobType: '',
        preferredDate: '',
        preferredTime: '',
        county: '',
        town: '',
        fullName: user?.user_metadata?.full_name || '',
        email: user?.email || '',
        phone: '',
        eircode: '',
        notes: '',
        // Domestic
        propertyType: '',
        propertySize: '',
        bedrooms: '',
        additionalFeatures: [],
        heatPump: '',
        berPurpose: '',
        // Commercial
        buildingType: '',
        floorArea: '',
        buildingComplexity: '',
        existingDocs: [],
        assessmentPurpose: '',
        heatingCoolingSystems: [],
    });

    const isDomestic = formData.jobType === 'domestic';
    const isCommercial = formData.jobType === 'commercial';

    // Total form steps (excluding auth steps):
    // Domestic: 0 (job type) + 1-11 (form) = 12 steps (0..11)
    // Commercial: 0 (job type) + 1-11 (form) = 12 steps (0..11)
    const TOTAL_FORM_STEPS = 12; // 0..11
    const LAST_FORM_STEP = 11;

    const updateField = (field: keyof FormData, value: string | string[]) => {
        setFormData((prev: FormData) => {
            const newData = { ...prev, [field]: value };
            if (field === 'county' && typeof value === 'string' && !prev.eircode && !isSpanish) {
                newData.eircode = (ROUTING_KEYS[value] || '').replace(/\s/g, '');
            }
            return newData;
        });
    };

    const updateFieldAndAdvance = (field: keyof FormData, value: string | string[]) => {
        setFormData((prev: FormData) => {
            const newData = { ...prev, [field]: value };
            if (field === 'county' && typeof value === 'string' && !prev.eircode && !isSpanish) {
                newData.eircode = (ROUTING_KEYS[value] || '').replace(/\s/g, '');
            }
            return newData;
        });
        setCurrentStep(prev => prev + 1);
    };

    // Domestic: toggle additional features
    const toggleFeature = (feature: string) => {
        if (feature === 'None') {
            setFormData((prev: FormData) => ({ ...prev, additionalFeatures: ['None'] }));
            setTimeout(() => setCurrentStep(prev => prev + 1), 150);
        } else {
            setFormData((prev: FormData) => {
                const current = prev.additionalFeatures.filter((f: string) => f !== 'None');
                if (current.includes(feature)) {
                    return { ...prev, additionalFeatures: current.filter((f: string) => f !== feature) };
                } else {
                    return { ...prev, additionalFeatures: [...current, feature] };
                }
            });
        }
    };

    // Commercial: toggle existing docs
    const toggleExistingDoc = (doc: string) => {
        if (doc === 'None available') {
            setFormData((prev: FormData) => ({ ...prev, existingDocs: ['None available'] }));
            setTimeout(() => setCurrentStep(prev => prev + 1), 150);
        } else {
            setFormData((prev: FormData) => {
                const current = prev.existingDocs.filter((d: string) => d !== 'None available');
                if (current.includes(doc)) {
                    return { ...prev, existingDocs: current.filter((d: string) => d !== doc) };
                } else {
                    return { ...prev, existingDocs: [...current, doc] };
                }
            });
        }
    };

    // Commercial: toggle heating/cooling systems
    const toggleHeatingCooling = (system: string) => {
        if (system === 'Unknown') {
            setFormData((prev: FormData) => ({ ...prev, heatingCoolingSystems: ['Unknown'] }));
            setTimeout(() => setCurrentStep(prev => prev + 1), 150);
        } else {
            setFormData((prev: FormData) => {
                const current = prev.heatingCoolingSystems.filter((s: string) => s !== 'Unknown');
                if (current.includes(system)) {
                    return { ...prev, heatingCoolingSystems: current.filter((s: string) => s !== system) };
                } else {
                    return { ...prev, heatingCoolingSystems: [...current, system] };
                }
            });
        }
    };

    const canProceed = (): boolean => {
        if (currentStep === 0) return !!formData.jobType;

        if (isDomestic) {
            switch (currentStep) {
                case 1: return !!formData.preferredDate;
                case 2: return !!formData.preferredTime;
                case 3: return !!formData.propertyType;
                case 4: return !!formData.propertySize;
                case 5: return !!formData.bedrooms;
                case 6: return formData.additionalFeatures.length > 0;
                case 7: return !!formData.heatPump;
                case 8: return !!formData.county;
                case 9: return !!formData.town;
                case 10: return !!formData.berPurpose;
                case 11: {
                    const key = ROUTING_KEYS[formData.county];
                    const cleanEircode = formData.eircode.replace(/\s/g, '');
                    const eircodeValid = isSpanish
                        ? cleanEircode.length >= 5
                        : cleanEircode.length >= 7 && (!key || cleanEircode.startsWith(key));
                    return !!formData.fullName && !!formData.email && !!formData.phone && eircodeValid;
                }
                case 12: return true;
                case 13: return true;
                default: return false;
            }
        }

        if (isCommercial) {
            switch (currentStep) {
                case 1: return !!formData.preferredDate;
                case 2: return !!formData.preferredTime;
                case 3: return !!formData.buildingType;
                case 4: return !!formData.floorArea;
                case 5: return !!formData.buildingComplexity;
                case 6: return formData.existingDocs.length > 0;
                case 7: return !!formData.assessmentPurpose;
                case 8: return formData.heatingCoolingSystems.length > 0;
                case 9: return !!formData.county;
                case 10: return !!formData.town;
                case 11: {
                    const key = ROUTING_KEYS[formData.county];
                    const cleanEircode = formData.eircode.replace(/\s/g, '');
                    const eircodeValid = isSpanish
                        ? cleanEircode.length >= 5
                        : cleanEircode.length >= 7 && (!key || cleanEircode.startsWith(key));
                    return !!formData.fullName && !!formData.email && !!formData.phone && eircodeValid;
                }
                case 12: return true;
                case 13: return true;
                default: return false;
            }
        }

        return false;
    };

    const handleNext = () => {
        if (currentStep < LAST_FORM_STEP && canProceed()) {
            setCurrentStep((prev: number) => prev + 1);
        } else if (currentStep === LAST_FORM_STEP) {
            handleSubmit();
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep((prev: number) => prev - 1);
        }
    };

    const handleSubmit = async () => {
        if (!canProceed()) return;
        if (user) {
            handleFinalSubmission();
        } else {
            setCurrentStep(12);
        }
    };

    const handleEmailVerified = () => {
        setCurrentStep(13);
    };

    const handleAuthenticated = () => {
        handleFinalSubmission();
    };

    const handleFinalSubmission = async () => {
        setIsSubmitting(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const currentUserId = session?.user?.id || user?.id;

            const lastReferralStr = localStorage.getItem('last_referral');
            let referredByListingId = null;

            if (lastReferralStr) {
                try {
                    const referralData = JSON.parse(lastReferralStr);
                    const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;
                    if (Date.now() - referralData.timestamp < THIRTY_DAYS) {
                        referredByListingId = referralData.listingId;
                    }
                } catch (e) {
                    console.error('Error parsing referral data:', e);
                }
            }

            // Build the insert payload based on job type
            const basePayload = {
                property_address: `${formData.town}, ${formData.county}`,
                town: formData.town,
                county: formData.county,
                preferred_date: formData.preferredDate === 'Flexible' ? null : formData.preferredDate,
                preferred_time: formData.preferredDate === 'Flexible' ? `${formData.preferredTime} (Flexible)` : formData.preferredTime,
                status: 'submitted',
                contact_name: formData.fullName,
                contact_email: formData.email,
                contact_phone: formData.phone,
                eircode: formData.eircode,
                user_id: currentUserId,
                referred_by_listing_id: referredByListingId,
                job_type: formData.jobType,
                seai_fee: 25,
                platform_fee: 45, // €25 visible to customer + €20 hidden margin
                contractor_payout: 60, // What contractor receives
            };

            let insertPayload;

            if (isDomestic) {
                insertPayload = {
                    ...basePayload,
                    property_type: formData.propertyType,
                    property_size: formData.propertySize,
                    bedrooms: parseInt(formData.bedrooms),
                    additional_features: formData.additionalFeatures,
                    heat_pump: formData.heatPump,
                    ber_purpose: formData.berPurpose,
                };
            } else {
                insertPayload = {
                    ...basePayload,
                    building_type: formData.buildingType,
                    floor_area: formData.floorArea,
                    building_complexity: formData.buildingComplexity,
                    existing_docs: formData.existingDocs,
                    assessment_purpose: formData.assessmentPurpose,
                    heating_cooling_systems: formData.heatingCoolingSystems,
                    notes: formData.notes,
                };
            }

            const tenant = getTenantFromDomain();
            const payloadWithTenant = { ...insertPayload, tenant };

            const { data, error: dbError } = await supabase
                .from('assessments')
                .insert(payloadWithTenant)
                .select()
                .single();

            if (dbError) throw dbError;

            const newAssessmentId = data.id;
            setAssessmentId(newAssessmentId);

            // Set status to live immediately and send notifications to contractors
            const { error: updateError } = await supabase
                .from('assessments')
                .update({ status: 'live' })
                .eq('id', newAssessmentId);

            if (updateError) {
                console.error('Failed to set assessment to live:', updateError);
            }

            // Send email notifications to contractors
            try {
                await supabase.functions.invoke('send-job-live-email', {
                    body: {
                        email: formData.email,
                        customerName: formData.fullName,
                        county: formData.county,
                        town: formData.town,
                        assessmentId: newAssessmentId,
                        jobType: formData.jobType,
                        tenant
                    }
                });
            } catch (emailErr) {
                console.error('Failed to send job live email:', emailErr);
                toast.error(t('email_notify_failed', 'Email notification failed but job is live'));
            }

            toast.success(t('quotes_requested', 'Quotes requested successfully!'));
            setCurrentStep(14);

        } catch (error: any) {
            console.error('Error finalising quote:', error);
            toast.error(error.message || t('submit_failed', 'Failed to submit details.'));
        } finally {
            setIsSubmitting(false);
        }
    };

    const getOrdinalSuffix = (day: number) => {
        if (day > 3 && day < 21) return 'th';
        switch (day % 10) {
            case 1: return 'st';
            case 2: return 'nd';
            case 3: return 'rd';
            default: return 'th';
        }
    };

    const generateCalendarDates = () => {
        const today = new Date();
        const dates = [];
        for (let i = 0; i < 15; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            dates.push(date);
        }
        return dates;
    };

    const formatDate = (date: Date) => date.toISOString().split('T')[0];
    const formatDateDisplay = (date: Date) => {
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const day = date.getDate();
        return `${days[date.getDay()]} ${day}${getOrdinalSuffix(day)} ${months[date.getMonth()]}`;
    };

    // ========== RENDER HELPERS ==========

    const renderDateStep = () => (
        <div className="space-y-6">
            <h2 className="text-3xl md:text-4xl font-light text-gray-800 text-center">{t('preferred_date')}</h2>
            <p className="text-gray-500 text-center text-sm md:text-base -mt-4">
                {t('flexible_note', "Not sure yet? Just select")} <span className="italic font-medium text-gray-700">{t('flexible', "I'm Flexible")}.</span>
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 max-w-5xl mx-auto overflow-y-auto max-h-[50vh] p-2 custom-scrollbar">
                <button
                    onClick={() => updateFieldAndAdvance('preferredDate', 'Flexible')}
                    className={`p-4 rounded-xl border-2 transition-all font-bold text-sm ${formData.preferredDate === 'Flexible' ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 hover:border-green-300 bg-white text-gray-600'}`}
                >
                    {t('flexible', "I'm Flexible")}
                </button>
                {generateCalendarDates().map((date) => (
                    <button
                        key={formatDate(date)}
                        onClick={() => updateFieldAndAdvance('preferredDate', formatDate(date))}
                        className={`p-4 rounded-xl border-2 transition-all ${formData.preferredDate === formatDate(date) ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 hover:border-green-300 bg-white text-gray-600'}`}
                    >
                        <span className="block text-sm font-medium">{formatDateDisplay(date)}</span>
                    </button>
                ))}
            </div>
        </div>
    );

    const renderTimeStep = () => (
        <div className="space-y-6">
            <h2 className="text-3xl md:text-4xl font-light text-gray-800 text-center">{t('preferred_time')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 max-w-3xl mx-auto">
                {TIME_SLOTS.map((time) => (
                    <button
                        key={time}
                        onClick={() => updateFieldAndAdvance('preferredTime', time)}
                        className={`p-4 rounded-lg border-2 transition-all text-center ${formData.preferredTime === time ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 hover:border-green-300 bg-white'}`}
                    >{time}</button>
                ))}
            </div>
        </div>
    );

    const renderCountyStep = () => (
        <div className="space-y-6">
            <h2 className="text-3xl md:text-4xl font-light text-gray-800 text-center">{t('county')}?</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-w-4xl mx-auto max-h-[60vh] overflow-y-auto p-2 custom-scrollbar">
                {COUNTIES.map((county) => (
                    <button
                        key={county}
                        onClick={() => { updateField('county', county); updateField('town', ''); setCurrentStep(prev => prev + 1); }}
                        className={`p-4 rounded-xl border-2 transition-all font-bold text-lg ${formData.county === county ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 hover:border-green-300 bg-white text-gray-600'}`}
                    >
                        {county}
                    </button>
                ))}
            </div>
            <p className="text-center text-gray-400 text-sm mt-4">{t('scroll_counties', 'Scroll to see more counties')}</p>
        </div>
    );

    const renderTownStep = () => (
        <div className="space-y-6">
            <h2 className="text-3xl md:text-4xl font-light text-gray-800 text-center">{t('town')} / {t('eircode')}?</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-w-4xl mx-auto max-h-[60vh] overflow-y-auto p-2 custom-scrollbar">
                {(TOWNS_BY_COUNTY[formData.county] || []).map((town) => (
                    <button
                        key={town}
                        onClick={() => updateFieldAndAdvance('town', town)}
                        className={`p-4 rounded-xl border-2 transition-all font-bold text-lg ${formData.town === town ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 hover:border-green-300 bg-white text-gray-600'}`}
                    >
                        {town}
                    </button>
                ))}
            </div>
            <p className="text-center text-gray-400 text-sm mt-4">{t('scroll_towns', 'Scroll to see more towns')}</p>
        </div>
    );

    const renderContactStep = () => (
        <div className="space-y-6">
            <h2 className="text-3xl md:text-4xl font-light text-gray-800 text-center italic">{t('contact_details', 'Contact Details')}</h2>
            <div className="max-w-lg mx-auto space-y-4">
                <input type="text" value={formData.fullName} onChange={(e) => updateField('fullName', e.target.value)} placeholder={`${t('full_name')}*`} className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-green-500" />
                <input type="email" value={formData.email} onChange={(e) => updateField('email', e.target.value)} placeholder={`${t('email_address')}*`} className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-green-500" />
                <div className="grid grid-cols-2 gap-4">
                    <div className="flex">
                        <span className="flex items-center px-3 border-2 border-r-0 border-gray-200 rounded-l-xl text-sm font-bold text-gray-500 bg-gray-50 whitespace-nowrap">
                            {isSpanish ? '+34' : '+353'}
                        </span>
                        <input type="tel" value={formData.phone} onChange={(e) => updateField('phone', e.target.value)} placeholder={`${t('phone_number')}*`} className="flex-1 p-4 border-2 border-l-0 border-gray-200 rounded-r-xl focus:border-green-500 focus:outline-none" />
                    </div>
                    <div className="space-y-1">
                        <input type="text" value={formData.eircode} onChange={(e) => updateField('eircode', e.target.value.toUpperCase())} placeholder={`${t('eircode')}*`} className={`w-full p-4 border-2 rounded-xl focus:border-green-500 ${!isSpanish && formData.eircode && formData.eircode.replace(/\s/g, '').length >= 7 && ROUTING_KEYS[formData.county] && !formData.eircode.replace(/\s/g, '').startsWith(ROUTING_KEYS[formData.county]) ? 'border-red-300 bg-red-50' : 'border-gray-200'}`} />
                        {!isSpanish && formData.county && ROUTING_KEYS[formData.county] && (
                            <p className={`text-[10px] font-bold px-1 uppercase tracking-wide ${formData.eircode.replace(/\s/g, '').startsWith(ROUTING_KEYS[formData.county]) ? 'text-green-600' : 'text-amber-600'}`}>
                                Required: Must start with {ROUTING_KEYS[formData.county]}
                            </p>
                        )}
                    </div>
                </div>
                {isCommercial && (
                    <textarea
                        value={formData.notes}
                        onChange={(e) => updateField('notes', e.target.value)}
                        placeholder={t('notes', 'Additional notes (optional)')}
                        rows={3}
                        className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-green-500 resize-none"
                    />
                )}
            </div>
        </div>
    );

    // ========== STEP CONTENT RENDERER ==========

    const renderStepContent = () => {
        // Step 0: Job Type Selection
        if (currentStep === 0) {
            return (
                <div className="space-y-6">
                    <h2 className="text-3xl md:text-4xl font-light text-gray-800 text-center">{t('assessment_type')}</h2>
                    <p className="text-gray-500 text-center text-sm md:text-base -mt-4">
                        {t('choose_property_type_desc', 'Choose the type of property you need assessed.')}
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
                        <button
                            onClick={() => updateFieldAndAdvance('jobType', 'domestic')}
                            className={`p-8 rounded-2xl border-2 transition-all text-center group hover:shadow-lg ${formData.jobType === 'domestic' ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-green-300 bg-white'}`}
                        >
                            <div className="text-4xl mb-4"></div>
                            <h3 className={`text-xl font-bold mb-2 ${formData.jobType === 'domestic' ? 'text-green-700' : 'text-gray-800'}`}>{t('domestic')} (BER)</h3>
                            <p className="text-sm text-gray-500">{t('domestic_desc', 'Houses, apartments, duplexes & other residential properties')}</p>
                        </button>
                        <button
                            onClick={() => updateFieldAndAdvance('jobType', 'commercial')}
                            className={`p-8 rounded-2xl border-2 transition-all text-center group hover:shadow-lg ${formData.jobType === 'commercial' ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-green-300 bg-white'}`}
                        >
                            <div className="text-4xl mb-4"></div>
                            <h3 className={`text-xl font-bold mb-2 ${formData.jobType === 'commercial' ? 'text-green-700' : 'text-gray-800'}`}>{t('commercial')} (No-vivienda)</h3>
                            <p className="text-sm text-gray-500">{t('commercial_desc', 'Offices, retail, warehouses, hospitality & other commercial buildings')}</p>
                        </button>
                    </div>
                </div>
            );
        }

        // ---------- DOMESTIC FLOW ----------
        if (isDomestic) {
            switch (currentStep) {
                case 1: return renderDateStep();
                case 2: return renderTimeStep();
                case 3:
                    return (
                        <div className="space-y-6">
                            <h2 className="text-3xl md:text-4xl font-light text-gray-800 text-center">{t('property_type')}?</h2>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
                                {PROPERTY_TYPES.map((type) => (
                                    <button key={type} onClick={() => updateFieldAndAdvance('propertyType', type)}
                                        className={`p-4 rounded-lg border-2 transition-all text-center ${formData.propertyType === type ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 hover:border-green-300 bg-white'}`}
                                    >{o(type)}</button>
                                ))}
                            </div>
                        </div>
                    );
                case 4:
                    return (
                        <div className="space-y-6">
                            <h2 className="text-3xl md:text-4xl font-light text-gray-800 text-center">{t('property_size')}?</h2>
                            <div className="flex justify-center mb-6">
                                <div className="inline-flex p-1 bg-gray-100 rounded-xl">
                                    <button
                                        onClick={() => setSizeUnit('m')}
                                        className={`px-6 py-2 rounded-lg font-bold transition-all ${sizeUnit === 'm' ? 'bg-white text-green-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                    >{o('Sq. Meters')}</button>
                                    <button
                                        onClick={() => setSizeUnit('ft')}
                                        className={`px-6 py-2 rounded-lg font-bold transition-all ${sizeUnit === 'ft' ? 'bg-white text-green-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                    >{o('Sq. Feet')}</button>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 max-w-2xl mx-auto">
                                {(sizeUnit === 'ft' ? PROPERTY_SIZES : PROPERTY_SIZES_METRIC).map((size) => (
                                    <button key={size} onClick={() => updateFieldAndAdvance('propertySize', size)}
                                        className={`p-4 rounded-lg border-2 transition-all text-center ${formData.propertySize === size ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 hover:border-green-300 bg-white'}`}
                                    >{size}</button>
                                ))}
                            </div>
                        </div>
                    );
                case 5:
                    return (
                        <div className="space-y-6">
                            <h2 className="text-3xl md:text-4xl font-light text-gray-800 text-center">{t('number_of_bedrooms')}?</h2>
                            <div className="flex justify-center gap-4 flex-wrap max-w-xl mx-auto">
                                {['1', '2', '3', '4', '5', '6'].map((num) => (
                                    <button key={num} onClick={() => updateFieldAndAdvance('bedrooms', num)}
                                        className={`w-16 h-16 rounded-full border-2 transition-all text-xl font-medium ${formData.bedrooms === num ? 'border-green-500 bg-green-500 text-white' : 'border-gray-200 hover:border-green-300 bg-white text-gray-700'}`}
                                    >{num}</button>
                                ))}
                            </div>
                        </div>
                    );
                case 6:
                    return (
                        <div className="space-y-6">
                            <h2 className="text-3xl md:text-4xl font-light text-gray-800 text-center">{t('additional_features')}?</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-xl mx-auto">
                                {ADDITIONAL_FEATURES.map((feature) => (
                                    <button key={feature} onClick={() => toggleFeature(feature)}
                                        className={`p-4 rounded-lg border-2 transition-all text-center flex items-center justify-between ${formData.additionalFeatures.includes(feature) ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 hover:border-green-300 bg-white'}`}
                                    >
                                        <span>{o(feature)}</span>
                                        {formData.additionalFeatures.includes(feature) && <Check size={20} className="text-green-500" />}
                                    </button>
                                ))}
                            </div>
                        </div>
                    );
                case 7:
                    return (
                        <div className="space-y-6">
                            <h2 className="text-3xl md:text-4xl font-light text-gray-800 text-center">{t('heat_pump')}?</h2>
                            <div className="flex justify-center gap-4 flex-wrap max-w-xl mx-auto">
                                {HEAT_PUMP_OPTIONS.map((option) => (
                                    <button key={option} onClick={() => updateFieldAndAdvance('heatPump', option)}
                                        className={`px-8 py-4 rounded-lg border-2 transition-all ${formData.heatPump === option ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 hover:border-green-300 bg-white'}`}
                                    >{o(option)}</button>
                                ))}
                            </div>
                        </div>
                    );
                case 8: return renderCountyStep();
                case 9: return renderTownStep();
                case 10:
                    return (
                        <div className="space-y-6">
                            <h2 className="text-3xl md:text-4xl font-light text-gray-800 text-center">{t('ber_purpose')}?</h2>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
                                {BER_PURPOSES.map((purpose) => (
                                    <button key={purpose} onClick={() => updateFieldAndAdvance('berPurpose', purpose)}
                                        className={`p-4 rounded-lg border-2 transition-all text-center ${formData.berPurpose === purpose ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 hover:border-green-300 bg-white'}`}
                                    >{o(purpose)}</button>
                                ))}
                            </div>
                        </div>
                    );
                case 11: return renderContactStep();
                case 12:
                    return (
                        <EmailVerification
                            email={formData.email}
                            assessmentId={assessmentId}
                            onVerified={handleEmailVerified}
                            onBack={() => setCurrentStep(11)}
                        />
                    );
                case 13:
                    return (
                        <IdentityAuth
                            email={formData.email}
                            fullName={formData.fullName}
                            phone={formData.phone}
                            isExternalSubmitting={isSubmitting}
                            onAuthenticated={handleAuthenticated}
                            onBack={() => setCurrentStep(11)}
                        />
                    );
                case 14:
                    return (
                        <div className="pt-8">
                            <JobConfirmation
                                customerName={formData.fullName}
                                county={formData.county}
                                email={formData.email}
                                emailError={emailError}
                                hideNavigation={!!onClose}
                            />
                            {onClose && (
                                <button onClick={onClose} className="mt-8 w-full bg-gray-900 text-white font-bold py-4 rounded-xl">
                                    Close & Go to Dashboard
                                </button>
                            )}
                        </div>
                    );
                default: return null;
            }
        }

        // ---------- COMMERCIAL FLOW ----------
        if (isCommercial) {
            switch (currentStep) {
                case 1: return renderDateStep();
                case 2: return renderTimeStep();
                case 3:
                    return (
                        <div className="space-y-6">
                            <h2 className="text-3xl md:text-4xl font-light text-gray-800 text-center">{t('building_type_prompt', 'Building type')}?</h2>
                            <p className="text-gray-500 text-center text-sm -mt-4">{t('select_building_type', 'Select the type of commercial building')}</p>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-3xl mx-auto">
                                {BUILDING_TYPES.map((type) => (
                                    <button key={type} onClick={() => updateFieldAndAdvance('buildingType', type)}
                                        className={`p-5 rounded-xl border-2 transition-all text-center ${formData.buildingType === type ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 hover:border-green-300 bg-white'}`}
                                    >{o(type)}</button>
                                ))}
                            </div>
                        </div>
                    );
                case 4:
                    return (
                        <div className="space-y-6">
                            <h2 className="text-3xl md:text-4xl font-light text-gray-800 text-center">{t('floor_area_prompt', 'Approx. floor area')}?</h2>
                            <div className="flex justify-center mb-6">
                                <div className="inline-flex p-1 bg-gray-100 rounded-xl">
                                    <button
                                        onClick={() => setSizeUnit('m')}
                                        className={`px-6 py-2 rounded-lg font-bold transition-all ${sizeUnit === 'm' ? 'bg-white text-green-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                    >{o('Sq. Meters')}</button>
                                    <button
                                        onClick={() => setSizeUnit('ft')}
                                        className={`px-6 py-2 rounded-lg font-bold transition-all ${sizeUnit === 'ft' ? 'bg-white text-green-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                    >{o('Sq. Feet')}</button>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-3xl mx-auto">
                                {(sizeUnit === 'ft' ? COMMERCIAL_FLOOR_AREAS_IMPERIAL : COMMERCIAL_FLOOR_AREAS_METRIC).map((size) => (
                                    <button key={size} onClick={() => updateFieldAndAdvance('floorArea', size)}
                                        className={`p-4 rounded-lg border-2 transition-all text-center ${formData.floorArea === size ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 hover:border-green-300 bg-white'}`}
                                    >{size}</button>
                                ))}
                            </div>
                        </div>
                    );
                case 5:
                    return (
                        <div className="space-y-6">
                            <h2 className="text-3xl md:text-4xl font-light text-gray-800 text-center">{t('building_complexity_prompt', 'Building complexity')}?</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-xl mx-auto">
                                {BUILDING_COMPLEXITY_OPTIONS.map((opt) => (
                                    <button key={opt} onClick={() => updateFieldAndAdvance('buildingComplexity', opt)}
                                        className={`p-4 rounded-lg border-2 transition-all text-center ${formData.buildingComplexity === opt ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 hover:border-green-300 bg-white'}`}
                                    >{o(opt)}</button>
                                ))}
                            </div>
                        </div>
                    );
                case 6:
                    return (
                        <div className="space-y-6">
                            <h2 className="text-3xl md:text-4xl font-light text-gray-800 text-center">{t('existing_docs_prompt', 'Existing documentation')}?</h2>
                            <p className="text-gray-500 text-center text-sm -mt-4">{t('select_all_that_apply', 'Select all that apply')}</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-xl mx-auto">
                                {EXISTING_DOCS_OPTIONS.map((doc) => (
                                    <button key={doc} onClick={() => toggleExistingDoc(doc)}
                                        className={`p-4 rounded-lg border-2 transition-all text-center flex items-center justify-between ${formData.existingDocs.includes(doc) ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 hover:border-green-300 bg-white'}`}
                                    >
                                        <span>{o(doc)}</span>
                                        {formData.existingDocs.includes(doc) && <Check size={20} className="text-green-500" />}
                                    </button>
                                ))}
                            </div>
                        </div>
                    );
                case 7:
                    return (
                        <div className="space-y-6">
                            <h2 className="text-3xl md:text-4xl font-light text-gray-800 text-center">{t('purpose_prompt', 'Purpose of assessment')}?</h2>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
                                {COMMERCIAL_PURPOSES.map((purpose) => (
                                    <button key={purpose} onClick={() => updateFieldAndAdvance('assessmentPurpose', purpose)}
                                        className={`p-4 rounded-lg border-2 transition-all text-center ${formData.assessmentPurpose === purpose ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 hover:border-green-300 bg-white'}`}
                                    >{o(purpose)}</button>
                                ))}
                            </div>
                        </div>
                    );
                case 8:
                    return (
                        <div className="space-y-6">
                            <h2 className="text-3xl md:text-4xl font-light text-gray-800 text-center">{t('heating_cooling_prompt', 'Heating / Cooling Systems')}?</h2>
                            <p className="text-gray-500 text-center text-sm -mt-4">{t('select_all_that_apply', 'Select all that apply')}</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-xl mx-auto">
                                {HEATING_COOLING_OPTIONS.map((system) => (
                                    <button key={system} onClick={() => toggleHeatingCooling(system)}
                                        className={`p-4 rounded-lg border-2 transition-all text-center flex items-center justify-between ${formData.heatingCoolingSystems.includes(system) ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 hover:border-green-300 bg-white'}`}
                                    >
                                        <span>{o(system)}</span>
                                        {formData.heatingCoolingSystems.includes(system) && <Check size={20} className="text-green-500" />}
                                    </button>
                                ))}
                            </div>
                        </div>
                    );
                case 9: return renderCountyStep();
                case 10: return renderTownStep();
                case 11: return renderContactStep();
                case 12:
                    return (
                        <EmailVerification
                            email={formData.email}
                            assessmentId={assessmentId}
                            onVerified={handleEmailVerified}
                            onBack={() => setCurrentStep(11)}
                        />
                    );
                case 13:
                    return (
                        <IdentityAuth
                            email={formData.email}
                            fullName={formData.fullName}
                            isExternalSubmitting={isSubmitting}
                            onAuthenticated={handleAuthenticated}
                            onBack={() => setCurrentStep(11)}
                        />
                    );
                case 14:
                    return (
                        <div className="pt-8">
                            <JobConfirmation
                                customerName={formData.fullName}
                                county={formData.county}
                                email={formData.email}
                                emailError={emailError}
                                hideNavigation={!!onClose}
                            />
                            {onClose && (
                                <button onClick={onClose} className="mt-8 w-full bg-gray-900 text-white font-bold py-4 rounded-xl">
                                    Close & Go to Dashboard
                                </button>
                            )}
                        </div>
                    );
                default: return null;
            }
        }

        return null;
    };

    // Steps that need a "Next" button (checkbox-based steps and contact step)
    const needsNextButton = () => {
        if (currentStep === 0) return false; // job type auto-advances
        if (currentStep >= 12) return false; // auth/confirmation steps handle themselves

        if (isDomestic) {
            return currentStep === 6 || currentStep === 11; // features (multi-select) & contact
        }
        if (isCommercial) {
            return currentStep === 6 || currentStep === 8 || currentStep === 11; // docs, heating/cooling (multi-select) & contact
        }
        return false;
    };

    const getProgressInfo = () => {
        if (currentStep === 0) return { label: t('step_1_of_12', 'Step 1 of 12'), percent: 0 };
        if (currentStep >= 12) {
            const authLabel = currentStep === 12 ? t('verify', 'Verify') : t('auth', 'Auth');
            return { label: `${t('step', 'Step')} ${authLabel}`, percent: 100 };
        }
        const stepNum = currentStep + 1;
        return {
            label: `${t('step', 'Step')} ${stepNum} ${t('of', 'of')} ${TOTAL_FORM_STEPS}`,
            percent: Math.round((stepNum / TOTAL_FORM_STEPS) * 100)
        };
    };

    const progress = getProgressInfo();

    return (
        <div className="bg-white rounded-3xl overflow-hidden shadow-2xl">
            {currentStep < 14 && (
                <div className="px-8 pt-8">
                    <div className="flex justify-between text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
                        <span>{progress.label}</span>
                        <span>{progress.percent}% {t('percent_complete', 'Complete')}</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-green-500 transition-all duration-500" style={{ width: `${progress.percent}%` }} />
                    </div>
                    {formData.jobType && currentStep > 0 && currentStep < 12 && (
                        <div className="mt-3 flex justify-center">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${isDomestic ? 'bg-blue-50 text-blue-600 border border-blue-100' : 'bg-purple-50 text-purple-600 border border-purple-100'}`}>
                                {isDomestic ? t('domestic_ber_tag', 'Domestic BER') : t('commercial_ber_tag', 'Commercial BER')}
                            </span>
                        </div>
                    )}
                </div>
            )}

            <div className="p-8 md:p-12">
                {renderStepContent()}
            </div>

            {currentStep < 12 && (
                <div className="p-8 bg-gray-50 border-t border-gray-100 flex justify-between gap-4">
                    <button onClick={handleBack} disabled={currentStep === 0}
                        className={`px-6 py-4 rounded-xl font-bold transition-all ${currentStep === 0 ? 'text-gray-300' : 'text-gray-500 hover:bg-gray-200'}`}
                    >{t('back')}</button>
                    {needsNextButton() && (
                        <button onClick={handleNext} disabled={!canProceed()}
                            className={`px-10 py-4 rounded-xl font-bold transition-all flex items-center gap-2 ${canProceed() ? 'bg-green-500 text-white shadow-lg shadow-green-100 hover:bg-green-600' : 'bg-gray-200 text-gray-400'}`}
                        >
                            {currentStep === LAST_FORM_STEP ? (isSubmitting ? t('loading') : t('get_quotes', 'Get Quotes')) : t('next')}
                            {currentStep < LAST_FORM_STEP && <ChevronRight size={18} />}
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export default QuoteFormModule;
