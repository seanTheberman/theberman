import { X, Home, Calendar, Send, User, Building, Euro, Clock } from 'lucide-react';
import type { Assessment } from '../../../types/admin';
import { getStatusColor } from '../adminUtils';

interface Props {
    assessment: Assessment;
    onClose: () => void;
    onGenerateQuote: () => void;
    onGoLive: () => void;
    onAssignAssessor: () => void;
    onSchedule: () => void;
    onComplete: () => void;
    onMessage: (content: string) => void;
}

export const AssessmentDetailModal = ({
    assessment, onClose, onGenerateQuote, onGoLive, onAssignAssessor, onSchedule, onComplete, onMessage,
}: Props) => (
    <div
        className="fixed inset-0 z-[10001] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
    >
        <div
            className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
        >
            <div className="bg-white border-b border-gray-100 p-6 flex justify-between items-start shrink-0">
                <div>
                    <h2 className="text-2xl font-black text-gray-900">Complete Job Details</h2>
                    <p className="text-sm text-gray-500 font-medium mt-1">Assessment ID: {assessment.id}</p>
                </div>
                <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors">
                    <X size={24} />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto">
                <div className="p-6 space-y-6">
                    {/* User Information Section */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
                        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <User size={20} className="text-blue-600" />
                            User Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div>
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Full Name</span>
                                <p className="text-sm font-bold text-gray-900 mt-1">{assessment.user?.full_name || assessment.contact_name || 'N/A'}</p>
                            </div>
                            <div>
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Email</span>
                                <p className="text-sm font-bold text-blue-600 mt-1">{assessment.user?.email || assessment.contact_email || 'N/A'}</p>
                            </div>
                            <div>
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Phone</span>
                                <p className="text-sm font-bold text-gray-900 mt-1">{assessment.user?.phone || assessment.contact_phone || 'Not provided'}</p>
                            </div>
                            <div>
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">County</span>
                                <p className="text-sm font-bold text-gray-900 mt-1">{assessment.user?.county || assessment.county || 'N/A'}</p>
                            </div>
                            <div>
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Town</span>
                                <p className="text-sm font-bold text-gray-900 mt-1">{assessment.user?.town || assessment.town || 'N/A'}</p>
                            </div>
                            <div>
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Registration Status</span>
                                <p className="text-sm font-bold text-gray-900 mt-1">{assessment.user?.registration_status || 'N/A'}</p>
                            </div>
                            <div>
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Account Active</span>
                                <p className="text-sm font-bold text-gray-900 mt-1">{assessment.user?.is_active ? 'Yes' : 'No'}</p>
                            </div>
                            <div>
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Member Since</span>
                                <p className="text-sm font-bold text-gray-900 mt-1">
                                    {assessment.user?.created_at ? new Date(assessment.user.created_at).toLocaleDateString('en-GB') : 'N/A'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Property Details */}
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100">
                        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <Home size={20} className="text-green-600" />
                            Property Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div>
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Property Address</span>
                                <p className="text-sm font-bold text-gray-900 mt-1">{assessment.property_address}</p>
                            </div>
                            <div>
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Eircode</span>
                                <p className="text-sm font-bold text-blue-600 mt-1">{assessment.eircode || 'N/A'}</p>
                            </div>
                            <div>
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Property Type</span>
                                <p className="text-sm font-bold text-gray-900 mt-1">{assessment.property_type || 'N/A'}</p>
                            </div>
                            <div>
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Size</span>
                                <p className="text-sm font-bold text-gray-900 mt-1">{assessment.property_size || 'N/A'}</p>
                            </div>
                            <div>
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Bedrooms</span>
                                <p className="text-sm font-bold text-gray-900 mt-1">{assessment.bedrooms || 'N/A'}</p>
                            </div>
                            <div>
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">BER Purpose</span>
                                <p className="text-sm font-bold text-gray-900 mt-1">{assessment.ber_purpose || 'N/A'}</p>
                            </div>
                            <div>
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Heat Pump</span>
                                <p className="text-sm font-bold text-gray-900 mt-1">{assessment.heat_pump || 'N/A'}</p>
                            </div>
                            {assessment.additional_features && assessment.additional_features.length > 0 && (
                                <div className="lg:col-span-3">
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Additional Features</span>
                                    <div className="flex flex-wrap gap-2 mt-1">
                                        {assessment.additional_features.map((feature, idx) => (
                                            <span key={idx} className="px-2 py-1 bg-green-100 text-green-700 text-[10px] rounded-full">
                                                {feature}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Job Status & Timeline */}
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100">
                        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <Clock size={20} className="text-purple-600" />
                            Job Status & Timeline
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div>
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Current Status</span>
                                <div className="mt-1">
                                    <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase ${getStatusColor(assessment.status)}`}>
                                        {assessment.status.replace(/_/g, ' ')}
                                    </span>
                                </div>
                            </div>
                            <div>
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Payment Status</span>
                                <p className="text-sm font-bold text-gray-900 mt-1">{assessment.payment_status || 'unpaid'}</p>
                            </div>
                            <div>
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Job Posted</span>
                                <p className="text-sm font-bold text-gray-900 mt-1">
                                    {new Date(assessment.created_at).toLocaleDateString('en-GB')} at {new Date(assessment.created_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                            <div>
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Scheduled Date</span>
                                <p className="text-sm font-bold text-gray-900 mt-1">{assessment.scheduled_date ? new Date(assessment.scheduled_date).toLocaleDateString('en-GB') : 'Not scheduled'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Schedule Preferences */}
                    <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-100">
                        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <Calendar size={20} className="text-amber-600" />
                            Schedule Preferences
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Preferred Date</span>
                                <p className="text-sm font-bold text-gray-900 mt-1">{assessment.preferred_date || 'Flexible'}</p>
                            </div>
                            <div>
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Preferred Time</span>
                                <p className="text-sm font-bold text-gray-900 mt-1">{assessment.preferred_time || 'Flexible'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Quotes Section */}
                    <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-6 border border-emerald-100">
                        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <Euro size={20} className="text-emerald-600" />
                            Quotes Received ({assessment.quotes?.length || 0})
                        </h3>
                        {assessment.quotes && assessment.quotes.length > 0 ? (
                            <div className="space-y-4">
                                {assessment.quotes.map((quote) => (
                                    <div key={quote.id} className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className="text-sm font-bold text-gray-900">{quote.contractor?.full_name || 'Unknown'}</span>
                                                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${quote.status === 'accepted' ? 'bg-green-100 text-green-700' : quote.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                        {quote.status}
                                                    </span>
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-gray-600">
                                                    <div> {quote.contractor?.email || 'N/A'}</div>
                                                    <div> {quote.contractor?.phone || 'N/A'}</div>
                                                    <div> {quote.contractor?.company_name || 'N/A'}</div>
                                                    <div> SEAI: {quote.contractor?.seai_number || 'N/A'}</div>
                                                    <div> County: {quote.contractor?.county || 'N/A'}</div>
                                                    <div> Type: {quote.contractor?.assessor_type || 'N/A'}</div>
                                                </div>
                                                {quote.notes && (
                                                    <p className="text-xs text-gray-500 mt-2 italic">Notes: {quote.notes}</p>
                                                )}
                                            </div>
                                            <div className="text-right ml-4">
                                                <p className="text-2xl font-bold text-emerald-600">€{quote.price}</p>
                                                <p className="text-[9px] text-gray-400">{new Date(quote.created_at).toLocaleDateString('en-GB')}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500 italic">No quotes received yet</p>
                        )}
                    </div>

                    {/* Referral Information */}
                    {assessment.referred_by && (
                        <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-2xl p-6 border border-indigo-100">
                            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <Building size={20} className="text-indigo-600" />
                                Referral Information
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Referred By</span>
                                    <p className="text-sm font-bold text-gray-900 mt-1">{assessment.referred_by.name}</p>
                                </div>
                                <div>
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Company</span>
                                    <p className="text-sm font-bold text-gray-900 mt-1">{assessment.referred_by.company_name}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="pt-6 border-t border-gray-100">
                        <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Required Actions</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            {assessment.status === 'submitted' && (
                                <>
                                    <button
                                        onClick={onGenerateQuote}
                                        className="bg-[#007F00] text-white px-4 py-3 rounded-xl text-sm font-bold hover:bg-green-700 transition-all shadow-sm flex items-center justify-center gap-2"
                                    >
                                        <Euro size={18} />
                                        Generate Quote
                                    </button>
                                    <button
                                        onClick={onGoLive}
                                        className="bg-blue-600 text-white px-4 py-3 rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-sm flex items-center justify-center gap-2"
                                    >
                                        <Send size={18} />
                                        Go Live (Notify Contractors)
                                    </button>
                                </>
                            )}
                            {assessment.status === 'pending_quote' && (
                                <button
                                    onClick={onAssignAssessor}
                                    className="bg-purple-600 text-white px-4 py-3 rounded-xl text-sm font-bold hover:bg-purple-700 transition-all shadow-sm flex items-center justify-center gap-2"
                                >
                                    <User size={18} />
                                    Assign Assessor
                                </button>
                            )}
                            {assessment.status === 'assigned' && (
                                <button
                                    onClick={onSchedule}
                                    className="bg-orange-600 text-white px-4 py-3 rounded-xl text-sm font-bold hover:bg-orange-700 transition-all shadow-sm flex items-center justify-center gap-2"
                                >
                                    <Calendar size={18} />
                                    Schedule Assessment
                                </button>
                            )}
                            {assessment.status === 'scheduled' && (
                                <button
                                    onClick={onComplete}
                                    className="bg-teal-600 text-white px-4 py-3 rounded-xl text-sm font-bold hover:bg-teal-700 transition-all shadow-sm flex items-center justify-center gap-2"
                                >
                                    <Building size={18} />
                                    Complete Assessment
                                </button>
                            )}
                            <button
                                onClick={() => onMessage('Please provide an update on your assessment status.')}
                                className="bg-gray-600 text-white px-4 py-3 rounded-xl text-sm font-bold hover:bg-gray-700 transition-all shadow-sm flex items-center justify-center gap-2"
                            >
                                <Send size={18} />
                                Send Message
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
);
