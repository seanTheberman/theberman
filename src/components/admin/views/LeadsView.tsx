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

export const LeadsView = ({ leads, filteredLeads, searchTerm, setSearchTerm, setSelectedLead, handleDeleteClick }: Props) => (
    <div className="space-y-4">
        <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <div className="relative w-full max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                    type="text"
                    placeholder="Search by name, email, location, or status..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#007F00]/20 focus:border-[#007F00] transition-all text-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <div className="text-xs text-gray-400 font-medium">
                Showing {filteredLeads.length} of {leads.length} leads
            </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Mobile View */}
            <div className="md:hidden">
                {filteredLeads.length === 0 ? (
                    <div className="p-12 text-center text-gray-400 italic">No leads found.</div>
                ) : (
                    filteredLeads.map((lead) => (
                        <div key={lead.id} className="p-4 border-b border-gray-100 space-y-3">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="font-bold text-gray-900">{lead.name}</p>
                                    <p className="text-xs text-gray-500">{new Date(lead.created_at).toLocaleDateString()}</p>
                                </div>
                                <LeadStatusBadge status={lead.status || 'new'} />
                            </div>
                            <div className="text-sm text-gray-600">
                                <p>{lead.email}</p>
                                <p className="mt-1">{lead.town}, {lead.county}</p>
                            </div>
                            <div className="flex justify-end gap-2 pt-2">
                                <button
                                    onClick={() => setSelectedLead(lead)}
                                    className="text-xs bg-gray-50 border border-gray-200 px-3 py-2 rounded-lg font-bold text-gray-700"
                                >
                                    View Details
                                </button>
                                <button
                                    onClick={() => handleDeleteClick(lead.id, 'lead')}
                                    className="text-xs bg-red-50 border border-red-100 px-3 py-2 rounded-lg font-bold text-red-600 hover:bg-red-100 transition-colors"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Desktop View */}
            <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-600">
                    <thead className="bg-gray-50/50 text-gray-900 font-bold uppercase tracking-wider text-xs border-b border-gray-100">
                        <tr>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Date</th>
                            <th className="px-6 py-4">Client Name</th>
                            <th className="px-6 py-4">Location</th>
                            <th className="px-6 py-4">Purpose</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {filteredLeads.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-gray-400 italic">
                                    No leads found matching your search.
                                </td>
                            </tr>
                        ) : (
                            filteredLeads.map((lead) => (
                                <tr key={lead.id} className="hover:bg-green-50/30 transition-colors group">
                                    <td className="px-6 py-4">
                                        <LeadStatusBadge status={lead.status || 'new'} />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                                        {new Date(lead.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 font-medium text-gray-900">
                                        {lead.name}
                                        <div className="text-xs text-gray-400 font-normal">{lead.email}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {lead.town ? `${lead.town}, ${lead.county || ''} ` : '-'}
                                    </td>
                                    <td className="px-6 py-4 text-gray-500">
                                        {lead.purpose || '-'}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => setSelectedLead(lead)}
                                                className="flex items-center gap-1 bg-white border border-gray-200 text-gray-600 hover:text-[#007F00] hover:border-[#007F00] px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm"
                                            >
                                                <Eye size={14} />
                                                View More
                                            </button>
                                            <button
                                                onClick={() => handleDeleteClick(lead.id, 'lead')}
                                                className="text-gray-400 hover:text-red-500 p-2 rounded-lg hover:bg-red-50 transition-all"
                                                title="Delete Lead"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
);
