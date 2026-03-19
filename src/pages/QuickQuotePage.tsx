import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import { ArrowLeft, MapPin, Home, Calendar, Clock, Euro, Mail, Phone, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

interface Assessment {
    id: string;
    property_address: string;
    town: string;
    county: string;
    property_type: string;
    property_size: string;
    bedrooms: number;
    heat_pump: string;
    ber_purpose: string;
    additional_features: string[];
    preferred_date: string;
    preferred_time?: string;
    created_at: string;
    eircode?: string;
    job_type?: string;
    building_type?: string;
    floor_area?: string;
    building_complexity?: string;
}

interface QuoteData {
    price: string;
    notes: string;
    availability_date: string;
    availability_time: string;
}

const QuickQuotePage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    
    const [assessment, setAssessment] = useState<Assessment | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [currentStep, setCurrentStep] = useState(1); // 1: Quote form, 2: Email/Phone, 3: Results
    
    const [quoteData, setQuoteData] = useState<QuoteData>({
        price: '',
        notes: '',
        availability_date: '',
        availability_time: ''
    });
    
    const [contactInfo, setContactInfo] = useState({
        email: '',
        phone: ''
    });
    
    const [searchResult, setSearchResult] = useState<{
        found: boolean;
        contractor?: any;
        message: string;
    } | null>(null);

    useEffect(() => {
        if (id) {
            fetchAssessment();
        }
    }, [id]);

    const fetchAssessment = async () => {
        try {
            const { data, error } = await supabase
                .from('assessments')
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw error;
            setAssessment(data);
        } catch (error: any) {
            toast.error('Failed to load job details');
            console.error('Error fetching assessment:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleQuoteSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!quoteData.price || !quoteData.availability_date) {
            toast.error('Please fill in all required fields');
            return;
        }
        
        setCurrentStep(2);
    };

    const handleContactSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!contactInfo.email || !contactInfo.phone) {
            toast.error('Please provide both email and phone number');
            return;
        }
        
        setSubmitting(true);
        
        try {
            // Search for existing contractor
            const { data: contractor, error: searchError } = await supabase
                .from('profiles')
                .select('*')
                .eq('role', 'contractor')
                .or(`email.eq.${contactInfo.email.toLowerCase()},phone.eq.${contactInfo.phone}`)
                .single();
            
            if (searchError && searchError.code !== 'PGRST116') {
                throw searchError;
            }
            
            if (contractor) {
                // Found existing contractor
                setSearchResult({
                    found: true,
                    contractor: contractor,
                    message: 'Found your account! We\'ll link this quote to your profile.'
                });
                
                // Submit the quote
                await submitQuote(contractor.id);
            } else {
                // No contractor found
                setSearchResult({
                    found: false,
                    message: 'No account found with this email/phone. Please register to submit your quote.'
                });
            }
        } catch (error: any) {
            toast.error('Something went wrong. Please try again.');
            console.error('Error:', error);
        } finally {
            setSubmitting(false);
            setCurrentStep(3);
        }
    };

    const submitQuote = async (contractorId: string) => {
        try {
            const { error: quoteError } = await supabase
                .from('quotes')
                .insert({
                    assessment_id: id,
                    created_by: contractorId,
                    price: parseFloat(quoteData.price),
                    notes: quoteData.notes,
                    status: 'pending'
                });
            
            if (quoteError) throw quoteError;
            
            toast.success('Quote submitted successfully!');
        } catch (error: any) {
            toast.error('Failed to submit quote');
            console.error('Quote submission error:', error);
            throw error;
        }
    };

    const handleRegister = () => {
        // Store quote data in sessionStorage to retrieve after registration
        sessionStorage.setItem('pendingQuote', JSON.stringify({
            assessmentId: id,
            quoteData,
            contactInfo
        }));
        
        navigate('/signup?role=contractor&redirect=quote');
    };

    const handleLogin = () => {
        navigate('/login?redirect=quote');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Loader2 className="animate-spin text-[#007F00]" size={48} />
            </div>
        );
    }

    if (!assessment) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <AlertCircle className="mx-auto text-red-500 mb-4" size={48} />
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Job Not Found</h2>
                    <p className="text-gray-600 mb-4">This job may no longer be available.</p>
                    <button
                        onClick={() => navigate('/')}
                        className="px-6 py-2 bg-[#007F00] text-white rounded-lg hover:bg-[#006600]"
                    >
                        Go Home
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-4xl mx-auto px-4 py-4">
                    <button
                        onClick={() => navigate('/')}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
                    >
                        <ArrowLeft size={20} />
                        Back to Home
                    </button>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 py-8">
                {/* Progress Steps */}
                <div className="flex items-center justify-center mb-8">
                    <div className="flex items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                            currentStep >= 1 ? 'bg-[#007F00] text-white' : 'bg-gray-200 text-gray-600'
                        }`}>
                            1
                        </div>
                        <span className="ml-2 text-sm font-medium">Quote Details</span>
                    </div>
                    <div className={`w-16 h-1 mx-4 ${currentStep >= 2 ? 'bg-[#007F00]' : 'bg-gray-200'}`} />
                    <div className="flex items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                            currentStep >= 2 ? 'bg-[#007F00] text-white' : 'bg-gray-200 text-gray-600'
                        }`}>
                            2
                        </div>
                        <span className="ml-2 text-sm font-medium">Contact Info</span>
                    </div>
                    <div className={`w-16 h-1 mx-4 ${currentStep >= 3 ? 'bg-[#007F00]' : 'bg-gray-200'}`} />
                    <div className="flex items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                            currentStep >= 3 ? 'bg-[#007F00] text-white' : 'bg-gray-200 text-gray-600'
                        }`}>
                            3
                        </div>
                        <span className="ml-2 text-sm font-medium">Complete</span>
                    </div>
                </div>

                {/* Job Details Card */}
                <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Job Details</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-start gap-3">
                            <MapPin className="text-gray-400 mt-1" size={18} />
                            <div>
                                <p className="font-medium text-gray-900">{assessment.property_address}</p>
                                <p className="text-sm text-gray-600">{assessment.town}, Co. {assessment.county}</p>
                                {assessment.eircode && (
                                    <p className="text-sm text-green-600 font-medium">Eircode: {assessment.eircode}</p>
                                )}
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <Home className="text-gray-400 mt-1" size={18} />
                            <div>
                                <p className="font-medium text-gray-900">{assessment.property_type}</p>
                                <p className="text-sm text-gray-600">{assessment.property_size}</p>
                                <p className="text-sm text-gray-600">{assessment.bedrooms} bedrooms</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <Calendar className="text-gray-400 mt-1" size={18} />
                            <div>
                                <p className="font-medium text-gray-900">Preferred Date</p>
                                <p className="text-sm text-gray-600">{assessment.preferred_date || 'Flexible'}</p>
                                {assessment.preferred_time && (
                                    <p className="text-sm text-gray-600">{assessment.preferred_time}</p>
                                )}
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <Clock className="text-gray-400 mt-1" size={18} />
                            <div>
                                <p className="font-medium text-gray-900">Posted</p>
                                <p className="text-sm text-gray-600">
                                    {new Date(assessment.created_at).toLocaleDateString('en-IE')}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Step 1: Quote Form */}
                {currentStep === 1 && (
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-6">Submit Your Quote</h2>
                        <form onSubmit={handleQuoteSubmit}>
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Quote Price (€) *
                                </label>
                                <div className="relative">
                                    <Euro className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        step="0.01"
                                        value={quoteData.price}
                                        onChange={(e) => setQuoteData({ ...quoteData, price: e.target.value })}
                                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007F00]"
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>

                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Availability Date *
                                </label>
                                <input
                                    type="date"
                                    required
                                    value={quoteData.availability_date}
                                    onChange={(e) => setQuoteData({ ...quoteData, availability_date: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007F00]"
                                />
                            </div>

                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Preferred Time
                                </label>
                                <select
                                    value={quoteData.availability_time}
                                    onChange={(e) => setQuoteData({ ...quoteData, availability_time: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007F00]"
                                >
                                    <option value="">Select time</option>
                                    <option value="Morning (9am-12pm)">Morning (9am-12pm)</option>
                                    <option value="Afternoon (12pm-5pm)">Afternoon (12pm-5pm)</option>
                                    <option value="Evening (5pm-7pm)">Evening (5pm-7pm)</option>
                                </select>
                            </div>

                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Additional Notes
                                </label>
                                <textarea
                                    rows={4}
                                    value={quoteData.notes}
                                    onChange={(e) => setQuoteData({ ...quoteData, notes: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007F00]"
                                    placeholder="Any additional information or special requirements..."
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full py-3 bg-[#007F00] text-white font-bold rounded-lg hover:bg-[#006600] transition-colors"
                            >
                                Continue to Contact Details
                            </button>
                        </form>
                    </div>
                )}

                {/* Step 2: Email/Phone Collection */}
                {currentStep === 2 && (
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-6">Your Contact Information</h2>
                        <p className="text-gray-600 mb-6">
                            We need your email and phone number to link this quote to your account.
                        </p>
                        <form onSubmit={handleContactSubmit}>
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Email Address *
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="email"
                                        required
                                        value={contactInfo.email}
                                        onChange={(e) => setContactInfo({ ...contactInfo, email: e.target.value })}
                                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007F00]"
                                        placeholder="email"
                                    />
                                </div>
                            </div>

                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Phone Number *
                                </label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="tel"
                                        required
                                        value={contactInfo.phone}
                                        onChange={(e) => setContactInfo({ ...contactInfo, phone: e.target.value })}
                                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007F00]"
                                        placeholder="phone number"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setCurrentStep(1)}
                                    className="flex-1 py-3 border border-gray-300 text-gray-700 font-bold rounded-lg hover:bg-gray-50"
                                >
                                    Back
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex-1 py-3 bg-[#007F00] text-white font-bold rounded-lg hover:bg-[#006600] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {submitting && <Loader2 className="animate-spin" size={18} />}
                                    Submit Quote
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Step 3: Results */}
                {currentStep === 3 && searchResult && (
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        {searchResult.found ? (
                            <div className="text-center">
                                <CheckCircle2 className="mx-auto text-green-500 mb-4" size={64} />
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">Quote Submitted!</h2>
                                <p className="text-gray-600 mb-6">{searchResult.message}</p>
                                <p className="text-sm text-gray-500 mb-6">
                                    We've sent a login link to your email. You can view and manage your quotes after logging in.
                                </p>
                                <button
                                    onClick={handleLogin}
                                    className="px-6 py-2 bg-[#007F00] text-white font-bold rounded-lg hover:bg-[#006600]"
                                >
                                    Login to Your Account
                                </button>
                            </div>
                        ) : (
                            <div className="text-center">
                                <AlertCircle className="mx-auto text-amber-500 mb-4" size={64} />
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">Account Required</h2>
                                <p className="text-gray-600 mb-6">{searchResult.message}</p>
                                <div className="space-y-3">
                                    <button
                                        onClick={handleRegister}
                                        className="w-full py-3 bg-[#007F00] text-white font-bold rounded-lg hover:bg-[#006600]"
                                    >
                                        Register as Contractor
                                    </button>
                                    <button
                                        onClick={() => setCurrentStep(2)}
                                        className="w-full py-3 border border-gray-300 text-gray-700 font-bold rounded-lg hover:bg-gray-50"
                                    >
                                        Try Different Email/Phone
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default QuickQuotePage;
