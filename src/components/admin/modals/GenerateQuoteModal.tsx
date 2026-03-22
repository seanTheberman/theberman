import { X, MapPin, Home, Loader2 } from 'lucide-react';
import type { Assessment } from '../../../types/admin';

interface QuoteData {
    price: string;
    estimated_date: string;
    notes: string;
}

interface Props {
    assessment: Assessment;
    quoteData: QuoteData;
    setQuoteData: (v: QuoteData) => void;
    isUpdating: boolean;
    onClose: () => void;
    onSubmit: (e: React.FormEvent) => void;
}

export const GenerateQuoteModal = ({ assessment, quoteData, setQuoteData, isUpdating, onClose, onSubmit }: Props) => (
    <div
        className="fixed inset-0 z-[10001] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
    >
        <div
            className="bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
        >
            <div className="p-6 border-b border-gray-100 flex justify-between items-center shrink-0">
                <h3 className="text-xl font-bold text-gray-900">Generate Quote</h3>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-colors">
                    <X size={24} />
                </button>
            </div>
            <div className="p-8 overflow-y-auto space-y-6">
                <div className="mb-6 space-y-4">
                    <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100/50">
                        <h4 className="text-[10px] font-bold text-blue-900 uppercase tracking-widest mb-3">Target Property</h4>
                        <div className="space-y-2">
                            <div className="flex items-start gap-2">
                                <MapPin className="text-blue-500 mt-0.5" size={14} />
                                <div>
                                    <p className="text-sm font-bold text-gray-900 leading-tight">{assessment.property_address}</p>
                                    <p className="text-[11px] text-gray-500 font-medium">{assessment.town}, {assessment.county}</p>
                                    {assessment.eircode && <p className="text-[11px] font-mono text-blue-600 mt-1">{assessment.eircode}</p>}
                                </div>
                            </div>
                            <div className="flex items-center gap-2 pt-1">
                                <Home className="text-blue-400" size={14} />
                                <p className="text-xs font-bold text-gray-700">{assessment.property_type || 'N/A'}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-green-50/50 p-4 rounded-xl border border-green-100/50">
                        <h4 className="text-[10px] font-bold text-[#007F00] uppercase tracking-widest mb-2">Client Information</h4>
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-green-100 text-[#007F00] flex items-center justify-center font-bold text-xs">
                                {(assessment.user?.full_name || assessment.contact_name || 'U').charAt(0)}
                            </div>
                            <div>
                                <p className="text-xs font-bold text-gray-900">{assessment.user?.full_name || assessment.contact_name || 'Unknown Client'}</p>
                                <p className="text-[10px] text-gray-500">{assessment.user?.email || assessment.contact_email}</p>
                                {(assessment.user?.phone || assessment.contact_phone) && (
                                    <p className="text-[10px] text-gray-400 font-medium mt-0.5">{assessment.user?.phone || assessment.contact_phone}</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <form onSubmit={onSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Quote Price (€)</label>
                        <input
                            required
                            type="number"
                            step="0.01"
                            value={quoteData.price}
                            onChange={(e) => setQuoteData({ ...quoteData, price: e.target.value })}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#007F00]"
                            placeholder="e.g. 250.00"
                        />
                        <p className="text-[10px] text-gray-400 font-medium italic mt-2">* Quote must include Berman's €30 service fee.</p>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Estimated Date</label>
                        <input
                            type="date"
                            value={quoteData.estimated_date}
                            onChange={(e) => setQuoteData({ ...quoteData, estimated_date: e.target.value })}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#007F00]"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Internal Notes</label>
                        <textarea
                            value={quoteData.notes}
                            onChange={(e) => setQuoteData({ ...quoteData, notes: e.target.value })}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#007F00]"
                            placeholder="Add any internal details or notes for the quote..."
                            rows={3}
                        />
                    </div>
                    <div className="pt-4 flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200">Cancel</button>
                        <button
                            type="submit"
                            disabled={isUpdating}
                            className="px-6 py-2 text-sm font-bold text-white bg-[#007F00] rounded-lg hover:bg-green-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                        >
                            {isUpdating ? <Loader2 className="animate-spin" size={16} /> : null}
                            {isUpdating ? 'Generating...' : 'Generate & Notify'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
);
