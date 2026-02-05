import { useState } from 'react';
import { ChevronRight, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import EmailVerification from './EmailVerification';
import IdentityAuth from './IdentityAuth';
import JobConfirmation from './JobConfirmation';

// Irish Counties
const COUNTIES = [
    'Carlow', 'Cavan', 'Clare', 'Cork', 'Donegal', 'Dublin', 'Galway', 'Kerry',
    'Kildare', 'Kilkenny', 'Laois', 'Leitrim', 'Limerick', 'Longford', 'Louth',
    'Mayo', 'Meath', 'Monaghan', 'Offaly', 'Roscommon', 'Sligo', 'Tipperary',
    'Waterford', 'Westmeath', 'Wexford', 'Wicklow'
];

// Towns by County
const TOWNS_BY_COUNTY: Record<string, string[]> = {
    'Dublin': ['Dublin City', 'Dun Laoghaire', 'Swords', 'Tallaght', 'Blanchardstown', 'Clondalkin', 'Lucan', 'Malahide'],
    'Cork': ['Cork City', 'Cobh', 'Mallow', 'Midleton', 'Kinsale', 'Bandon', 'Fermoy', 'Youghal'],
    'Galway': ['Galway City', 'Tuam', 'Ballinasloe', 'Clifden', 'Oranmore', 'Loughrea', 'Athenry'],
    'Limerick': ['Limerick City', 'Newcastle West', 'Abbeyfeale', 'Kilmallock', 'Adare'],
    'Waterford': ['Waterford City', 'Dungarvan', 'Tramore', 'Kilmacthomas', 'Lismore'],
    'Kerry': ['Tralee', 'Killarney', 'Listowel', 'Kenmare', 'Dingle', 'Castleisland'],
    'Carlow': ['Carlow Town', 'Tullow', 'Muinebheag', 'Hacketstown'],
    'Cavan': ['Cavan Town', 'Bailieborough', 'Virginia', 'Kingscourt', 'Cootehill'],
    'Clare': ['Ennis', 'Shannon', 'Kilrush', 'Killaloe', 'Ennistymon'],
    'Donegal': ['Letterkenny', 'Bundoran', 'Donegal Town', 'Buncrana', 'Ballyshannon'],
    'Kildare': ['Naas', 'Newbridge', 'Maynooth', 'Celbridge', 'Leixlip', 'Athy', 'Kildare Town'],
    'Kilkenny': ['Kilkenny City', 'Thomastown', 'Castlecomer', 'Callan', 'Graiguenamanagh'],
    'Laois': ['Portlaoise', 'Mountmellick', 'Portarlington', 'Abbeyleix', 'Mountrath'],
    'Leitrim': ['Carrick-on-Shannon', 'Manorhamilton', 'Drumshanbo', 'Mohill'],
    'Longford': ['Longford Town', 'Ballymahon', 'Granard', 'Edgeworthstown'],
    'Louth': ['Dundalk', 'Drogheda', 'Ardee', 'Dunleer', 'Carlingford'],
    'Mayo': ['Castlebar', 'Ballina', 'Westport', 'Claremorris', 'Ballinrobe', 'Belmullet'],
    'Meath': ['Navan', 'Trim', 'Kells', 'Ashbourne', 'Dunshaughlin', 'Dunboyne', 'Ratoath'],
    'Monaghan': ['Monaghan Town', 'Carrickmacross', 'Castleblayney', 'Clones', 'Ballybay'],
    'Offaly': ['Tullamore', 'Birr', 'Edenderry', 'Clara', 'Banagher'],
    'Roscommon': ['Roscommon Town', 'Boyle', 'Castlerea', 'Ballaghaderreen', 'Strokestown'],
    'Sligo': ['Sligo Town', 'Tubbercurry', 'Ballymote', 'Enniscrone', 'Collooney'],
    'Tipperary': ['Clonmel', 'Thurles', 'Nenagh', 'Tipperary Town', 'Cashel', 'Carrick-on-Suir', 'Templemore'],
    'Westmeath': ['Athlone', 'Mullingar', 'Moate', 'Kilbeggan', 'Castlepollard'],
    'Wexford': ['Wexford Town', 'Enniscorthy', 'Gorey', 'New Ross', 'Bunclody'],
    'Wicklow': ['Wicklow Town', 'Bray', 'Arklow', 'Greystones', 'Baltinglass', 'Rathdrum']
};

const ROUTING_KEYS: Record<string, string> = {
    'Carlow': 'R93', 'Cavan': 'H12', 'Clare': 'V95', 'Cork': 'T12', 'Donegal': 'F92',
    'Dublin': 'D', 'Galway': 'H91', 'Kerry': 'V92', 'Kildare': 'W91', 'Kilkenny': 'R95',
    'Laois': 'R32', 'Leitrim': 'N41', 'Limerick': 'V94', 'Longford': 'N39', 'Louth': 'A91',
    'Mayo': 'F23', 'Meath': 'C15', 'Monaghan': 'H18', 'Offaly': 'R35', 'Roscommon': 'F42',
    'Sligo': 'F91', 'Tipperary': 'E21', 'Waterford': 'X91', 'Westmeath': 'N37', 'Wexford': 'Y35',
    'Wicklow': 'A63'
};

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

interface FormData {
    preferredDate: string;
    preferredTime: string;
    propertyType: string;
    propertySize: string;
    bedrooms: string;
    additionalFeatures: string[];
    heatPump: string;
    county: string;
    town: string;
    berPurpose: string;
    fullName: string;
    email: string;
    phone: string;
    eircode: string;
}

interface QuoteFormModuleProps {
    onClose?: () => void;
}

const QuoteFormModule = ({ onClose }: QuoteFormModuleProps) => {
    const { user } = useAuth();
    const [currentStep, setCurrentStep] = useState(1);
    const [sizeUnit, setSizeUnit] = useState<'ft' | 'm'>('ft');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [assessmentId, setAssessmentId] = useState<string | null>(null);
    const [emailError, setEmailError] = useState<string | null>(null);
    // const totalSteps = 13;

    const [formData, setFormData] = useState<FormData>({
        preferredDate: '',
        preferredTime: '',
        propertyType: '',
        propertySize: '',
        bedrooms: '',
        additionalFeatures: [],
        heatPump: '',
        county: '',
        town: '',
        berPurpose: '',
        fullName: user?.user_metadata?.full_name || '',
        email: user?.email || '',
        phone: '',
        eircode: ''
    });

    const updateField = (field: keyof FormData, value: string | string[]) => {
        setFormData((prev: FormData) => {
            const newData = { ...prev, [field]: value };

            // Auto-fill Routing Key if county changes and eircode is empty
            if (field === 'county' && typeof value === 'string' && !prev.eircode) {
                newData.eircode = (ROUTING_KEYS[value] || '').replace(/\s/g, '');
            }

            return newData;
        });
    };

    const toggleFeature = (feature: string) => {
        if (feature === 'None') {
            setFormData((prev: FormData) => ({ ...prev, additionalFeatures: ['None'] }));
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

    const canProceed = (): boolean => {
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
                const eircodeValid = cleanEircode.length >= 7 && (!key || cleanEircode.startsWith(key));
                return !!formData.fullName && !!formData.email && !!formData.phone && eircodeValid;
            }
            case 12: return true; // Email verification step
            case 13: return true; // Identity Auth step
            default: return false;
        }
    };

    const handleNext = () => {
        if (currentStep < 11 && canProceed()) {
            setCurrentStep((prev: number) => prev + 1);
        } else if (currentStep === 11) {
            handleSubmit();
        }
    };

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep((prev: number) => prev - 1);
        }
    };

    const handleSubmit = async () => {
        if (!canProceed()) return;
        // If already logged in, skip auth step
        if (user) {
            handleFinalSubmission();
        } else {
            setCurrentStep(12); // Go to email verification
        }
    };

    const handleEmailVerified = () => {
        setCurrentStep(13); // Go to identity auth
    };

    const handleAuthenticated = () => {
        handleFinalSubmission();
    };

    const handleFinalSubmission = async () => {
        setIsSubmitting(true);
        try {
            // Get current session directly to ensure we have the user ID 
            // even if the context hasn't updated yet after sign up
            const { data: { session } } = await supabase.auth.getSession();
            const currentUserId = session?.user?.id || user?.id;

            // 1. Create assessment record
            const { data, error: dbError } = await supabase
                .from('assessments')
                .insert({
                    property_address: `${formData.town}, ${formData.county}`,
                    town: formData.town,
                    county: formData.county,
                    property_type: formData.propertyType,
                    property_size: formData.propertySize,
                    bedrooms: parseInt(formData.bedrooms),
                    additional_features: formData.additionalFeatures,
                    heat_pump: formData.heatPump,
                    ber_purpose: formData.berPurpose,
                    preferred_date: formData.preferredDate === 'Flexible' ? null : formData.preferredDate,
                    preferred_time: formData.preferredDate === 'Flexible' ? `${formData.preferredTime} (Flexible)` : formData.preferredTime,
                    status: 'submitted',
                    contact_name: formData.fullName,
                    contact_email: formData.email,
                    contact_phone: formData.phone,
                    eircode: formData.eircode,
                    user_id: currentUserId // Link reliably to user
                })
                .select()
                .single();

            if (dbError) throw dbError;

            const newAssessmentId = data.id;
            setAssessmentId(newAssessmentId);

            // 2. Send job live email
            try {
                await supabase.functions.invoke('send-job-live-email', {
                    body: {
                        email: formData.email,
                        customerName: formData.fullName,
                        county: formData.county,
                        town: formData.town,
                        assessmentId: newAssessmentId
                    }
                });
                setEmailError(null);
            } catch (emailErr) {
                console.error('Failed to send job live email:', emailErr);
                setEmailError('Email notification failed but job is live');
            }

            toast.success('Quotes requested successfully!');
            setCurrentStep(14); // Confirmation step

        } catch (error: any) {
            console.error('Error finalising quote:', error);
            toast.error(error.message || 'Failed to submit details.');
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
        // Start from today and generate 15 days.
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

    const renderStepContent = () => {
        switch (currentStep) {
            case 1:
                return (
                    <div className="space-y-6">
                        <h2 className="text-3xl md:text-4xl font-light text-gray-800 text-center">Your preferred date</h2>
                        <p className="text-gray-500 text-center text-sm md:text-base -mt-4">
                            Not sure yet? Just select <span className="italic font-medium text-gray-700">I'm Flexible.</span>
                        </p>
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 max-w-5xl mx-auto overflow-y-auto max-h-[50vh] p-2 custom-scrollbar">
                            <button
                                onClick={() => { updateField('preferredDate', 'Flexible'); handleNext(); }}
                                className={`p-4 rounded-xl border-2 transition-all font-bold text-sm ${formData.preferredDate === 'Flexible' ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 hover:border-green-300 bg-white text-gray-600'}`}
                            >
                                I'm Flexible
                            </button>
                            {generateCalendarDates().map((date) => (
                                <button
                                    key={formatDate(date)}
                                    onClick={() => { updateField('preferredDate', formatDate(date)); handleNext(); }}
                                    className={`p-4 rounded-xl border-2 transition-all ${formData.preferredDate === formatDate(date) ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 hover:border-green-300 bg-white text-gray-600'}`}
                                >
                                    <span className="block text-sm font-medium">{formatDateDisplay(date)}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                );
            case 2:
                return (
                    <div className="space-y-6">
                        <h2 className="text-3xl md:text-4xl font-light text-gray-800 text-center">Your preferred time</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 max-w-3xl mx-auto">
                            {TIME_SLOTS.map((time) => (
                                <button
                                    key={time}
                                    onClick={() => { updateField('preferredTime', time); handleNext(); }}
                                    className={`p-4 rounded-lg border-2 transition-all text-center ${formData.preferredTime === time ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 hover:border-green-300 bg-white'}`}
                                >{time}</button>
                            ))}
                        </div>
                    </div>
                );
            case 3:
                return (
                    <div className="space-y-6">
                        <h2 className="text-3xl md:text-4xl font-light text-gray-800 text-center">Property type?</h2>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
                            {PROPERTY_TYPES.map((type) => (
                                <button key={type} onClick={() => { updateField('propertyType', type); handleNext(); }}
                                    className={`p-4 rounded-lg border-2 transition-all text-center ${formData.propertyType === type ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 hover:border-green-300 bg-white'}`}
                                >{type}</button>
                            ))}
                        </div>
                    </div>
                );
            case 4:
                return (
                    <div className="space-y-6">
                        <h2 className="text-3xl md:text-4xl font-light text-gray-800 text-center">Property size?</h2>
                        <div className="flex justify-center mb-6">
                            <div className="inline-flex p-1 bg-gray-100 rounded-xl">
                                <button
                                    onClick={() => setSizeUnit('ft')}
                                    className={`px-6 py-2 rounded-lg font-bold transition-all ${sizeUnit === 'ft' ? 'bg-white text-green-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                >Sq. Feet</button>
                                <button
                                    onClick={() => setSizeUnit('m')}
                                    className={`px-6 py-2 rounded-lg font-bold transition-all ${sizeUnit === 'm' ? 'bg-white text-green-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                >Sq. Meters</button>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 max-w-2xl mx-auto">
                            {(sizeUnit === 'ft' ? PROPERTY_SIZES : PROPERTY_SIZES_METRIC).map((size) => (
                                <button key={size} onClick={() => { updateField('propertySize', size); handleNext(); }}
                                    className={`p-4 rounded-lg border-2 transition-all text-center ${formData.propertySize === size ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 hover:border-green-300 bg-white'}`}
                                >{size}</button>
                            ))}
                        </div>
                    </div>
                );
            case 5:
                return (
                    <div className="space-y-6">
                        <h2 className="text-3xl md:text-4xl font-light text-gray-800 text-center">Bedrooms?</h2>
                        <div className="flex justify-center gap-4 flex-wrap max-w-xl mx-auto">
                            {['1', '2', '3', '4', '5', '6'].map((num) => (
                                <button key={num} onClick={() => { updateField('bedrooms', num); handleNext(); }}
                                    className={`w-16 h-16 rounded-full border-2 transition-all text-xl font-medium ${formData.bedrooms === num ? 'border-green-500 bg-green-500 text-white' : 'border-gray-200 hover:border-green-300 bg-white text-gray-700'}`}
                                >{num}</button>
                            ))}
                        </div>
                    </div>
                );
            case 6:
                return (
                    <div className="space-y-6">
                        <h2 className="text-3xl md:text-4xl font-light text-gray-800 text-center">Additional features?</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-xl mx-auto">
                            {ADDITIONAL_FEATURES.map((feature) => (
                                <button key={feature} onClick={() => toggleFeature(feature)}
                                    className={`p-4 rounded-lg border-2 transition-all text-center flex items-center justify-between ${formData.additionalFeatures.includes(feature) ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 hover:border-green-300 bg-white'}`}
                                >
                                    <span>{feature}</span>
                                    {formData.additionalFeatures.includes(feature) && <Check size={20} className="text-green-500" />}
                                </button>
                            ))}
                        </div>
                    </div>
                );
            case 7:
                return (
                    <div className="space-y-6">
                        <h2 className="text-3xl md:text-4xl font-light text-gray-800 text-center">Heat pump?</h2>
                        <div className="flex justify-center gap-4 flex-wrap max-w-xl mx-auto">
                            {HEAT_PUMP_OPTIONS.map((option) => (
                                <button key={option} onClick={() => { updateField('heatPump', option); handleNext(); }}
                                    className={`px-8 py-4 rounded-lg border-2 transition-all ${formData.heatPump === option ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 hover:border-green-300 bg-white'}`}
                                >{option}</button>
                            ))}
                        </div>
                    </div>
                );
            case 8:
                return (
                    <div className="space-y-6">
                        <h2 className="text-3xl md:text-4xl font-light text-gray-800 text-center">County?</h2>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-w-4xl mx-auto max-h-[60vh] overflow-y-auto p-2 custom-scrollbar">
                            {COUNTIES.map((county) => (
                                <button
                                    key={county}
                                    onClick={() => { updateField('county', county); updateField('town', ''); handleNext(); }}
                                    className={`p-4 rounded-xl border-2 transition-all font-bold text-lg ${formData.county === county ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 hover:border-green-300 bg-white text-gray-600'}`}
                                >
                                    {county}
                                </button>
                            ))}
                        </div>
                        <p className="text-center text-gray-400 text-sm mt-4">Scroll to see more counties</p>
                    </div>
                );
            case 9:
                return (
                    <div className="space-y-6">
                        <h2 className="text-3xl md:text-4xl font-light text-gray-800 text-center">Town?</h2>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-w-4xl mx-auto max-h-[60vh] overflow-y-auto p-2 custom-scrollbar">
                            {(TOWNS_BY_COUNTY[formData.county] || []).map((town) => (
                                <button
                                    key={town}
                                    onClick={() => { updateField('town', town); handleNext(); }}
                                    className={`p-4 rounded-xl border-2 transition-all font-bold text-lg ${formData.town === town ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 hover:border-green-300 bg-white text-gray-600'}`}
                                >
                                    {town}
                                </button>
                            ))}
                        </div>
                        <p className="text-center text-gray-400 text-sm mt-4">Scroll to see more towns</p>
                    </div>
                );
            case 10:
                return (
                    <div className="space-y-6">
                        <h2 className="text-3xl md:text-4xl font-light text-gray-800 text-center">BER Purpose?</h2>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
                            {BER_PURPOSES.map((purpose) => (
                                <button key={purpose} onClick={() => { updateField('berPurpose', purpose); handleNext(); }}
                                    className={`p-4 rounded-lg border-2 transition-all text-center ${formData.berPurpose === purpose ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 hover:border-green-300 bg-white'}`}
                                >{purpose}</button>
                            ))}
                        </div>
                    </div>
                );
            case 11:
                return (
                    <div className="space-y-6">
                        <h2 className="text-3xl md:text-4xl font-light text-gray-800 text-center italic">Contact Details</h2>
                        <div className="max-w-lg mx-auto space-y-4">
                            <input type="text" value={formData.fullName} onChange={(e) => updateField('fullName', e.target.value)} placeholder="Full Name*" className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-green-500" />
                            <input type="email" value={formData.email} onChange={(e) => updateField('email', e.target.value)} placeholder="Email Address*" className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-green-500" />
                            <div className="grid grid-cols-2 gap-4">
                                <input type="tel" value={formData.phone} onChange={(e) => updateField('phone', e.target.value)} placeholder="Mobile Number*" className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-green-500" />
                                <div className="space-y-1">
                                    <input type="text" value={formData.eircode} onChange={(e) => updateField('eircode', e.target.value.toUpperCase())} placeholder="Eircode*" className={`w-full p-4 border-2 rounded-xl focus:border-green-500 ${formData.eircode && formData.eircode.replace(/\s/g, '').length >= 7 && ROUTING_KEYS[formData.county] && !formData.eircode.replace(/\s/g, '').startsWith(ROUTING_KEYS[formData.county]) ? 'border-red-300 bg-red-50' : 'border-gray-200'}`} />
                                    {formData.county && ROUTING_KEYS[formData.county] && (
                                        <p className={`text-[10px] font-bold px-1 uppercase tracking-wide ${formData.eircode.replace(/\s/g, '').startsWith(ROUTING_KEYS[formData.county]) ? 'text-green-600' : 'text-amber-600'}`}>
                                            Required: Must start with {ROUTING_KEYS[formData.county]}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                );
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
    };

    return (
        <div className="bg-white rounded-3xl overflow-hidden shadow-2xl">
            {currentStep < 14 && (
                <div className="px-8 pt-8">
                    <div className="flex justify-between text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
                        <span>Step {currentStep > 11 ? (currentStep === 12 ? 'Verify' : 'Auth') : currentStep} of 11</span>
                        <span>{Math.round((Math.min(currentStep, 11) / 11) * 100)}% Complete</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-green-500 transition-all duration-500" style={{ width: `${(Math.min(currentStep, 11) / 11) * 100}%` }} />
                    </div>
                </div>
            )}

            <div className="p-8 md:p-12">
                {renderStepContent()}
            </div>

            {currentStep < 12 && (
                <div className="p-8 bg-gray-50 border-t border-gray-100 flex justify-between gap-4">
                    <button onClick={handleBack} disabled={currentStep === 1}
                        className={`px-6 py-4 rounded-xl font-bold transition-all ${currentStep === 1 ? 'text-gray-300' : 'text-gray-500 hover:bg-gray-200'}`}
                    >Back</button>
                    {(currentStep === 6 || currentStep === 11) && (
                        <button onClick={handleNext} disabled={!canProceed()}
                            className={`px-10 py-4 rounded-xl font-bold transition-all flex items-center gap-2 ${canProceed() ? 'bg-green-500 text-white shadow-lg shadow-green-100 hover:bg-green-600' : 'bg-gray-200 text-gray-400'}`}
                        >
                            {currentStep === 11 ? (isSubmitting ? 'Submitting...' : 'Get Quotes') : 'Next'}
                            {currentStep < 11 && <ChevronRight size={18} />}
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export default QuoteFormModule;
