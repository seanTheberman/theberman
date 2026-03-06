import { X, Loader2 } from 'lucide-react';

interface Props {
    certUrl: string;
    setCertUrl: (v: string) => void;
    isUpdating: boolean;
    onClose: () => void;
    onSubmit: (e: React.FormEvent) => void;
}

export const CompleteModal = ({ certUrl, setCertUrl, isUpdating, onClose, onSubmit }: Props) => (
    <div
        className="fixed inset-0 z-[10001] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
    >
        <div
            className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
        >
            <div className="p-6 border-b border-gray-100 flex justify-between items-center shrink-0">
                <h3 className="text-xl font-bold text-gray-900">Complete Assessment</h3>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-colors">
                    <X size={24} />
                </button>
            </div>
            <form onSubmit={onSubmit} className="p-8 overflow-y-auto space-y-4">
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 mb-4">
                    <p className="text-xs text-blue-800 font-medium">Finalizing this assessment will allow the homeowner to download their BER certificate.</p>
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Certificate URL (e.g. Google Drive/Dropbox/S3)</label>
                    <input
                        type="url"
                        required
                        value={certUrl}
                        onChange={(e) => setCertUrl(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#007F00]"
                        placeholder="https://..."
                    />
                </div>
                <div className="pt-4 flex justify-end gap-3">
                    <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg">Cancel</button>
                    <button
                        type="submit"
                        disabled={isUpdating}
                        className="px-6 py-2 text-sm font-bold text-white bg-[#007F00] rounded-lg hover:bg-green-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {isUpdating ? <Loader2 className="animate-spin" size={16} /> : null}
                        {isUpdating ? 'Finalizing...' : 'Complete Assessment'}
                    </button>
                </div>
            </form>
        </div>
    </div>
);
