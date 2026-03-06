import { AlertTriangle, Loader2 } from 'lucide-react';

interface Props {
    itemType: string;
    isDeleting: boolean;
    onCancel: () => void;
    onConfirm: () => void;
}

export const DeleteConfirmModal = ({ itemType, isDeleting, onCancel, onConfirm }: Props) => (
    <div
        className="fixed inset-0 z-[10001] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onCancel}
    >
        <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8 animate-in zoom-in-95 duration-200 text-center"
            onClick={(e) => e.stopPropagation()}
        >
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-100">
                <AlertTriangle size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Are you sure?</h3>
            <p className="text-gray-500 text-sm mb-8">
                This action cannot be undone. This {itemType} will be permanently removed from our records.
            </p>
            <div className="flex gap-3">
                <button
                    onClick={onCancel}
                    disabled={isDeleting}
                    className="flex-1 px-4 py-3 text-sm font-bold text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50"
                >
                    Cancel
                </button>
                <button
                    onClick={onConfirm}
                    disabled={isDeleting}
                    className="flex-1 px-4 py-3 text-sm font-bold text-white bg-red-600 rounded-xl hover:bg-red-700 transition-colors shadow-lg shadow-red-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {isDeleting ? (
                        <><Loader2 size={18} className="animate-spin" /> Deleting...</>
                    ) : (
                        'Delete Permanently'
                    )}
                </button>
            </div>
        </div>
    </div>
);
