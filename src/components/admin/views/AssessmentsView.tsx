import React from 'react';
import { Eye, Trash2, Search, MapPin } from 'lucide-react';
import type { Assessment, Profile } from '../../../types/admin';
import { getStatusColor } from '../adminUtils';

interface Props {
    assessments: Assessment[];
    filteredAssessments: Assessment[];
    users_list: Profile[];
    searchTerm: string;
    setSearchTerm: (v: string) => void;
    locationFilter: string;
    setLocationFilter: (v: string) => void;
    setSelectedAssessment: (a: Assessment | null) => void;
    setShowAssessmentDetailModal: (v: boolean) => void;
    handleDeleteClick: (id: string, type: 'assessment') => void;
}

const paymentBadge = (status?: string) => {
    if (status === 'paid') return 'bg-green-100 text-green-700';
    if (status === 'refunded') return 'bg-red-100 text-red-700';
    return 'bg-gray-100 text-gray-500';
};

export const AssessmentsView = React.memo(({
    assessments, filteredAssessments, users_list,
    searchTerm, setSearchTerm, locationFilter, setLocationFilter,
    setSelectedAssessment, setShowAssessmentDetailModal, handleDeleteClick
}: Props) => {
    // Build unique county list from all assessment data (before filtering)
    const uniqueCounties = Array.from(
        new Set(assessments.map(a => a.county).filter(Boolean))
    ).sort() as string[];

    return (
        <div className="space-y-4">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between bg-white px-4 py-3 rounded-xl border border-gray-100 shadow-sm">
                <div className="flex flex-col sm:flex-row gap-2 flex-1 max-w-xl">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={15} />
                        <input
                            type="text"
                            placeholder="Address, client, status..."
                            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#007F00]/20 focus:border-[#007F00] outline-none transition-all bg-gray-50"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="relative w-full sm:w-44">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={13} />
                        <select
                            className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#007F00]/20 focus:border-[#007F00] outline-none transition-all bg-gray-50 appearance-none text-gray-600"
                            value={locationFilter}
                            onChange={e => setLocationFilter(e.target.value)}
                        >
                            <option value="">All Preference locations</option>
                            {uniqueCounties.map(loc => (
                                <option key={loc} value={loc}>{loc}</option>
                            ))}
                        </select>
                    </div>
                </div>
                <span className="text-xs text-gray-400">
                    {filteredAssessments.length} result{filteredAssessments.length !== 1 ? 's' : ''}
                    {locationFilter && ` · ${locationFilter}`}
                </span>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm min-w-[700px]">
                        <thead>
                            <tr className="border-b border-gray-100 bg-gray-50/80">
                                <th className="px-5 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider">Status</th>
                                <th className="px-5 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider">Notified</th>
                                <th className="px-5 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider">Property</th>
                                <th className="px-5 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider">Client</th>
                                <th className="px-5 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider">Assessor</th>
                                <th className="px-5 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider">Referred By</th>
                                <th className="px-5 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider">Scheduled</th>
                                <th className="px-5 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider">Payment</th>
                                <th className="px-5 py-3 text-right text-[10px] font-bold text-gray-400 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredAssessments.length === 0 ? (
                                <tr><td colSpan={8} className="px-5 py-12 text-center text-gray-300 text-sm italic">
                                    No assessments found{locationFilter ? ` in ${locationFilter}` : ''}.
                                </td></tr>
                            ) : filteredAssessments.map(a => (
                                <tr
                                    key={a.id}
                                    onClick={() => { setSelectedAssessment(a); setShowAssessmentDetailModal(true); }}
                                    className="hover:bg-gray-50/60 transition-colors group cursor-pointer"
                                >
                                    <td className="px-5 py-3">
                                        <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${getStatusColor(a.status)}`}>
                                            {a.status.replace(/_/g, ' ')}
                                        </span>
                                    </td>
                                    <td className="px-5 py-3">
                                        {a.job_live_notified_at ? (
                                            <div className="flex flex-col gap-1">
                                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide bg-green-100 text-green-700">
                                                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
                                                    Sent
                                                </span>
                                                <span className="text-[9px] text-gray-400">
                                                    {new Date(a.job_live_notified_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                                {(a.job_live_email_sent || a.job_live_sms_sent) && (
                                                    <span className="text-[8px] text-gray-400">
                                                        {[
                                                            a.job_live_email_sent && 'Email',
                                                            a.job_live_sms_sent && 'SMS'
                                                        ].filter(Boolean).join(' + ')}
                                                    </span>
                                                )}
                                            </div>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide bg-gray-100 text-gray-500">
                                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/></svg>
                                                Pending
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-5 py-3">
                                        <div className="font-semibold text-gray-800 text-[13px] leading-tight max-w-[180px] truncate">{a.property_address}</div>
                                        {(a.town || a.county) && (
                                            <div className="text-[10px] text-gray-400 mt-0.5">{[a.town, a.county ? `Co. ${a.county}` : ''].filter(Boolean).join(', ')}</div>
                                        )}
                                    </td>
                                    <td className="px-5 py-3">
                                        <div className="font-medium text-gray-700 text-[12px]">{a.user?.full_name || a.contact_name || '—'}</div>
                                        <div className="text-[10px] text-gray-400">{a.user?.email || a.contact_email}</div>
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
                                    <td className="px-5 py-3">
                                        {a.referred_by ? (
                                            <div>
                                                <div className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
                                                    {a.referred_by.name}
                                                </div>
                                                {a.referred_by.company_name && (
                                                    <div className="text-[9px] text-gray-400 mt-0.5">{a.referred_by.company_name}</div>
                                                )}
                                            </div>
                                        ) : (
                                            <span className="text-[11px] text-gray-300 italic">Direct</span>
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
                                        <div className="flex items-center justify-end gap-1" onClick={e => e.stopPropagation()}>
                                            <button
                                                onClick={() => { setSelectedAssessment(a); setShowAssessmentDetailModal(true); }}
                                                className="p-1.5 text-gray-300 hover:text-[#007F00] hover:bg-green-50 rounded-lg transition-all"
                                                title="View details"
                                            ><Eye size={14} /></button>
                                            <button
                                                onClick={() => handleDeleteClick(a.id, 'assessment')}
                                                className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
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
        </div>
    );
});
