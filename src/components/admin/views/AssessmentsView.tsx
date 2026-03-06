import { Eye, Trash2 } from 'lucide-react';
import type { Assessment, Profile } from '../../../types/admin';
import { getStatusColor } from '../adminUtils';

interface Props {
    filteredAssessments: Assessment[];
    users_list: Profile[];
    setSelectedAssessment: (a: Assessment | null) => void;
    setShowAssessmentDetailModal: (v: boolean) => void;
    handleDeleteClick: (id: string, type: 'lead' | 'sponsor' | 'assessment' | 'user') => void;
}

export const AssessmentsView = ({
    filteredAssessments,
    users_list,
    setSelectedAssessment,
    setShowAssessmentDetailModal,
    handleDeleteClick,
}: Props) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
                <thead className="bg-gray-50/50 text-gray-900 font-bold uppercase tracking-wider text-xs border-b border-gray-100">
                    <tr>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4">Address</th>
                        <th className="px-6 py-4">Client</th>
                        <th className="px-6 py-4">Assessor</th>
                        <th className="px-6 py-4">Scheduled</th>
                        <th className="px-6 py-4">Payment</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                    {filteredAssessments.map((assessment) => (
                        <tr key={assessment.id} className="hover:bg-green-50/30 transition-colors group">
                            <td className="px-6 py-4">
                                <div className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${getStatusColor(assessment.status)}`}>
                                    {assessment.status.replace('_', ' ')}
                                </div>
                            </td>
                            <td className="px-6 py-4 font-medium text-gray-900">
                                {assessment.property_address}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="font-medium text-gray-900">{assessment.profiles?.full_name || 'Generic User'}</div>
                                <div className="text-xs text-gray-400">{assessment.profiles?.email}</div>
                            </td>
                            <td className="px-6 py-4">
                                {assessment.contractor_id ? (
                                    <span className="text-xs font-bold text-gray-700 bg-gray-100 px-2 py-1 rounded-md">
                                        {users_list.find(u => u.id === assessment.contractor_id)?.full_name || 'Unknown'}
                                    </span>
                                ) : (
                                    <span className="text-xs text-gray-400 italic">Unassigned</span>
                                )}
                            </td>
                            <td className="px-6 py-4 text-gray-500">
                                {assessment.scheduled_date ? new Date(assessment.scheduled_date).toLocaleDateString() : 'TBC'}
                            </td>
                            <td className="px-6 py-4">
                                <span className={`text-xs font-bold px-2 py-1 rounded-md ${assessment.payment_status === 'paid' ? 'bg-green-100 text-green-700' :
                                    assessment.payment_status === 'refunded' ? 'bg-red-100 text-red-700' :
                                        'bg-gray-100 text-gray-500'
                                    }`}>
                                    {assessment.payment_status ? assessment.payment_status.toUpperCase() : 'UNPAID'}
                                </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                                <div className="flex items-center justify-end gap-2">
                                    <button
                                        onClick={() => {
                                            setSelectedAssessment(assessment);
                                            setShowAssessmentDetailModal(true);
                                        }}
                                        className="bg-white border border-gray-200 text-gray-600 hover:text-[#007F00] hover:border-[#007F00] px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm flex items-center gap-1"
                                    >
                                        <Eye size={14} />
                                        View Details
                                    </button>
                                    <button
                                        onClick={() => handleDeleteClick(assessment.id, 'assessment')}
                                        className="text-gray-400 hover:text-red-500 p-2 rounded-lg hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
                                        title="Delete Assessment"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
);
