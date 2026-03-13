import React from 'react';
import { Search, Eye, Trash2 } from 'lucide-react';
import type { Lead } from '../../../types/admin';
import { LeadStatusBadge } from '../StatusBadges';

interface Props {
    leads: Lead[];
    filteredLeads: Lead[];
    searchTerm: string;
    setSearchTerm: (v: string) => void;
    setSelectedLead: (l: Lead | null) => void;
    handleDeleteClick: (id: string, type: 'lead' | 'sponsor' | 'assessment' | 'user') => void;
}

export const LeadsView = React.memo(({ leads, filteredLeads, searchTerm, setSearchTerm, setSelectedLead, handleDeleteClick }: Props) => (
    <div className="space-y-4">
        {/* Toolbar */}
        <div className="flex items-center justify-between bg-white px-4 py-3 rounded-xl border border-gray-100 shadow-sm">
            <div className="relative w-full max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={15} />
                <input
                    type="text"
                    placeholder="Name, email, location or status..."
                    className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#007F00]/20 focus:border-[#007F00] outline-none transition-all bg-gray-50"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
            </div>
            <span className="text-xs text-gray-400 ml-4">{filteredLeads.length} of {leads.length} leads</span>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[600px]">
                    <thead>
                        <tr className="border-b border-gray-100 bg-gray-50/80">
                            <th className="px-5 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider">Status</th>
                            <th className="px-5 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider">Date</th>
                            <th className="px-5 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider">Contact</th>
                            <th className="px-5 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider">Location</th>
                            <th className="px-5 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider">Purpose</th>
                            <th className="px-5 py-3 text-right text-[10px] font-bold text-gray-400 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {filteredLeads.length === 0 ? (
                            <tr><td colSpan={6} className="px-5 py-12 text-center text-gray-300 text-sm italic">No leads found.</td></tr>
                        ) : filteredLeads.map(lead => (
                            <tr key={lead.id} className="hover:bg-gray-50/60 transition-colors cursor-pointer" onClick={() => setSelectedLead(lead)}>
                                <td className="px-5 py-3"><LeadStatusBadge status={lead.status || 'new'} /></td>
                                <td className="px-5 py-3 text-[12px] text-gray-400 whitespace-nowrap">
                                    {new Date(lead.created_at).toLocaleDateString('en-GB')}
                                </td>
                                <td className="px-5 py-3">
                                    <div className="font-semibold text-gray-800 text-[13px]">{lead.name}</div>
                                    <div className="text-[11px] text-gray-400">{lead.email}</div>
                                    {lead.phone && <div className="text-[10px] text-gray-300">{lead.phone}</div>}
                                </td>
                                <td className="px-5 py-3 text-[12px] text-gray-500">
                                    {lead.town ? `${lead.town}${lead.county ? `, Co. ${lead.county}` : ''}` : lead.county ? `Co. ${lead.county}` : '—'}
                                </td>
                                <td className="px-5 py-3 text-[12px] text-gray-400">{lead.purpose || '—'}</td>
                                <td className="px-5 py-3">
                                    <div className="flex items-center justify-end gap-1" onClick={e => e.stopPropagation()}>
                                        <button onClick={() => setSelectedLead(lead)} title="View details" className="p-1.5 text-gray-300 hover:text-[#007F00] hover:bg-green-50 rounded-lg transition-all"><Eye size={14} /></button>
                                        <button onClick={() => handleDeleteClick(lead.id, 'lead')} title="Delete" className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"><Trash2 size={14} /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
));
