import { X, Loader2 } from 'lucide-react';
import type { Assessment, Profile } from '../../../types/admin';

interface Props {
    assessment: Assessment;
    contractors: Profile[];
    isUpdating: boolean;
    onClose: () => void;
    onAssign: (contractorId: string) => void;
}

export const AssignAssessorModal = ({ assessment, contractors, isUpdating, onClose, onAssign }: Props) => (
    <div
        className="fixed inset-0 z-[10001] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
    >
        <div
            className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
        >
            <div className="p-6 border-b border-gray-100 flex justify-between items-center shrink-0">
                <h3 className="text-xl font-bold text-gray-900">Assign Assessor</h3>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-colors">
                    <X size={24} />
                </button>
            </div>
            <div className="p-8 overflow-y-auto">
                <div className="mb-4">
                    <p className="text-sm text-gray-500 mb-2">Select a certified BER Assessor for:</p>
                    <p className="font-bold text-gray-800 text-sm bg-gray-50 p-2 rounded border border-gray-100">
                        {assessment.property_address}
                    </p>
                </div>
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {contractors.length === 0 ? (
                        <p className="text-center text-gray-400 text-sm py-4">No Assessors found.</p>
                    ) : (
                        contractors.map(contractor => (
                            <button
                                key={contractor.id}
                                onClick={() => onAssign(contractor.id)}
                                className="w-full flex items-center gap-3 p-3 rounded-xl border border-gray-200 hover:border-[#007F00] hover:bg-green-50 transition-all text-left group"
                            >
                                <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm shrink-0 group-hover:bg-white">
                                    {contractor.full_name.charAt(0)}
                                </div>
                                <div className="flex-grow">
                                    <p className="font-bold text-gray-900 text-sm">{contractor.full_name}</p>
                                    <p className="text-xs text-gray-500">
                                        {contractor.email}
                                        {contractor.home_county && ` • Co. ${contractor.home_county}`}
                                        {contractor.preferred_counties && contractor.preferred_counties.length > 0 && ` (+${contractor.preferred_counties.filter(c => c !== contractor.home_county).length})`}
                                    </p>
                                </div>
                                {isUpdating && <Loader2 className="animate-spin" size={16} />}
                            </button>
                        ))
                    )}
                </div>
                <div className="pt-4 mt-2 border-t border-gray-100 flex justify-end">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200">
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    </div>
);
