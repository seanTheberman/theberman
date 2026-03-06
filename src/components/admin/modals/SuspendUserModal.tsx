import { X, AlertTriangle, Loader2 } from 'lucide-react';

interface Props {
    item: { id: string; name: string; currentStatus: boolean };
    isUpdating: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

export const SuspendUserModal = ({ item, isUpdating, onClose, onConfirm }: Props) => (
    <div
        className="fixed inset-0 z-[10001] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
    >
        <div
            className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
        >
            <div className="p-6 border-b border-gray-100 flex justify-between items-center shrink-0">
                <h3 className="text-xl font-bold text-gray-900">
                    {item.currentStatus ? 'Suspend User' : 'Activate User'}
                </h3>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-colors">
                    <X size={24} />
                </button>
            </div>

            <div className="p-8 overflow-y-auto text-center">
                <div className="w-20 h-20 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-6 border border-amber-100">
                    <AlertTriangle size={40} />
                </div>
                <p className="text-gray-600 mb-8 leading-relaxed">
                    Are you sure you want to{' '}
                    {item.currentStatus
                        ? <span className="text-red-600 font-bold">suspend</span>
                        : <span className="text-green-600 font-bold">activate</span>
                    }{' '}
                    <strong>{item.name}</strong>?
                    {item.currentStatus && (
                        <span className="block mt-2 text-sm text-gray-400">The user will no longer be able to access their dashboard until reactivated.</span>
                    )}
                </p>
                <div className="flex gap-3">
                    <button onClick={onClose} className="flex-1 px-4 py-3 text-sm font-bold text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isUpdating}
                        className={`flex-[2] px-6 py-3 rounded-xl text-white font-bold transition-all shadow-lg flex items-center justify-center gap-2 ${item.currentStatus ? 'bg-red-600 hover:bg-red-700 shadow-red-100' : 'bg-green-600 hover:bg-green-700 shadow-green-100'}`}
                    >
                        {isUpdating ? <Loader2 size={18} className="animate-spin" /> : null}
                        {item.currentStatus ? 'Suspend Account' : 'Activate Account'}
                    </button>
                </div>
            </div>
        </div>
    </div>
);
