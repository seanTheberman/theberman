import React, { useMemo, useState } from 'react';
import { Search, Plus, Briefcase, AlertTriangle, Edit2, Trash2, ExternalLink, Star, Filter, Building2, HardHat } from 'lucide-react';
import type { Profile, CatalogueListing } from '../../../types/admin';

type CatalogueViewType = 'businesses' | 'assessors';

interface Props {
    listings: CatalogueListing[];
    users_list: Profile[];
    searchTerm: string;
    setSearchTerm: (v: string) => void;
    locationFilter: string;
    setLocationFilter: (v: string) => void;
    handleOpenCatalogueView: (business: Profile | null, existingListing?: CatalogueListing) => void;
    toggleCatalogueStatus: (id: string, currentStatus: boolean) => void;
    toggleCatalogueFeatured: (id: string, currentFeatured: boolean) => void;
    handleDeleteListing: (id: string) => void;
}

export const CatalogueView = React.memo(({
    listings, users_list, searchTerm, setSearchTerm, locationFilter, setLocationFilter,
    handleOpenCatalogueView, toggleCatalogueStatus, toggleCatalogueFeatured, handleDeleteListing,
}: Props) => {
    // State for toggling between Businesses and BER Assessors
    const [activeView, setActiveView] = useState<CatalogueViewType>('businesses');

    // Helper function to get owner role for a listing
    const getOwnerRole = (listing: CatalogueListing): string | null => {
        const owner = users_list.find(u => u.id === listing.user_id || u.id === listing.owner_id);
        return owner?.role || null;
    };

    // Filter listings based on active view (Businesses vs Assessors)
    const filteredByType = useMemo(() => {
        return listings.filter(l => {
            const ownerRole = getOwnerRole(l);
            if (activeView === 'businesses') {
                return ownerRole === 'business';
            } else {
                return ownerRole === 'contractor';
            }
        });
    }, [listings, activeView, users_list]);
    // Get unique counties from all listings
    const uniqueCounties = useMemo(() => {
        const allCounties = new Set<string>();
        listings.forEach(l => {
            // Add main county
            if (l.county) allCounties.add(l.county);
            
            // Also check additional addresses for counties
            if (l.additional_addresses && Array.isArray(l.additional_addresses)) {
                l.additional_addresses.forEach((addr: string) => {
                    if (typeof addr === 'string') {
                        if (addr.includes('|||')) {
                            const county = addr.split('|||')[1];
                            if (county && county.trim()) allCounties.add(county.trim());
                        } else {
                            // If it's just a county name without the ||| separator
                            const trimmed = addr.trim();
                            if (trimmed && !trimmed.includes('+') && trimmed.length > 2) {
                                allCounties.add(trimmed);
                            }
                        }
                    }
                });
            }
        });
        return Array.from(allCounties).filter(Boolean).sort();
    }, [listings]);

    const filtered = useMemo(() => filteredByType.filter(l => {
        const query = searchTerm.toLowerCase();
        const matchSearch = (l.company_name || l.name || '').toLowerCase().includes(query) ||
            (l.email || '').toLowerCase().includes(query) ||
            (l.address || '').toLowerCase().includes(query) ||
            (l.county || '').toLowerCase().includes(query) ||
            (l.town || '').toLowerCase().includes(query) ||
            (l.additional_addresses || []).some((addr: string) => addr.toLowerCase().includes(query));
        
        const matchLocation = !locationFilter || 
            l.county === locationFilter ||
            (l.additional_addresses && Array.isArray(l.additional_addresses) && l.additional_addresses.some((addr: string) => {
                if (typeof addr === 'string') {
                    if (addr.includes('|||')) {
                        const county = addr.split('|||')[1];
                        return county === locationFilter;
                    } else {
                        return addr.trim() === locationFilter;
                    }
                }
                return false;
            }));
        
        return matchSearch && matchLocation;
    }), [filteredByType, searchTerm, locationFilter]);

    return (
        <div className="space-y-4">
            {/* View Toggle Buttons - Businesses vs BER Assessors */}
            <div className="bg-white p-2 rounded-xl shadow-sm border border-gray-100">
                <div className="flex gap-2">
                    <button
                        onClick={() => setActiveView('businesses')}
                        className={`flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-bold transition-all ${
                            activeView === 'businesses'
                                ? 'bg-[#007F00] text-white shadow-md'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                    >
                        <Building2 size={18} />
                        Businesses
                    </button>
                    <button
                        onClick={() => setActiveView('assessors')}
                        className={`flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-bold transition-all ${
                            activeView === 'assessors'
                                ? 'bg-[#007F00] text-white shadow-md'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                    >
                        <HardHat size={18} />
                        BER Assessors
                    </button>
                </div>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100 gap-4">
                <div className="flex flex-col md:flex-row gap-2 flex-1 max-w-xl">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search catalogue by name or email..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#007F00]/20 focus:border-[#007F00] transition-all text-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="relative w-full md:w-44">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <select
                            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#007F00]/20 focus:border-[#007F00] outline-none transition-all bg-gray-50 appearance-none text-gray-600"
                            value={locationFilter}
                            onChange={(e) => setLocationFilter(e.target.value)}
                        >
                            <option value="">All Counties</option>
                            {uniqueCounties.map(county => (
                                <option key={county} value={county}>{county}</option>
                            ))}
                        </select>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => handleOpenCatalogueView(null)}
                        className="flex items-center gap-2 bg-[#007F00] text-white px-6 py-3 rounded-xl text-sm font-bold hover:bg-green-700 transition-all shadow-md whitespace-nowrap"
                    >
                        <Plus size={18} />
                        Add New Listing
                    </button>
                    <span className="text-xs text-gray-400">
                        {filtered.length} / {listings.length}
                        {locationFilter && ` · ${locationFilter}`}
                    </span>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100 text-[10px] font-black uppercase tracking-widest text-gray-400">
                                <th className="px-6 py-4">{activeView === 'businesses' ? 'Business' : 'BER Assessor'}</th>
                                <th className="px-6 py-4">Contact</th>
                                <th className="px-6 py-4">Locations</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Featured</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-400 italic">
                                        No {activeView === 'businesses' ? 'businesses' : 'BER assessors'} found.
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((l) => {
                                    const owner = users_list.find(u => u.id === l.user_id || u.id === l.owner_id);
                                    const isOwnerSuspended = owner?.stripe_payment_id === 'SUSPENDED';
                                    const allCounties = [
                                        l.county,
                                        ...(l.additional_addresses || []).map((a: string) => a.includes('|||') ? a.split('|||')[1] : a)
                                    ].filter(Boolean);
                                    const uniqueCounties = Array.from(new Set(allCounties));

                                    return (
                                        <tr
                                            key={l.id}
                                            onClick={() => handleOpenCatalogueView(null, l)}
                                            className="hover:bg-gray-50/50 transition-colors group cursor-pointer"
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    {l.logo_url ? (
                                                        <img src={l.logo_url} className="w-10 h-10 rounded-lg object-cover border border-gray-100" alt="" />
                                                    ) : (
                                                        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400"><Briefcase size={20} /></div>
                                                    )}
                                                    <div>
                                                        <div className="font-bold text-gray-900 text-sm">{l.name}</div>
                                                        <div className="text-[10px] text-gray-400 font-medium">{l.company_name}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-xs text-gray-600 font-medium">{l.email}</div>
                                                {l.phone && <div className="text-[10px] text-gray-400">{l.phone}</div>}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-wrap gap-1 max-w-[200px]">
                                                    {(uniqueCounties as string[]).slice(0, 3).map((c, i) => (
                                                        <span key={i} className="px-2 py-0.5 bg-gray-100 text-[9px] font-black uppercase rounded text-gray-600 border border-gray-200">{c}</span>
                                                    ))}
                                                    {uniqueCounties.length > 3 && (
                                                        <span className="px-2 py-0.5 bg-blue-50 text-[9px] font-black uppercase rounded text-blue-600 border border-blue-100">+{uniqueCounties.length - 3} More</span>
                                                    )}
                                                    {uniqueCounties.length === 0 && <span className="text-[10px] text-gray-300 italic">No locations</span>}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4" onClick={e => e.stopPropagation()}>
                                                {isOwnerSuspended ? (
                                                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-red-100 text-red-700">
                                                        <AlertTriangle size={12} /> Suspended
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={() => toggleCatalogueStatus(l.id, l.is_active)}
                                                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${l.is_active ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-500'}`}
                                                    >
                                                        <div className={`w-1.5 h-1.5 rounded-full ${l.is_active ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
                                                        {l.is_active ? 'Active' : 'Inactive'}
                                                    </button>
                                                )}
                                            </td>
                                            <td className="px-6 py-4" onClick={e => e.stopPropagation()}>
                                                <button
                                                    onClick={() => toggleCatalogueFeatured(l.id, l.featured)}
                                                    className={`p-2 rounded-lg transition-all ${l.featured ? 'text-amber-500 bg-amber-50' : 'text-gray-300 hover:text-gray-400'}`}
                                                    title={l.featured ? 'Unfeature Listing' : 'Feature Listing'}
                                                >
                                                    <Star size={18} fill={l.featured ? 'currentColor' : 'none'} />
                                                </button>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2" onClick={e => e.stopPropagation()}>
                                                    <button onClick={() => handleOpenCatalogueView(null, l)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="Edit Listing"><Edit2 size={16} /></button>
                                                    <button onClick={() => handleDeleteListing(l.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all" title="Delete Listing"><Trash2 size={16} /></button>
                                                    <a href={`/catalogue/${l.slug}`} target="_blank" rel="noreferrer" className="p-2 text-gray-400 hover:text-[#007F00] hover:bg-green-50 rounded-lg transition-all" title="View Publicly"><ExternalLink size={16} /></a>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
});
