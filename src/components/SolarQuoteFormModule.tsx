import { useState } from 'react';
import { Sun, Home, Zap, MapPin, User, Phone, Mail, ArrowRight, Euro } from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import EmailVerification from './EmailVerification';
import IdentityAuth from './IdentityAuth';
import JobConfirmation from './JobConfirmation';

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

// New Options according to requirements
const PROPERTY_TYPES = ['Detached', 'Semi-detached', 'Terraced', 'Bungalow', 'Commercial', 'Agricultural / Farm', 'School', 'Other'];
const GRANT_OPTIONS = ['Yes', 'No', 'Not Sure'];
const PANEL_LOCATIONS = ['Roof', 'Ground', 'Not Sure'];
const PANEL_COUNTS = ['6–8 Panels — Small (Under 4kW)', '8–12 Panels — Medium (4kW – 6kW)', '12+ Panels — Large (Over 6kW)', 'Not Sure — Need advice on this'];
const BILL_ESTIMATES = ['Under €1,500 / year', '€1,500 – €2,000 / year', '€2,000+ / year', 'Not Sure'];

interface SolarFormData {
    propertyType: string;
    solarGrant: string;
    panelLocation: string;
    panelCount: string;
    electricityBill: string;
    county: string;
    eircode: string;
    fullName: string;
    email: string;
    phone: string;
}

interface SolarQuoteFormModuleProps {
    onClose?: () => void;
}

const SolarQuoteFormModule = ({ onClose }: SolarQuoteFormModuleProps) => {
    const { user } = useAuth();
    const [currentStep, setCurrentStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [assessmentId, setAssessmentId] = useState<string | null>(null);
    const [emailError, setEmailError] = useState<string | null>(null);

    const [formData, setFormData] = useState<SolarFormData>({
        propertyType: '',
        solarGrant: '',
        panelLocation: '',
        panelCount: '',
        electricityBill: '',
        county: '',
        eircode: '',
        fullName: user?.user_metadata?.full_name || '',
        email: user?.email || '',
        phone: ''
    });

    const updateField = (field: keyof SolarFormData, value: string) => {
        setFormData(prev => {
            const newData = { ...prev, [field]: value };
            if (field === 'county' && !prev.eircode) {
                newData.eircode = (ROUTING_KEYS[value] || '').replace(/\s/g, '');
            }
            return newData;
        });
    };

    const updateFieldAndAdvance = (field: keyof SolarFormData, value: string) => {
        updateField(field, value);
        setCurrentStep(prev => prev + 1);
    };

    const canProceed = (): boolean => {
        switch (currentStep) {
            case 1: return !!formData.propertyType;
            case 2: return !!formData.solarGrant;
            case 3: return !!formData.panelLocation;
            case 4: return !!formData.panelCount;
            case 5: return !!formData.electricityBill;
            case 6: return !!formData.county;
            case 7: {
                const key = ROUTING_KEYS[formData.county];
                const cleanEircode = formData.eircode.replace(/\s/g, '');
                return cleanEircode.length >= 7 && (!key || cleanEircode.startsWith(key));
            }
            case 8: return !!formData.fullName && !!formData.email && !!formData.phone;
            default: return true;
        }
    };

    const handleNext = () => {
        if (currentStep < 8 && canProceed()) {
            setCurrentStep(prev => prev + 1);
        } else if (currentStep === 8) {
            handleSubmit();
        }
    };

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep(prev => prev - 1);
        }
    };

    const handleSubmit = async () => {
        if (!canProceed()) return;
        if (user) {
            handleFinalSubmission();
        } else {
            setCurrentStep(9); // Email verification
        }
    };

    const handleEmailVerified = () => setCurrentStep(10); // Identity Auth
    const handleAuthenticated = () => handleFinalSubmission();

    const handleFinalSubmission = async () => {
        setIsSubmitting(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const currentUserId = session?.user?.id || user?.id;

            // Construct additional features array for Solar details
            const solarDetails = [
                `Solar Grant: ${formData.solarGrant}`,
                `Panel Location: ${formData.panelLocation}`,
                `Panel Count: ${formData.panelCount}`,
                `Annual Bill: ${formData.electricityBill}`
            ];

            const { data, error: dbError } = await supabase
                .from('assessments')
                .insert({
                    property_address: `${formData.county}, ${formData.eircode}`, // Using County + Eircode as address
                    town: formData.county, // Defaulting town to county as it wasn't asked
                    county: formData.county,
                    property_type: formData.propertyType,
                    // property_size: 'N/A', // Not asked
                    // bedrooms: 0, // Not asked
                    additional_features: solarDetails,
                    heat_pump: 'No', // Default
                    ber_purpose: 'Solar PV', // Specific purpose for routing
                    preferred_date: null, // Not applicable for Solar
                    preferred_time: 'Any time', // Default
                    status: 'submitted',
                    contact_name: formData.fullName,
                    contact_email: formData.email,
                    contact_phone: formData.phone,
                    eircode: formData.eircode,
                    user_id: currentUserId,
                })
                .select()
                .single();

            if (dbError) throw dbError;

            const newAssessmentId = data.id;
            setAssessmentId(newAssessmentId);

            // Send notification
            try {
                await supabase.functions.invoke('send-job-live-email', {
                    body: {
                        email: formData.email,
                        customerName: formData.fullName,
                        county: formData.county,
                        town: formData.county, // Using county as town
                        assessmentId: newAssessmentId
                    }
                });
                setEmailError(null);
            } catch (emailErr) {
                console.error('Failed to send job live email:', emailErr);
                setEmailError('Email notification failed but job is live');
            }


            toast.success('Solar quote request submitted!');
            setCurrentStep(11); // Confirmation
        } catch (error: any) {
            console.error('Error submitting solar request:', error);
            toast.error(error.message || 'Failed to submit request');
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderStepContent = () => {
        switch (currentStep) {
            case 1:
                return (
                    <div className="space-y-6">
                        <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto text-[#007F00] mb-8">
                            <Home size={32} />
                        </div>
                        <h2 className="text-3xl font-black text-gray-900 text-center uppercase tracking-tight">What is your property type?</h2>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
                            {PROPERTY_TYPES.map(type => (
                                <button key={type} onClick={() => updateFieldAndAdvance('propertyType', type)}
                                    className={`p-6 rounded-2xl border-2 transition-all font-bold text-sm ${formData.propertyType === type ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-100 hover:border-green-300 bg-white text-gray-600'}`}
                                >{type}</button>
                            ))}
                        </div>
                    </div>
                );
            case 2:
                return (
                    <div className="space-y-6">
                        <div className="w-16 h-16 bg-yellow-50 rounded-full flex items-center justify-center mx-auto text-yellow-600 mb-8">
                            <Euro size={32} />
                        </div>
                        <h2 className="text-3xl font-black text-gray-900 text-center uppercase tracking-tight">Would you like to avail of the solar grant?</h2>
                        <p className="text-gray-400 text-center text-sm font-bold uppercase tracking-widest -mt-4">(SEAI Solar Grant of up to €1,800)</p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
                            {GRANT_OPTIONS.map(opt => (
                                <button key={opt} onClick={() => updateFieldAndAdvance('solarGrant', opt)}
                                    className={`p-6 rounded-2xl border-2 transition-all font-bold text-sm ${formData.solarGrant === opt ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-100 hover:border-green-300 bg-white text-gray-600'}`}
                                >{opt}</button>
                            ))}
                        </div>
                    </div>
                );
            case 3:
                return (
                    <div className="space-y-6">
                        <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto text-blue-600 mb-8">
                            <MapPin size={32} />
                        </div>
                        <h2 className="text-3xl font-black text-gray-900 text-center uppercase tracking-tight">Where do you want the solar panels?</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
                            {PANEL_LOCATIONS.map(loc => (
                                <button key={loc} onClick={() => updateFieldAndAdvance('panelLocation', loc)}
                                    className={`p-6 rounded-2xl border-2 transition-all font-bold text-sm ${formData.panelLocation === loc ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-100 hover:border-green-300 bg-white text-gray-600'}`}
                                >{loc}</button>
                            ))}
                        </div>
                    </div>
                );
            case 4:
                return (
                    <div className="space-y-6">
                        <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mx-auto text-orange-600 mb-8">
                            <Sun size={32} />
                        </div>
                        <h2 className="text-3xl font-black text-gray-900 text-center uppercase tracking-tight">How many solar panels would you like?</h2>
                        <div className="grid grid-cols-1 gap-4 max-w-2xl mx-auto">
                            {PANEL_COUNTS.map(count => (
                                <button key={count} onClick={() => updateFieldAndAdvance('panelCount', count)}
                                    className={`p-6 rounded-2xl border-2 transition-all font-bold text-sm text-left ${formData.panelCount === count ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-100 hover:border-green-300 bg-white text-gray-600'}`}
                                >{count}</button>
                            ))}
                        </div>
                    </div>
                );
            case 5:
                return (
                    <div className="space-y-6">
                        <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center mx-auto text-purple-600 mb-8">
                            <Zap size={32} />
                        </div>
                        <h2 className="text-3xl font-black text-gray-900 text-center uppercase tracking-tight">How much are your electricity bills?</h2>
                        <p className="text-gray-400 text-center text-sm font-bold uppercase tracking-widest -mt-4">(An estimate is perfectly fine)</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                            {BILL_ESTIMATES.map(bill => (
                                <button key={bill} onClick={() => updateFieldAndAdvance('electricityBill', bill)}
                                    className={`p-6 rounded-2xl border-2 transition-all font-bold text-sm ${formData.electricityBill === bill ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-100 hover:border-green-300 bg-white text-gray-600'}`}
                                >{bill}</button>
                            ))}
                        </div>
                    </div>
                );
            case 6:
                return (
                    <div className="space-y-6">
                        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto text-red-600 mb-8">
                            <MapPin size={32} />
                        </div>
                        <h2 className="text-3xl font-black text-gray-900 text-center uppercase tracking-tight">What county is the property in?</h2>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-w-4xl mx-auto max-h-[50vh] overflow-y-auto p-2 custom-scrollbar">
                            {COUNTIES.map(county => (
                                <button key={county} onClick={() => updateFieldAndAdvance('county', county)}
                                    className={`p-4 rounded-xl border-2 transition-all font-bold text-sm ${formData.county === county ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-100 hover:border-green-300 bg-white text-gray-600'}`}
                                >{county}</button>
                            ))}
                        </div>
                    </div>
                );
            case 7:
                return (
                    <div className="space-y-6">
                        <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto text-green-600 mb-8">
                            <Home size={32} />
                        </div>
                        <h2 className="text-3xl font-black text-gray-900 text-center uppercase tracking-tight">Your Eircode</h2>
                        <p className="text-gray-400 text-center text-sm font-bold uppercase tracking-widest -mt-4">(This ensures you get quotes from the best installers in your area)</p>
                        <div className="max-w-xl mx-auto space-y-4">
                            <div className="relative">
                                <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                <input type="text" value={formData.eircode} onChange={(e) => updateField('eircode', e.target.value.toUpperCase())} placeholder="Example: A65F4E2" className={`w-full pl-14 pr-6 py-5 bg-gray-50 border-2 rounded-2xl outline-none font-bold text-lg transition-all shadow-sm focus:border-green-500 ${formData.eircode && formData.eircode.replace(/\s/g, '').length >= 7 && ROUTING_KEYS[formData.county] && !formData.eircode.replace(/\s/g, '').startsWith(ROUTING_KEYS[formData.county]) ? 'border-red-300 bg-red-50' : 'border-transparent'}`} />
                            </div>
                            {formData.county && ROUTING_KEYS[formData.county] && (
                                <p className={`text-[10px] font-black uppercase tracking-widest px-6 ${formData.eircode.replace(/\s/g, '').startsWith(ROUTING_KEYS[formData.county]) ? 'text-green-600' : 'text-amber-600'}`}>
                                    Required: Must start with {ROUTING_KEYS[formData.county]}
                                </p>
                            )}
                        </div>
                    </div>
                );
            case 8:
                return (
                    <div className="space-y-6">
                        <h2 className="text-3xl font-black text-gray-900 text-center uppercase tracking-tight">Contact Details</h2>
                        <div className="max-w-xl mx-auto space-y-4">
                            <div className="relative">
                                <User className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                <input type="text" value={formData.fullName} onChange={(e) => updateField('fullName', e.target.value)} placeholder="Full Name*" className="w-full pl-14 pr-6 py-5 bg-gray-50 border-2 border-transparent focus:border-green-500 focus:bg-white rounded-2xl outline-none font-bold text-sm transition-all shadow-sm" />
                            </div>
                            <div className="relative">
                                <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                <input type="email" value={formData.email} onChange={(e) => updateField('email', e.target.value)} placeholder="Email Address*" className="w-full pl-14 pr-6 py-5 bg-gray-50 border-2 border-transparent focus:border-green-500 focus:bg-white rounded-2xl outline-none font-bold text-sm transition-all shadow-sm" />
                            </div>
                            <div className="relative">
                                <Phone className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                <input type="tel" value={formData.phone} onChange={(e) => updateField('phone', e.target.value)} placeholder="Mobile Number*" className="w-full pl-14 pr-6 py-5 bg-gray-50 border-2 border-transparent focus:border-green-500 focus:bg-white rounded-2xl outline-none font-bold text-sm transition-all shadow-sm" />
                            </div>
                        </div>
                    </div>
                );
            case 9:
                return (
                    <EmailVerification email={formData.email} assessmentId={assessmentId} onVerified={handleEmailVerified} onBack={() => setCurrentStep(8)} />
                );
            case 10:
                return (
                    <IdentityAuth email={formData.email} fullName={formData.fullName} isExternalSubmitting={isSubmitting} onAuthenticated={handleAuthenticated} onBack={() => setCurrentStep(8)} />
                );
            case 11:
                return (
                    <JobConfirmation
                        customerName={formData.fullName}
                        county={formData.county}
                        email={formData.email}
                        emailError={emailError}
                        hideNavigation={!!onClose}
                        jobType="Solar"
                    />
                );
            default: return null;
        }
    };

    return (
        <div className="bg-white rounded-[3rem] overflow-hidden shadow-2xl border border-gray-100">
            {currentStep < 9 && (
                <div className="px-12 pt-12">
                    <div className="flex justify-between text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">
                        <span>Solar Assessment Step {currentStep} of 8</span>
                        <span>{Math.round((currentStep / 8) * 100)}% Complete</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-[#007F00] transition-all duration-700 ease-out" style={{ width: `${(currentStep / 8) * 100}%` }} />
                    </div>
                </div>
            )}

            <div className="p-8 md:p-16">
                {renderStepContent()}
            </div>

            {currentStep < 9 && (
                <div className="p-8 md:p-12 bg-gray-50/50 border-t border-gray-100 flex justify-between items-center gap-6">
                    <button onClick={handleBack} disabled={currentStep === 1}
                        className={`font-black text-[10px] uppercase tracking-widest transition-all ${currentStep === 1 ? 'opacity-0 pointer-events-none' : 'text-gray-400 hover:text-gray-900 flex items-center gap-2'}`}
                    >
                        Go Back
                    </button>
                    {(currentStep === 7 || currentStep === 8) && (
                        <button onClick={handleNext} disabled={!canProceed()}
                            className={`px-12 py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center gap-3 shadow-xl ${canProceed() ? 'bg-[#007F00] text-white shadow-green-100 hover:bg-[#006400] active:scale-95' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                        >
                            {isSubmitting ? 'Processing...' : (currentStep === 8 ? 'Get Solar Quotes' : 'Next Step')}
                            <ArrowRight size={16} />
                        </button>
                    )}
                </div>
            )}

            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: #f1f1f1;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #007F00;
                    border-radius: 10px;
                }
            `}</style>
        </div>
    );
};

export default SolarQuoteFormModule;
