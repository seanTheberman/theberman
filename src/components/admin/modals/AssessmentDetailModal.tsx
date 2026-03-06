import { X, MapPin, Home, CheckCircle2, Calendar, Mail, TrendingUp, Briefcase, RefreshCw, MessageSquare } from 'lucide-react';
import type { Assessment } from '../../../types/admin';
import { getStatusColor } from '../adminUtils';

interface Props {
    assessment: Assessment;
    onClose: () => void;
    onGenerateQuote: () => void;
    onAssignAssessor: () => void;
    onSchedule: () => void;
    onComplete: () => void;
    onMessage: (content: string) => void;
}

export const AssessmentDetailModal = ({
    assessment, onClose, onGenerateQuote, onAssignAssessor, onSchedule, onComplete, onMessage,
}: Props) => (
    <div
        className="fixed inset-0 z-[10001] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
    >
        <div
            className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
        >
            <div className="bg-white border-b border-gray-100 p-6 flex justify-between items-center shrink-0">
                <div>
                    <h3 className="text-2xl font-bold text-gray-900">Assessment Details</h3>
                    <div className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide mt-2 ${getStatusColor(assessment.status)}`}>
                        {assessment.status.replace('_', ' ')}
                    </div>
                </div>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-colors">
                    <X size={24} />
                </button>
            </div>

            <div className="p-8 overflow-y-auto space-y-8">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-y-8 gap-x-6">
                    <div className="space-y-2">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Location</span>
                        <div className="flex items-start gap-2">
                            <MapPin className="text-[#007EA7] shrink-0 mt-0.5" size={16} />
                            <div>
                                <p className="text-sm font-bold text-gray-900 leading-tight">{assessment.town}, {assessment.county}</p>
                                <p className="text-[11px] text-gray-500 mt-0.5">{assessment.property_address}</p>
                            </div>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Property Type</span>
                        <div className="flex items-center gap-2">
                            <Home className="text-[#007EA7] shrink-0" size={16} />
                            <p className="text-sm font-bold text-gray-900">{assessment.property_type || 'N/A'}</p>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Size</span>
                        <p className="text-sm font-bold text-gray-900">{assessment.property_size || 'N/A'}</p>
                    </div>
                    <div className="space-y-2">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Bedrooms</span>
                        <p className="text-sm font-bold text-gray-900">{assessment.bedrooms || 'N/A'}</p>
                    </div>
                    <div className="space-y-2">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Purpose</span>
                        <p className="text-sm font-bold text-gray-900">{assessment.ber_purpose || 'N/A'}</p>
                    </div>
                    <div className="space-y-2">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Heat Pump</span>
                        <p className="text-sm font-bold text-gray-900">{assessment.heat_pump || 'No'}</p>
                    </div>
                </div>

                <div className="bg-gray-50 rounded-[2rem] p-8 border border-gray-100 flex flex-col md:flex-row gap-8">
                    <div className="flex-1 space-y-3">
                        <span className="text-[10px] font-black text-[#007EA7] uppercase tracking-widest block">
                            {assessment.status === 'completed' ? 'Completed On' : 'Preferred Schedule'}
                        </span>
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-white rounded-xl text-[#007EA7] shadow-sm">
                                {assessment.status === 'completed' ? <CheckCircle2 size={20} className="text-[#007F00]" /> : <Calendar size={20} />}
                            </div>
                            <div>
                                <p className="text-sm font-black text-gray-900">
                                    {assessment.status === 'completed'
                                        ? (assessment.completed_at ? new Date(assessment.completed_at).toLocaleDateString('en-GB') : 'Completed')
                                        : (assessment.preferred_date || assessment.scheduled_date ? new Date(assessment.scheduled_date || assessment.preferred_date!).toLocaleDateString('en-GB') : 'TBC')}
                                </p>
                                {assessment.preferred_time && <p className="text-xs text-gray-500">{assessment.preferred_time}</p>}
                            </div>
                        </div>
                    </div>
                    <div className="flex-1 space-y-3">
                        <span className="text-[10px] font-black text-[#007EA7] uppercase tracking-widest block">Additional Features</span>
                        <div className="flex flex-wrap gap-2">
                            {assessment.additional_features && assessment.additional_features.length > 0
                                ? assessment.additional_features.map((f, i) => (
                                    <span key={i} className="px-2 py-1 bg-blue-50 text-blue-700 rounded-lg text-[10px] font-bold">{f}</span>
                                ))
                                : <span className="text-sm text-gray-400 font-medium">None listed</span>
                            }
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between p-5 bg-white rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-green-100 text-[#007F00] flex items-center justify-center font-bold text-sm">
                            {(assessment.profiles?.full_name || assessment.contact_name || 'U').charAt(0)}
                        </div>
                        <div>
                            <p className="text-sm font-black text-gray-900">{assessment.profiles?.full_name || assessment.contact_name || 'Unknown Client'}</p>
                            <p className="text-xs text-gray-500 font-medium">{assessment.profiles?.email || assessment.contact_email}</p>
                            {(assessment.profiles?.phone || assessment.contact_phone) && (
                                <p className="text-[10px] text-gray-400 font-medium mt-0.5">{assessment.profiles?.phone || assessment.contact_phone}</p>
                            )}
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <a href={`mailto:${assessment.profiles?.email || assessment.contact_email}`} className="p-2.5 bg-white border border-gray-100 text-[#007F00] rounded-xl hover:bg-green-50 transition-all shadow-sm">
                            <Mail size={18} />
                        </a>
                    </div>
                </div>

                <div className="pt-6 border-t border-gray-100">
                    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Required Actions</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {assessment.status === 'submitted' && (
                            <button
                                onClick={onGenerateQuote}
                                className="bg-[#007F00] text-white px-4 py-3 rounded-xl text-sm font-bold hover:bg-green-700 transition-all shadow-sm flex items-center justify-center gap-2"
                            >
                                <TrendingUp size={18} />
                                Generate Quote
                            </button>
                        )}
                        {!assessment.contractor_id && assessment.status !== 'completed' && (
                            <button
                                onClick={onAssignAssessor}
                                className="bg-[#007EA7] text-white px-4 py-3 rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-sm flex items-center justify-center gap-2"
                            >
                                <Briefcase size={18} />
                                Assign Assessor
                            </button>
                        )}
                        {(assessment.status === 'quote_accepted' || assessment.status === 'assigned') && (
                            <button
                                onClick={onSchedule}
                                className="bg-indigo-600 text-white px-4 py-3 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-sm flex items-center justify-center gap-2"
                            >
                                <Calendar size={18} />
                                Schedule
                            </button>
                        )}
                        {assessment.status === 'scheduled' && (
                            <button
                                onClick={onComplete}
                                className="bg-purple-600 text-white px-4 py-3 rounded-xl text-sm font-bold hover:bg-purple-700 transition-all shadow-sm flex items-center justify-center gap-2"
                            >
                                <RefreshCw size={18} />
                                Complete
                            </button>
                        )}
                        <button
                            onClick={() => {
                                const name = assessment.profiles?.full_name || assessment.contact_name || 'there';
                                onMessage(`Hi ${name},\n\nI'm writing to you regarding your BER assessment for ${assessment.property_address}.\n\n[Type your message here]\n\nBest regards,\nThe Berman Team`);
                            }}
                            className="bg-white border-2 border-gray-900 text-gray-900 px-4 py-3 rounded-xl text-sm font-bold hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
                        >
                            <MessageSquare size={18} />
                            Message (Gmail)
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
);
