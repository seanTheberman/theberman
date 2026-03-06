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

const paymentBadge = (status?: string) => {
    if (status === 'paid') return 'bg-green-100 text-green-700';
    if (status === 'refunded') return 'bg-red-100 text-red-700';
    return 'bg-gray-100 text-gray-500';
};

export const AssessmentsView = ({ filteredAssessments, users_list, setSelectedAssessment, setShowAssessmentDetailModal, handleDeleteClick }: Props) => (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[700px]">
            <thead>
                <tr className="border-b border-gray-100 bg-gray-50/80">
                    <th className="px-5 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider">Status</th>
                    <th className="px-5 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider">Property</th>
                    <th className="px-5 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider">Client</th>
                    <th className="px-5 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider">Assessor</th>
                    <th className="px-5 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider">Scheduled</th>
                    <th className="px-5 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider">Payment</th>
                    <th className="px-5 py-3 text-right text-[10px] font-bold text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
                {filteredAssessments.length === 0 ? (
                    <tr><td colSpan={7} className="px-5 py-12 text-center text-gray-300 text-sm italic">No assessments found.</td></tr>
                ) : filteredAssessments.map(a => (
                    <tr key={a.id} className="hover:bg-gray-50/60 transition-colors group">
                        <td className="px-5 py-3">
                            <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${getStatusColor(a.status)}`}>
                                {a.status.replace(/_/g, ' ')}
                            </span>
                        </td>
                        <td className="px-5 py-3">
                            <div className="font-semibold text-gray-800 text-[13px] leading-tight max-w-[180px] truncate">{a.property_address}</div>
                            {(a.town || a.county) && (
                                <div className="text-[10px] text-gray-400 mt-0.5">{[a.town, a.county ? `Co. ${a.county}` : ''].filter(Boolean).join(', ')}</div>
                            )}
                        </td>
                        <td className="px-5 py-3">
                            <div className="font-medium text-gray-700 text-[12px]">{a.profiles?.full_name || a.contact_name || '—'}</div>
                            <div className="text-[10px] text-gray-400">{a.profiles?.email || a.contact_email}</div>
                        </td>
                        <td className="px-5 py-3">
                            {a.contractor_id ? (
                                <span className="text-[11px] font-semibold text-gray-700 bg-gray-100 px-2 py-0.5 rounded-md">
                                    {users_list.find(u => u.id === a.contractor_id)?.full_name || 'Unknown'}
                                </span>
                            ) : (
                                <span className="text-[11px] text-gray-300 italic">Unassigned</span>
                            )}
                        </td>
                        <td className="px-5 py-3 text-[12px] text-gray-400 whitespace-nowrap">
                            {a.scheduled_date ? new Date(a.scheduled_date).toLocaleDateString('en-GB') : <span className="text-gray-300 italic">TBC</span>}
                        </td>
                        <td className="px-5 py-3">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase ${paymentBadge(a.payment_status)}`}>
                                {a.payment_status || 'unpaid'}
                            </span>
                        </td>
                        <td className="px-5 py-3">
                            <div className="flex items-center justify-end gap-1">
                                <button
                                    onClick={() => { setSelectedAssessment(a); setShowAssessmentDetailModal(true); }}
                                    className="p-1.5 text-gray-300 hover:text-[#007F00] hover:bg-green-50 rounded-lg transition-all"
                                    title="View details"
                                ><Eye size={14} /></button>
                                <button
                                    onClick={() => handleDeleteClick(a.id, 'assessment')}
                                    className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                    title="Delete"
                                ><Trash2 size={14} /></button>
                            </div>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
        </div>
    </div>
);
