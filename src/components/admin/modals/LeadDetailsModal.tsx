import { X, Calendar, Mail, Phone, MapPin, Home } from 'lucide-react';
import { ChevronDown, Loader2 } from 'lucide-react';
import type { Lead } from '../../../types/admin';
import { getStatusColor } from '../adminUtils';
import toast from 'react-hot-toast';

interface Props {
    lead: Lead;
    isUpdating: boolean;
    onClose: () => void;
    updateStatus: (id: string, status: string) => void;
}

export const LeadDetailsModal = ({ lead, isUpdating, onClose, updateStatus }: Props) => (
    <div
        className="fixed inset-0 z-[10001] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
    >
        <div
            className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
        >
            <div className="bg-white border-b border-gray-100 p-6 flex justify-between items-start shrink-0">
                <div>
                    <h3 className="text-2xl font-bold text-gray-900">Lead Details</h3>
                    <p className="text-sm text-gray-400 flex items-center gap-2 mt-1.5 font-medium">
                        <Calendar size={14} />
                        Received: {new Date(lead.created_at).toLocaleString()}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative group">
                        <select
                            value={lead.status || 'new'}
                            disabled={isUpdating}
                            onChange={(e) => updateStatus(lead.id, e.target.value)}
                            className={`appearance-none cursor-pointer pl-4 pr-9 py-2 rounded-xl text-xs font-bold uppercase tracking-wider border-0 ring-1 ring-inset focus:ring-2 outline-none transition-all shadow-sm ${getStatusColor(lead.status || 'new')} ring-black/5 hover:ring-black/10 disabled:opacity-50 disabled:cursor-wait`}
                        >
                            <option value="new">New</option>
                            <option value="contacted">Contacted</option>
                            <option value="completed">Completed</option>
                        </select>
                        {isUpdating ? (
                            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 animate-spin" size={14} />
                        ) : (
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500/80 pointer-events-none group-hover:text-gray-700 transition-colors" size={14} />
                        )}
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-colors">
                        <X size={24} />
                    </button>
                </div>
            </div>

            <div className="p-8 overflow-y-auto space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="border border-gray-100 rounded-2xl p-6 bg-white hover:border-[#007F00]/30 hover:shadow-md hover:shadow-green-500/5 transition-all duration-300 group">
                        <div className="flex items-center justify-between mb-6">
                            <h4 className="text-[11px] font-extrabold text-[#007F00] uppercase tracking-widest bg-green-50 px-3 py-1 rounded-full">Client Information</h4>
                        </div>
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-green-50 to-green-100 text-[#007F00] flex items-center justify-center font-bold text-xl shadow-sm border border-green-200/50">
                                {lead.name.charAt(0)}
                            </div>
                            <div>
                                <p className="font-bold text-gray-900 text-lg break-words">{lead.name}</p>
                                <p className="text-xs text-gray-500 font-medium bg-gray-100 px-2 py-0.5 rounded inline-block mt-1">Customer</p>
                            </div>
                        </div>
                        <div className="border-t border-dashed border-gray-200 my-5"></div>
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 text-sm text-gray-600 font-medium p-2 hover:bg-gray-50 rounded-lg transition-colors -mx-2">
                                <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 shrink-0">
                                    <Mail size={16} />
                                </div>
                                <span className="truncate flex-1" title={lead.email}>{lead.email}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-gray-600 font-medium p-2 hover:bg-gray-50 rounded-lg transition-colors -mx-2">
                                <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 shrink-0">
                                    <Phone size={16} />
                                </div>
                                {lead.phone}
                            </div>
                        </div>
                    </div>

                    <div className="border border-gray-100 rounded-2xl p-6 bg-white hover:border-[#007EA7]/30 hover:shadow-md hover:shadow-blue-500/5 transition-all duration-300 h-full flex flex-col justify-between group">
                        <div>
                            <div className="flex items-center justify-between mb-6">
                                <h4 className="text-[11px] font-extrabold text-[#007EA7] uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full">Property Details</h4>
                            </div>
                            <div className="space-y-6">
                                <div className="flex items-start gap-4 p-2 -mx-2">
                                    <div className="w-10 h-10 rounded-full bg-blue-50 text-[#007EA7] flex items-center justify-center shrink-0 border border-blue-100">
                                        <MapPin size={20} />
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900 text-lg leading-tight mb-1">{lead.town || 'Not provided'}</p>
                                        <p className="text-sm text-gray-500 font-medium">{lead.county || 'County not provided'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-gray-700 p-2 hover:bg-blue-50/50 rounded-lg transition-colors -mx-2">
                                    <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 shrink-0">
                                        <Home size={18} />
                                    </div>
                                    <span className="font-medium text-gray-600">{lead.property_type || 'N/A'}</span>
                                </div>
                            </div>
                        </div>
                        <div className="mt-6">
                            <div className="inline-flex items-center px-4 py-1.5 bg-[#007EA7] text-white rounded-full text-xs font-bold shadow-sm">
                                Purpose: {lead.purpose || 'N/A'}
                            </div>
                        </div>
                    </div>
                </div>

                <div>
                    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 pl-1">MESSAGE FROM CLIENT</h4>
                    <div className="bg-gray-50 rounded-xl p-6 text-gray-700 text-sm leading-relaxed border border-gray-100 font-medium">
                        {lead.message}
                    </div>
                </div>

                <div className="flex flex-col gap-3 pt-4 border-t border-gray-50">
                    <div className="grid grid-cols-1 gap-4 relative z-10">
                        <a
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => toast.success('Opening Gmail...')}
                            href={`https://mail.google.com/mail/?view=cm&fs=1&to=${lead.email}&su=${encodeURIComponent('Re: Your inquiry to The Berman')}&body=${encodeURIComponent(`Hi ${lead.name},\n\nI'm writing to you regarding your BER assessment for ${lead.town || 'your area'}.\n\n`)}`}
                            className="w-full bg-white border-2 border-gray-900 text-gray-900 font-bold text-sm py-4 rounded-2xl hover:bg-gray-50 transition-all flex items-center justify-center gap-2 shadow-sm hover:shadow-lg active:scale-[0.98] no-underline"
                        >
                            <Mail size={18} />
                            Client Message
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </div>
);
